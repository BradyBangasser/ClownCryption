import Crypto from "crypto"
import ClownCryption from "./clowncryption"
import CFS from "./fileSystem"
import * as charsets from "./defaultCharsets/charsets"
import * as defaultCharsets from "./defaultCharsets/defaults"

/**
 * Different Charset types
 */
export type CharsetType = "binary" | "literal"

/**
 * Different Charset Modes
 */
export type CharsetMode = "normal" | "efficient"

/**
 * Different classes of charsets
 */
export type ICharsetChars = IEfficientBinaryCharset | ILiteralCharset | IBinaryCharset

/**
 * Defines the options for the ClownCryption Constructor
 * @interal
 */
export interface ClownOptions {
    /**
     * The instance key for the encryption algorithm
     * @see {@link https://en.wikipedia.org/wiki/Key_(cryptography) | Key Cryptography Definition}
     */
    key: string

    /**
     * The instance Initalizing Vector for the encryption algorithm
     * @see {@link https://en.wikipedia.org/wiki/Initialization_vector | IV Cryptography Definition}
     */
    iv: string

    /**
     * The instance salt for the encryption algorithm
     * @defaultValue pepper
     * @see {@link https://en.wikipedia.org/wiki/Salt_(cryptography) | Salt Cryptography Definition}
     */
    salt?: string

    /**
     * The name of a charset or a charset to set as the instance charset
     * @defaultValue {@link charsets.EfficientBinaryCharset}
     */
    charset?: charsets.PublicCharset | string

    /**
     * The Algorithm used to encrypt the message
     * @defaultValue aes-192-ccm
     */
    algorithm?: Crypto.CipherCCMTypes | Crypto.CipherGCMTypes | Crypto.CipherOCBTypes

    /** @hidden */
    commonReplacers?: [string, string][]
}

/**
 * Options for the encrypt and decrypt functions on a ClownCryption instance
 * @see {@link https://nodejs.org/api/crypto.html#cryptoscryptsyncpassword-salt-keylen-options}
 */
export interface EncryptOptions {
    /**
     * The message to be encrypted or decrypted
     */
    message: string

    /**
     * A string used as the key for the encryption algorithm
     * @defaultValue {@link ClownCryption.#key | ClownCryption Instance Key}
     * @see {@link https://en.wikipedia.org/wiki/Key_(cryptography) | Key Cryptography Definition}
     */
    key?: string

    /**
     * String used as the Initalizing Vector in the encryption algorithm
     * @defaultValue {@link ClownCryption._iv | ClownCryption Instance IV}
     * @see {@link https://en.wikipedia.org/wiki/Initialization_vector | IV Cryptography Definition}
     */
    iv?: string

    /**
     * String used as salt in the encryption algorithm
     * @defaultValue {@link ClownCryption._salt | ClownCryption Instance Salt}
     * @see {@link https://en.wikipedia.org/wiki/Salt_(cryptography) | Salt Cryptography Definition}
     */
    salt?: string

    /**
     * The Encryption algorithm used to encrypt the message
     * @defaultValue {@link ClownCryption._algorithm | ClownCryption Instance Algorithm}
     * @see {@link https://www.openssl.org/docs/man1.1.1/man1/ciphers.html | OpenSSL Ciphers}
     */
    algorithm?: ClownOptions["algorithm"]

    /**
     * The Charset used to encode the encrypted string
     * @defaultValue {@link ClownCryption._charset | ClownCryption Instance Charset}
     * @see {@link defaultCharsets | Default Charsets}
     */
    charset?: charsets.PublicCharset
}

/**
 * Options for the static encrypt and decrypt function on the ClownCryption class
 */
export interface StaticEncryptOptions {
    /**
     * The message to be encrypted or decrypted
     */
    message: string

    /**
     * String used as the key for the encryption algorithm
     * @see {@link https://en.wikipedia.org/wiki/Key_(cryptography) | Key Cryptography Definition}
     */
    key: string

    /**
     * String used as the Initalizing Vector in the encryption algorithm
     * @see {@link https://en.wikipedia.org/wiki/Initialization_vector | IV Cryptography Definition}
     */
    iv: string

    /**
     * String used as salt in the encryption algorithm
     * @defaultValue pepper
     * @see {@link https://en.wikipedia.org/wiki/Salt_(cryptography) | Salt Cryptography Definition}
     */
    salt?: string

