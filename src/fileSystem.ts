import * as fs from "fs";
import path from "path";
import { IExportConfigOptions, IFileExportOptions } from ".";
import ClownCryption from "./clowncryption";
import * as charsets from "./defaultCharsets/charsets";
import {
  DefaultBinaryCharset,
  DefaultLiteralCharset,
} from "./defaultCharsets/defaults";

/**
 * Clown File System, manages files, imports, and exports
 */
class CFS {
  /** 
   * @hidden
   * @privateRemark This shouldn't be shown on docs because it's a private constructor
   */
  private constructor() {}

  /**
   * Creates a file that contains the message and other parameters
   * @param {string} str The message to be exported to the file
   * @param {IFileExportOptions} options The export options
   * @returns {string} The export file's path
   */
  static generateStringFile(
    str: string,
    {
      fileName,
      filePath,
      overwrite = false,
      exportType = "clown",
      encryptFile = false,
      encryptInClown = true,

      key,
      includeKey = false,
      iv,
      includeIv = false,
      algorithm,
      includeAlgorithm = false,
      salt,
      includeSalt = false,
      charset,
      includeCharset = false,
      commonReplacers = [],
      includeCommonReplacers = false,
    }: IFileExportOptions
  ): string {
    const { path: fPath } = this._serializePath(
      path.join(filePath ?? "", fileName),
      overwrite
    );

    const exportContent = {
      key: this._stringProp(key, includeKey),
      iv: this._stringProp(iv, includeIv),
      algorithm: this._stringProp(algorithm, includeAlgorithm),
      salt: this._stringProp(salt, includeSalt),
      charset: this._stringProp(charset?.toJSON(), includeCharset),
      commonReplacers: this._stringProp(
        commonReplacers,
        includeCommonReplacers
      ),
      message: str,
    };

    const content = this._generateOutputString(
      exportContent,
      exportType,
      encryptFile,
      encryptInClown
    );

    fs.writeFileSync(`${fPath}.${exportType}`, content);

    return `${fPath}.${exportType}`;
  }

  /**
   * Reads the content of a file and returns them in object format
   * @param filePath The path to the file
   * @param key The key to decrypt the file
   * @returns The content of the file in object format
   */
  static readStringFile(
    filePath: string | fs.PathLike,
    key?: string
  ): { [key: string]: any } {
    return this._generateInputObject(
      fs.readFileSync(this._serializePath(filePath).path, "utf-8"),
      key
    );
  }

  /**
   * This exports the configuration of a client to a file
   * @param filePath The path of the export file
   * @param client The {@link ClownCryption} client
   * @param options The options for exporting
   * @returns The export file's path
   */
  static exportConfig(
    filePath: string,
    client: ClownCryption,
    {
      encryptFile = false,
      exportType = "clown",
      includeAlgorithm = true,
      includeCharset = true,
      includeCommonReplacers = true,
      includeSalt = true,
      encryptInClown = true,
    }: IExportConfigOptions
  ) {
    let exportOb = {
      key: client.key,
      iv: client.iv,
      salt: this._stringProp(client.salt, includeSalt),
      algorithm: this._stringProp(client.algorithm, includeAlgorithm),
      charset: this._stringProp(client.charset, includeCharset),
      commonReplacers: this._stringProp(
        client.commonReplacers,
        includeCommonReplacers
      ),
    };

    const { path: fPath } = this._serializePath(filePath, false);

    const content = this._generateOutputString(
      exportOb,
      exportType,
      encryptFile,
      encryptInClown
    );

    fs.writeFileSync(`${fPath}.${exportType}`, content);

    return `${fPath}.${exportType}`;
  }

  /**
   * Read a configuration file and returns it as an object
   * @param filePath Path to the file to read
   * @param key The encryption key
   * @returns The configuration
   */
  static readFileConfig(
    filePath: string,
    key?: string
  ): { [key: string]: string } {
    return this._generateInputObject(
      fs.readFileSync(this._serializePath(filePath).path, "utf-8"),
      key
    );
  }

