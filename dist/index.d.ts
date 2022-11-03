import Crypto from 'crypto';

declare abstract class BaseCharset {
    private _charset;
    private _charsetMap;
    private _inverseCharsetMap;
    private _commonReplacer;
    readonly type: CharsetType;
    mode: CharsetMode;
    constructor(type: "binary", mode: CharsetMode, binaryCharset: IEfficientBinaryCharset | IBinaryCharset, commonReplacers?: [string, string][]);
    constructor(type: "literal", mode: CharsetMode, stringCharset: ILiteralCharset);
    get charset(): ICharsetChars;
    apply(str: string): void;
    private _createCharsetMap;
    getChar(character: Character | number): string | undefined;
    private _encodeHybird;
    private _encodeBinary;
    private _encodeLiteral;
    private _decodeBinary;
    private _decodeLiteral;
    encode(str: string): string;
    decode(str: string): string;
    static importCharset(charsetStr: string): void;
    toJSON(): {
        type: CharsetType;
        mode: CharsetMode;
        charset: [string, string][];
    };
    toString(): string;
}

declare abstract class PublicCharset extends BaseCharset {
    readonly name: string;
    readonly aliases: string[];
    constructor(name: string, charset: IEfficientBinaryCharset, aliases?: string | string[]);
    constructor(name: string, charset: IBinaryCharset, aliases?: string | string[]);
    constructor(name: string, charset: ILiteralCharset, aliases?: string | string[]);
}

declare class ClownCryption {
    #private;
    private _charset;
    private _encryptionAlgorithm;
    private _commonReplacers;
    private _salt;
    private _iv;
    private static readonly _commonReplacers;
    constructor({ key, iv, salt, charset, algorithm, commonReplacers }: ClownOptions);
    private _getCharset;
    encrypt(str: string, key?: string | undefined, charset?: BaseCharset): string;
    decrypt(str: string, key?: string | undefined, charset?: BaseCharset): string;
    get key(): string;
    get iv(): string;
    get charset(): PublicCharset;
    get salt(): string;
    get algorithm(): Crypto.CipherCCMTypes | Crypto.CipherGCMTypes | Crypto.CipherOCBTypes;
    get commonReplacers(): [string, string][];
    exportStringToFile(encryptedString: string, { fileName, filePath, overwrite, exportType, encryptFile, key, includeKey, iv, includeIv, algorithm, includeAlgorithm, salt, includeSalt, charset, includeCharset, commonReplacers }: IFileExportOptions): string;
    importStringFile(filePath: string, key?: string): any;
    exportConfigToFile(fileName: string, options: IExportConfigOptions): string;
    static condenseBinary(binaryString: string): string;
    static decondenseBinary(condensedBinary: string): string;
    static findPattern(str: string, maxPatternSize?: number, minPatternSize?: number): [string, number][];
    static importFileConfig(fileName: string, key?: string): ClownCryption;
    static getBinary(str: string): string;
    static multiplyString(str: string, num: number): string;
}

declare class CFS {
    static generateStringFile(str: string, { fileName, filePath, overwrite, exportType, encryptFile, key, includeKey, iv, includeIv, algorithm, includeAlgorithm, salt, includeSalt, charset, includeCharset, commonReplacers, includeCommonReplacers, includeWhiteSpace }: IFileExportOptions): string;
    static readStringFile(filePath: string | {
        [key: string]: string;
    }, key?: string, options?: {
        importByFileContent: boolean;
    }): any;
    static exportConfig(filePath: string, client: ClownCryption, { encrypt, exportStyle, includeAlgorithm, includeCharset, includeCommonReplacers, includeSalt }: IExportConfigOptions): string;
    static readFileConfig(filePath: string, key?: string): {
        [key: string]: string;
    };
    static encryptTransport<T extends {
        [key: string]: unknown;
    }>(str: T | string, key: string): {
        [key: string]: string;
    } | string;
    static decryptTransport(str: string | {
        [key: string]: string;
    }, key: string): typeof str;
    private static _exportToJS;
    private static _importFromJS;
    static parseClown(content: string, key?: string): {
        [key: string]: string;
    };
    static clownify(fileName: string, content: {
        [key: string]: any;
    }, encrypt?: false | string): string;
    static isHex(str: string | {
        [key: string]: string;
    }): boolean;
    private static _stringProp;
    private static _serializePath;
}

declare type CharsetType = "binary" | "literal";
declare type CharsetMode = "normal" | "efficient";
declare type ICharsetChars = IEfficientBinaryCharset | ILiteralCharset | IBinaryCharset;
declare type ClownOptions = {
    key: string;
    iv: string;
    salt?: string;
    charset?: PublicCharset | string;
    algorithm?: Crypto.CipherCCMTypes | Crypto.CipherGCMTypes | Crypto.CipherOCBTypes;
    commonReplacers?: [string, string][];
};
interface IPublicCharsetBaseOptions {
    name: string;
    aliases?: string | string[];
}
interface ILiteralCharsetOptions extends IPublicCharsetBaseOptions {
    type?: "literal";
    mode?: string;
    charset: ILiteralCharset;
}
interface IBinaryCharsetOptions extends IPublicCharsetBaseOptions {
    type?: "binary";
}
interface IBinaryCharset {
    0: string;
    1: string;
}
interface IEfficientBinaryCharset {
    0: string;
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
    7: string;
    8: string;
    9: string;
    ":": string;
    "commonReplacer1": string;
    "commonReplacer2": string;
    ".": string;
}
interface ILiteralCharset {
    "a": string;
    "b": string;
    "c": string;
    "d": string;
    "e": string;
    "f": string;
    "0": string;
    "1": string;
    "2": string;
    "3": string;
    "4": string;
    "5": string;
    "6": string;
    "7": string;
    "8": string;
    "9": string;
}
declare type Character = string;
interface IFileExportOptions {
    fileName: string;
    filePath?: string;
    overwrite?: boolean;
    exportType?: "clown" | "json" | "js";
    encryptFile?: false | string;
    encryptInClown?: boolean;
    key?: string;
    includeKey?: boolean;
    iv?: string;
    includeIv?: boolean;
    algorithm?: Crypto.CipherCCMTypes | Crypto.CipherGCMTypes | Crypto.CipherOCBTypes;
    includeAlgorithm?: boolean;
    salt?: string;
    includeSalt?: boolean;
    charset?: BaseCharset;
    includeCharset?: boolean;
    commonReplacers?: [string, string][];
    includeCommonReplacers?: boolean;
    includeWhiteSpace?: boolean;
}
interface IMessageFileContent {
    fileName: string;
    message: string;
    key?: string;
    iv?: string;
    algorithm?: string;
    charset?: BaseCharset;
    commonReplacer?: [string, string][];
    salt?: string;
}
interface IExportConfigOptions {
    encrypt?: false | string;
    includeCharset?: boolean;
    includeCommonReplacers?: boolean;
    includeAlgorithm?: boolean;
    includeSalt?: boolean;
    exportStyle?: "clown" | "json" | "js";
}

export { CFS, Character, CharsetMode, CharsetType, ClownOptions, IBinaryCharset, IBinaryCharsetOptions, ICharsetChars, IEfficientBinaryCharset, IExportConfigOptions, IFileExportOptions, ILiteralCharset, ILiteralCharsetOptions, IMessageFileContent };
