import { BinaryCharset, EfficientBinaryCharset, LiteralCharset, PublicCharset } from "./charsets";

/**
 * The Default Binary Charset
 * @chars
 * * 0: 🤡
 * * 1: 🤓
 */
export const DefaultBinaryCharset = new BinaryCharset("DefaultBinary", { "0": "🤡", "1": "🤓"})

/**
 * The Default Efficient Binary Charset
 * @chars
 * * 0: 🤡
 * * 1: 🤓
 * * 2: 🗿
 * * 3: 🤨
 * * 4: 😐
 * * 5: 😏
 * * 6: 🤯
 * * 7: 🥸
 * * 8: 🥴
 * * 9: 🤯
 * * .: 📮
 * * :: ☭
 * * Common Replacer 1: 💩
 * * Common Replacer 2: 👨‍🦯
 */
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

/**
 * The Default Literal Charset
 * @chars
 * * a: 🤡
 * * b: 🤓
 * * c: 🗿
 * * d: 🤨
 * * e: 😐
 * * f: 😏
 * * 0: 🤯
 * * 1: 🥸
 * * 2: 🫁
 * * 3: 🤯
 * * 4: 📮
 * * 5: ☭
 * * 6: 🥌
 * * 7: 💩
 * * 8: 👨‍🦯
 * * 9: 🥴
 */
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

/**
 * @internal
 * Mangages Charsets
 */
export class CharsetManager {

    /** @hidden */
    static instance?: CharsetManager

    /** @hidden */
    private constructor() {
        this.addCharset(DefaultLiteralCharset)
        this.addCharset(DefaultEfficientBinaryCharset)
        this.addCharset(DefaultBinaryCharset)
    }

    /**
     * The place charsets are stored
     */
    private _charsets = new Map<string, PublicCharset>()

    /**
     * fetches a charset from {@link _charsets | the charset map}
     * @param name Name of the charset
     * @returns The charset or undefined
     */
    public getCharset(name: string): PublicCharset | undefined {
        name = name.toLowerCase().trim()
        if (typeof this._charsets.get(name) !== "undefined") return this._charsets.get(name)
        
        for (let set of this._charsets) {
            if (set[1].aliases.includes(name)) return set[1]
        }
    }

    /**
     * Adds Charset to the manager
     * @param charset The charset to add
     */
    public addCharset(charset: PublicCharset) {
        if (!(charset instanceof PublicCharset)) throw new TypeError(`Charset is invalid`)
        this._charsets.set(charset.name, charset)
    }

    /**
     * Removes a charset from the manager
     * @param name Name of the charset
     * @returns True if the charset was sucessfully removed, else false
     */
    public removeCharset(name: string) {
        return this._charsets.delete(name)
    }

    /** @hidden */
    public static init() {
        if (typeof this.instance === "undefined") this.instance = new this()
        return this.instance
    }
}

export default CharsetManager.init()