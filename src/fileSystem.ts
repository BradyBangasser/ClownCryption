import Crypto from "crypto";
import * as fs from "fs";
import path from "path";
import { IExportConfigOptions, IFileExportOptions } from ".";
import ClownCryption from "./clowncryption";
import constants from "./constants";

class CFS {
    static generateStringFile(str: string, {
        fileName,
        filePath,
        overwrite = false,
        exportType = "clown",
        encryptFile = false,

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
        includeWhiteSpace = false
    }: IFileExportOptions): string {

        const { fileName: realFileName, path: fPath } = this._serializePath(path.join(filePath ?? "", fileName), overwrite)

        const exportContent = {
            key: this._stringProp(key, includeKey),
            iv: this._stringProp(iv, includeIv),
            algorithm: this._stringProp(algorithm, includeAlgorithm),
            salt: this._stringProp(salt, includeSalt),
            charset: this._stringProp(charset?.toJSON(), includeCharset),
            commonReplacers: this._stringProp(commonReplacers, includeCommonReplacers),
            message: str
        }

        if (exportType === "js") return this._exportToJS(fPath, exportContent)

        let builder: { [key: string]: string } | string
        if (exportType === "clown") builder = this.clownify(realFileName, exportContent)
        else builder = exportContent

        if (typeof encryptFile === "string") builder = this.encryptTransport(builder, encryptFile)

        fs.writeFileSync(`${fPath}.${exportType}`, JSON.stringify(builder, null, (includeWhiteSpace === true) ? "\t" : ""))

        return `${fPath}.${exportType}`
    }

    static readStringFile(filePath: string | { [key: string]: string }, key?: string, options?: { importByFileContent: boolean }) {

        let fileContent: string | { [key: string]: string }

        if (typeof filePath === "string" && options?.importByFileContent === false) {
            filePath = this._serializePath(filePath).path
            if (path.extname(filePath.toString()) === ".js") return this._importFromJS(filePath)
        }

        if (options?.importByFileContent === true) fileContent = filePath
        else {
            if (!(filePath as string).startsWith(process.cwd())) filePath = path.join(process.cwd(), filePath as string)

            fileContent = fs.readFileSync(filePath as string).toString("utf-8")
            if (path.extname(filePath as string) === ".json") fileContent = JSON.parse(fileContent)
        }

        if (typeof key === "string" && this.isHex(fileContent)) {
            if (typeof fileContent === "object") return this.decryptTransport(fileContent, key)
            return this.parseClown(fileContent, key)
        }
        
        if (typeof fileContent === "object") return fileContent
        else return this.parseClown(fileContent)
    }

    static exportConfig(filePath: string, client: ClownCryption, {
        encrypt = false,
        exportStyle = "clown",
        includeAlgorithm = true,
        includeCharset = true,
        includeCommonReplacers = true,
        includeSalt = true
    }: IExportConfigOptions) {

        let exportOb = {
            key: client.key,
            iv: client.iv,
            salt: this._stringProp(client.salt, includeSalt),
            algorithm: this._stringProp(client.algorithm, includeAlgorithm),
            charset: this._stringProp(client.charset, includeCharset),
            commonReplacers: this._stringProp(client.commonReplacers, includeCommonReplacers)
        }

        const { fileName, path: fPath } = this._serializePath(filePath, false)

        let fileContent: string

        if (exportStyle === "js") return this._exportToJS(fPath, exportOb)

        if (exportStyle === "clown") {
            fileContent = this.clownify(fileName, exportOb, encrypt)
        } else if (typeof encrypt === "string") fileContent = JSON.stringify(this.encryptTransport(exportOb, encrypt))
        else fileContent = JSON.stringify(exportOb)

        fs.writeFileSync(`${fPath}.${exportStyle}`, fileContent)
        return `${fPath}.${exportStyle}`
    }

    static readFileConfig(filePath: string, key?: string): { [key: string]: string } {
        filePath = this._serializePath(filePath).path

        if (path.extname(filePath).endsWith("js")) return this._importFromJS(filePath)

        let content = fs.readFileSync(filePath).toString()

        if (typeof content === "string") return this.parseClown(content, key)
        else if (this.isHex(JSON.parse(content)) && typeof key === "string") return this.decryptTransport(JSON.parse(content), key) as { [key: string]: string }
        return JSON.parse(content)
    }

    static encryptTransport<T extends { [key: string]: unknown }>(str: T | string, key: string): { [key: string]: string } | string {
        if (typeof str === "string") {
            const cipher = Crypto.createCipheriv(constants.algorithm, Crypto.scryptSync(key, "salt", 24), Buffer.alloc(16))
            return cipher.update(str, "utf-8", "hex") + cipher.final("hex")
        }

        let builder: { [key: string]: string } = {}
        Object.entries(str).forEach(([oKey, val]) => {
            if (typeof val === "undefined") return
            let cipher = Crypto.createCipheriv(constants.algorithm, Crypto.scryptSync(key, "salt", 24), Buffer.alloc(16))
            let newKey = cipher.update(oKey, "utf-8", "hex") + cipher.final("hex")

            cipher = Crypto.createCipheriv(constants.algorithm, Crypto.scryptSync(key, "salt", 24), Buffer.alloc(16))
            let newVal = cipher.update(((typeof val === "string") ? val : (val?.toString() ?? JSON.stringify(val))), "utf-8", "hex") + cipher.final("hex")

            builder[newKey] = newVal
        })

        return builder
    }

