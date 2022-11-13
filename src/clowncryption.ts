import {
  Algorithms,
  charsets,
  ClownOptions,
  EncryptOptions,
  IExportConfigOptions,
  IFileExportOptions,
  StaticEncryptOptions,
} from ".";
import CharsetManager from "./defaultCharsets/defaults";
import Crypto from "crypto";
import CFS from "./fileSystem";
import { PublicCharset } from "./defaultCharsets/charsets";

/**
 * Main Client of ClownCryption
 */
class ClownCryption {
  /**
   * The instance key, this is the default value for the {@link ClownCryption.encrypt | Encrypt Method} key
   */
  #key: string;

  /**
   * The instance charset, this is the default value for the {@link ClownCryption.encrypt | Encrypt Method} charset
   * @extends PublicCharset
   */
  private _charset: PublicCharset;

  /**
   * The instance algorithm, this is the default value for the {@link ClownCryption.encrypt | Encrypt Method} algorithm
   */
  private _algorithm: Algorithms;

  /**
   * @hidden
   * @privateRemark Needs some more work to implement
   * The instance Common Replacers, these are the default value the {@link ClownCryption.encrypt | Encrypt Method} Common Replacers
   */
  private _commonReplacers: [string, string][];

  /**
   * The instance salt, this is the default value for the {@link ClownCryption.encrypt | Encrypt Method} salt
   */
  private _salt: string;

  /**
   * The instance IV, this is the default value for the {@link ClownCryption.encrypt | Encrypt Method} IV
   */
  private _iv: string;

  /**
   * Manages the charsets
   * @see {@link defaultCharsets.CharsetManager}
   */
  public readonly charsetMangager = CharsetManager;

  /**
   * @hidden
   * @privateRemark Common replacers
   */
  private static readonly _commonReplacers: [string, string][] = [
    ["100", "_"],
    ["110", "+"],
  ];

  /**
   * Creates a new ClownCryption Instance
   * @param options Options for the ClownCryption Constructor
   */
  constructor({
    key,
    iv,
    salt = "pepper",
    charset = "eb",
    algorithm = "aes192",
    commonReplacers = ClownCryption._commonReplacers,
  }: ClownOptions) {
    this.#key = key.toString();
    this._iv = iv.toString();
    this._salt = salt.toString();
    this._charset = ClownCryption._getCharset(charset);
    this._algorithm = algorithm.toLowerCase().trim() as "aes128";
    this._commonReplacers = commonReplacers;
  }

  /**
   * Fetches a CharsetManager
   * @param charset {@link charsets.PublicCharset | Charset} or string
   * @returns If a {@link charsets.PublicCharset | Charset} is provided it is returned else it tries to fetch the charset from the built in charsets
   * @see {@link defaultCharsets.CharsetManager | Charset Manager}
   */
  private static _getCharset(charset: PublicCharset | string): PublicCharset {
    if (charset instanceof PublicCharset) return charset;
    if (typeof charset === "string") {
      const chset = CharsetManager.getCharset(charset);
      if (typeof chset !== "undefined") return chset;
    }

    throw new TypeError(`Charset (${charset}) is not a valid charset`);
  }

  /**
   * Encrypts a string with the AES algorithm
   * @param str The string to encrypt
   * @param key The key to encrypt the string with
   * @param iv The Initalizing Vector of the encryption function
   * @param keylen Basically just saying aes128, aes192, or aes256, note that the str param doesn't have to be thing length
   * @param salt The salt for the encryption
   * @param log If you want to log the errors from the encryption algorithm
   * @returns encrypted string or and empty string if there is an error
   */
  public static aesEncrypt(
    str: string,
    key: string,
    iv: string,
    keylen: 128 | 192 | 256 = 192,
    salt: string = "pepper",
    log: boolean = true
  ) {
    const cipher = Crypto.createCipheriv(
      `aes${keylen}`,
      Crypto.scryptSync(key, salt, keylen / 8),
      Buffer.alloc(16, iv)
    );

    let encryption: string = "";
    try {
      encryption = cipher.update(str, "utf-8", "hex");
      encryption += cipher.final("hex");
    } catch (error) {
      if (log) console.error(error);
    } finally {
      return encryption;
    }
  }

