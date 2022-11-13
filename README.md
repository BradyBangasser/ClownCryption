> The worlds most fun encryption software

## Highlights

- Uses The [Node Crypto Module](https://nodejs.org/api/crypto.html#cryptocreatecipherivalgorithm-key-iv-options) to create encryptions
- Custom Charsets
- Debatably better encryption than most corporations and government agencies use

## Install

```sh
npm install clowncryption
```
<br>

```sh 
yarn add clowncryption
```

## Usage

```js
import ClownCryption from 'clowncryption';
// or const ClownCryption = require("clowncryption");

const Clown = new ClownCryption({
    key: "Secret Key",
    iv: "Initalizing Vector"
});

const encryptedString = Clown.encrypt({
    message: "This is a secret message"
});

console.log(Clown.decrypt({
    message: encryptedString
}));

// Static Encryption

const encryptedString = ClownCryption.encrypt({
    message: "This is another secret message",
    key: "My Other Secret Key",
    iv: "Initalizing Vector"
});

console.log(ClownCryption.decrypt({
    message: encryptedString,
    key: "My Other Secret Key",
    iv: "Initalizing Vector"
}));
```

ClownCryption makes it easy to create new charsets

```js
import ClownCryption from 'clowncryption';
// Or const ClownCrption = require("clowncryption")

import { charsets } from 'clowncryption'; 
// Or const { charsets } = require("clowncryption")

// Create new Custom Charset
const myCharset = new charsets.BinaryCharset("My Charset", {
    0: "😐",
    1: "😏"
});

const encryptedString = ClownCryption.encrypt({
    message: "Hello World",
    key: "Super Secret Key",
    iv: "Spaghetti",
    charset: myCharset
});

const decryptedString = ClownCryption.decrypt({
    message: encryptedString,
    key: "Super Secret Key",
    iv: "Spaghetti",
    charset: myCharset
})

console.log(decryptedString);
```

### See [more exampes](https://github.com/BradyBangasser/ClownCryption/tree/main/examples)

## Supported Algorithms
- AES-128
- AES-192
- AES-256


## Browser support

Testing ongoing

## Origin story

This started as a joke between some friends, one of them made some encryption software that used exclusively emojis to encrypt messages. That algorithm not very good encryption and they decided to rewrite it to be more secure and also open source.

## Warning

This algorithm is not recommended for use because emojis take up double the space as normal characters, making this algorithm extremely inefficient storage wise.

## Maintainers

- [Brady Bangasser](https://github.com/BradyBangasser)