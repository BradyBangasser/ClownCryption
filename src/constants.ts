import Crypto from "crypto"
import { DefaultBinaryCharset, DefaultEfficientBinaryCharset, DefaultLiteralCharset } from "./defaultCharsets/defaults"

const constants = {
    key: "undefined" as string,
    iv: "initVector",
    algorithm: "aes-192-cbc" as Crypto.CipherCCMTypes,
    salt: "salt" as string | undefined,
    binaryEfficientOptions: {
        commonReplacers: [["100", "_"], ["110", "+"]] as [string, string][]
    },
    charset: {
        binary: DefaultBinaryCharset,
        efficientBinary: DefaultEfficientBinaryCharset,
        literal: DefaultLiteralCharset
    },
}

export default constants