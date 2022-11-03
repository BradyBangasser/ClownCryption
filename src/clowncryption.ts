import { ClownOptions, IEfficientBinaryCharset, IExportConfigOptions, IFileExportOptions } from ".";
import CharsetManager from "./defaultCharsets/defaults";
import constants from "./constants";
import Crypto from "crypto"
import CFS from "./fileSystem";
import BaseCharset from "./defaultCharsets/baseCharset";
import { PublicCharset } from "./defaultCharsets/charsets";

class ClownCryption {

    #key: string
    private _charset: PublicCharset
    private _encryptionAlgorithm: Crypto.CipherCCMTypes | Crypto.CipherGCMTypes | Crypto.CipherOCBTypes
    private _commonReplacers: [string, string][]
    private _salt: string
    private _iv: string

    private static readonly _commonReplacers: [string, string][] = constants.binaryEfficientOptions.commonReplacers

    constructor({
        key,
        iv,
        salt = "salt",
        charset = "eb",
        algorithm = "aes-192-ccm",
        commonReplacers = ClownCryption._commonReplacers
    }: ClownOptions) {
        
        this.#key = key
        this._iv = iv
        this._salt = salt
        this._charset = this._getCharset(charset)
        this._encryptionAlgorithm = algorithm
        this._commonReplacers = commonReplacers
    }

    private _getCharset(charset: PublicCharset | string): PublicCharset {
        if (charset instanceof PublicCharset) return charset
        if (typeof charset === "string") {
            const chset = CharsetManager.getCharset(charset)
            if (typeof chset !== "undefined") return chset
        }

        throw new TypeError(`Charset (${charset}) is not a valid charset`)
    }

    // encryption 
    public encrypt(str: string, key: string | undefined = this.key, charset: BaseCharset = this._charset as BaseCharset) {
        const cipher = Crypto.createCipheriv(this._encryptionAlgorithm as any, Crypto.scryptSync(key, this.salt, 24), Buffer.alloc(16, this.iv))

        try {
            const crypto = cipher.update(str, "utf-8", "hex") + cipher.final("hex")
            return charset.encode(crypto)
        } catch (err: any) {
            console.error(err)
        }

        return ""
    }

    public decrypt(str: string, key: string | undefined = this.key, charset: BaseCharset = this._charset as BaseCharset) {
        const decipher = Crypto.createDecipheriv(this._encryptionAlgorithm, Crypto.scryptSync(key, this.salt, 24), Buffer.alloc(16, this.iv))

        try {
            const decrypt = charset.decode(str)
            return decipher.update(decrypt, "hex", "utf-8") + decipher.final("utf-8")
        } catch(err: any) {
            console.error(err)
        }

        return ""
    }

    public get key() {
        return this.#key
    }

    public get iv() {
        return this._iv
    }

    public get charset() {
        return this._charset
    }

    public get salt() {
        return this._salt
    }

    public get algorithm() {
        return this._encryptionAlgorithm
    }

    public get commonReplacers() {
        return this._commonReplacers
    }

    public exportStringToFile(encryptedString: string, {
        fileName,
        filePath,
        overwrite,
        exportType,
        encryptFile,
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
        commonReplacers = this.commonReplacers
    }: IFileExportOptions) {
        return CFS.generateStringFile(encryptedString, {
            fileName,
            filePath,
            overwrite,
            exportType,
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
            commonReplacers
        })
    }

    public importStringFile(filePath: string, key?: string) {
        return CFS.readStringFile(filePath, key)
    }

    public exportConfigToFile(fileName: string, options: IExportConfigOptions) {
        return CFS.exportConfig(fileName, this, options)
    }

