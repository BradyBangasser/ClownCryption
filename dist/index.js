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
  constructor(type, mode, charset, commonReplacers = [
    ["100", "_"],
    ["110", "+"]
  ]) {
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
        this._charsetMap.set(
          this._commonReplacer[parseInt(String(character[0].at(-1))) - 1][1],
          character[1]
        );
        this._inverseCharsetMap.set(
          character[1],
          this._commonReplacer[parseInt(String(character[0].at(-1))) - 1][1]
        );
        return;
      }
      if (BaseCharset.getStringEmojis(String(character)).length !== 1 && String(character).length !== 1)
        throw new SyntaxError(`Character ${character}.length > 1`);
      if (this._charsetMap.get(String(character[0])) || this._inverseCharsetMap.get(String(character[1])))
        throw new SyntaxError(
          `Cannot set ${character[0]} to ${character[1]} because one of them is already in the charset`
        );
      this._charsetMap.set(String(character[0]), String(character[1]));
      this._inverseCharsetMap.set(String(character[1]), String(character[0]));
    });
  }
  getChar(character) {
    return this._charsetMap.get(new String(character));
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
    for (let i of str) {
      builder += this._charsetMap.get(i);
    }
    return builder;
  }
  validChars(str) {
    for (let i of str) {
      if (typeof this._inverseCharsetMap.get(i))
        return false;
    }
    return true;
  }
  static getStringEmojis(str) {
    return str.match(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDEFF])/gi
    ) || [];
  }
  static isEmoji(char) {
    return BaseCharset.getStringEmojis(char).length === char.length / 2;
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
    for (let character of str) {
      builder += this._inverseCharsetMap.get(character);
    }
    return builder;
  }
  encode(str) {
    if (this.type === "binary")
      return this._encodeBinary(str);
    if (this.type === "literal")
      return this._encodeLiteral(str);
    throw new SyntaxError(
      `Charset type of ${this.type} is not binary or literal`
    );
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
    super(
      name,
      {
        "0": chars[0] ?? chars["0"],
        "1": chars[1] ?? chars["1"]
      },
      aliases
    );
  }
};
var LiteralCharset = class extends PublicCharset {
  constructor(name, chars, aliases) {
    super(name, chars, aliases);
  }
};

// src/defaultCharsets/defaults.ts
var DefaultBinaryCharset = new BinaryCharset(
  "DefaultBinary",
  { "0": "\u{1F921}", "1": "\u{1F913}" },
  ["binary"]
);
var DefaultEfficientBinaryCharset = new EfficientBinaryCharset(
  "DefaultEfficientBinary",
  {
    "0": "\u{1F921}",
    "1": "\u{1F913}",
    "2": "\u{1FAC1}",
    "3": "\u{1F92F}",
    "4": "\u{1F4EE}",
    "5": "\u{1F404}",
    "6": "\u{1F5FF}",
    "7": "\u{1F4A9}",
    "8": "\u{1F920}",
    "9": "\u{1F974}",
    ".": "\u{1F610}",
    ":": "\u{1F60F}",
    commonReplacer1: "\u{1F92F}",
    commonReplacer2: "\u{1F95B}"
  },
  ["eb"]
);
var DefaultLiteralCharset = new LiteralCharset(
  "LiteralCharset",
  {
    a: "\u{1F978}",
    b: "\u{1F95B}",
    c: "\u{1F5FF}",
    d: "\u{1F928}",
    e: "\u{1F610}",
    f: "\u{1F60F}",
    "0": "\u{1F921}",
    "1": "\u{1F913}",
    "2": "\u{1FAC1}",
    "3": "\u{1F92F}",
    "4": "\u{1F4EE}",
    "5": "\u{1F404}",
    "6": "\u{1F94C}",
    "7": "\u{1F4A9}",
    "8": "\u{1F920}",
    "9": "\u{1F974}"
  },
  ["literal"]
);
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
var import_crypto = __toESM(require("crypto"));

