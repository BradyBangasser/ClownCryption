import * as fs from 'fs';

/**
 * @internal
 * A basic charset
 */
declare abstract class BaseCharset {
    /** Charset Characters */
    private _charset;
    /** Map of the charset */
    private _charsetMap;
    /** An inverted map of the charset */
    private _inverseCharsetMap;
    /** The common replacers used in the efficient binary charsets */
    private _commonReplacer;
    /** The typeof the charset */
    readonly type: CharsetType;
    /** The charset mode */
    mode: CharsetMode;
    /**
     *
     * @param type binary, this is just the type of the charset
     * @param mode The mode of the charset, efficient or normal
     * @param binaryCharset A object with efficient or normal binary encoding characters
     * @param commonReplacers The common replacers for the efficienct binary charset
     */
    constructor(type: "binary", mode: CharsetMode, binaryCharset: IEfficientBinaryCharset | IBinaryCharset, commonReplacers?: [string, string][]);
    /**
     * Creates a literal charset
     * @param type literal, this is just the type of the charset
     * @param mode Normal or efficient, this doesn't really matter for the literal charset
     * @param stringCharset A literal charset Object
     */
    constructor(type: "literal", mode: string, stringCharset: ILiteralCharset);
    /** Gets the charset characters */
    get charset(): ICharsetChars;
    /**
     * Creates a {@link BaseCharset._charsetMap | map} and an {@link BaseCharset._inverseCharsetMap} of a charset
     * @param charset The charset
     */
    private _createCharsetMap;
    /**
     * Gets the charset translation of a character
     * @param character The character
     * @returns string or undefined
     */
    getChar(character: string | number): string | undefined;
    /**
     * Encodes a binry string
     * @param str The string
     * @returns Encoded binary string
     */
    private _encodeBinary;
    /**
     * Encodes a literal string
     * @param str The string
     * @returns The encoded string
     */
    private _encodeLiteral;
    validChars(str: string): boolean;
    /**
     * Returns all emojis in a string
     * @param str The string
     * @returns An array of emojis
     */
    static getStringEmojis(str: string): string[];
    /**
     * This check to see if a character or string is all emojis
     * @param char The string or character
     * @returns true if all character in char are emojis, else false
     */
    static isEmoji(char: string): boolean;
    /**
     * String to decode to binary
     * @param str String
     * @returns Decoded string
     */
    private _decodeBinary;
    /**
     * Decodes a literal string
     * @param str String
     * @returns Decoded string
     */
    private _decodeLiteral;
    /**
     * Encodes string with the current charset
     * @param str String
     * @returns Encoded string
     */
    encode(str: string): string;
    /**
     * Decodes string
     * @param str String
     * @returns Decoded string
     */
    decode(str: string): string;
    /**
     * Imports a charset from a string
     * @hidden
     * @privateRemark Not implemented yet
     * @param charsetStr Charset string
     */
    static importCharset(charsetStr: string): void;
    /**
     * Converts this to json
     * @returns BaseCharset in JSON form
     */
    toJSON(): {
        type: CharsetType;
        mode: CharsetMode;
        charset: [string, string][];
    };
    /** .toString method */
    toString(): string;
}

/**
 * Charset Template
 * @remarks This class is ment to be extended and create subclasses for charsets
 */
declare abstract class PublicCharset extends BaseCharset {
    /** Name of the Charset */
    readonly name: string;
    /** The aliases of the charset */
    readonly aliases: string[];
    /**
     * Creates an Efficient Binary Charset
     * @param name Name of the charset
     * @param charset The charset characters
     * @param aliases The aliases of the charset
     */
    constructor(name: string, charset: IEfficientBinaryCharset, aliases?: string | string[]);
    /**
     * Creates a Binary Charset
     * @param name The name of the charset
     * @param charset The charset characters
     * @param aliases The aliases of the charset
     */
    constructor(name: string, charset: IBinaryCharset, aliases?: string | string[]);
    /**
     * Creates a Literal Charset
     * @param name Name of the charset
     * @param charset The charset characters
     * @param aliases The aliases of the charset
     */
    constructor(name: string, charset: ILiteralCharset, aliases?: string | string[]);
}
/** Creates an Efficient Binary Charset */
declare class EfficientBinaryCharset extends PublicCharset {
    constructor(name: string, chars: IEfficientBinaryCharset, aliases?: string | string[]);
}
/** Creates a Binary Charset */
declare class BinaryCharset extends PublicCharset {
    constructor(name: string, chars: {
        0: string;
        1: string;
    } | {
        "0": string;
        "1": string;
    }, aliases?: string | string[]);
}
/** Creates a Literal Charset */
declare class LiteralCharset extends PublicCharset {
    constructor(name: string, chars: ILiteralCharset, aliases?: string | string[]);
}

