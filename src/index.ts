import Crypto from "crypto"
import ClownCryption from "./clowncryption"
import constants from "./constants"
import BaseCharset from "./defaultCharsets/baseCharset"
import CFS from "./fileSystem"
import type { PublicCharset } from "./defaultCharsets/charsets"

export type CharsetType = "binary" | "literal"
export type CharsetMode = "normal" | "efficient"
export type ICharsetChars = IEfficientBinaryCharset | ILiteralCharset | IBinaryCharset

export type ClownOptions = {
    key: string
    iv: string
    salt?: string
    charset?: PublicCharset | string
    algorithm?: Crypto.CipherCCMTypes | Crypto.CipherGCMTypes | Crypto.CipherOCBTypes
    commonReplacers?: [string, string][]
}

interface IPublicCharsetBaseOptions {
    name: string
    aliases?: string | string[]
}

export interface ILiteralCharsetOptions extends IPublicCharsetBaseOptions {
    type?: "literal"
    mode?: string
    charset: ILiteralCharset
}

export interface IBinaryCharsetOptions extends IPublicCharsetBaseOptions {
    type?: "binary"
}

export interface IBinaryCharset {
    0: string
    1: string
}

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

export type Character = string

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

export { CFS }