  /**
   *
   * @param str The Encrypted string to decrypt
   * @param key The key to decrypt the string with
   * @param iv The Initalizing Vector for the algorithm
   * @param keylen Basically just saying aes128, aes192, or aes256, note that the str param doesn't have to be thing length
   * @param salt The salt for the algorithm
   * @param log If you want to log the errors from the decrypt
   * @returns Decrypted string
   */
  public static aesDecrypt(
    str: string,
    key: string,
    iv: string,
    keylen: 128 | 192 | 256 = 192,
    salt: string = "pepper",
    log: boolean = true
  ) {
    const decipher = Crypto.createDecipheriv(
      `aes${keylen}`,
      Crypto.scryptSync(key, salt, keylen / 8),
      Buffer.alloc(16, iv)
    );

    let decryption: string = "";
    try {
      decryption = decipher.update(str, "hex", "utf-8");
      decryption += decipher.final("utf-8");
    } catch (error) {
      if (log) console.error(error);
    } finally {
      return decryption;
    }
  }

  /**
   * Encrypts and Encodes a message
   * @remarks The function uses the {@link https://nodejs.org/api/crypto.html#cryptocreatecipherivalgorithm-key-iv-options | Crypto.createCipheriv} function to encrypt a message and than than message is passed into the {@link charsets.PublicCharset.encode | encode} function, this creates a encrypted encoded message that is returned
   * @param {EncryptionOptions} options options for the encryption
   * @returns {string} The encrypted encoded message
   */
  public encrypt({
    message,
    key = this.key,
    iv = this.iv,
    charset = this.charset,
    algorithm = this.algorithm,
    salt = this.salt,
  }: EncryptOptions): string {
    return ClownCryption.encrypt({
      message,
      key,
      iv,
      charset,
      algorithm,
      salt,
    });
  }

  /**
   * Encrypts and Encodes a message
   * @remark The function uses the {@link https://nodejs.org/api/crypto.html#cryptocreatecipherivalgorithm-key-iv-options | Crypto.createCipheriv} function to encrypt a message and than than message is passed into the {@link charsets.PublicCharset.encode | encode} function, this creates a encrypted encoded message that is returned
   * @param options The options for the static encrypt function
   * @returns The encrypted encoded message
   */
  public static encrypt({
    message,
    key,
    iv,
    charset = CharsetManager.getCharset("DefaultEfficientBinary"),
    algorithm = "aes192",
    salt = "pepper",
  }: StaticEncryptOptions) {
    return ClownCryption._getCharset(charset as PublicCharset)?.encode(
      this.aesEncrypt(
        message,
        key,
        iv,
        parseInt(algorithm.replace(/[^1-9]/g, "")) as 128,
        salt
      )
    );
  }

  /**
   * Decodes and Decrypts the message
   * @remarks The function passes the message into {@link charsets.PublicCharset.decode} and passes that result into the {@link https://nodejs.org/api/crypto.html#cryptocreatedecipherivalgorithm-key-iv-options | Crypto.createDecrypteriv} function and the result of that is returned
   * @param options Options for the decrption
   * @returns Decoded and Decrypted string
   */
  public decrypt({
    message,
    key = this.key,
    iv = this.iv,
    salt = this.salt,
    algorithm = this.algorithm,
    charset = this.charset,
  }: EncryptOptions) {
    return ClownCryption.decrypt({
      message,
      key,
      iv,
      salt,
      algorithm,
      charset,
    });
  }

  /**
   * Decodes and Decrypts the message
   * @remarks The function passes the message into {@link charsets.PublicCharset.decode} and passes that result into the {@link https://nodejs.org/api/crypto.html#cryptocreatedecipherivalgorithm-key-iv-options | Crypto.createDecrypteriv} function and the result of that is returned
   * @param options Options for the decrption
   * @returns Decoded and Decrypted string
   */
  public static decrypt({
    message,
    key,
    iv,
    charset = CharsetManager.getCharset("DefaultEfficientBinary"),
    algorithm = "aes192",
    salt = "pepper",
  }: StaticEncryptOptions) {
    return ClownCryption.aesDecrypt(
      ClownCryption._getCharset(charset as PublicCharset)?.decode(message) ??
        "",
      key,
      iv,
      parseInt(algorithm.replace(/[^1-9]/g, "")) as 128,
      salt
    );
  }