type charsets_EfficientBinaryCharset = EfficientBinaryCharset;
declare const charsets_EfficientBinaryCharset: typeof EfficientBinaryCharset;
type charsets_BinaryCharset = BinaryCharset;
declare const charsets_BinaryCharset: typeof BinaryCharset;
type charsets_LiteralCharset = LiteralCharset;
declare const charsets_LiteralCharset: typeof LiteralCharset;
type charsets_PublicCharset = PublicCharset;
declare const charsets_PublicCharset: typeof PublicCharset;
declare namespace charsets {
  export {
    charsets_EfficientBinaryCharset as EfficientBinaryCharset,
    charsets_BinaryCharset as BinaryCharset,
    charsets_LiteralCharset as LiteralCharset,
    charsets_PublicCharset as PublicCharset,
  };
}

/**
 * The Default Binary Charset
 * @chars
 * * 0: 🤡
 * * 1: 🤓
 */
declare const DefaultBinaryCharset: BinaryCharset;
/**
 * The Default Efficient Binary Charset
 * @chars
 * * 0: 🤡
 * * 1: 🤓
 * * 2: 🫁
 * * 3: 🤯
 * * 4: 📮
 * * 5: 🐄
 * * 6: 🗿
 * * 7: 💩
 * * 8: 🤠
 * * 9: 🥴
 * * .: 😐
 * * :: 😏
 * * Common Replacer 1: 🤯
 * * Common Replacer 2: 🥛
 */
declare const DefaultEfficientBinaryCharset: EfficientBinaryCharset;
/**
 * The Default Literal Charset
 * @chars
 * * a: 🥸
 * * b: 🥛
 * * c: 🗿
 * * d: 🤨
 * * e: 😐
 * * f: 😏
 * * 0: 🤡
 * * 1: 🤓
 * * 2: 🫁
 * * 3: 🤯
 * * 4: 📮
 * * 5: 🐄
 * * 6: 🥌
 * * 7: 💩
 * * 8: 🤠
 * * 9: 🥴
 */
declare const DefaultLiteralCharset: LiteralCharset;
/**
 * @internal
 * Mangages Charsets
 */
declare class CharsetManager {
    /** @hidden */
    static instance?: CharsetManager;
    /** @hidden */
    private constructor();
    /**
     * The place charsets are stored
     */
    private _charsets;
    /**
     * fetches a charset from {@link _charsets | the charset map}
     * @param name Name of the charset
     * @returns The charset or undefined
     */
    getCharset(name: string): PublicCharset | undefined;
    /**
     * Adds Charset to the manager
     * @param charset The charset to add
     */
    addCharset(charset: PublicCharset): void;
    /**
     * Removes a charset from the manager
     * @param name Name of the charset
     * @returns True if the charset was sucessfully removed, else false
     */
    removeCharset(name: string): boolean;
    /** @hidden */
    static init(): CharsetManager;
}
declare const _default: CharsetManager;

