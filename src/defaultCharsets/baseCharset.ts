import { IBinaryCharset, Character, CharsetMode, CharsetType, IEfficientBinaryCharset, ICharsetChars, ILiteralCharset } from "..";
import ClownCryption from "../clowncryption";
import constants from "../constants";
import { UnknownCharError } from "../errors";
import { EfficientBinaryCharset } from "./charsets";

abstract class BaseCharset {
    private _charset: ICharsetChars;
    private _charsetMap: Map<string, string> = new Map<string, string>();
    private _inverseCharsetMap: typeof this._charsetMap = new Map<string, string | string>();
    private _commonReplacer: [string, string][]
    readonly type: CharsetType;
    public mode: CharsetMode

    constructor(type: "binary", mode: CharsetMode, binaryCharset: IEfficientBinaryCharset | IBinaryCharset, commonReplacers?: [string, string][])
    constructor(type: "literal", mode: CharsetMode, stringCharset: ILiteralCharset)
    constructor(type: CharsetType, mode: CharsetMode, charset: ICharsetChars, commonReplacers: [string, string][] = [["100", "_"], ["110", "+"]]) {
        this._charset = charset
        this.type = type
        this.mode = mode
        this._commonReplacer = commonReplacers
        this._createCharsetMap(charset)
    }

    public get charset() {
        return this._charset
    }

    public apply(str: string) {
        const strBuilder: string[] = []
        str.split("").forEach((character, index) => {
            const newChar = this._charsetMap.get(character)

            if (typeof newChar !== "string") {
                const error = new UnknownCharError(str, index)
                if (typeof this._charsetMap.get("unknown") === "undefined") throw error

                console.warn(error.message)
                return strBuilder.push(this._charsetMap.get("unknown") as string)
            }

            strBuilder.push(newChar)
        })
    }

    private _createCharsetMap(charset: typeof this._charset) {
        Object.entries(charset).forEach((character) => {
            if (character[0].startsWith("commonReplacer")) {
                this._charsetMap.set(this._commonReplacer[parseInt(String(character[0].at(-1))) - 1][1], character[1])
                this._inverseCharsetMap.set(character[1], this._commonReplacer[parseInt(String(character[0].at(-1))) - 1][1])
                return
            }

            this._charsetMap.set(String(character[0]), String(character[1]))
            this._inverseCharsetMap.set(String(character[1]), String(character[0]))
        })
    }

    public getChar(character: Character | number) {
        return this._charsetMap.get(new String(character) as string)
    }

    private _encodeHybird(str: string) {
        let builder: string[] = []
        const strSplit = str.split("")

        strSplit.forEach(char => {
            let newChar = this._charsetMap.get(char)
            if (char == " ") newChar = this._charsetMap.get("space") ?? this._charsetMap.get(" ")
            if (char == "\t") newChar = this._charsetMap.get("tab") ?? this._charsetMap.get("\t")
            if (typeof newChar === "undefined") newChar = this._charsetMap.get("unknown")

            if (typeof newChar === "undefined") {
                `b${char.charCodeAt(0).toString(2)}`.split("").forEach(binaryDigit => {
                    newChar = this._charsetMap.get(binaryDigit)
                })
            }

            builder.push(newChar as string)
        })

        return this._encodeLiteral(builder.join(""))
    }

    private _encodeBinary(str: string) {
        const builder: string[] = []
        const splitStr = str.split("")
        let returnVal

        splitStr.forEach(char => {
            builder.push(char.charCodeAt(0).toString(2).padStart(8, "0"))
        })

        if (this.mode === "efficient") returnVal = ClownCryption.condenseBinary(builder.join(""))
        else returnVal = builder.join("")
        return this._encodeLiteral(returnVal)
    }

    private _encodeLiteral(str: string) {
        let builder = ""
        str.split("").forEach(char => {
            let newChar = this._charsetMap.get(char)
            if (char == " ") newChar = this._charsetMap.get("space") ?? this._charsetMap.get(" ")
            if (char == "\t") newChar = this._charsetMap.get("tab") ?? this._charsetMap.get("\t")
            if (typeof newChar === "undefined") newChar = this._charsetMap.get("unknown") ?? char
            builder += newChar
        })
        return builder
    }

    private _decodeBinary(str: string) {
        str = this._decodeLiteral(str)
        if (this.mode === "efficient") {
            str = ClownCryption.decondenseBinary(str)
        }

        const builder: string[] = [];
        (str.match(/.{8}/g) as string[]).forEach(char => {
            builder.push(String.fromCharCode(parseInt(char, 2)))
        })

        return builder.join("")
    }

    private _decodeLiteral(str: string) {
        let builder = ""

        str.split("").forEach(char => {
            const newChar = this._inverseCharsetMap.get(char)
            if (newChar === "space") return builder += " "
            if (newChar === "enter") return builder += "\n"
            if (newChar === "tab") return builder += "\t"
            builder += newChar
        })

        return builder
    }

    public encode(str: string) {
        if (this.type === "binary") return this._encodeBinary(str)
        if (this.type === "literal") return this._encodeLiteral(str)
        return this._encodeHybird(str)
    }

    public decode(str: string) {
        if (this.type === "binary") return this._decodeBinary(str)
        return this._decodeLiteral(str)
    }

    public static importCharset(charsetStr: string) {
        let charset = JSON.parse(charsetStr)
        let charClass
        if (Array.isArray(charset)) {

        } 
        if (charset.type === "literal") {}
    }

    public toJSON() {
        return {
            type: this.type,
            mode: this.mode,
            charset: Array.from(this._charsetMap)
        }
    }

    public toString() {
        return JSON.stringify(this.toJSON())
    }
}

export default BaseCharset