import Crypto from "crypto";
import * as fs from "fs";
import path from "path";
import { IExportConfigOptions, IFileExportOptions } from ".";
import ClownCryption from "./clowncryption";
import constants from "./constants";

/**
 * Clown File System, manages files, imports, and exports
 */
class CFS {

    /** @hidden */
    private constructor() {}

    /**
     * Creates a file that contains the message and other parameters
     * @param {string} str The message to be exported to the file
     * @param {IFileExportOptions} options The export options 
     * @returns {string} The export file's path
     */
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

    /**
     * Reads the content of a file and returns them in object format
     * @param filePath The path to the file
     * @param key The key to decrypt the file
     * @param importByFileContent If the filePath param is set to the file content
     * @returns The content of the file in object format
     */
    static readStringFile(filePath: string | { [key: string]: string }, key?: string, importByFileContent: boolean = false): { [key: string]: any } {

        let fileContent: string | { [key: string]: string }

        if (typeof filePath === "string" && importByFileContent === false) {
            filePath = this._serializePath(filePath).path
            if (path.extname(filePath.toString()) === ".js") return this._importFromJS(filePath)
        }

        if (importByFileContent === true) fileContent = filePath
        else {
            if (!(filePath as string).startsWith(process.cwd())) filePath = path.join(process.cwd(), filePath as string)

            fileContent = fs.readFileSync(filePath as string).toString("utf-8")
            if (path.extname(filePath as string) === ".json") fileContent = JSON.parse(fileContent)
        }

        if (typeof key === "string" && this.isHex(fileContent)) {
            if (typeof fileContent === "object") return this.decryptTransport(fileContent, key) as { [key: string]: any }
            return this.parseClown(fileContent, key)
        }
        
        if (typeof fileContent === "object") return fileContent
        else return this.parseClown(fileContent)
    }

    /**
     * This exports the configuration of a client to a file
     * @param filePath The path of the export file
     * @param client The {@link ClownCryption} client
     * @param options The options for exporting
     * @returns The export file's path
     */
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

    /**
     * Read a configuration file and returns it as an object
     * @param filePath Path to the file to read
     * @param key The encryption key
     * @returns The configuration
     */
    static readFileConfig(filePath: string, key?: string): { [key: string]: string } {
        filePath = this._serializePath(filePath).path

        if (path.extname(filePath).endsWith("js")) return this._importFromJS(filePath)

        let content = fs.readFileSync(filePath).toString()

        if (typeof content === "string") return this.parseClown(content, key)
        else if (this.isHex(JSON.parse(content)) && typeof key === "string") return this.decryptTransport(JSON.parse(content), key) as { [key: string]: string }
        return JSON.parse(content)
    }

    /**
     * Encrypts a string or object
     * @param str The content to encrypt
     * @param key The key for the encryption algorithm
     * @returns Encrypted message
     */
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

    /**
     * Decrypts content returned by the {@link CFS.encryptTransport | Encrypt Transport} method
     * @param str The return value of {@link CFS.encryptTransport | Encrypt Transport}
     * @param key The key of the encryption
     * @returns Unencrypted content
     */
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

    /**
     * Exports an object to a js file
     * @param fPath The export file's path
     * @param content The content to be exported
     * @returns The path to the exported file
     */
    private static _exportToJS(fPath: string | fs.PathLike, content: { [key: string]: any }) {
        const { path: newFPath } = this._serializePath(fPath)
        const jsStringify = (object: { [key: string]: any } | any[]) => `{\n\t${Object.entries(object).map(([key, thing]) => `${key}: ${(typeof thing === "string") ? `"${thing}"` : ((Array.isArray(thing) ? JSON.stringify(thing) : thing))}`).join(",\n\t")}\n}`

        fs.writeFileSync(`${newFPath}.js`, Buffer.from(`module.exports = ${jsStringify(content)}`))
        return `${newFPath}.js`
    }

    /**
     * Imports the content from a js file
     * @param fPath The file's path
     * @returns The file's content
     */
    private static _importFromJS(fPath: string | fs.PathLike) {
        return require(fPath.toString())
    }

    /**
     * Parses the content of a .clown file and returns it as an object
     * @param content The content of a .clown file
     * @param key The key to the encryption of the file
     * @returns Content of the .clown file as an object
     */
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

    /**
     * Puts an object in .clown format
     * @param fileName The file's name
     * @param content The file's content
     * @param encrypt If you want to encrypt the file or not, if a string is provided than that string is used as the key, defaults to false
     * @returns String in .clown format
     */
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

    /**
     * Check to see if a string is a hex string or not
     * @param str String to check
     * @returns boolean
     */
    public static isHex(str: string | { [key: string]: string }) {
        if (typeof str === "string") return ((str.match(/[0-9"a-f]{1}/gi)?.length ?? 0) === str.length)
        let objKey = Object.entries(str)[0]
        return ((objKey[0].match(/[0-9a-f]{1}/gi)?.length ?? 0) === objKey[0].length)
    }

    /**
     * @internal Stringifys objects the correct way, and only does so if includeProp is true
     * @param prop The prop to stringify
     * @param includeProp Whether to stringify the prop, if false returns undefined
     * @returns undefined if includeProp is false else returns a string
     */
    private static _stringProp = (prop: any, includeProp: boolean): string => ((includeProp === true) ? (prop?.toString() !== "[object Object]" && typeof prop?.toString() === "string") ? prop.toString() : JSON.stringify(prop) : undefined)

    /**
     * Formats the path of files
     * @param fPath The path of the file
     * @param overwrite If false and the file exists the function will generate a random name for the file, else overwrites the file
     * @returns fileName and path
     */
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