    // static methods
    static condenseBinary(binaryString: string) {
        let count = 0
        let lastChar = ""
        let efficientBuilder = ""
        const variables: string[] = []
        const buildStringSplit = binaryString.split("")

        for (let i in buildStringSplit) {
            if (buildStringSplit[i] !== lastChar) {
                if (count < 2) {
                    efficientBuilder += ClownCryption.multiplyString(lastChar, count)
                    lastChar = buildStringSplit[i]
                    count = 0
                } else {
                    efficientBuilder += (lastChar + (count))
                    lastChar = buildStringSplit[i]
                    count = 0
                }
            } else {
                count++
            }
        }
        efficientBuilder += (lastChar + count)

        for (let i in this._commonReplacers) {
            efficientBuilder = efficientBuilder.replaceAll(this._commonReplacers[i][0], this._commonReplacers[i][1])
        }
        
        for (let i = 0; i <= 9; i++) {
            if (!efficientBuilder.includes(i.toString())) variables.push(i.toString())
        }

        let patterns: [string, number][] = ClownCryption.findPattern(efficientBuilder)
        let possibleSavings = 0
        let varSpace = 1
        const assignedVariables: { variable: string, replaces: string, uses: number, saves: number }[] = []
        
        for (let i in variables) {
            if (typeof patterns[i] === "undefined") continue
            const variObject = {
                variable: variables[i],
                replaces: patterns[i][0],
                uses: variables[i].length + patterns[i][0].length,
                saves: patterns[i][0].length * patterns[i][1]
            }

            possibleSavings += variObject.saves
            varSpace += variObject.uses

            assignedVariables.push(variObject)
        }

        let variableString: string[] = []
        if (possibleSavings > varSpace) {
            assignedVariables.forEach(assigned => {
                variableString.push(assigned.variable + assigned.replaces)
                efficientBuilder = efficientBuilder.replaceAll(assigned.replaces, assigned.variable)
            })

            efficientBuilder = variableString.join(".") + ":" + efficientBuilder
        }

        console.log(`${ (1 - (efficientBuilder.length / binaryString.length)) * 100 }% size reduction`)
        return efficientBuilder
    }

    static decondenseBinary(condensedBinary: string) {
        let buildString = ""
        if (condensedBinary.includes(":")) {
            const variableString = condensedBinary.split(":")[0]
            condensedBinary = condensedBinary.split(":")[1]
            const variables = variableString.split(".")
            
            variables.forEach(variable => {
                condensedBinary = condensedBinary.replaceAll(variable[0], variable.substring(1))
            })
        }

        for (let i in this._commonReplacers) {
            condensedBinary = condensedBinary.replaceAll(this._commonReplacers[i][1], this._commonReplacers[i][0])
        }

        condensedBinary.split("").forEach((value, index, array) => {
            if (parseInt(value) >= 2) {
                buildString += ClownCryption.multiplyString(array[index - 1], parseInt(value))
                return
            }

            if (parseInt(array[index + 1]) <= 1) {
                return buildString += value
            }
        })

        return buildString + buildString[buildString.length - 1]
    }

    static findPattern(str: string, maxPatternSize: number = 4, minPatternSize: number = 3) {
        let patterns: { [key: string]: number } = {}

        for (let i = maxPatternSize; i >= minPatternSize; i--) {
            let n
            for (n = 0; n < str.length; n += i) {
                const pattern = str.substring(n, n + i)
                patterns[pattern] = (patterns[pattern] ?? 0) + 1
            }
        }

        return Object.entries(patterns).sort((a, b) => (b[1] * b[0].length) - (a[1] * a[0].length)).filter((value, index, array) => value[1] > 1 && value[0].length === array[0][0].length)
    }

    static importFileConfig(fileName: string, key?: string) {
        const config = CFS.readFileConfig(fileName, key)

        console.log(BaseCharset.importCharset(config.charset))
        return new this({
            key: config.key,
            iv: config.iv,
            algorithm: config.algorithm,
            salt: config.salt,
        } as any)
    }

    static getBinary(str: string) {
        const strSplit = str.split("")
        const builder: string[] = []

        for (let i in strSplit) {
            builder.push(strSplit[i].charCodeAt(0).toString(2))
        }

        return builder.join(" ")
    }

    static multiplyString(str: string, num: number) {
        let builder = ""
        for (let i = 0; i <= num; i++) {
            builder += str
        }

        return builder
    }
}

export default ClownCryption