declare const defaults_DefaultBinaryCharset: typeof DefaultBinaryCharset;
declare const defaults_DefaultEfficientBinaryCharset: typeof DefaultEfficientBinaryCharset;
declare const defaults_DefaultLiteralCharset: typeof DefaultLiteralCharset;
type defaults_CharsetManager = CharsetManager;
declare const defaults_CharsetManager: typeof CharsetManager;
declare namespace defaults {
  export {
    _default as default,
    defaults_DefaultBinaryCharset as DefaultBinaryCharset,
    defaults_DefaultEfficientBinaryCharset as DefaultEfficientBinaryCharset,
    defaults_DefaultLiteralCharset as DefaultLiteralCharset,
    defaults_CharsetManager as CharsetManager,
  };
}

/**
 * Main Client of ClownCryption
 */
declare class ClownCryption {
    #private;
    /**
     * The instance charset, this is the default value for the {@link ClownCryption.encrypt | Encrypt Method} charset
     * @extends PublicCharset
     */
    private _charset;
    /**
     * The instance algorithm, this is the default value for the {@link ClownCryption.encrypt | Encrypt Method} algorithm
     */
    private _algorithm;
    /**
     * @hidden
     * @privateRemark Needs some more work to implement
     * The instance Common Replacers, these are the default value the {@link ClownCryption.encrypt | Encrypt Method} Common Replacers
     */
    private _commonReplacers;
    /**
     * The instance salt, this is the default value for the {@link ClownCryption.encrypt | Encrypt Method} salt
     */
    private _salt;
    /**
     * The instance IV, this is the default value for the {@link ClownCryption.encrypt | Encrypt Method} IV
     */
    private _iv;
    /**
     * Manages the charsets
     * @see {@link defaultCharsets.CharsetManager}
     */
    readonly charsetMangager: CharsetManager;
    /**
     * @hidden
     * @privateRemark Common replacers
     */
    private static readonly _commonReplacers;
    /**
     * Creates a new ClownCryption Instance
     * @param options Options for the ClownCryption Constructor
     */
    constructor({ key, iv, salt, charset, algorithm, commonReplacers, }: ClownOptions);
    /**
     * Fetches a CharsetManager
     * @param charset {@link charsets.PublicCharset | Charset} or string
     * @returns If a {@link charsets.PublicCharset | Charset} is provided it is returned else it tries to fetch the charset from the built in charsets
     * @see {@link defaultCharsets.CharsetManager | Charset Manager}
     */
    private static _getCharset;
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
    static aesEncrypt(str: string, key: string, iv: string, keylen?: 128 | 192 | 256, salt?: string, log?: boolean): string;
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
    static aesDecrypt(str: string, key: string, iv: string, keylen?: 128 | 192 | 256, salt?: string, log?: boolean): string;
    /**
     * Encrypts and Encodes a message
     * @remarks The function uses the {@link https://nodejs.org/api/crypto.html#cryptocreatecipherivalgorithm-key-iv-options | Crypto.createCipheriv} function to encrypt a message and than than message is passed into the {@link charsets.PublicCharset.encode | encode} function, this creates a encrypted encoded message that is returned
     * @param {EncryptionOptions} options options for the encryption
     * @returns {string} The encrypted encoded message
     */
    encrypt({ message, key, iv, charset, algorithm, salt, }: EncryptOptions): string;
    /**
     * Encrypts and Encodes a message
     * @remark The function uses the {@link https://nodejs.org/api/crypto.html#cryptocreatecipherivalgorithm-key-iv-options | Crypto.createCipheriv} function to encrypt a message and than than message is passed into the {@link charsets.PublicCharset.encode | encode} function, this creates a encrypted encoded message that is returned
     * @param options The options for the static encrypt function
     * @returns The encrypted encoded message
     */
    static encrypt({ message, key, iv, charset, algorithm, salt, }: StaticEncryptOptions): string;
    /**
     * Decodes and Decrypts the message
     * @remarks The function passes the message into {@link charsets.PublicCharset.decode} and passes that result into the {@link https://nodejs.org/api/crypto.html#cryptocreatedecipherivalgorithm-key-iv-options | Crypto.createDecrypteriv} function and the result of that is returned
     * @param options Options for the decrption
     * @returns Decoded and Decrypted string
     */
    decrypt({ message, key, iv, salt, algorithm, charset, }: EncryptOptions): string;
    /**
     * Decodes and Decrypts the message
     * @remarks The function passes the message into {@link charsets.PublicCharset.decode} and passes that result into the {@link https://nodejs.org/api/crypto.html#cryptocreatedecipherivalgorithm-key-iv-options | Crypto.createDecrypteriv} function and the result of that is returned
     * @param options Options for the decrption
     * @returns Decoded and Decrypted string
     */
    static decrypt({ message, key, iv, charset, algorithm, salt, }: StaticEncryptOptions): string;
    /**
     * @returns The instance key
     * @see {@link https://en.wikipedia.org/wiki/Key_(cryptography) | Key Cryptography Definition}
     */
    get key(): string;
    /**
     * @returns The instance IV
     * @see {@link https://en.wikipedia.org/wiki/Initialization_vector | IV Cryptography Definition}
     */
    get iv(): string;
    /**
     * @returns The instance Charset
     */
    get charset(): PublicCharset;
    /**
     * @returns The Instance salt
     * @see {@link https://en.wikipedia.org/wiki/Salt_(cryptography) | Salt Cryptography Definition}
     */
    get salt(): string;
    /**
     * @returns The Instance Algorithm
     * @see {@link https://www.openssl.org/docs/man1.1.1/man1/ciphers.html | OpenSSL Ciphers}
     */
    get algorithm(): Algorithms;
    /**
     * @returns The Instance Common Replacers
     */
    get commonReplacers(): [string, string][];
    /**
     * Exports a message to a file
     * @param encryptedString The message to export
     * @param options The export options
     * @returns Path of the exported file
     * @see {@link CFS.generateStringFile}
     * @see {@link ClownCryption.importStringFile}
     */
    exportStringToFile(encryptedString: string, { fileName, filePath, overwrite, exportType, encryptFile, encryptInClown, key, includeKey, iv, includeIv, algorithm, includeAlgorithm, salt, includeSalt, charset, includeCharset, commonReplacers, }: IFileExportOptions): string;
    /**
     * Imports a message from a file
     * @param filePath Path to the file
     * @param key Encryption key
     * @returns Content of the file
     * @see {@link CFS.readStringFile}
     * @see {@link ClownCryption.exportStringToFile}
     */
    importStringFile(filePath: string, key?: string): {
        [key: string]: any;
    };
    /**
     * Exports the configuration of the instance
     * @param fileName Path to the file
     * @param options Options of the export
     * @returns Path of the export file
     * @see {@link CFS.exportConfig}
     */
    exportConfigToFile(fileName: string, options: IExportConfigOptions): string;
    /**
     * Condenses Binary
     * @param binaryString A string in binary
     * @returns Condensed Binary
     * @see {@link ClownCryption.decondenseBinary}
     */
    static condenseBinary(binaryString: string): string;
    /**
     * Decondenses Binary
     * @param condensedBinary Condensed Binary String
     * @returns Decondensed String
     * @see {@link ClownCryption.condenseBinary}
     */
    static decondenseBinary(condensedBinary: string): string;
    /**
     * Finds patterns in a string
     * @param str The string to search
     * @param maxPatternSize The maximum length of the pattern
     * @param minPatternSize  The minimum length of the pattern
     * @returns A list of patterns as [pattern, amount] ordered high to low count, all patterns will be the same length
     */
    static findPattern(str: string, maxPatternSize?: number, minPatternSize?: number): [string, number][];
    /**
     * Creates a new ClownCryption instance based on a configuration file
     * @param filePath The import file's path
     * @param key The encryption key
     * @returns New ClownCryption instance
     * @see {@link ClownCryption.exportConfigToFile}
     */
    static importFileConfig(filePath: string, key?: string): ClownCryption;
    /**
     * Gets the binary value of a string
     * @param str The string
     * @returns The string encoded in binary
     */
    static getBinary(str: string): string;
    /**
     * Repeats a string a specified number of times and returns it
     * @param str The string
     * @param num The amount of times to repeat it
     * @returns The new string
     */
    static multiplyString(str: string, num: number): string;
}

