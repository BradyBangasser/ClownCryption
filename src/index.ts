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
    exportStyle?: "clown" | "json" // add js export option
}

console.time("time")
const clown = new ClownCryption({ key: "yo", iv: "yoo" })

const key: string | undefined = "banana"
const cPath = clown.exportConfigToFile("dist/hi", {
    exportStyle: "clown",
    encrypt: key
})

console.log(CFS.test())
 
// const enStr = clown.encrypt(`In military terminology,[1] a missile is a guided airborne ranged weapon capable of self-propelled flight usually by a jet engine or rocket motor. Missiles are thus also called guided missiles or guided rockets (when a previously unguided rocket is made guided). Missiles have five system components: targeting, guidance system, flight system, engine and warhead. Missiles come in types adapted for different purposes: surface-to-surface and air-to-surface missiles (ballistic, cruise, anti-ship, anti-tank, etc.), surface-to-air missiles (and anti-ballistic), air-to-air missiles, and anti-satellite weapons. Airborne explosive devices without propulsion are referred to as shells if fired by an artillery piece and bombs if dropped by an aircraft. Unguided jet- or rocket-propelled weapons are usually described as rocket artillery. Historically, the word missile referred to any projectile that is thrown, shot or propelled towards a target; this usage is still recognized today.[1]`)
// // const enStr = clown.encrypt(`Hello Word!`)
// // const deStr = clown.decrypt(enStr)
// const imp = clown.importStringFile(clown.exportStringToFile(enStr, {
//     fileName: "dist/yo",
//     encryptFile: "banana",
//     exportType: "clown",
//     includeAlgorithm: true,
//     includeCharset: true,
//     includeCommonReplacers: true,
//     includeIv: true,
//     includeKey: true,
//     includeWhiteSpace: false
// }), "banana")

// clown.decrypt((imp as any).message)

console.timeEnd("time")
//console.log(deStr)

//console.log("\n", enStr, enStr.length, deStr, deStr.length)

const mostCommonPatterns: { [key: string]: number } = {}

// for (let i = 0; i < 100; i++) {
//     const string = genRandonString(Math.floor(Math.random() * 3) + 1)
//     const enc = clown.encrypt(string)
//     const dec = clown.decrypt(enc, string)
    
//     // const patterns = ClownCryption.findPattern(enc)
    
//     // for (let i = 0; i <= 3; i++) {
//     //     mostCommonPatterns[patterns[i][0]] = (mostCommonPatterns[patterns[i][0]] ?? 0) + patterns[i][1]
//     // }

//     if (dec !== string) {
//         console.log(string, dec)
//     }
// }

//console.log(Object.entries(mostCommonPatterns).sort((a, b) => b[1] - a[1]))

function genRandonString(length: number) {
    var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()`~-=_+';
    var charLength = chars.length;
    var result = '';
    for ( var i = 0; i < length; i++ ) {
       result += chars.charAt(Math.floor(Math.random() * charLength));
    }
    return result;
}

export { CFS }