    /**
     * The algorithm used to encrypt the message
     * @defaultValue aes-192-cbc
     * @see {@link https://www.openssl.org/docs/man1.1.1/man1/ciphers.html | OpenSSL Ciphers}
     */
    algorithm?: ClownOptions["algorithm"]

    /**
     * The charset used to encode the encrypted message
     * @defaultValue {@link defaultCharsets.DefaultEfficientBinaryCharset | Default Efficient Binary Charset} 
     * @see {@link charsets.PublicCharset}
     */
    charset?: charsets.PublicCharset
}

/**
 * Base Public Charset Options
 * @internal
 */
interface IPublicCharsetBaseOptions {
    /**
     * Name of the Charset
     */
    name: string

    /**
     * Aliases for the charset
     */
    aliases?: string | string[]
}

/**
 * Public charset options for Literal Charsets
 */
export interface ILiteralCharsetOptions extends IPublicCharsetBaseOptions {
    /** @hidden */
    type?: "literal"
    /** @hidden */
    mode?: string

    /**
     * The Literal Charset Characters
     */
    charset: ILiteralCharset
}

/**
 * Public charset options for Binary Charsets
 */
export interface IBinaryCharsetOptions extends IPublicCharsetBaseOptions {
    /** @hidden */
    type?: "binary"

    /**
     * Which mode the charset is in
     * @defaultValue efficient
     */
    mode?: CharsetMode

    /**
     * The Charset Characters
     */
    charset: charsets.BinaryCharset | charsets.EfficientBinaryCharset
}

/**
 * Binary Charset Template
 */
export interface IBinaryCharset {
    /** What the character 0 is replaced with */
    0: string
    /** What the character 1 is replaced with */
    1: string
}

/**
 * Efficient Binary Charset Template
 */
export interface IEfficientBinaryCharset {
    /** What the character 0 is replaced with */
    0: string
    /** What the character 1 is replaced with */
    1: string
    /** What the character 2 is replaced with */
    2: string
    /** What the character 3 is replaced with */
    3: string
    /** What the character 4 is replaced with */
    4: string
    /** What the character 5 is replaced with */
    5: string
    /** What the character 6 is replaced with */
    6: string
    /** What the character 7 is replaced with */
    7: string
    /** What the character 8 is replaced with */
    8: string
    /** What the character 9 is replaced with */
    9: string
    /** What the character : is replaced with */
    ":": string
    /** What the first common replacer is replaced with */
    "commonReplacer1": string
    /** What the second common replacer is replaced with */
    "commonReplacer2": string
    /** What the character . is replaced with */
    ".": string
}

/**
 * Literal Charset Template
 */
export interface ILiteralCharset {
    /** What the character a is replaced with */
    "a": string
    /** What the character b is replaced with */
    "b": string
    /** What the character c is replaced with */
    "c": string
    /** What the character d is replaced with */
    "d": string
    /** What the character e is replaced with */
    "e": string
    /** What the character f is replaced with */
    "f": string
    /** What the character 0 is replaced with */
    "0": string
    /** What the character 1 is replaced with */
    "1": string
    /** What the character 2 is replaced with */
    "2": string
    /** What the character 3 is replaced with */
    "3": string
    /** What the character 4 is replaced with */
    "4": string
    /** What the character 5 is replaced with */
    "5": string
    /** What the character 6 is replaced with */
    "6": string
    /** What the character 7 is replaced with */
    "7": string
    /** What the character 8 is replaced with */
    "8": string
    /** What the character 9 is replaced with */
    "9": string
}

/**
 * Options for exporting a file
 */
export interface IFileExportOptions {
    /**
     * The name of the file the export will be written to
     */
    fileName: string

    /**
     * The path to the file the exprot will be written to, if the fileName and the end of the filePath don't match up the fileName will be added onto the end of the filePath
     */
    filePath?: string

    /**
     * If you want to overwrite the file if it already exists
     * @defaultValue false
     */
    overwrite?: boolean

    /**
     * The file type you would like to export to
     * @defaultValue clown
     */
    exportType?: "clown" | "json" | "js"

    /**
     * Whether to encrypt the export file or not, 
     * If a string is provided that string is used as the key of the encryption, not available for js export type
     * @defaultValue false
     */
    encryptFile?: false | string

