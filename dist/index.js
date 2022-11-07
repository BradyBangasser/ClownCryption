"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};

// src/index.ts
var src_exports = {};
__export(src_exports, {
  CFS: () => fileSystem_default,
  ClownCryption: () => clowncryption_default,
  charsets: () => charsets_exports,
  default: () => src_default,
  defaultCharsets: () => defaults_exports
});
module.exports = __toCommonJS(src_exports);

// src/defaultCharsets/defaults.ts
var defaults_exports = {};
__export(defaults_exports, {
  CharsetManager: () => CharsetManager,
  DefaultBinaryCharset: () => DefaultBinaryCharset,
  DefaultEfficientBinaryCharset: () => DefaultEfficientBinaryCharset,
  DefaultLiteralCharset: () => DefaultLiteralCharset,
  default: () => defaults_default
});

// src/defaultCharsets/charsets.ts
var charsets_exports = {};
__export(charsets_exports, {
  BinaryCharset: () => BinaryCharset,
  EfficientBinaryCharset: () => EfficientBinaryCharset,
  LiteralCharset: () => LiteralCharset,
  PublicCharset: () => PublicCharset
});

// src/defaultCharsets/baseCharset.ts
var BaseCharset = class {
  _charset;
  _charsetMap = /* @__PURE__ */ new Map();
  _inverseCharsetMap = /* @__PURE__ */ new Map();
  _commonReplacer;
  type;
  mode;
  constructor(type, mode, charset, commonReplacers = [["100", "_"], ["110", "+"]]) {
    this._charset = charset;
    this.type = type;
    this.mode = mode;
    this._commonReplacer = commonReplacers;
    this._createCharsetMap(charset);
  }
  get charset() {
    return this._charset;
  }
  _createCharsetMap(charset) {
    Object.entries(charset).forEach((character) => {
      if (character[0].startsWith("commonReplacer")) {
        this._charsetMap.set(this._commonReplacer[parseInt(String(character[0].at(-1))) - 1][1], character[1]);
        this._inverseCharsetMap.set(character[1], this._commonReplacer[parseInt(String(character[0].at(-1))) - 1][1]);
        return;
      }
      this._charsetMap.set(String(character[0]), String(character[1]));
      this._inverseCharsetMap.set(String(character[1]), String(character[0]));
    });
  }
  getChar(character) {
    return this._charsetMap.get(new String(character));
  }
  _encodeHybird(str) {
    let builder = [];
    const strSplit = str.split("");
    strSplit.forEach((char) => {
      let newChar = this._charsetMap.get(char);
      if (char == " ")
        newChar = this._charsetMap.get("space") ?? this._charsetMap.get(" ");
      if (char == "	")
        newChar = this._charsetMap.get("tab") ?? this._charsetMap.get("	");
      if (typeof newChar === "undefined")
        newChar = this._charsetMap.get("unknown");
      if (typeof newChar === "undefined") {
        `b${char.charCodeAt(0).toString(2)}`.split("").forEach((binaryDigit) => {
          newChar = this._charsetMap.get(binaryDigit);
        });
      }
      builder.push(newChar);
    });
    return this._encodeLiteral(builder.join(""));
  }
  _encodeBinary(str) {
    const builder = [];
    const splitStr = str.split("");
    let returnVal;
    splitStr.forEach((char) => {
      builder.push(char.charCodeAt(0).toString(2).padStart(8, "0"));
    });
    if (this.mode === "efficient")
      returnVal = clowncryption_default.condenseBinary(builder.join(""));
    else
      returnVal = builder.join("");
    return this._encodeLiteral(returnVal);
  }
  _encodeLiteral(str) {
    let builder = "";
    str.split("").forEach((char) => {
      let newChar = this._charsetMap.get(char);
      if (char == " ")
        newChar = this._charsetMap.get("space") ?? this._charsetMap.get(" ");
      if (char == "	")
        newChar = this._charsetMap.get("tab") ?? this._charsetMap.get("	");
      if (typeof newChar === "undefined")
        newChar = this._charsetMap.get("unknown") ?? char;
      builder += newChar;
    });
    return builder;
  }
  _decodeBinary(str) {
    str = this._decodeLiteral(str);
    if (this.mode === "efficient") {
      str = clowncryption_default.decondenseBinary(str);
    }
    const builder = [];
    str.match(/.{8}/g).forEach((char) => {
      builder.push(String.fromCharCode(parseInt(char, 2)));
    });
    return builder.join("");
  }
  _decodeLiteral(str) {
    let builder = "";
    str.split("").forEach((char) => {
      const newChar = this._inverseCharsetMap.get(char);
      if (newChar === "space")
        return builder += " ";
      if (newChar === "enter")
        return builder += "\n";
      if (newChar === "tab")
        return builder += "	";
      builder += newChar;
    });
    return builder;
  }
  encode(str) {
    if (this.type === "binary")
      return this._encodeBinary(str);
    if (this.type === "literal")
      return this._encodeLiteral(str);
    return this._encodeHybird(str);
  }
  decode(str) {
    if (this.type === "binary")
      return this._decodeBinary(str);
    return this._decodeLiteral(str);
  }
  static importCharset(charsetStr) {
    let charset = JSON.parse(charsetStr);
    let charClass;
    if (Array.isArray(charset)) {
    }
    if (charset.type === "literal") {
    }
  }
  toJSON() {
    return {
      type: this.type,
      mode: this.mode,
      charset: Array.from(this._charsetMap)
    };
  }
  toString() {
    return JSON.stringify(this.toJSON());
  }
};
var baseCharset_default = BaseCharset;

