import { CharsetMode, CharsetType, IBinaryCharset, IEfficientBinaryCharset, ILiteralCharset } from "..";
import constants from "../constants";
import BaseCharset from "./baseCharset";

export abstract class PublicCharset extends BaseCharset {
    public readonly name: string
    public readonly aliases: string[]
    constructor(name: string, charset: IEfficientBinaryCharset, aliases?: string | string[])
    constructor(name: string, charset: IBinaryCharset, aliases?: string | string[])
    constructor(name: string, charset: ILiteralCharset, aliases?: string | string[])
    constructor(name: string, charset: IEfficientBinaryCharset | IBinaryCharset | ILiteralCharset, aliases: string | string[] = []) {
        if ("a" in charset) super("literal", "normal", charset)
        else if (8 in charset) super("binary", "efficient", charset)
        else super("binary", "normal", charset)

        this.name = name.toLowerCase().trim()
        this.aliases = (Array.isArray(aliases) ? aliases.map((val) => val.toLowerCase().trim()) : [aliases.toLowerCase().trim()])
    }
}

class EfficientBinaryCharset extends PublicCharset {
    constructor(name: string, chars: IEfficientBinaryCharset, aliases?: string | string[]) {
        super(name, chars, aliases)
    }
}

class BinaryCharset extends PublicCharset {
    constructor(name: string, chars: { 0: string, 1: string } | { "0": string, "1": string }, aliases?: string | string[]) {
        super(name, {
            0: chars[0] ?? chars["0"],
            1: chars[1] ?? chars["1"]
        }, aliases)
    }
}

class LiteralCharset extends PublicCharset {
    constructor(name: string, chars: ILiteralCharset, aliases?: string | string[]) {
        super(name, chars, aliases)
    }
}

export { EfficientBinaryCharset, BinaryCharset, LiteralCharset }