    /** 
     * @hidden
     * @privateRemark Not implemented yet
     */
    encryptInClown?: boolean

    /**
     * The exported key,
     * The key is only exported if {@link IFileExportOptions.includeKey | includeKey} is set to true
     * @defaultValue {@link ClownCryption.#key | ClownCryption Instance Key}
     * @see {@link https://en.wikipedia.org/wiki/Key_(cryptography) | Key Cryptography Definition}
     */
    key?: string

    /**
     * Whether {@link IFileExportOptions.key | the key} should be exported or not
     * @defaultValue false
     */
    includeKey?: boolean

    /**
     * The exported IV,
     * The IV is only exported if {@link IFileExportOptions.includeIv | includeIv} is set to true
     * @defaultValue {@link ClownCryption._iv | ClownCryption Instance IV}
     * @see {@link https://en.wikipedia.org/wiki/Initialization_vector | IV Cryptography Definition}
     */
    iv?: string

    /**
     * Whether {@link IFileExportOptions.iv | the IV} should be exported or not
     * @defaultValue false
     */
    includeIv?: boolean

    /**
     * The exported algorithm,
     * The algorithm is only exported if {@link IFileExportOptions.includeAlgorithm | includeAlgorithm} is set to true
     * @defaultValue {@link ClownCryption._algorithm | ClownCryption Instance Algorithm}
     * @see {@link https://www.openssl.org/docs/man1.1.1/man1/ciphers.html | OpenSSL Ciphers}
     */
    algorithm?: Crypto.CipherCCMTypes | Crypto.CipherGCMTypes | Crypto.CipherOCBTypes

    /**
     * Whether {@link IFileExportOptions.algorithm | the algorithm} should be exported or not
     * @defaultValue false
     */
    includeAlgorithm?: boolean

    /**
     * The exported algorithm,
     * The salt is only exported if {@link IFileExportOptions.includeSalt | includeSalt} is set to true
     * @defaultValue {@link ClownCryption._salt | ClownCryption Instance Salt}
     * @see {@link https://en.wikipedia.org/wiki/Salt_(cryptography) | Salt Cryptography Definition}
     */
    salt?: string

    /**
     * Whether {@link IFileExportOptions.salt | the salt} should be exported or not
     * @defaultValue false
     */
    includeSalt?: boolean

    /**
     * The exported charset,
     * The charset is only exported if {@link IFileExportOptions.includeCharset | includeCharset} is set to true
     * @defaultValue {@link ClownCryption._charset | ClownCryption Instance Charset}
     */
    charset?: charsets.PublicCharset

    /**
     * Whether {@link IFileExportOptions.charset | the charset} should be exported or not
     * @defaultValue false
     */
    includeCharset?: boolean

    /**
     * The exported Common Replacers,
     * The Common Replacers are only exported if {@link IFileExportOptions.includeCommonReplacers | includeCommonReplacers} is set to true
     * @defaultValue {@link ClownCryption.commonReplacers | ClownCryption Instance Common Replacers}
     */
    commonReplacers?: [string, string][]

    /**
     * Whether {@link IFileExportOptions.commonReplacers | the Common Replacers} should be exported or not
     * @defaultValue false
     */
    includeCommonReplacers?: boolean

    /**
     * If you want to include whitespace in the export,
     * Only used when {@link IFileExportOptions.exportType | Export Type} is json
     * @defaultValue false
     */
    includeWhiteSpace?: boolean
}

/**
 * The configuration export options
 */
export interface IExportConfigOptions {

    /**
     * Whether to encrypt the export file or not, 
     * If a string is provided that string is used as the key of the encryption, not available for js export type
     * @defaultValue false
     */
    encrypt?: false | string

    /**
     * Whether to export the instance charset
     * @defaultValue true
     */
    includeCharset?: boolean

    /**
     * Whether to export the instance Common Replacers
     * @defaultValue true
     */
    includeCommonReplacers?: boolean

    /**
     * Whether to export the instance algorithm
     * @defaultValue true
     */
    includeAlgorithm?: boolean

    /**
     * Whether to export the instance salt
     * @defaultValue true
     */
    includeSalt?: boolean

    /**
     * The file type you would like to export to
     * @defaultValue clown
     */
    exportStyle?: "clown" | "json" | "js"
}

export { CFS, ClownCryption, charsets, defaultCharsets }
export default ClownCryption