const ClownCryption = require("clowncryption");

// Encrypt a string
const encryptedString = ClownCryption.encrypt({
    message: "Hello World",
    key: "My Secret Key",
    iv: "Initalizing Vector",
    charset: "binary"
});

// Decrypt that string

const decryptedString = ClownCryption.decrypt({
    message: encryptedString, // The encrypted string
    key: "My Secret Key",
    iv: "Initalizing Vector",
    charset: "binary"
})

console.log(decryptedString)