/**
 * Clown File System, manages files, imports, and exports
 */
declare class CFS {
    /** @hidden */
    private constructor();
    /**
     * Creates a file that contains the message and other parameters
     * @param {string} str The message to be exported to the file
     * @param {IFileExportOptions} options The export options
     * @returns {string} The export file's path
     */
    static generateStringFile(str: string, { fileName, filePath, overwrite, exportType, encryptFile, encryptInClown, key, includeKey, iv, includeIv, algorithm, includeAlgorithm, salt, includeSalt, charset, includeCharset, commonReplacers, includeCommonReplacers, }: IFileExportOptions): string;
    /**
     * Reads the content of a file and returns them in object format
     * @param filePath The path to the file
     * @param key The key to decrypt the file
     * @returns The content of the file in object format
     */
    static readStringFile(filePath: string | fs.PathLike, key?: string): {
        [key: string]: any;
    };
    /**
     * This exports the configuration of a client to a file
     * @param filePath The path of the export file
     * @param client The {@link ClownCryption} client
     * @param options The options for exporting
     * @returns The export file's path
     */
    static exportConfig(filePath: string, client: ClownCryption, { encryptFile, exportType, includeAlgorithm, includeCharset, includeCommonReplacers, includeSalt, encryptInClown, }: IExportConfigOptions): string;
    /**
     * Read a configuration file and returns it as an object
     * @param filePath Path to the file to read
     * @param key The encryption key
     * @returns The configuration
     */
    static readFileConfig(filePath: string, key?: string): {
        [key: string]: string;
    };
    /**
     * Check to see if a string is a hex string or not
     * @param str String to check
     * @returns boolean
     */
    static isHex(str: string | {
        [key: string]: string;
    }): boolean;
    /**
     * @internal Stringifys objects the correct way, and only does so if includeProp is true
     * @param prop The prop to stringify
     * @param includeProp Whether to stringify the prop, if false returns undefined
     * @returns undefined if includeProp is false else returns a string
     */
    private static _stringProp;
    /**
     * Formats the path of files
     * @param filePath The path of the file
     * @param overwrite If false and the file exists the function will generate a random name for the file, else overwrites the file
     * @param includeFileExt If you want to include the file extention of the file if one is found
     * @returns fileName and path
     */
    private static _serializePath;
    /**
     * Generates a buffer to be written to an output file
     * @param content The content of the new file
     * @param fileType Which format you want to export to
     * @param encrypt If you want to encrypt the file or not
     * @param encodeInClown If you want the file to be encoded in clown
     * @returns A buffer with the content
     */
    private static _generateOutputString;
    /**
     * Parses the content of the file
     * @param content The content of the imported file
     * @param key The key to the encryption
     * @returns An object with the content of the file
     */
    private static _generateInputObject;
}