  /**
   * Check to see if a string is a hex string or not
   * @param str String to check
   * @returns boolean
   */
  public static isHex(str: string | { [key: string]: string }) {
    if (typeof str === "string")
      return (str.match(/[0-9"a-f]{1}/gi)?.length ?? 0) === str.length;
    let objKey = Object.entries(str)[0];
    return (objKey[0].match(/[0-9a-f]{1}/gi)?.length ?? 0) === objKey[0].length;
  }

  /**
   * @internal Stringifys objects the correct way, and only does so if includeProp is true
   * @param prop The prop to stringify
   * @param includeProp Whether to stringify the prop, if false returns undefined
   * @returns undefined if includeProp is false else returns a string
   */
  private static _stringProp = (prop: any, includeProp: boolean): string =>
    includeProp === true
      ? prop?.toString() !== "[object Object]" &&
        typeof prop?.toString() === "string"
        ? prop.toString()
        : JSON.stringify(prop)
      : undefined;

  /**
   * Formats the path of files
   * @param filePath The path of the file
   * @param overwrite If false and the file exists the function will generate a random name for the file, else overwrites the file
   * @param includeFileExt If you want to include the file extention of the file if one is found
   * @returns fileName and path
   */
  private static _serializePath(
    filePath: string | fs.PathLike,
    overwrite: boolean = false,
    includeFileExt: boolean = false
  ): { fileName: string; path: string } {
    filePath = filePath.toString();
    if (!filePath.startsWith(process.cwd()))
      filePath = path.join(process.cwd(), filePath);
    let realFileName = path.basename(filePath);

    for (let file of fs.readdirSync(path.dirname(filePath))) {
      if (
        path.basename(file, path.extname(file)) === realFileName &&
        path.extname(file).length
      ) {
        realFileName = `${realFileName}${
          overwrite
            ? ""
            : `_clown${Math.floor(Math.random() * 999999 + 1)
                .toString()
                .padStart(6, "0")}`
        }${includeFileExt ? path.extname(file) : ""}`;
        filePath = path.join(path.dirname(filePath), realFileName);
        break;
      }
    }

    return { fileName: realFileName, path: filePath };
  }

  /**
   * Generates a buffer to be written to an output file
   * @param content The content of the new file
   * @param fileType Which format you want to export to
   * @param encrypt If you want to encrypt the file or not
   * @param encodeInClown If you want the file to be encoded in clown
   * @returns A buffer with the content
   */
  private static _generateOutputString(
    content: { [key: string]: any },
    fileType: "clown" | "json" | "js",
    encrypt: string | false = false,
    encodeInClown: boolean | "short" | "very short" = true
  ): Buffer {
    // Defining some useful functions
    const encode = (val: string) =>
      encodeInClown === "short" || encodeInClown === "very short"
        ? DefaultLiteralCharset.encode(val)
        : DefaultBinaryCharset.encode(val);
    const fcrypt = (val: string) =>
      ClownCryption.aesEncrypt(
        val,
        encrypt || "My Super Secret Super Funny Key",
        "Initalizing Vector",
        128,
        "pepper",
        false
      );

    // formating
    fileType = fileType.toLowerCase().trim() as "clown";
    content = Object.fromEntries(
      Object.entries(content).filter((value) => typeof value[1] !== "undefined")
    );
    if (typeof encodeInClown === "string")
      encodeInClown =
        encodeInClown === "short" || encodeInClown === "very short"
          ? (encodeInClown.toLowerCase().trim() as "short" | "very short")
          : true;

    // the part that does stuff
    if (fileType === "clown") {
      if (encodeInClown === "very short")
        return Buffer.from(
          `[${Object.entries(content)
            .map(([key, str]) => {
              return (
                [
                  encode(fcrypt(key)),
                  charsets.PublicCharset.isEmoji(str)
                    ? `*${str}`
                    : encode(fcrypt(str)),
                ].join(":[") + "]"
              );
            })
            .join("]:[")}]`
        );
      let stringifiedContent = `[${Object.entries(content)
        .map((value) => value.join(":[*") + "]")
        .join("]:[")}]`;
      if (typeof encrypt === "string" || encodeInClown)
        stringifiedContent = fcrypt(stringifiedContent);
      if (encodeInClown) stringifiedContent = encode(stringifiedContent);
      return Buffer.from(stringifiedContent);
    } else if (fileType === "json") {
      if (typeof encrypt === "string" || encodeInClown)
        content = Object.fromEntries(
          Object.entries(content).map(([key, val]) => [
            fcrypt(key),
            fcrypt(val),
          ])
        );
      if (encodeInClown)
        content = Object.fromEntries(
          Object.entries(content).map(([key, val]) => [
            encode(key),
            encode(val),
          ])
        );
      return Buffer.from(JSON.stringify(content, null, "\t"));
    } else {
      return Buffer.from(
        `module.exports = ${((object: { [key: string]: any } | any[]) =>
          `{\n\t${Object.entries(object)
            .map(
              ([key, thing]) =>
                `${key}: ${
                  typeof thing === "string"
                    ? `"${thing}"`
                    : Array.isArray(thing)
                    ? JSON.stringify(thing)
                    : thing
                }`
            )
            .join(",\n\t")}\n}`)(content)}`
      );
    }
  }

  /**
   * Parses the content of the file
   * @param content The content of the imported file
   * @param key The key to the encryption
   * @returns An object with the content of the file
   */
  private static _generateInputObject(content: string, key?: string) {
    // defining functions
    const decode = (val: string) =>
      DefaultBinaryCharset.validChars(val)
        ? DefaultBinaryCharset.decode(val)
        : DefaultLiteralCharset.decode(val);
    const decrypt = (val: string) =>
      ClownCryption.aesDecrypt(
        val,
        key || "My Super Secret Super Funny Key",
        "Initalizing Vector",
        128,
        "pepper",
        false
      );

    // the part that does stuff, I think
    if (this.isHex(content)) content = decrypt(content);
    if (DefaultLiteralCharset.validChars(content))
      content = decrypt(
        DefaultBinaryCharset.validChars(content)
          ? DefaultBinaryCharset.decode(content)
          : DefaultLiteralCharset.decode(content)
      );
    if (content.startsWith("[")) {
      return Object.fromEntries(
        content.split("]:[").map((split) => {
          if (split.startsWith("[")) split = split.substring(1);
          if (split.endsWith("]]"))
            split = split.substring(0, split.length - 1);

          return split.split(":").map((val, index) => {
            if (index % 2 === 1) val = val.substring(1, val.length - 1);
            let valDecode = decode(val);
            if (valDecode.toLowerCase().includes("undefined"))
              return val.replaceAll("*", "");
            if (this.isHex(valDecode)) return decrypt(valDecode) || val;
            return val;
          });
        }) as [string, string][]
      );
    }

    if (content.startsWith("{")) return JSON.parse(content);
    if (content.startsWith("module.exports = "))
      return JSON.parse(content.replace("module.export = ", ""));

    throw new Error(`Unable to parse content: ${content}`);
  }
}

export default CFS;