// src/defaultCharsets/charsets.ts
var PublicCharset = class extends baseCharset_default {
  name;
  aliases;
  constructor(name, charset, aliases = []) {
    if ("a" in charset)
      super("literal", "normal", charset);
    else if (8 in charset)
      super("binary", "efficient", charset);
    else
      super("binary", "normal", charset);
    this.name = name.toLowerCase().trim();
    this.aliases = Array.isArray(aliases) ? aliases.map((val) => val.toLowerCase().trim()) : [aliases.toLowerCase().trim()];
  }
};
var EfficientBinaryCharset = class extends PublicCharset {
  constructor(name, chars, aliases) {
    super(name, chars, aliases);
  }
};
var BinaryCharset = class extends PublicCharset {
  constructor(name, chars, aliases) {
    super(name, {
      0: chars[0] ?? chars["0"],
      1: chars[1] ?? chars["1"]
    }, aliases);
  }
};
var LiteralCharset = class extends PublicCharset {
  constructor(name, chars, aliases) {
    super(name, chars, aliases);
  }
};

// src/defaultCharsets/defaults.ts
var DefaultBinaryCharset = new BinaryCharset("DefaultBinary", { "0": "\u{1F921}", "1": "\u{1F913}" });
var DefaultEfficientBinaryCharset = new EfficientBinaryCharset("DefaultEfficientBinary", {
  "0": "\u{1F921}",
  "1": "\u{1F913}",
  "2": "\u{1F5FF}",
  "3": "\u{1F928}",
  "4": "\u{1F610}",
  "5": "\u{1F60F}",
  "6": "\u{1F92F}",
  "7": "\u{1F978}",
  "8": "\u{1F974}",
  "9": "\u{1F92F}",
  ".": "\u{1F4EE}",
  ":": "\u262D",
  "commonReplacer1": "\u{1F4A9}",
  "commonReplacer2": "\u{1F468}\u200D\u{1F9AF}"
}, ["eb"]);
var DefaultLiteralCharset = new LiteralCharset("LiteralCharset", {
  "a": "\u{1F921}",
  "b": "\u{1F913}",
  "c": "\u{1F5FF}",
  "d": "\u{1F928}",
  "e": "\u{1F610}",
  "f": "\u{1F60F}",
  "0": "\u{1F92F}",
  "1": "\u{1F978}",
  "2": "\u{1FAC1}",
  "3": "\u{1F92F}",
  "4": "\u{1F4EE}",
  "5": "\u262D",
  "6": "\u{1F94C}",
  "7": "\u{1F4A9}",
  "8": "\u{1F468}\u200D\u{1F9AF}",
  "9": "\u{1F974}"
});
var CharsetManager = class {
  constructor() {
    this.addCharset(DefaultLiteralCharset);
    this.addCharset(DefaultEfficientBinaryCharset);
    this.addCharset(DefaultBinaryCharset);
  }
  _charsets = /* @__PURE__ */ new Map();
  getCharset(name) {
    name = name.toLowerCase().trim();
    if (typeof this._charsets.get(name) !== "undefined")
      return this._charsets.get(name);
    for (let set of this._charsets) {
      if (set[1].aliases.includes(name))
        return set[1];
    }
  }
  addCharset(charset) {
    if (!(charset instanceof PublicCharset))
      throw new TypeError(`Charset is invalid`);
    this._charsets.set(charset.name, charset);
  }
  removeCharset(name) {
    return this._charsets.delete(name);
  }
  static init() {
    if (typeof this.instance === "undefined")
      this.instance = new this();
    return this.instance;
  }
};
__publicField(CharsetManager, "instance");
var defaults_default = CharsetManager.init();