/**
 * Different Charset types
 */
declare type CharsetType = "binary" | "literal";
/**
 * Different Charset Modes
 */
declare type CharsetMode = "normal" | "efficient";
/**
 * Different classes of charsets
 */
declare type ICharsetChars = IEfficientBinaryCharset | ILiteralCharset | IBinaryCharset;
/** Supported algorithms */
declare type Algorithms = "aes128" | "aes192" | "aes256";
/**
 * Defines the options for the {@link ClownCryption.constructor | ClownCryption Constructor}
 * @interal
 */
interface ClownOptions {
    /**
     * The instance key for the encryption algorithm
     * @see {@link https://en.wikipedia.org/wiki/Key_(cryptography) | Key Cryptography Definition}
     */
    key: string;
    /**
     * The instance Initalizing Vector for the encryption algorithm
     * @see {@link https://en.wikipedia.org/wiki/Initialization_vector | IV Cryptography Definition}
     */
    iv: string;
    /**
     * The instance salt for the encryption algorithm
     * @defaultValue pepper
     * @see {@link https://en.wikipedia.org/wiki/Salt_(cryptography) | Salt Cryptography Definition}
     */
    salt?: string;
    /**
     * The name of a charset or a charset to set as the instance charset
     * @defaultValue {@link charsets.EfficientBinaryCharset}
     */
    charset?: PublicCharset | string;
    /**
     * The Algorithm used to encrypt the message
     * @defaultValue aes192
     */
    algorithm?: Algorithms;
    /**
     * Common Replacers for the algorithm
     * @remarks The common replacers are used on the Efficient Binary charsets to reduce the length of the binary string by replacing common patterns with these
     * @defaultValue ["100", "_"], ["110", "+"]
     */
    commonReplacers?: [string, string][];
}
/**
 * Options for the encrypt and decrypt functions on a ClownCryption instance
 * @see {@link https://nodejs.org/api/crypto.html#cryptoscryptsyncpassword-salt-keylen-options}
 */