  /**
   * @returns The instance key
   * @see {@link https://en.wikipedia.org/wiki/Key_(cryptography) | Key Cryptography Definition}
   */
  public get key() {
    return this.#key;
  }

  /**
   * @returns The instance IV
   * @see {@link https://en.wikipedia.org/wiki/Initialization_vector | IV Cryptography Definition}
   */
  public get iv() {
    return this._iv;
  }

  /**
   * @returns The instance Charset
   */
  public get charset() {
    return this._charset;
  }

  /**
   * @returns The Instance salt
   * @see {@link https://en.wikipedia.org/wiki/Salt_(cryptography) | Salt Cryptography Definition}
   */
  public get salt() {
    return this._salt;
  }

  /**
   * @returns The Instance Algorithm
   * @see {@link https://www.openssl.org/docs/man1.1.1/man1/ciphers.html | OpenSSL Ciphers}
   */
  public get algorithm() {
    return this._algorithm;
  }

  /**
   * @returns The Instance Common Replacers
   */
  public get commonReplacers() {
    return this._commonReplacers;
  }

  /**
   * Exports a message to a file
   * @param encryptedString The message to export
   * @param options The export options
   * @returns Path of the exported file
   * @see {@link CFS.generateStringFile}
   * @see {@link ClownCryption.importStringFile}
   */
  public exportStringToFile(
    encryptedString: string,
    {
      fileName,
      filePath,
      overwrite,
      exportType,
      encryptFile,
      encryptInClown = true,
      key = this.key,
      includeKey,
      iv = this.iv,
      includeIv,
      algorithm = this.algorithm,
      includeAlgorithm,
      salt = this.salt,
      includeSalt,
      charset = this._charset,
      includeCharset,
      commonReplacers = this.commonReplacers,
    }: IFileExportOptions
  ) {
    return CFS.generateStringFile(encryptedString, {
      fileName,
      filePath,
      overwrite,
      exportType,
      encryptInClown,
      encryptFile,
      key,
      includeKey,
      iv,
      includeIv,
      algorithm,
      includeAlgorithm,
      salt,
      includeSalt,
      charset,
      includeCharset,
      commonReplacers,
    });
  }

  /**
   * Imports a message from a file
   * @param filePath Path to the file
   * @param key Encryption key
   * @returns Content of the file
   * @see {@link CFS.readStringFile}
   * @see {@link ClownCryption.exportStringToFile}
   */
  public importStringFile(filePath: string, key?: string) {
    return CFS.readStringFile(filePath, key);
  }

  /**
   * Exports the configuration of the instance
   * @param fileName Path to the file
   * @param options Options of the export
   * @returns Path of the export file
   * @see {@link CFS.exportConfig}
   */
  public exportConfigToFile(fileName: string, options: IExportConfigOptions) {
    return CFS.exportConfig(fileName, this, options);
  }

  /**
   * Condenses Binary
   * @param binaryString A string in binary
   * @returns Condensed Binary
   * @see {@link ClownCryption.decondenseBinary}
   */
  static condenseBinary(binaryString: string) {
    let count = 0;
    let lastChar = "";
    let efficientBuilder = "";
    const variables: string[] = [];
    const buildStringSplit = binaryString.split("");

    for (let i in buildStringSplit) {
      if (buildStringSplit[i] !== lastChar) {
        if (count < 2) {
          efficientBuilder += ClownCryption.multiplyString(lastChar, count);
          lastChar = buildStringSplit[i];
          count = 0;
        } else {
          efficientBuilder += lastChar + count;
          lastChar = buildStringSplit[i];
          count = 0;
        }
      } else {
        count++;
      }
    }
    efficientBuilder += lastChar + count;

    for (let i in this._commonReplacers) {
      efficientBuilder = efficientBuilder.replaceAll(
        this._commonReplacers[i][0],
        this._commonReplacers[i][1]
      );
    }

    for (let i = 0; i <= 9; i++) {
      if (!efficientBuilder.includes(i.toString()))
        variables.push(i.toString());
    }

    let patterns: [string, number][] =
      ClownCryption.findPattern(efficientBuilder);
    let possibleSavings = 0;
    let varSpace = 1;
    const assignedVariables: {
      variable: string;
      replaces: string;
      uses: number;
      saves: number;
    }[] = [];

    for (let i in variables) {
      if (typeof patterns[i] === "undefined") continue;
      const variObject = {
        variable: variables[i],
        replaces: patterns[i][0],
        uses: variables[i].length + patterns[i][0].length,
        saves: patterns[i][0].length * patterns[i][1],
      };

      possibleSavings += variObject.saves;
      varSpace += variObject.uses;

      assignedVariables.push(variObject);
    }

    let variableString: string[] = [];
    if (possibleSavings > varSpace) {
      assignedVariables.forEach((assigned) => {
        variableString.push(assigned.variable + assigned.replaces);
        efficientBuilder = efficientBuilder.replaceAll(
          assigned.replaces,
          assigned.variable
        );
      });

      efficientBuilder = variableString.join(".") + ":" + efficientBuilder;
    }
    return efficientBuilder;
  }

