import { BinaryCharset, EfficientBinaryCharset, LiteralCharset, PublicCharset } from "./charsets";

export const DefaultBinaryCharset = new BinaryCharset("DefaultBinary", { "0": "🤡", "1": "🤓"})

export const DefaultEfficientBinaryCharset = new EfficientBinaryCharset("DefaultEfficientBinary", {
    "0": "🤡",
    "1": "🤓",
    "2": "🗿",
    "3": "🤨",
    "4": "😐",
    "5": "😏",
    "6": "🤯",
    "7": "🥸",
    "8": "🥴",
    "9": "🤯",
    ".": "📮",
    ":": "☭",
    "commonReplacer1": "💩",
    "commonReplacer2": "👨‍🦯"
}, ["eb"])

export const DefaultLiteralCharset = new LiteralCharset("LiteralCharset", {
    "a": "🤡",
    "b": "🤓",
    "c": "🗿",
    "d": "🤨",
    "e": "😐",
    "f": "😏",
    "0": "🤯",
    "1": "🥸",
    "2": "🫁",
    "3": "🤯",
    "4": "📮",
    "5": "☭",
    "6": "🥌",
    "7": "💩",
    "8": "👨‍🦯",
    "9": "🥴",
})

class CharsetManager {

    static instance?: CharsetManager

    private constructor() {
        this.addCharset(DefaultLiteralCharset)
        this.addCharset(DefaultEfficientBinaryCharset)
        this.addCharset(DefaultBinaryCharset)
    }

    private _charsets = new Map<string, PublicCharset>()

    public getCharset(name: string): PublicCharset | undefined {
        name = name.toLowerCase().trim()
        if (typeof this._charsets.get(name) !== "undefined") return this._charsets.get(name)
        
        for (let set of this._charsets) {
            if (set[1].aliases.includes(name)) return set[1]
        }
    }

    public addCharset(charset: PublicCharset) {
        if (!(charset instanceof PublicCharset)) throw new TypeError(`Charset is invalid`)
        this._charsets.set(charset.name, charset)
    }

    public removeCharset(name: string) {
        return this._charsets.delete(name)
    }

    public static init() {
        if (typeof this.instance === "undefined") this.instance = new this()
        return this.instance
    }
}

export default CharsetManager.init()