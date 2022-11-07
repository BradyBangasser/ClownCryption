import { IBinaryCharset, IEfficientBinaryCharset, ILiteralCharset } from "..";
import BaseCharset from "./baseCharset";

/**
 * Charset Template
 * @remarks This class is ment to be extended and create subclasses for charsets
 */
abstract class PublicCharset extends BaseCharset {

    /** Name of the Charset */
    public readonly name: string
    /** The aliases of the charset */
    public readonly aliases: string[]

    /**
     * Creates an Efficient Binary Charset
     * @param name Name of the charset
     * @param charset The charset characters 
     * @param aliases The aliases of the charset
     */
    constructor(name: string, charset: IEfficientBinaryCharset, aliases?: string | string[])

    /**
     * Creates a Binary Charset
     * @param name The name of the charset
     * @param charset The charset characters
     * @param aliases The aliases of the charset
     */
    constructor(name: string, charset: IBinaryCharset, aliases?: string | string[])

    /**
     * Creates a Literal Charset
     * @param name Name of the charset
     * @param charset The charset characters
     * @param aliases The aliases of the charset
     */
    constructor(name: string, charset: ILiteralCharset, aliases?: string | string[])
    constructor(name: string, charset: IEfficientBinaryCharset | IBinaryCharset | ILiteralCharset, aliases: string | string[] = []) {
        if ("a" in charset) super("literal", "normal", charset)
        else if (8 in charset) super("binary", "efficient", charset)
        else super("binary", "normal", charset)

        this.name = name.toLowerCase().trim()
        this.aliases = (Array.isArray(aliases) ? aliases.map((val) => val.toLowerCase().trim()) : [aliases.toLowerCase().trim()])
    }
}

/** Creates an Efficient Binary Charset */
class EfficientBinaryCharset extends PublicCharset {
    constructor(name: string, chars: IEfficientBinaryCharset, aliases?: string | string[]) {
        super(name, chars, aliases)
    }
}

/** Creates a Binary Charset */
class BinaryCharset extends PublicCharset {
    constructor(name: string, chars: { 0: string, 1: string } | { "0": string, "1": string }, aliases?: string | string[]) {
        super(name, {
            0: chars[0] ?? chars["0"],
            1: chars[1] ?? chars["1"]
        }, aliases)
    }
}

/** Creates a Literal Charset */
class LiteralCharset extends PublicCharset {
    constructor(name: string, chars: ILiteralCharset, aliases?: string | string[]) {
        super(name, chars, aliases)
    }
}

export { EfficientBinaryCharset, BinaryCharset, LiteralCharset, PublicCharset }