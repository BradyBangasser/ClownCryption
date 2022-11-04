import Crypto from "crypto"
import ClownCryption from "./clowncryption"
import constants from "./constants"
import BaseCharset from "./defaultCharsets/baseCharset"
import CFS from "./fileSystem"
import type { BinaryCharset, EfficientBinaryCharset, PublicCharset } from "./defaultCharsets/charsets"

export type CharsetType = "binary" | "literal"
export type CharsetMode = "normal" | "efficient"
export type ICharsetChars = IEfficientBinaryCharset | ILiteralCharset | IBinaryCharset

/**
 * Options for the ClownCryption constructor
 * @param {string} key The instance key for the encryption algorithm
 * @param {string} iv The instance Initalizing Vector for the encryption algorithm
 * @param {string} salt Optional - The instance salt for the encryption algorithm, default to "pepper"
 * @param {PublicCharset | string} charset Optional - The name of a charset or a charset to set as the instance charset, default to the default efficient binary charset
 * 
 */
export interface ClownOptions {
    key: string
    iv: string
    salt?: string
    charset?: PublicCharset | string
    algorithm?: Crypto.CipherCCMTypes | Crypto.CipherGCMTypes | Crypto.CipherOCBTypes
    commonReplacers?: [string, string][]
}

/**
 * Options for the encrypt and decrypt functions on a ClownCryption instance
 * @param {string} message - The message to be encrypted or decrypted
 * @param {string} key Optional - String used as the key for the encryption algorithm, defaults to the instance key
 * @param {stirng} iv Optional - String used as the Initalizing Vector in the encryption algorithm, defaults to the instance IV
 * @param {string} salt Optional - String used as salt in the encryption algorithm, default to the instance salt
 * @param {Crypto.CipherCCMTypes | Crypto.CipherGCMTypes | Crypto.CipherOCBTypes} algorithm Optional - The algorithm used to encrypt the message, defaults to the instance algorithm
 * @param {PublicCharset} charset Optional - The charset used to encode the encrypted message, defaults to the instance charset
 * @see https://nodejs.org/api/crypto.html#cryptoscryptsyncpassword-salt-keylen-options
 */
export interface EncryptOptions {
    message: string
    key?: string
    iv?: string
    salt?: string
    algorithm?: ClownOptions["algorithm"]
    charset?: PublicCharset
}

/**
 * Options for the static encrypt and decrypt function on the ClownCryption class
 * @param {string} message - The message to be encrypted or decrypted
 * @param {string} key - String used as the key for the encryption algorithm
 * @param {stirng} iv String used as the Initalizing Vector in the encryption algorithm
 * @param {string} salt Optional - String used as salt in the encryption algorithm, default to the instance salt
 * @param {Crypto.CipherCCMTypes | Crypto.CipherGCMTypes | Crypto.CipherOCBTypes} algorithm Optional - The algorithm used to encrypt the message, defaults to the instance algorithm
 * @param {PublicCharset} charset Optional - The charset used to encode the encrypted message, defaults to the instance charset
 */
export interface StaticEncryptOptions {
    message: string
    key: string
    iv: string
    salt?: string
    algorithm?: ClownOptions["algorithm"]
    charset?: PublicCharset
}

/**
 * Base Public Charset Options
 * @param {string} name Name of the Charset
 * @param {string | string[]} aliases Aliases of the Charset
 */
interface IPublicCharsetBaseOptions {
    name: string
    aliases?: string | string[]
}

/**
 * Public charset options for Literal Charsets
 * @extends IPublicCharsetBaseOptions
 * @param {ILiteralCharset} charset The Charset
 */
export interface ILiteralCharsetOptions extends IPublicCharsetBaseOptions {
    type?: "literal"
    mode?: string
    charset: ILiteralCharset
}

/**
 * Public charset options for Binary Charsets
 * @extends IPublicCharsetBaseOptions
 * @param {BinaryCharset | EfficientBinaryCharset} charset The Charset
 */
export interface IBinaryCharsetOptions extends IPublicCharsetBaseOptions {
    type?: "binary"
    mode?: CharsetMode
    charset: BinaryCharset | EfficientBinaryCharset
}

/**
 * Binary Charset Template
 */
export interface IBinaryCharset {
    0: string
    1: string
}

/**
 * Efficient Binary Charset Template
 */
export interface IEfficientBinaryCharset {
    0: string
    1: string
    2: string
    3: string
    4: string
    5: string
    6: string
    7: string
    8: string
    9: string
    ":": string
    "commonReplacer1": string
    "commonReplacer2": string
    ".": string
}

/**
 * Literal Charset Template
 */
export interface ILiteralCharset {
    "a": string
    "b": string
    "c": string
    "d": string
    "e": string
    "f": string
    "0": string
    "1": string
    "2": string
    "3": string
    "4": string
    "5": string
    "6": string
    "7": string
    "8": string
    "9": string
}

/**
 * Options for exporting a file
 * @param {string} fileName The export file's name
 * @param {string} filePath Optional - the path to the file
 * @param {boolean} overwrite Optional - if you want to overwrite the file if it already exists, defaults to false
 * @param {"clown" | "json" | "js"} exportType Optional - 
 */
export interface IFileExportOptions {
    fileName: string
    filePath?: string
    overwrite?: boolean
    exportType?: "clown" | "json" | "js"
    encryptFile?: false | string
    encryptInClown?: boolean
    key?: string
    includeKey?: boolean
    iv?: string
    includeIv?: boolean
    algorithm?: Crypto.CipherCCMTypes | Crypto.CipherGCMTypes | Crypto.CipherOCBTypes
    includeAlgorithm?: boolean
    salt?: string
    includeSalt?: boolean
    charset?: BaseCharset
    includeCharset?: boolean
    commonReplacers?: [string, string][]
    includeCommonReplacers?: boolean
    includeWhiteSpace?: boolean
}

export interface IMessageFileContent {
    fileName: string
    message: string
    key?: string
    iv?: string
    algorithm?: string
    charset?: BaseCharset
    commonReplacer?: [string, string][]
    salt?: string
}

export interface IExportConfigOptions {
    encrypt?: false | string
    includeCharset?: boolean
    includeCommonReplacers?: boolean
    includeAlgorithm?: boolean
    includeSalt?: boolean
    exportStyle?: "clown" | "json" | "js"
}

export { CFS, ClownCryption }
export default ClownCryption