interface EncryptOptions {
    /**
     * The message to be encrypted or decrypted
     */
    message: string;
    /**
     * A string used as the key for the encryption algorithm
     * @defaultValue {@link ClownCryption.#key | ClownCryption Instance Key}
     * @see {@link https://en.wikipedia.org/wiki/Key_(cryptography) | Key Cryptography Definition}
     */
    key?: string;
    /**
     * String used as the Initalizing Vector in the encryption algorithm
     * @defaultValue {@link ClownCryption._iv | ClownCryption Instance IV}
     * @see {@link https://en.wikipedia.org/wiki/Initialization_vector | IV Cryptography Definition}
     */
    iv?: string;
    /**
     * String used as salt in the encryption algorithm
     * @defaultValue {@link ClownCryption._salt | ClownCryption Instance Salt}
     * @see {@link https://en.wikipedia.org/wiki/Salt_(cryptography) | Salt Cryptography Definition}
     */
    salt?: string;
    /**
     * The Encryption algorithm used to encrypt the message
     * @defaultValue {@link ClownCryption._algorithm | ClownCryption Instance Algorithm}
     * @see {@link https://www.openssl.org/docs/man1.1.1/man1/ciphers.html | OpenSSL Ciphers}
     */
    algorithm?: ClownOptions["algorithm"];
    /**
     * The Charset used to encode the encrypted string
     * @defaultValue {@link ClownCryption._charset | ClownCryption Instance Charset}
     * @see {@link defaultCharsets | Default Charsets}
     */
    charset?: PublicCharset;
}
/**
 * Options for the static encrypt and decrypt function on the ClownCryption class
 */
interface StaticEncryptOptions {
    /**
     * The message to be encrypted or decrypted
     */
    message: string;
    /**
     * String used as the key for the encryption algorithm
     * @see {@link https://en.wikipedia.org/wiki/Key_(cryptography) | Key Cryptography Definition}
     */
    key: string;
    /**
     * String used as the Initalizing Vector in the encryption algorithm
     * @see {@link https://en.wikipedia.org/wiki/Initialization_vector | IV Cryptography Definition}
     */
    iv: string;
    /**
     * String used as salt in the encryption algorithm
     * @defaultValue pepper
     * @see {@link https://en.wikipedia.org/wiki/Salt_(cryptography) | Salt Cryptography Definition}
     */
    salt?: string;
    /**
     * The algorithm used to encrypt the message
     * @defaultValue aes192
     * @see {@link https://www.openssl.org/docs/man1.1.1/man1/ciphers.html | OpenSSL Ciphers}
     */
    algorithm?: Algorithms;
    /**
     * The charset used to encode the encrypted message
     * @defaultValue {@link defaultCharsets.DefaultEfficientBinaryCharset | Default Efficient Binary Charset}
     * @see {@link charsets.PublicCharset}
     */
    charset?: PublicCharset | string;
}
/**
 * Base Public Charset Options
 * @internal
 */
interface IPublicCharsetBaseOptions {
    /**
     * Name of the Charset
     */
    name: string;
    /**
     * Aliases for the charset
     */
    aliases?: string | string[];
}
/**
 * Public charset options for Literal Charsets
 */
interface ILiteralCharsetOptions extends IPublicCharsetBaseOptions {
    /** @hidden */
    type?: "literal";
    /** @hidden */
    mode?: string;
    /**
     * The Literal Charset Characters
     */
    charset: ILiteralCharset;
}
/**
 * Public charset options for Binary Charsets
 */
