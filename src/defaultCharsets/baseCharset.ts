import {
  IBinaryCharset,
  CharsetMode,
  CharsetType,
  IEfficientBinaryCharset,
  ICharsetChars,
  ILiteralCharset,
} from "..";
import ClownCryption from "../clowncryption";

/**
 * @internal
 * A basic charset
 */
abstract class BaseCharset {
  /** Charset Characters */
  private _charset: ICharsetChars;
  /** Map of the charset */
  private _charsetMap: Map<string, string> = new Map<string, string>();
  /** An inverted map of the charset */
  private _inverseCharsetMap: typeof this._charsetMap = new Map<
    string,
    string | string
  >();
  /** The common replacers used in the efficient binary charsets */
  private _commonReplacer: [string, string][];
  /** The typeof the charset */
  readonly type: CharsetType;
  /** The charset mode */
  public mode: CharsetMode;

  /**
   *
   * @param type binary, this is just the type of the charset
   * @param mode The mode of the charset, efficient or normal
   * @param binaryCharset A object with efficient or normal binary encoding characters
   * @param commonReplacers The common replacers for the efficienct binary charset
   */
  constructor(
    type: "binary",
    mode: CharsetMode,
    binaryCharset: IEfficientBinaryCharset | IBinaryCharset,
    commonReplacers?: [string, string][]
  );

  /**
   * Creates a literal charset
   * @param type literal, this is just the type of the charset
   * @param mode Normal or efficient, this doesn't really matter for the literal charset
   * @param stringCharset A literal charset Object
   */
  constructor(type: "literal", mode: string, stringCharset: ILiteralCharset);
  constructor(
    type: CharsetType,
    mode: CharsetMode,
    charset: ICharsetChars,
    commonReplacers: [string, string][] = [
      ["100", "_"],
      ["110", "+"],
    ]
  ) {
    this._charset = charset;
    this.type = type;
    this.mode = mode;
    this._commonReplacer = commonReplacers;
    this._createCharsetMap(charset);
  }

  /** Gets the charset characters */
  public get charset() {
    return this._charset;
  }

  /**
   * Creates a {@link BaseCharset._charsetMap | map} and an {@link BaseCharset._inverseCharsetMap} of a charset
   * @param charset The charset
   */
  private _createCharsetMap(charset: typeof this._charset) {
    Object.entries(charset).forEach((character) => {
      if (character[0].startsWith("commonReplacer")) {
        this._charsetMap.set(
          this._commonReplacer[parseInt(String(character[0].at(-1))) - 1][1],
          character[1]
        );
        this._inverseCharsetMap.set(
          character[1],
          this._commonReplacer[parseInt(String(character[0].at(-1))) - 1][1]
        );
        return;
      }

      if (
        BaseCharset.getStringEmojis(String(character)).length !== 1 &&
        String(character).length !== 1
      )
        throw new SyntaxError(`Character ${character}.length > 1`);
      if (
        this._charsetMap.get(String(character[0])) ||
        this._inverseCharsetMap.get(String(character[1]))
      )
        throw new SyntaxError(
          `Cannot set ${character[0]} to ${character[1]} because one of them is already in the charset`
        );

      this._charsetMap.set(String(character[0]), String(character[1]));
      this._inverseCharsetMap.set(String(character[1]), String(character[0]));
    });
  }

  /**
   * Gets the charset translation of a character
   * @param character The character
   * @returns string or undefined
   */
  public getChar(character: string | number) {
    return this._charsetMap.get(new String(character) as string);
  }

  /**
   * Encodes a binry string
   * @param str The string
   * @returns Encoded binary string
   */
  private _encodeBinary(str: string) {
    const builder: string[] = [];
    const splitStr = str.split("");
    let returnVal;

    splitStr.forEach((char) => {
      builder.push(char.charCodeAt(0).toString(2).padStart(8, "0"));
    });

    if (this.mode === "efficient")
      returnVal = ClownCryption.condenseBinary(builder.join(""));
    else returnVal = builder.join("");
    return this._encodeLiteral(returnVal);
  }

  /**
   * Encodes a literal string
   * @param str The string
   * @returns The encoded string
   */
  private _encodeLiteral(str: string) {
    let builder = "";

    for (let i of str) {
      builder += this._charsetMap.get(i);
    }

    return builder;
  }

  public validChars(str: string) {
    for (let i of str) {
      if (typeof this._inverseCharsetMap.get(i)) return false;
    }

    return true;
  }

  /**
   * Returns all emojis in a string
   * @param str The string
   * @returns An array of emojis
   */
  public static getStringEmojis(str: string): string[] {
    return (
      str.match(
        /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDEFF])/gi
      ) || []
    );
  }

  /**
   * This check to see if a character or string is all emojis
   * @param char The string or character
   * @returns true if all character in char are emojis, else false
   */
  public static isEmoji(char: string) {
    return BaseCharset.getStringEmojis(char).length === char.length / 2;
  }

  /**
   * String to decode to binary
   * @param str String
   * @returns Decoded string
   */
  private _decodeBinary(str: string) {
    str = this._decodeLiteral(str);

    if (this.mode === "efficient") {
      str = ClownCryption.decondenseBinary(str);
    }

    const builder: string[] = [];
    (str.match(/[01]{8}/g) as string[]).forEach((char) => {
      builder.push(String.fromCharCode(parseInt(char, 2)));
    });
    return builder.join("");
  }

  /**
   * Decodes a literal string
   * @param str String
   * @returns Decoded string
   */
  private _decodeLiteral(str: string) {
    let builder = "";

    for (let character of str) {
      builder += this._inverseCharsetMap.get(character);
    }

    return builder;
  }

  /**
   * Encodes string with the current charset
   * @param str String
   * @returns Encoded string
   */
  public encode(str: string) {
    if (this.type === "binary") return this._encodeBinary(str);
    if (this.type === "literal") return this._encodeLiteral(str);
    throw new SyntaxError(
      `Charset type of ${this.type} is not binary or literal`
    );
  }

  /**
   * Decodes string
   * @param str String
   * @returns Decoded string
   */
  public decode(str: string) {
    if (this.type === "binary") return this._decodeBinary(str);
    return this._decodeLiteral(str);
  }

  /**
   * Imports a charset from a string
   * @hidden
   * @privateRemark Not implemented yet
   * @param charsetStr Charset string
   */
  public static importCharset(charsetStr: string) {
    let charset = JSON.parse(charsetStr);
    let charClass;
    if (Array.isArray(charset)) {
    }
    if (charset.type === "literal") {
    }
  }

  /**
   * Converts this to json
   * @returns BaseCharset in JSON form
   */
  public toJSON() {
    return {
      type: this.type,
      mode: this.mode,
      charset: Array.from(this._charsetMap),
    };
  }

  /** .toString method */
  public toString() {
    return JSON.stringify(this.toJSON());
  }
}

export default BaseCharset;
