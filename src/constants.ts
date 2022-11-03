import Crypto from "crypto"
import { DefaultBinaryCharset, DefaultEfficientBinaryCharset, DefaultLiteralCharset } from "./defaultCharsets/defaults"

const constants = {
    algorithm: "aes-192-cbc",
    salt: "salt",
    defaultCharsets: {
        binary: DefaultBinaryCharset,
        efficientBinary: DefaultEfficientBinaryCharset,
        literal: DefaultLiteralCharset
    },
}

export default constants