interface IBinaryCharsetOptions extends IPublicCharsetBaseOptions {
    /** @hidden */
    type?: "binary";
    /**
     * Which mode the charset is in
     * @defaultValue efficient
     */
    mode?: CharsetMode;
    /**
     * The Charset Characters
     */
    charset: BinaryCharset | EfficientBinaryCharset;
}
/**
 * Binary Charset Template
 */
interface IBinaryCharset {
    /** What the character 0 is replaced with */
    0: string;
    /** What the character 1 is replaced with */
    1: string;
}
/**
 * Efficient Binary Charset Template
 */
interface IEfficientBinaryCharset {
    /** What the character 0 is replaced with */
    0: string;
    /** What the character 1 is replaced with */
    1: string;
    /** What the character 2 is replaced with */
    2: string;
    /** What the character 3 is replaced with */
    3: string;
    /** What the character 4 is replaced with */
    4: string;
    /** What the character 5 is replaced with */
    5: string;
    /** What the character 6 is replaced with */
    6: string;
    /** What the character 7 is replaced with */
    7: string;
    /** What the character 8 is replaced with */
    8: string;
    /** What the character 9 is replaced with */
    9: string;
    /** What the character : is replaced with */
    ":": string;
    /** What the first common replacer is replaced with */
    commonReplacer1: string;
    /** What the second common replacer is replaced with */
    commonReplacer2: string;
    /** What the character . is replaced with */
    ".": string;
}
/**
 * Literal Charset Template
 */
interface ILiteralCharset {
    /** What the character a is replaced with */
    a: string;
    /** What the character b is replaced with */
    b: string;
    /** What the character c is replaced with */
    c: string;
    /** What the character d is replaced with */
    d: string;
    /** What the character e is replaced with */
    e: string;
    /** What the character f is replaced with */
    f: string;
    /** What the character 0 is replaced with */
    "0": string;
    /** What the character 1 is replaced with */
    "1": string;
    /** What the character 2 is replaced with */
    "2": string;
    /** What the character 3 is replaced with */
    "3": string;
    /** What the character 4 is replaced with */
    "4": string;
    /** What the character 5 is replaced with */
    "5": string;
    /** What the character 6 is replaced with */
    "6": string;
    /** What the character 7 is replaced with */
    "7": string;
    /** What the character 8 is replaced with */
    "8": string;
    /** What the character 9 is replaced with */
    "9": string;
}
/**
 * Options for exporting a file
 */