    static decryptTransport(str: string | { [key: string]: string }, key: string): typeof str {
        if (typeof str === "object") {
            const builder: { [key: string]: string } = {}
            Object.entries(str).forEach(([oKey, string]) => {
                let decipher = Crypto.createDecipheriv(constants.algorithm, Crypto.scryptSync(key, "salt", 24), Buffer.alloc(16))
                const newOKey = decipher.update(oKey, "hex", "utf-8") + decipher.final("utf-8")

                decipher = Crypto.createDecipheriv(constants.algorithm, Crypto.scryptSync(key, "salt", 24), Buffer.alloc(16))
                const newString = decipher.update(string, "hex", "utf-8") + decipher.final("utf-8")

                builder[newOKey] = newString
            })

            return builder
        }

        let decipher = Crypto.createDecipheriv(constants.algorithm, Crypto.scryptSync(key, "salt", 24), Buffer.alloc(16))
        return decipher.update(str, "hex", "utf-8") + decipher.final("utf-8")
    }

    private static _exportToJS(fPath: string | fs.PathLike, content: { [key: string]: any }) {
        const { path: newFPath } = this._serializePath(fPath)
        const jsStringify = (object: { [key: string]: any } | any[]) => `{\n\t${Object.entries(object).map(([key, thing]) => `${key}: ${(typeof thing === "string") ? `"${thing}"` : ((Array.isArray(thing) ? JSON.stringify(thing) : thing))}`).join(",\n\t")}\n}`

        fs.writeFileSync(`${newFPath}.js`, Buffer.from(`module.exports = ${jsStringify(content)}`))
        return `${newFPath}.js`
    }

    private static _importFromJS(fPath: string | fs.PathLike) {
        return require(fPath.toString())
    }

    static parseClown(content: string, key?: string): { [key: string]: string } {
        let parsedContent: string = JSON.parse(content)

        if (typeof key === "string" && ((content.toString().match(/[0-9"a-f]{1}/gi)?.length ?? 0) === content.toString().length)) parsedContent = this.decryptTransport(parsedContent, key) as string

        let builder: { [key: string]: string } = {};

        let split: string[] = parsedContent.split(".")
        builder.fileName = split[0].substring(1, split[0].length - 1)
        split.shift()

        parsedContent = split.join(".")

        parsedContent.split("].[").forEach((val, index) => {
            const valSplit = val.split("]:[")
            if (index === 0) valSplit[0] = valSplit[0].substring(1)
            builder[valSplit[0]] = valSplit[1]
        })

        return builder
    }

    static clownify(fileName: string, content: { [key: string]: any }, encrypt: false | string = false): string {
        let builder = `[${fileName}]`

        Object.entries(content).forEach(([key, string]) => {
            if (typeof string === "undefined") return
            if (typeof string !== "string") {
                string = string?.toString() ?? JSON.stringify(string)
            }

            builder += `.[${key}]:[${string}]`
        })

        if (typeof encrypt === "string") return JSON.stringify(CFS.encryptTransport(builder, encrypt))
        return builder
    }

    public static isHex(str: string | { [key: string]: string }) {
        if (typeof str === "string") return ((str.match(/[0-9"a-f]{1}/gi)?.length ?? 0) === str.length)
        let objKey = Object.entries(str)[0]
        return ((objKey[0].match(/[0-9a-f]{1}/gi)?.length ?? 0) === objKey[0].length)
    }

    private static _stringProp = (prop: any, includeProp: boolean): string => ((includeProp === true) ? (prop?.toString() !== "[object Object]" && typeof prop?.toString() === "string") ? prop.toString() : JSON.stringify(prop) : undefined)
    private static _serializePath(fPath: string | fs.PathLike, overwrite: boolean = false): { fileName: string, path: string } {
        fPath = fPath.toString()
        if (!fPath.startsWith(process.cwd())) fPath = path.join(process.cwd(), fPath)
        const realFileName = fPath.split(/(\\\\)|(\/)/g).at(-1) ?? fPath

        try {
            let fss = fs.statSync(fPath)
            if (fss.isDirectory()) fPath = path.join(fPath, fPath)
            if (fss.isFile() && !overwrite) fPath = `${fPath}_clown${Math.floor(Math.random() * 999999 + 1).toString().padStart(6, "0")}`
        } finally {
            return { fileName: realFileName, path: fPath }
        }
    }
}

export default CFS