  /**
   * Decondenses Binary
   * @param condensedBinary Condensed Binary String
   * @returns Decondensed String
   * @see {@link ClownCryption.condenseBinary}
   */
  static decondenseBinary(condensedBinary: string) {
    let buildString = "";
    if (condensedBinary.includes(":")) {
      const variableString = condensedBinary.split(":")[0];
      condensedBinary = condensedBinary.split(":")[1];
      const variables = variableString.split(".");

      variables.forEach((variable) => {
        condensedBinary = condensedBinary.replaceAll(
          variable[0],
          variable.substring(1)
        );
      });
    }

    for (let i in this._commonReplacers) {
      condensedBinary = condensedBinary.replaceAll(
        this._commonReplacers[i][1],
        this._commonReplacers[i][0]
      );
    }

    condensedBinary.split("").forEach((value, index, array) => {
      if (parseInt(value) >= 2) {
        buildString += ClownCryption.multiplyString(
          array[index - 1],
          parseInt(value)
        );
        return;
      }

      if (parseInt(array[index + 1]) <= 1) {
        return (buildString += value);
      }
    });

    return buildString + buildString[buildString.length - 1];
  }

  /**
   * Finds patterns in a string
   * @param str The string to search
   * @param maxPatternSize The maximum length of the pattern
   * @param minPatternSize  The minimum length of the pattern
   * @returns A list of patterns as [pattern, amount] ordered high to low count, all patterns will be the same length
   */
  static findPattern(
    str: string,
    maxPatternSize: number = 4,
    minPatternSize: number = 3
  ) {
    let patterns: { [key: string]: number } = {};

    for (let i = maxPatternSize; i >= minPatternSize; i--) {
      let n;
      for (n = 0; n < str.length; n += i) {
        const pattern = str.substring(n, n + i);
        patterns[pattern] = (patterns[pattern] ?? 0) + 1;
      }
    }

    return Object.entries(patterns)
      .sort((a, b) => b[1] * b[0].length - a[1] * a[0].length)
      .filter(
        (value, index, array) =>
          value[1] > 1 && value[0].length === array[0][0].length
      );
  }

  /**
   * Creates a new ClownCryption instance based on a configuration file
   * @param filePath The import file's path
   * @param key The encryption key
   * @returns New ClownCryption instance
   * @see {@link ClownCryption.exportConfigToFile}
   */
  static importFileConfig(filePath: string, key?: string) {
    const config = CFS.readFileConfig(filePath, key);

    return new this({
      key: config.key,
      iv: config.iv,
      algorithm: config.algorithm,
      salt: config.salt,
    } as any);
  }

  /**
   * Gets the binary value of a string
   * @param str The string
   * @returns The string encoded in binary
   */
  static getBinary(str: string) {
    const strSplit = str.split("");
    const builder: string[] = [];

    for (let i in strSplit) {
      builder.push(strSplit[i].charCodeAt(0).toString(2));
    }

    return builder.join(" ");
  }

  /**
   * Repeats a string a specified number of times and returns it
   * @param str The string
   * @param num The amount of times to repeat it
   * @returns The new string
   */
  static multiplyString(str: string, num: number) {
    let builder = "";
    for (let i = 0; i <= num; i++) {
      builder += str;
    }

    return builder;
  }
}

export default ClownCryption;