interface IFileExportOptions {
    /**
     * The name of the file the export will be written to
     */
    fileName: string;
    /**
     * The path to the file the exprot will be written to, if the fileName and the end of the filePath don't match up the fileName will be added onto the end of the filePath
     */
    filePath?: string;
    /**
     * If you want to overwrite the file if it already exists
     * @defaultValue false
     */
    overwrite?: boolean;
    /**
     * The file type you would like to export to
     * @defaultValue clown
     */
    exportType?: "clown" | "json" | "js";
    /**
     * Whether to encrypt the export file or not,
     * If a string is provided that string is used as the key of the encryption, not available for js export type
     * @defaultValue false
     */
    encryptFile?: false | string;
    /**
     * @hidden
     * @privateRemark Not implemented yet
     */
    encryptInClown?: boolean | "short" | "very short";
    /**
     * The exported key,
     * The key is only exported if {@link IFileExportOptions.includeKey | includeKey} is set to true
     * @defaultValue {@link ClownCryption.#key | ClownCryption Instance Key}
     * @see {@link https://en.wikipedia.org/wiki/Key_(cryptography) | Key Cryptography Definition}
     */
    key?: string;
    /**
     * Whether {@link IFileExportOptions.key | the key} should be exported or not
     * @defaultValue false
     */
    includeKey?: boolean;
    /**
     * The exported IV,
     * The IV is only exported if {@link IFileExportOptions.includeIv | includeIv} is set to true
     * @defaultValue {@link ClownCryption._iv | ClownCryption Instance IV}
     * @see {@link https://en.wikipedia.org/wiki/Initialization_vector | IV Cryptography Definition}
     */
    iv?: string;
    /**
     * Whether {@link IFileExportOptions.iv | the IV} should be exported or not
     * @defaultValue false
     */
    includeIv?: boolean;
    /**
     * The exported algorithm,
     * The algorithm is only exported if {@link IFileExportOptions.includeAlgorithm | includeAlgorithm} is set to true
     * @defaultValue {@link ClownCryption._algorithm | ClownCryption Instance Algorithm}
     * @see {@link https://www.openssl.org/docs/man1.1.1/man1/ciphers.html | OpenSSL Ciphers}
     */
    algorithm?: Algorithms;
    /**
     * Whether {@link IFileExportOptions.algorithm | the algorithm} should be exported or not
     * @defaultValue false
     */
    includeAlgorithm?: boolean;
    /**
     * The exported algorithm,
     * The salt is only exported if {@link IFileExportOptions.includeSalt | includeSalt} is set to true
     * @defaultValue {@link ClownCryption._salt | ClownCryption Instance Salt}
     * @see {@link https://en.wikipedia.org/wiki/Salt_(cryptography) | Salt Cryptography Definition}
     */
    salt?: string;
    /**
     * Whether {@link IFileExportOptions.salt | the salt} should be exported or not
     * @defaultValue false
     */
    includeSalt?: boolean;
    /**
     * The exported charset,
     * The charset is only exported if {@link IFileExportOptions.includeCharset | includeCharset} is set to true
     * @defaultValue {@link ClownCryption._charset | ClownCryption Instance Charset}
     */
    charset?: PublicCharset;
    /**
     * Whether {@link IFileExportOptions.charset | the charset} should be exported or not
     * @defaultValue false
     */
    includeCharset?: boolean;
    /**
     * The exported Common Replacers,
     * The Common Replacers are only exported if {@link IFileExportOptions.includeCommonReplacers | includeCommonReplacers} is set to true
     * @defaultValue {@link ClownCryption.commonReplacers | ClownCryption Instance Common Replacers}
     */
    commonReplacers?: [string, string][];
    /**
     * Whether {@link IFileExportOptions.commonReplacers | the Common Replacers} should be exported or not
     * @defaultValue false
     */
    includeCommonReplacers?: boolean;
    /**
     * If you want to include whitespace in the export,
     * Only used when {@link IFileExportOptions.exportType | Export Type} is json
     * @defaultValue false
     */
    includeWhiteSpace?: boolean;
}
/**
 * The configuration export options
 */
interface IExportConfigOptions {
    /**
     * Whether to encrypt the export file or not,
     * If a string is provided that string is used as the key of the encryption, not available for js export type
     * @defaultValue false
     */
    encryptFile?: false | string;
    /**
     * Whether to export the instance charset
     * @defaultValue true
     */
    includeCharset?: boolean;
    /**
     * Whether to export the instance Common Replacers
     * @defaultValue true
     */
    includeCommonReplacers?: boolean;
    /**
     * Whether to export the instance algorithm
     * @defaultValue true
     */
    includeAlgorithm?: boolean;
    /**
     * Whether to export the instance salt
     * @defaultValue true
     */
    includeSalt?: boolean;
    /**
     * The file type you would like to export to
     * @defaultValue clown
     */
    exportType?: "clown" | "json" | "js";
    /**
     * If you want the output file to put encoded in clown
     * @defaultValue true
     */
    encryptInClown?: boolean | "short" | "very short";
}

export { Algorithms, CFS, CharsetMode, CharsetType, ClownCryption, ClownOptions, EncryptOptions, IBinaryCharset, IBinaryCharsetOptions, ICharsetChars, IEfficientBinaryCharset, IExportConfigOptions, IFileExportOptions, ILiteralCharset, ILiteralCharsetOptions, StaticEncryptOptions, charsets, ClownCryption as default, defaults as defaultCharsets };