// src/clowncryption.ts
var import_crypto2 = __toESM(require("crypto"));

// src/fileSystem.ts
var import_crypto = __toESM(require("crypto"));
var fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));

// src/constants.ts
var constants = {
  algorithm: "aes-192-cbc",
  salt: "salt",
  defaultCharsets: {
    binary: DefaultBinaryCharset,
    efficientBinary: DefaultEfficientBinaryCharset,
    literal: DefaultLiteralCharset
  }
};
var constants_default = constants;

// src/fileSystem.ts
var _CFS = class {
  constructor() {
  }
  static generateStringFile(str, {
    fileName,
    filePath,
    overwrite = false,
    exportType = "clown",
    encryptFile = false,
    key,
    includeKey = false,
    iv,
    includeIv = false,
    algorithm,
    includeAlgorithm = false,
    salt,
    includeSalt = false,
    charset,
    includeCharset = false,
    commonReplacers = [],
    includeCommonReplacers = false,
    includeWhiteSpace = false
  }) {
    const { fileName: realFileName, path: fPath } = this._serializePath(import_path.default.join(filePath ?? "", fileName), overwrite);
    const exportContent = {
      key: this._stringProp(key, includeKey),
      iv: this._stringProp(iv, includeIv),
      algorithm: this._stringProp(algorithm, includeAlgorithm),
      salt: this._stringProp(salt, includeSalt),
      charset: this._stringProp(charset == null ? void 0 : charset.toJSON(), includeCharset),
      commonReplacers: this._stringProp(commonReplacers, includeCommonReplacers),
      message: str
    };
    if (exportType === "js")
      return this._exportToJS(fPath, exportContent);
    let builder;
    if (exportType === "clown")
      builder = this.clownify(realFileName, exportContent);
    else
      builder = exportContent;
    if (typeof encryptFile === "string")
      builder = this.encryptTransport(builder, encryptFile);
    fs.writeFileSync(`${fPath}.${exportType}`, JSON.stringify(builder, null, includeWhiteSpace === true ? "	" : ""));
    return `${fPath}.${exportType}`;
  }
  static readStringFile(filePath, key, importByFileContent = false) {
    let fileContent;
    if (typeof filePath === "string" && importByFileContent === false) {
      filePath = this._serializePath(filePath).path;
      if (import_path.default.extname(filePath.toString()) === ".js")
        return this._importFromJS(filePath);
    }
    if (importByFileContent === true)
      fileContent = filePath;
    else {
      if (!filePath.startsWith(process.cwd()))
        filePath = import_path.default.join(process.cwd(), filePath);
      fileContent = fs.readFileSync(filePath).toString("utf-8");
      if (import_path.default.extname(filePath) === ".json")
        fileContent = JSON.parse(fileContent);
    }
    if (typeof key === "string" && this.isHex(fileContent)) {
      if (typeof fileContent === "object")
        return this.decryptTransport(fileContent, key);
      return this.parseClown(fileContent, key);
    }
    if (typeof fileContent === "object")
      return fileContent;
    else
      return this.parseClown(fileContent);
  }
  static exportConfig(filePath, client, {
    encrypt = false,
    exportStyle = "clown",
    includeAlgorithm = true,
    includeCharset = true,
    includeCommonReplacers = true,
    includeSalt = true
  }) {
    let exportOb = {
      key: client.key,
      iv: client.iv,
      salt: this._stringProp(client.salt, includeSalt),
      algorithm: this._stringProp(client.algorithm, includeAlgorithm),
      charset: this._stringProp(client.charset, includeCharset),
      commonReplacers: this._stringProp(client.commonReplacers, includeCommonReplacers)
    };
    const { fileName, path: fPath } = this._serializePath(filePath, false);
    let fileContent;
    if (exportStyle === "js")
      return this._exportToJS(fPath, exportOb);
    if (exportStyle === "clown") {
      fileContent = this.clownify(fileName, exportOb, encrypt);
    } else if (typeof encrypt === "string")
      fileContent = JSON.stringify(this.encryptTransport(exportOb, encrypt));
    else
      fileContent = JSON.stringify(exportOb);
    fs.writeFileSync(`${fPath}.${exportStyle}`, fileContent);
    return `${fPath}.${exportStyle}`;
  }
  static readFileConfig(filePath, key) {
    filePath = this._serializePath(filePath).path;
    if (import_path.default.extname(filePath).endsWith("js"))
      return this._importFromJS(filePath);
    let content = fs.readFileSync(filePath).toString();
    if (typeof content === "string")
      return this.parseClown(content, key);
    else if (this.isHex(JSON.parse(content)) && typeof key === "string")
      return this.decryptTransport(JSON.parse(content), key);
    return JSON.parse(content);
  }
  static encryptTransport(str, key) {
    if (typeof str === "string") {
      const cipher = import_crypto.default.createCipheriv(constants_default.algorithm, import_crypto.default.scryptSync(key, "salt", 24), Buffer.alloc(16));
      return cipher.update(str, "utf-8", "hex") + cipher.final("hex");
    }
    let builder = {};
    Object.entries(str).forEach(([oKey, val]) => {
      if (typeof val === "undefined")
        return;
      let cipher = import_crypto.default.createCipheriv(constants_default.algorithm, import_crypto.default.scryptSync(key, "salt", 24), Buffer.alloc(16));
      let newKey = cipher.update(oKey, "utf-8", "hex") + cipher.final("hex");
      cipher = import_crypto.default.createCipheriv(constants_default.algorithm, import_crypto.default.scryptSync(key, "salt", 24), Buffer.alloc(16));
      let newVal = cipher.update(typeof val === "string" ? val : (val == null ? void 0 : val.toString()) ?? JSON.stringify(val), "utf-8", "hex") + cipher.final("hex");
      builder[newKey] = newVal;
    });
    return builder;
  }
  static decryptTransport(str, key) {
    if (typeof str === "object") {
      const builder = {};
      Object.entries(str).forEach(([oKey, string]) => {
        let decipher2 = import_crypto.default.createDecipheriv(constants_default.algorithm, import_crypto.default.scryptSync(key, "salt", 24), Buffer.alloc(16));
        const newOKey = decipher2.update(oKey, "hex", "utf-8") + decipher2.final("utf-8");
        decipher2 = import_crypto.default.createDecipheriv(constants_default.algorithm, import_crypto.default.scryptSync(key, "salt", 24), Buffer.alloc(16));
        const newString = decipher2.update(string, "hex", "utf-8") + decipher2.final("utf-8");
        builder[newOKey] = newString;
      });
      return builder;
    }
    let decipher = import_crypto.default.createDecipheriv(constants_default.algorithm, import_crypto.default.scryptSync(key, "salt", 24), Buffer.alloc(16));
    return decipher.update(str, "hex", "utf-8") + decipher.final("utf-8");
  }
  static _exportToJS(fPath, content) {
    const { path: newFPath } = this._serializePath(fPath);
    const jsStringify = (object) => `{
	${Object.entries(object).map(([key, thing]) => `${key}: ${typeof thing === "string" ? `"${thing}"` : Array.isArray(thing) ? JSON.stringify(thing) : thing}`).join(",\n	")}
}`;
    fs.writeFileSync(`${newFPath}.js`, Buffer.from(`module.exports = ${jsStringify(content)}`));
    return `${newFPath}.js`;
  }
  static _importFromJS(fPath) {
    return require(fPath.toString());
  }
  static parseClown(content, key) {
    var _a;
    let parsedContent = JSON.parse(content);
    if (typeof key === "string" && (((_a = content.toString().match(/[0-9"a-f]{1}/gi)) == null ? void 0 : _a.length) ?? 0) === content.toString().length)
      parsedContent = this.decryptTransport(parsedContent, key);
    let builder = {};
    let split = parsedContent.split(".");
    builder.fileName = split[0].substring(1, split[0].length - 1);
    split.shift();
    parsedContent = split.join(".");
    parsedContent.split("].[").forEach((val, index) => {
      const valSplit = val.split("]:[");
      if (index === 0)
        valSplit[0] = valSplit[0].substring(1);
      builder[valSplit[0]] = valSplit[1];
    });
    return builder;
  }
  static clownify(fileName, content, encrypt = false) {
    let builder = `[${fileName}]`;
    Object.entries(content).forEach(([key, string]) => {
      if (typeof string === "undefined")
        return;
      if (typeof string !== "string") {
        string = (string == null ? void 0 : string.toString()) ?? JSON.stringify(string);
      }
      builder += `.[${key}]:[${string}]`;
    });
    if (typeof encrypt === "string")
      return JSON.stringify(_CFS.encryptTransport(builder, encrypt));
    return builder;
  }
  static isHex(str) {
    var _a, _b;
    if (typeof str === "string")
      return (((_a = str.match(/[0-9"a-f]{1}/gi)) == null ? void 0 : _a.length) ?? 0) === str.length;
    let objKey = Object.entries(str)[0];
    return (((_b = objKey[0].match(/[0-9a-f]{1}/gi)) == null ? void 0 : _b.length) ?? 0) === objKey[0].length;
  }
  static _serializePath(fPath, overwrite = false) {
    fPath = fPath.toString();
    if (!fPath.startsWith(process.cwd()))
      fPath = import_path.default.join(process.cwd(), fPath);
    const realFileName = fPath.split(/(\\\\)|(\/)/g).at(-1) ?? fPath;
    try {
      let fss = fs.statSync(fPath);
      if (fss.isDirectory())
        fPath = import_path.default.join(fPath, fPath);
      if (fss.isFile() && !overwrite)
        fPath = `${fPath}_clown${Math.floor(Math.random() * 999999 + 1).toString().padStart(6, "0")}`;
    } finally {
      return { fileName: realFileName, path: fPath };
    }
  }
};
var CFS = _CFS;
__publicField(CFS, "_stringProp", (prop, includeProp) => includeProp === true ? (prop == null ? void 0 : prop.toString()) !== "[object Object]" && typeof (prop == null ? void 0 : prop.toString()) === "string" ? prop.toString() : JSON.stringify(prop) : void 0);
var fileSystem_default = CFS;

// src/clowncryption.ts
var _key;
var _ClownCryption = class {
  constructor({
    key,
    iv,
    salt = "pepper",
    charset = "eb",
    algorithm = "aes-192-ccm",
    commonReplacers = _ClownCryption._commonReplacers
  }) {
    __privateAdd(this, _key, void 0);
    __publicField(this, "_charset");
    __publicField(this, "_algorithm");
    __publicField(this, "_commonReplacers");
    __publicField(this, "_salt");
    __publicField(this, "_iv");
    __publicField(this, "charsetMangager", defaults_default);
    __privateSet(this, _key, key);
    this._iv = iv;
    this._salt = salt;
    this._charset = this._getCharset(charset);
    this._algorithm = algorithm;
    this._commonReplacers = commonReplacers;
  }
  _getCharset(charset) {
    if (charset instanceof PublicCharset)
      return charset;
    if (typeof charset === "string") {
      const chset = defaults_default.getCharset(charset);
      if (typeof chset !== "undefined")
        return chset;
    }
    throw new TypeError(`Charset (${charset}) is not a valid charset`);
  }
  encrypt({
    message,
    key = this.key,
    iv = this.iv,
    charset = this.charset,
    algorithm = this.algorithm,
    salt = this.salt
  }) {
    const cipher = import_crypto2.default.createCipheriv(algorithm, import_crypto2.default.scryptSync(key, salt, 24), Buffer.alloc(16, iv));
    try {
      const crypto = cipher.update(message, "utf-8", "hex") + cipher.final("hex");
      return charset.encode(crypto);
    } catch (err) {
      console.error(err);
    }
    return "";
  }
  static encrypt({
    message,
    key,
    iv,
    charset = defaults_default.getCharset("DefaultEfficientBinary"),
    algorithm = "aes-192-ccm",
    salt = "pepper"
  }) {
    if (!(charset instanceof PublicCharset))
      throw new TypeError("Charset is not valid");
    const cipher = import_crypto2.default.createCipheriv(algorithm, import_crypto2.default.scryptSync(key, salt, 24), Buffer.alloc(16, iv));
    try {
      const crypto = cipher.update(message, "utf-8", "hex") + cipher.final("hex");
      return charset.encode(crypto);
    } catch (err) {
      console.error(err);
    }
    return "";
  }
  decrypt({
    message,
    key = this.key,
    iv = this.iv,
    salt = this.salt,
    algorithm = this.algorithm,
    charset = this.charset
  }) {
    const decipher = import_crypto2.default.createDecipheriv(algorithm, import_crypto2.default.scryptSync(key, salt, 24), Buffer.alloc(16, iv));
    try {
      const decrypt = charset.decode(message);
      return decipher.update(decrypt, "hex", "utf-8") + decipher.final("utf-8");
    } catch (err) {
      console.error(err);
    }
    return "";
  }
  static decrypt({
    message,
    key,
    iv,
    charset = defaults_default.getCharset("DefaultEfficientBinary"),
    algorithm = "aes-192-ccm",
    salt = "pepper"
  }) {
    if (!(charset instanceof PublicCharset))
      throw new TypeError("Charset is not valid");
    const decipher = import_crypto2.default.createDecipheriv(algorithm, import_crypto2.default.scryptSync(key, salt, 24), Buffer.alloc(16, iv));
    try {
      const decrypt = charset.decode(message);
      return decipher.update(decrypt, "hex", "utf-8") + decipher.final("utf-8");
    } catch (err) {
      console.error(err);
    }
    return "";
  }
  get key() {
    return __privateGet(this, _key);
  }
  get iv() {
    return this._iv;
  }
  get charset() {
    return this._charset;
  }
  get salt() {
    return this._salt;
  }
  get algorithm() {
    return this._algorithm;
  }
  get commonReplacers() {
    return this._commonReplacers;
  }
  exportStringToFile(encryptedString, {
    fileName,
    filePath,
    overwrite,
    exportType,
    encryptFile,
    key = this.key,
    includeKey,
    iv = this.iv,
    includeIv,
    algorithm = this.algorithm,
    includeAlgorithm,
    salt = this.salt,
    includeSalt,
    charset = this._charset,
    includeCharset,
    commonReplacers = this.commonReplacers
  }) {
    return fileSystem_default.generateStringFile(encryptedString, {
      fileName,
      filePath,
      overwrite,
      exportType,
      encryptFile,
      key,
      includeKey,
      iv,
      includeIv,
      algorithm,
      includeAlgorithm,
      salt,
      includeSalt,
      charset,
      includeCharset,
      commonReplacers
    });
  }
  importStringFile(filePath, key) {
    return fileSystem_default.readStringFile(filePath, key);
  }
  exportConfigToFile(fileName, options) {
    return fileSystem_default.exportConfig(fileName, this, options);
  }
  static condenseBinary(binaryString) {
    let count = 0;
    let lastChar = "";
    let efficientBuilder = "";
    const variables = [];
    const buildStringSplit = binaryString.split("");
    for (let i in buildStringSplit) {
      if (buildStringSplit[i] !== lastChar) {
        if (count < 2) {
          efficientBuilder += _ClownCryption.multiplyString(lastChar, count);
          lastChar = buildStringSplit[i];
          count = 0;
        } else {
          efficientBuilder += lastChar + count;
          lastChar = buildStringSplit[i];
          count = 0;
        }
      } else {
        count++;
      }
    }
    efficientBuilder += lastChar + count;
    for (let i in this._commonReplacers) {
      efficientBuilder = efficientBuilder.replaceAll(this._commonReplacers[i][0], this._commonReplacers[i][1]);
    }
    for (let i = 0; i <= 9; i++) {
      if (!efficientBuilder.includes(i.toString()))
        variables.push(i.toString());
    }
    let patterns = _ClownCryption.findPattern(efficientBuilder);
    let possibleSavings = 0;
    let varSpace = 1;
    const assignedVariables = [];
    for (let i in variables) {
      if (typeof patterns[i] === "undefined")
        continue;
      const variObject = {
        variable: variables[i],
        replaces: patterns[i][0],
        uses: variables[i].length + patterns[i][0].length,
        saves: patterns[i][0].length * patterns[i][1]
      };
      possibleSavings += variObject.saves;
      varSpace += variObject.uses;
      assignedVariables.push(variObject);
    }
    let variableString = [];
    if (possibleSavings > varSpace) {
      assignedVariables.forEach((assigned) => {
        variableString.push(assigned.variable + assigned.replaces);
        efficientBuilder = efficientBuilder.replaceAll(assigned.replaces, assigned.variable);
      });
      efficientBuilder = variableString.join(".") + ":" + efficientBuilder;
    }
    console.log(`${(1 - efficientBuilder.length / binaryString.length) * 100}% size reduction`);
    return efficientBuilder;
  }
  static decondenseBinary(condensedBinary) {
    let buildString = "";
    if (condensedBinary.includes(":")) {
      const variableString = condensedBinary.split(":")[0];
      condensedBinary = condensedBinary.split(":")[1];
      const variables = variableString.split(".");
      variables.forEach((variable) => {
        condensedBinary = condensedBinary.replaceAll(variable[0], variable.substring(1));
      });
    }
    for (let i in this._commonReplacers) {
      condensedBinary = condensedBinary.replaceAll(this._commonReplacers[i][1], this._commonReplacers[i][0]);
    }
    condensedBinary.split("").forEach((value, index, array) => {
      if (parseInt(value) >= 2) {
        buildString += _ClownCryption.multiplyString(array[index - 1], parseInt(value));
        return;
      }
      if (parseInt(array[index + 1]) <= 1) {
        return buildString += value;
      }
    });
    return buildString + buildString[buildString.length - 1];
  }
  static findPattern(str, maxPatternSize = 4, minPatternSize = 3) {
    let patterns = {};
    for (let i = maxPatternSize; i >= minPatternSize; i--) {
      let n;
      for (n = 0; n < str.length; n += i) {
        const pattern = str.substring(n, n + i);
        patterns[pattern] = (patterns[pattern] ?? 0) + 1;
      }
    }
    return Object.entries(patterns).sort((a, b) => b[1] * b[0].length - a[1] * a[0].length).filter((value, index, array) => value[1] > 1 && value[0].length === array[0][0].length);
  }
  static importFileConfig(filePath, key) {
    const config = fileSystem_default.readFileConfig(filePath, key);
    return new this({
      key: config.key,
      iv: config.iv,
      algorithm: config.algorithm,
      salt: config.salt
    });
  }
  static getBinary(str) {
    const strSplit = str.split("");
    const builder = [];
    for (let i in strSplit) {
      builder.push(strSplit[i].charCodeAt(0).toString(2));
    }
    return builder.join(" ");
  }
  static multiplyString(str, num) {
    let builder = "";
    for (let i = 0; i <= num; i++) {
      builder += str;
    }
    return builder;
  }
};
var ClownCryption = _ClownCryption;
_key = new WeakMap();
__publicField(ClownCryption, "_commonReplacers", [["100", "_"], ["110", "+"]]);
var clowncryption_default = ClownCryption;

// src/index.ts
var src_default = clowncryption_default;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CFS,
  ClownCryption,
  charsets,
  defaultCharsets
});