// src/fileSystem.ts
var fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
var CFS = class {
  constructor() {
  }
  static generateStringFile(str, {
    fileName,
    filePath,
    overwrite = false,
    exportType = "clown",
    encryptFile = false,
    encryptInClown = true,
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
    includeCommonReplacers = false
  }) {
    const { path: fPath } = this._serializePath(
      import_path.default.join(filePath ?? "", fileName),
      overwrite
    );
    const exportContent = {
      key: this._stringProp(key, includeKey),
      iv: this._stringProp(iv, includeIv),
      algorithm: this._stringProp(algorithm, includeAlgorithm),
      salt: this._stringProp(salt, includeSalt),
      charset: this._stringProp(charset?.toJSON(), includeCharset),
      commonReplacers: this._stringProp(
        commonReplacers,
        includeCommonReplacers
      ),
      message: str
    };
    const content = this._generateOutputString(
      exportContent,
      exportType,
      encryptFile,
      encryptInClown
    );
    fs.writeFileSync(`${fPath}.${exportType}`, content);
    return `${fPath}.${exportType}`;
  }
  static readStringFile(filePath, key) {
    return this._generateInputObject(
      fs.readFileSync(this._serializePath(filePath).path, "utf-8"),
      key
    );
  }
  static exportConfig(filePath, client, {
    encryptFile = false,
    exportType = "clown",
    includeAlgorithm = true,
    includeCharset = true,
    includeCommonReplacers = true,
    includeSalt = true,
    encryptInClown = true
  }) {
    let exportOb = {
      key: client.key,
      iv: client.iv,
      salt: this._stringProp(client.salt, includeSalt),
      algorithm: this._stringProp(client.algorithm, includeAlgorithm),
      charset: this._stringProp(client.charset, includeCharset),
      commonReplacers: this._stringProp(
        client.commonReplacers,
        includeCommonReplacers
      )
    };
    const { path: fPath } = this._serializePath(filePath, false);
    const content = this._generateOutputString(
      exportOb,
      exportType,
      encryptFile,
      encryptInClown
    );
    fs.writeFileSync(`${fPath}.${exportType}`, content);
    return `${fPath}.${exportType}`;
  }
  static readFileConfig(filePath, key) {
    return this._generateInputObject(
      fs.readFileSync(this._serializePath(filePath).path, "utf-8"),
      key
    );
  }
  static isHex(str) {
    if (typeof str === "string")
      return (str.match(/[0-9"a-f]{1}/gi)?.length ?? 0) === str.length;
    let objKey = Object.entries(str)[0];
    return (objKey[0].match(/[0-9a-f]{1}/gi)?.length ?? 0) === objKey[0].length;
  }
  static _serializePath(filePath, overwrite = false, includeFileExt = false) {
    filePath = filePath.toString();
    if (!filePath.startsWith(process.cwd()))
      filePath = import_path.default.join(process.cwd(), filePath);
    let realFileName = import_path.default.basename(filePath);
    for (let file of fs.readdirSync(import_path.default.dirname(filePath))) {
      if (import_path.default.basename(file, import_path.default.extname(file)) === realFileName && import_path.default.extname(file).length) {
        realFileName = `${realFileName}${overwrite ? "" : `_clown${Math.floor(Math.random() * 999999 + 1).toString().padStart(6, "0")}`}${includeFileExt ? import_path.default.extname(file) : ""}`;
        filePath = import_path.default.join(import_path.default.dirname(filePath), realFileName);
        break;
      }
    }
    return { fileName: realFileName, path: filePath };
  }
  static _generateOutputString(content, fileType, encrypt = false, encodeInClown = true) {
    const encode = (val) => encodeInClown === "short" || encodeInClown === "very short" ? DefaultLiteralCharset.encode(val) : DefaultBinaryCharset.encode(val);
    const fcrypt = (val) => clowncryption_default.aesEncrypt(
      val,
      encrypt || "My Super Secret Super Funny Key",
      "Initalizing Vector",
      128,
      "pepper",
      false
    );
    fileType = fileType.toLowerCase().trim();
    content = Object.fromEntries(
      Object.entries(content).filter((value) => typeof value[1] !== "undefined")
    );
    if (typeof encodeInClown === "string")
      encodeInClown = encodeInClown === "short" || encodeInClown === "very short" ? encodeInClown.toLowerCase().trim() : true;
    if (fileType === "clown") {
      if (encodeInClown === "very short")
        return Buffer.from(
          `[${Object.entries(content).map(([key, str]) => {
            return [
              encode(fcrypt(key)),
              PublicCharset.isEmoji(str) ? `*${str}` : encode(fcrypt(str))
            ].join(":[") + "]";
          }).join("]:[")}]`
        );
      let stringifiedContent = `[${Object.entries(content).map((value) => value.join(":[*") + "]").join("]:[")}]`;
      if (typeof encrypt === "string" || encodeInClown)
        stringifiedContent = fcrypt(stringifiedContent);
      if (encodeInClown)
        stringifiedContent = encode(stringifiedContent);
      return Buffer.from(stringifiedContent);
    } else if (fileType === "json") {
      if (typeof encrypt === "string" || encodeInClown)
        content = Object.fromEntries(
          Object.entries(content).map(([key, val]) => [
            fcrypt(key),
            fcrypt(val)
          ])
        );
      if (encodeInClown)
        content = Object.fromEntries(
          Object.entries(content).map(([key, val]) => [
            encode(key),
            encode(val)
          ])
        );
      return Buffer.from(JSON.stringify(content, null, "	"));
    } else {
      return Buffer.from(
        `module.exports = ${((object) => `{
	${Object.entries(object).map(
          ([key, thing]) => `${key}: ${typeof thing === "string" ? `"${thing}"` : Array.isArray(thing) ? JSON.stringify(thing) : thing}`
        ).join(",\n	")}
}`)(content)}`
      );
    }
  }
  static _generateInputObject(content, key) {
    const decode = (val) => DefaultBinaryCharset.validChars(val) ? DefaultBinaryCharset.decode(val) : DefaultLiteralCharset.decode(val);
    const decrypt = (val) => clowncryption_default.aesDecrypt(
      val,
      key || "My Super Secret Super Funny Key",
      "Initalizing Vector",
      128,
      "pepper",
      false
    );
    if (this.isHex(content))
      content = decrypt(content);
    if (DefaultLiteralCharset.validChars(content))
      content = decrypt(
        DefaultBinaryCharset.validChars(content) ? DefaultBinaryCharset.decode(content) : DefaultLiteralCharset.decode(content)
      );
    if (content.startsWith("[")) {
      return Object.fromEntries(
        content.split("]:[").map((split) => {
          if (split.startsWith("["))
            split = split.substring(1);
          if (split.endsWith("]]"))
            split = split.substring(0, split.length - 1);
          return split.split(":").map((val, index) => {
            if (index % 2 === 1)
              val = val.substring(1, val.length - 1);
            let valDecode = decode(val);
            if (valDecode.toLowerCase().includes("undefined"))
              return val.replaceAll("*", "");
            if (this.isHex(valDecode))
              return decrypt(valDecode) || val;
            return val;
          });
        })
      );
    }
    if (content.startsWith("{"))
      return JSON.parse(content);
    if (content.startsWith("module.exports = "))
      return JSON.parse(content.replace("module.export = ", ""));
    throw new Error(`Unable to parse content: ${content}`);
  }
};
__publicField(CFS, "_stringProp", (prop, includeProp) => includeProp === true ? prop?.toString() !== "[object Object]" && typeof prop?.toString() === "string" ? prop.toString() : JSON.stringify(prop) : void 0);
var fileSystem_default = CFS;

// src/clowncryption.ts
var _key;
var _ClownCryption = class {
  constructor({
    key,
    iv,
    salt = "pepper",
    charset = "eb",
    algorithm = "aes192",
    commonReplacers = _ClownCryption._commonReplacers
  }) {
    __privateAdd(this, _key, void 0);
    __publicField(this, "_charset");
    __publicField(this, "_algorithm");
    __publicField(this, "_commonReplacers");
    __publicField(this, "_salt");
    __publicField(this, "_iv");
    __publicField(this, "charsetMangager", defaults_default);
    __privateSet(this, _key, key.toString());
    this._iv = iv.toString();
    this._salt = salt.toString();
    this._charset = _ClownCryption._getCharset(charset);
    this._algorithm = algorithm.toLowerCase().trim();
    this._commonReplacers = commonReplacers;
  }
  static _getCharset(charset) {
    if (charset instanceof PublicCharset)
      return charset;
    if (typeof charset === "string") {
      const chset = defaults_default.getCharset(charset);
      if (typeof chset !== "undefined")
        return chset;
    }
    throw new TypeError(`Charset (${charset}) is not a valid charset`);
  }
  static aesEncrypt(str, key, iv, keylen = 192, salt = "pepper", log = true) {
    const cipher = import_crypto.default.createCipheriv(
      `aes${keylen}`,
      import_crypto.default.scryptSync(key, salt, keylen / 8),
      Buffer.alloc(16, iv)
    );
    let encryption = "";
    try {
      encryption = cipher.update(str, "utf-8", "hex");
      encryption += cipher.final("hex");
    } catch (error) {
      if (log)
        console.error(error);
    } finally {
      return encryption;
    }
  }
  static aesDecrypt(str, key, iv, keylen = 192, salt = "pepper", log = true) {
    const decipher = import_crypto.default.createDecipheriv(
      `aes${keylen}`,
      import_crypto.default.scryptSync(key, salt, keylen / 8),
      Buffer.alloc(16, iv)
    );
    let decryption = "";
    try {
      decryption = decipher.update(str, "hex", "utf-8");
      decryption += decipher.final("utf-8");
    } catch (error) {
      if (log)
        console.error(error);
    } finally {
      return decryption;
    }
  }
  encrypt({
    message,
    key = this.key,
    iv = this.iv,
    charset = this.charset,
    algorithm = this.algorithm,
    salt = this.salt
  }) {
    return _ClownCryption.encrypt({
      message,
      key,
      iv,
      charset,
      algorithm,
      salt
    });
  }
  static encrypt({
    message,
    key,
    iv,
    charset = defaults_default.getCharset("DefaultEfficientBinary"),
    algorithm = "aes192",
    salt = "pepper"
  }) {
    return _ClownCryption._getCharset(charset)?.encode(
      this.aesEncrypt(
        message,
        key,
        iv,
        parseInt(algorithm.replace(/[^1-9]/g, "")),
        salt
      )
    );
  }
  decrypt({
    message,
    key = this.key,
    iv = this.iv,
    salt = this.salt,
    algorithm = this.algorithm,
    charset = this.charset
  }) {
    return _ClownCryption.decrypt({
      message,
      key,
      iv,
      salt,
      algorithm,
      charset
    });
  }
  static decrypt({
    message,
    key,
    iv,
    charset = defaults_default.getCharset("DefaultEfficientBinary"),
    algorithm = "aes192",
    salt = "pepper"
  }) {
    return _ClownCryption.aesDecrypt(
      _ClownCryption._getCharset(charset)?.decode(message) ?? "",
      key,
      iv,
      parseInt(algorithm.replace(/[^1-9]/g, "")),
      salt
    );
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
    encryptInClown = true,
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
      encryptInClown,
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
      efficientBuilder = efficientBuilder.replaceAll(
        this._commonReplacers[i][0],
        this._commonReplacers[i][1]
      );
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
        efficientBuilder = efficientBuilder.replaceAll(
          assigned.replaces,
          assigned.variable
        );
      });
      efficientBuilder = variableString.join(".") + ":" + efficientBuilder;
    }
    return efficientBuilder;
  }
  static decondenseBinary(condensedBinary) {
    let buildString = "";
    if (condensedBinary.includes(":")) {
      const variableString = condensedBinary.split(":")[0];
      condensedBinary = condensedBinary.split(":")[1];
      const variables = variableString.split(".");
      variables.forEach((variable) => {
        condensedBinary = condensedBinary.replaceAll(
          variable[0],
          variable.substring(1)
        );
      });
    }
    for (let i in this._commonReplacers) {
      condensedBinary = condensedBinary.replaceAll(
        this._commonReplacers[i][1],
        this._commonReplacers[i][0]
      );
    }
    condensedBinary.split("").forEach((value, index, array) => {
      if (parseInt(value) >= 2) {
        buildString += _ClownCryption.multiplyString(
          array[index - 1],
          parseInt(value)
        );
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
    return Object.entries(patterns).sort((a, b) => b[1] * b[0].length - a[1] * a[0].length).filter(
      (value, index, array) => value[1] > 1 && value[0].length === array[0][0].length
    );
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
__publicField(ClownCryption, "_commonReplacers", [
  ["100", "_"],
  ["110", "+"]
]);
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
