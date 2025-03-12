
define("@scom/ton-core", ["require", "exports"], function (require, exports) {
  Object.defineProperty(exports, "__esModule", { value: true }); 
  "use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
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
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/symbol.inspect/index.js
var require_symbol = __commonJS({
  "node_modules/symbol.inspect/index.js"(exports2, module2) {
    "use strict";
    var SymbolInspect = Symbol.for("nodejs.util.inspect.custom");
    module2.exports = SymbolInspect;
  }
});

// node_modules/@ton/core/dist/utils/crc16.js
var require_crc16 = __commonJS({
  "node_modules/@ton/core/dist/utils/crc16.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.crc16 = void 0;
    function crc162(data) {
      const poly = 4129;
      let reg = 0;
      const message = Buffer.alloc(data.length + 2);
      message.set(data);
      for (let byte of message) {
        let mask = 128;
        while (mask > 0) {
          reg <<= 1;
          if (byte & mask) {
            reg += 1;
          }
          mask >>= 1;
          if (reg > 65535) {
            reg &= 65535;
            reg ^= poly;
          }
        }
      }
      return Buffer.from([Math.floor(reg / 256), reg % 256]);
    }
    exports2.crc16 = crc162;
  }
});

// node_modules/@ton/core/dist/address/Address.js
var require_Address = __commonJS({
  "node_modules/@ton/core/dist/address/Address.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    var _a;
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.address = exports2.Address = void 0;
    var symbol_inspect_1 = __importDefault(require_symbol());
    var crc16_1 = require_crc16();
    var bounceable_tag = 17;
    var non_bounceable_tag = 81;
    var test_flag = 128;
    function parseFriendlyAddress(src) {
      if (typeof src === "string" && !Address2.isFriendly(src)) {
        throw new Error("Unknown address type");
      }
      const data = Buffer.isBuffer(src) ? src : Buffer.from(src, "base64");
      if (data.length !== 36) {
        throw new Error("Unknown address type: byte length is not equal to 36");
      }
      const addr = data.subarray(0, 34);
      const crc = data.subarray(34, 36);
      const calcedCrc = (0, crc16_1.crc16)(addr);
      if (!(calcedCrc[0] === crc[0] && calcedCrc[1] === crc[1])) {
        throw new Error("Invalid checksum: " + src);
      }
      let tag = addr[0];
      let isTestOnly = false;
      let isBounceable = false;
      if (tag & test_flag) {
        isTestOnly = true;
        tag = tag ^ test_flag;
      }
      if (tag !== bounceable_tag && tag !== non_bounceable_tag)
        throw "Unknown address tag";
      isBounceable = tag === bounceable_tag;
      let workchain = null;
      if (addr[1] === 255) {
        workchain = -1;
      } else {
        workchain = addr[1];
      }
      const hashPart = addr.subarray(2, 34);
      return { isTestOnly, isBounceable, workchain, hashPart };
    }
    var Address2 = class _Address {
      static isAddress(src) {
        return src instanceof _Address;
      }
      static isFriendly(source) {
        if (source.length !== 48) {
          return false;
        }
        if (!/[A-Za-z0-9+/_-]+/.test(source)) {
          return false;
        }
        return true;
      }
      static isRaw(source) {
        if (source.indexOf(":") === -1) {
          return false;
        }
        let [wc, hash] = source.split(":");
        if (!Number.isInteger(parseFloat(wc))) {
          return false;
        }
        if (!/[a-f0-9]+/.test(hash.toLowerCase())) {
          return false;
        }
        if (hash.length !== 64) {
          return false;
        }
        return true;
      }
      static normalize(source) {
        if (typeof source === "string") {
          return _Address.parse(source).toString();
        } else {
          return source.toString();
        }
      }
      static parse(source) {
        if (_Address.isFriendly(source)) {
          return this.parseFriendly(source).address;
        } else if (_Address.isRaw(source)) {
          return this.parseRaw(source);
        } else {
          throw new Error("Unknown address type: " + source);
        }
      }
      static parseRaw(source) {
        let workChain = parseInt(source.split(":")[0]);
        let hash = Buffer.from(source.split(":")[1], "hex");
        return new _Address(workChain, hash);
      }
      static parseFriendly(source) {
        if (Buffer.isBuffer(source)) {
          let r = parseFriendlyAddress(source);
          return {
            isBounceable: r.isBounceable,
            isTestOnly: r.isTestOnly,
            address: new _Address(r.workchain, r.hashPart)
          };
        } else {
          let addr = source.replace(/\-/g, "+").replace(/_/g, "/");
          let r = parseFriendlyAddress(addr);
          return {
            isBounceable: r.isBounceable,
            isTestOnly: r.isTestOnly,
            address: new _Address(r.workchain, r.hashPart)
          };
        }
      }
      constructor(workChain, hash) {
        this.toRawString = () => {
          return this.workChain + ":" + this.hash.toString("hex");
        };
        this.toRaw = () => {
          const addressWithChecksum = Buffer.alloc(36);
          addressWithChecksum.set(this.hash);
          addressWithChecksum.set([this.workChain, this.workChain, this.workChain, this.workChain], 32);
          return addressWithChecksum;
        };
        this.toStringBuffer = (args) => {
          let testOnly = args && args.testOnly !== void 0 ? args.testOnly : false;
          let bounceable = args && args.bounceable !== void 0 ? args.bounceable : true;
          let tag = bounceable ? bounceable_tag : non_bounceable_tag;
          if (testOnly) {
            tag |= test_flag;
          }
          const addr = Buffer.alloc(34);
          addr[0] = tag;
          addr[1] = this.workChain;
          addr.set(this.hash, 2);
          const addressWithChecksum = Buffer.alloc(36);
          addressWithChecksum.set(addr);
          addressWithChecksum.set((0, crc16_1.crc16)(addr), 34);
          return addressWithChecksum;
        };
        this.toString = (args) => {
          let urlSafe = args && args.urlSafe !== void 0 ? args.urlSafe : true;
          let buffer = this.toStringBuffer(args);
          if (urlSafe) {
            return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_");
          } else {
            return buffer.toString("base64");
          }
        };
        this[_a] = () => this.toString();
        if (hash.length !== 32) {
          throw new Error("Invalid address hash length: " + hash.length);
        }
        this.workChain = workChain;
        this.hash = hash;
        Object.freeze(this);
      }
      equals(src) {
        if (src.workChain !== this.workChain) {
          return false;
        }
        return src.hash.equals(this.hash);
      }
    };
    exports2.Address = Address2;
    _a = symbol_inspect_1.default;
    function address2(src) {
      return Address2.parse(src);
    }
    exports2.address = address2;
  }
});

// node_modules/@ton/core/dist/address/ExternalAddress.js
var require_ExternalAddress = __commonJS({
  "node_modules/@ton/core/dist/address/ExternalAddress.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    var _a;
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ExternalAddress = void 0;
    var symbol_inspect_1 = __importDefault(require_symbol());
    var ExternalAddress2 = class _ExternalAddress {
      static isAddress(src) {
        return src instanceof _ExternalAddress;
      }
      constructor(value, bits) {
        this[_a] = () => this.toString();
        this.value = value;
        this.bits = bits;
      }
      toString() {
        return `External<${this.bits}:${this.value}>`;
      }
    };
    exports2.ExternalAddress = ExternalAddress2;
    _a = symbol_inspect_1.default;
  }
});

// node_modules/@ton/core/dist/utils/base32.js
var require_base32 = __commonJS({
  "node_modules/@ton/core/dist/utils/base32.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.base32Decode = exports2.base32Encode = void 0;
    var alphabet = "abcdefghijklmnopqrstuvwxyz234567";
    function base32Encode2(buffer) {
      const length = buffer.byteLength;
      let bits = 0;
      let value = 0;
      let output = "";
      for (let i = 0; i < length; i++) {
        value = value << 8 | buffer[i];
        bits += 8;
        while (bits >= 5) {
          output += alphabet[value >>> bits - 5 & 31];
          bits -= 5;
        }
      }
      if (bits > 0) {
        output += alphabet[value << 5 - bits & 31];
      }
      return output;
    }
    exports2.base32Encode = base32Encode2;
    function readChar(alphabet2, char) {
      const idx = alphabet2.indexOf(char);
      if (idx === -1) {
        throw new Error("Invalid character found: " + char);
      }
      return idx;
    }
    function base32Decode2(input) {
      let cleanedInput;
      cleanedInput = input.toLowerCase();
      const { length } = cleanedInput;
      let bits = 0;
      let value = 0;
      let index = 0;
      const output = Buffer.alloc(length * 5 / 8 | 0);
      for (let i = 0; i < length; i++) {
        value = value << 5 | readChar(alphabet, cleanedInput[i]);
        bits += 5;
        if (bits >= 8) {
          output[index++] = value >>> bits - 8 & 255;
          bits -= 8;
        }
      }
      return output;
    }
    exports2.base32Decode = base32Decode2;
  }
});

// node_modules/@ton/core/dist/address/ADNLAddress.js
var require_ADNLAddress = __commonJS({
  "node_modules/@ton/core/dist/address/ADNLAddress.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    var _a;
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ADNLAddress = void 0;
    var symbol_inspect_1 = __importDefault(require_symbol());
    var base32_1 = require_base32();
    var crc16_1 = require_crc16();
    var ADNLAddress2 = class _ADNLAddress {
      static parseFriendly(src) {
        if (src.length !== 55) {
          throw Error("Invalid address");
        }
        src = "f" + src;
        let decoded = (0, base32_1.base32Decode)(src);
        if (decoded[0] !== 45) {
          throw Error("Invalid address");
        }
        let gotHash = decoded.slice(33);
        let hash = (0, crc16_1.crc16)(decoded.slice(0, 33));
        if (!hash.equals(gotHash)) {
          throw Error("Invalid address");
        }
        return new _ADNLAddress(decoded.slice(1, 33));
      }
      static parseRaw(src) {
        const data = Buffer.from(src, "base64");
        return new _ADNLAddress(data);
      }
      constructor(address2) {
        this.toRaw = () => {
          return this.address.toString("hex").toUpperCase();
        };
        this.toString = () => {
          let data = Buffer.concat([Buffer.from([45]), this.address]);
          let hash = (0, crc16_1.crc16)(data);
          data = Buffer.concat([data, hash]);
          return (0, base32_1.base32Encode)(data).slice(1);
        };
        this[_a] = () => this.toString();
        if (address2.length !== 32) {
          throw Error("Invalid address");
        }
        this.address = address2;
      }
      equals(b) {
        return this.address.equals(b.address);
      }
    };
    exports2.ADNLAddress = ADNLAddress2;
    _a = symbol_inspect_1.default;
  }
});

// node_modules/@ton/core/dist/boc/utils/paddedBits.js
var require_paddedBits = __commonJS({
  "node_modules/@ton/core/dist/boc/utils/paddedBits.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.paddedBufferToBits = exports2.bitsToPaddedBuffer = void 0;
    var BitBuilder_1 = require_BitBuilder();
    var BitString_1 = require_BitString();
    function bitsToPaddedBuffer(bits) {
      let builder = new BitBuilder_1.BitBuilder(Math.ceil(bits.length / 8) * 8);
      builder.writeBits(bits);
      let padding = Math.ceil(bits.length / 8) * 8 - bits.length;
      for (let i = 0; i < padding; i++) {
        if (i === 0) {
          builder.writeBit(1);
        } else {
          builder.writeBit(0);
        }
      }
      return builder.buffer();
    }
    exports2.bitsToPaddedBuffer = bitsToPaddedBuffer;
    function paddedBufferToBits2(buff) {
      let bitLen = 0;
      for (let i = buff.length - 1; i >= 0; i--) {
        if (buff[i] !== 0) {
          const testByte = buff[i];
          let bitPos = testByte & -testByte;
          if ((bitPos & 1) == 0) {
            bitPos = Math.log2(bitPos) + 1;
          }
          if (i > 0) {
            bitLen = i << 3;
          }
          bitLen += 8 - bitPos;
          break;
        }
      }
      return new BitString_1.BitString(buff, 0, bitLen);
    }
    exports2.paddedBufferToBits = paddedBufferToBits2;
  }
});

// node_modules/@ton/core/dist/boc/BitString.js
var require_BitString = __commonJS({
  "node_modules/@ton/core/dist/boc/BitString.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    var _a;
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BitString = void 0;
    var paddedBits_1 = require_paddedBits();
    var symbol_inspect_1 = __importDefault(require_symbol());
    var BitString2 = class _BitString {
      /**
       * Checks if supplied object is BitString
       * @param src is unknow object
       * @returns true if object is BitString and false otherwise
       **/
      static isBitString(src) {
        return src instanceof _BitString;
      }
      /**
       * Constructing BitString from a buffer
       * @param data data that contains the bitstring data. NOTE: We are expecting this buffer to be NOT modified
       * @param offset offset in bits from the start of the buffer
       * @param length length of the bitstring in bits
       */
      constructor(data, offset, length) {
        this[_a] = () => this.toString();
        if (length < 0) {
          throw new Error(`Length ${length} is out of bounds`);
        }
        this._length = length;
        this._data = data;
        this._offset = offset;
      }
      /**
       * Returns the length of the bitstring
       */
      get length() {
        return this._length;
      }
      /**
       * Returns the bit at the specified index
       * @param index index of the bit
       * @throws Error if index is out of bounds
       * @returns true if the bit is set, false otherwise
       */
      at(index) {
        if (index >= this._length) {
          throw new Error(`Index ${index} > ${this._length} is out of bounds`);
        }
        if (index < 0) {
          throw new Error(`Index ${index} < 0 is out of bounds`);
        }
        let byteIndex = this._offset + index >> 3;
        let bitIndex = 7 - (this._offset + index) % 8;
        return (this._data[byteIndex] & 1 << bitIndex) !== 0;
      }
      /**
       * Get a subscring of the bitstring
       * @param offset
       * @param length
       * @returns
       */
      substring(offset, length) {
        if (offset > this._length) {
          throw new Error(`Offset(${offset}) > ${this._length} is out of bounds`);
        }
        if (offset < 0) {
          throw new Error(`Offset(${offset}) < 0 is out of bounds`);
        }
        if (length === 0) {
          return _BitString.EMPTY;
        }
        if (offset + length > this._length) {
          throw new Error(`Offset ${offset} + Length ${length} > ${this._length} is out of bounds`);
        }
        return new _BitString(this._data, this._offset + offset, length);
      }
      /**
       * Try to get a buffer from the bitstring without allocations
       * @param offset offset in bits
       * @param length length in bits
       * @returns buffer if the bitstring is aligned to bytes, null otherwise
       */
      subbuffer(offset, length) {
        if (offset > this._length) {
          throw new Error(`Offset ${offset} is out of bounds`);
        }
        if (offset < 0) {
          throw new Error(`Offset ${offset} is out of bounds`);
        }
        if (offset + length > this._length) {
          throw new Error(`Offset + Lenght = ${offset + length} is out of bounds`);
        }
        if (length % 8 !== 0) {
          return null;
        }
        if ((this._offset + offset) % 8 !== 0) {
          return null;
        }
        let start = this._offset + offset >> 3;
        let end = start + (length >> 3);
        return this._data.subarray(start, end);
      }
      /**
       * Checks for equality
       * @param b other bitstring
       * @returns true if the bitstrings are equal, false otherwise
       */
      equals(b) {
        if (this._length !== b._length) {
          return false;
        }
        for (let i = 0; i < this._length; i++) {
          if (this.at(i) !== b.at(i)) {
            return false;
          }
        }
        return true;
      }
      /**
       * Format to canonical string
       * @returns formatted bits as a string
       */
      toString() {
        const padded = (0, paddedBits_1.bitsToPaddedBuffer)(this);
        if (this._length % 4 === 0) {
          const s = padded.subarray(0, Math.ceil(this._length / 8)).toString("hex").toUpperCase();
          if (this._length % 8 === 0) {
            return s;
          } else {
            return s.substring(0, s.length - 1);
          }
        } else {
          const hex = padded.toString("hex").toUpperCase();
          if (this._length % 8 <= 4) {
            return hex.substring(0, hex.length - 1) + "_";
          } else {
            return hex + "_";
          }
        }
      }
    };
    exports2.BitString = BitString2;
    _a = symbol_inspect_1.default;
    BitString2.EMPTY = new BitString2(Buffer.alloc(0), 0, 0);
  }
});

// node_modules/@ton/core/dist/boc/BitBuilder.js
var require_BitBuilder = __commonJS({
  "node_modules/@ton/core/dist/boc/BitBuilder.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BitBuilder = void 0;
    var Address_1 = require_Address();
    var ExternalAddress_1 = require_ExternalAddress();
    var BitString_1 = require_BitString();
    var BitBuilder2 = class {
      constructor(size = 1023) {
        this._buffer = Buffer.alloc(Math.ceil(size / 8));
        this._length = 0;
      }
      /**
       * Current number of bits written
       */
      get length() {
        return this._length;
      }
      /**
       * Write a single bit
       * @param value bit to write, true or positive number for 1, false or zero or negative for 0
       */
      writeBit(value) {
        let n = this._length;
        if (n > this._buffer.length * 8) {
          throw new Error("BitBuilder overflow");
        }
        if (typeof value === "boolean" && value === true || typeof value === "number" && value > 0) {
          this._buffer[n / 8 | 0] |= 1 << 7 - n % 8;
        }
        this._length++;
      }
      /**
       * Copy bits from BitString
       * @param src source bits
       */
      writeBits(src) {
        for (let i = 0; i < src.length; i++) {
          this.writeBit(src.at(i));
        }
      }
      /**
       * Write bits from buffer
       * @param src source buffer
       */
      writeBuffer(src) {
        if (this._length % 8 === 0) {
          if (this._length + src.length * 8 > this._buffer.length * 8) {
            throw new Error("BitBuilder overflow");
          }
          src.copy(this._buffer, this._length / 8);
          this._length += src.length * 8;
        } else {
          for (let i = 0; i < src.length; i++) {
            this.writeUint(src[i], 8);
          }
        }
      }
      /**
       * Write uint value
       * @param value value as bigint or number
       * @param bits number of bits to write
       */
      writeUint(value, bits) {
        if (bits < 0 || !Number.isSafeInteger(bits)) {
          throw Error(`invalid bit length. Got ${bits}`);
        }
        const v = BigInt(value);
        if (bits === 0) {
          if (v !== 0n) {
            throw Error(`value is not zero for ${bits} bits. Got ${value}`);
          } else {
            return;
          }
        }
        const vBits = 1n << BigInt(bits);
        if (v < 0 || v >= vBits) {
          throw Error(`bitLength is too small for a value ${value}. Got ${bits}`);
        }
        if (this._length + bits > this._buffer.length * 8) {
          throw new Error("BitBuilder overflow");
        }
        const tillByte = 8 - this._length % 8;
        if (tillByte > 0) {
          const bidx = Math.floor(this._length / 8);
          if (bits < tillByte) {
            const wb = Number(v);
            this._buffer[bidx] |= wb << tillByte - bits;
            this._length += bits;
          } else {
            const wb = Number(v >> BigInt(bits - tillByte));
            this._buffer[bidx] |= wb;
            this._length += tillByte;
          }
        }
        bits -= tillByte;
        while (bits > 0) {
          if (bits >= 8) {
            this._buffer[this._length / 8] = Number(v >> BigInt(bits - 8) & 0xffn);
            this._length += 8;
            bits -= 8;
          } else {
            this._buffer[this._length / 8] = Number(v << BigInt(8 - bits) & 0xffn);
            this._length += bits;
            bits = 0;
          }
        }
      }
      /**
       * Write int value
       * @param value value as bigint or number
       * @param bits number of bits to write
       */
      writeInt(value, bits) {
        let v = BigInt(value);
        if (bits < 0 || !Number.isSafeInteger(bits)) {
          throw Error(`invalid bit length. Got ${bits}`);
        }
        if (bits === 0) {
          if (value !== 0n) {
            throw Error(`value is not zero for ${bits} bits. Got ${value}`);
          } else {
            return;
          }
        }
        if (bits === 1) {
          if (value !== -1n && value !== 0n) {
            throw Error(`value is not zero or -1 for ${bits} bits. Got ${value}`);
          } else {
            this.writeBit(value === -1n);
            return;
          }
        }
        let vBits = 1n << BigInt(bits) - 1n;
        if (v < -vBits || v >= vBits) {
          throw Error(`value is out of range for ${bits} bits. Got ${value}`);
        }
        if (v < 0) {
          this.writeBit(true);
          v = vBits + v;
        } else {
          this.writeBit(false);
        }
        this.writeUint(v, bits - 1);
      }
      /**
       * Wrtie var uint value, used for serializing coins
       * @param value value to write as bigint or number
       * @param bits header bits to write size
       */
      writeVarUint(value, bits) {
        let v = BigInt(value);
        if (bits < 0 || !Number.isSafeInteger(bits)) {
          throw Error(`invalid bit length. Got ${bits}`);
        }
        if (v < 0) {
          throw Error(`value is negative. Got ${value}`);
        }
        if (v === 0n) {
          this.writeUint(0, bits);
          return;
        }
        const sizeBytes = Math.ceil(v.toString(2).length / 8);
        const sizeBits = sizeBytes * 8;
        this.writeUint(sizeBytes, bits);
        this.writeUint(v, sizeBits);
      }
      /**
       * Wrtie var int value, used for serializing coins
       * @param value value to write as bigint or number
       * @param bits header bits to write size
       */
      writeVarInt(value, bits) {
        let v = BigInt(value);
        if (bits < 0 || !Number.isSafeInteger(bits)) {
          throw Error(`invalid bit length. Got ${bits}`);
        }
        if (v === 0n) {
          this.writeUint(0, bits);
          return;
        }
        let v2 = v > 0 ? v : -v;
        const sizeBytes = Math.ceil((v2.toString(2).length + 1) / 8);
        const sizeBits = sizeBytes * 8;
        this.writeUint(sizeBytes, bits);
        this.writeInt(v, sizeBits);
      }
      /**
       * Write coins in var uint format
       * @param amount amount to write
       */
      writeCoins(amount) {
        this.writeVarUint(amount, 4);
      }
      /**
       * Write address
       * @param address write address or address external
       */
      writeAddress(address2) {
        if (address2 === null || address2 === void 0) {
          this.writeUint(0, 2);
          return;
        }
        if (Address_1.Address.isAddress(address2)) {
          this.writeUint(2, 2);
          this.writeUint(0, 1);
          this.writeInt(address2.workChain, 8);
          this.writeBuffer(address2.hash);
          return;
        }
        if (ExternalAddress_1.ExternalAddress.isAddress(address2)) {
          this.writeUint(1, 2);
          this.writeUint(address2.bits, 9);
          this.writeUint(address2.value, address2.bits);
          return;
        }
        throw Error(`Invalid address. Got ${address2}`);
      }
      /**
       * Build BitString
       * @returns result bit string
       */
      build() {
        return new BitString_1.BitString(this._buffer, 0, this._length);
      }
      /**
       * Build into Buffer
       * @returns result buffer
       */
      buffer() {
        if (this._length % 8 !== 0) {
          throw new Error("BitBuilder buffer is not byte aligned");
        }
        return this._buffer.subarray(0, this._length / 8);
      }
    };
    exports2.BitBuilder = BitBuilder2;
  }
});

// node_modules/@ton/core/dist/boc/CellType.js
var require_CellType = __commonJS({
  "node_modules/@ton/core/dist/boc/CellType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CellType = void 0;
    var CellType2;
    (function(CellType3) {
      CellType3[CellType3["Ordinary"] = -1] = "Ordinary";
      CellType3[CellType3["PrunedBranch"] = 1] = "PrunedBranch";
      CellType3[CellType3["Library"] = 2] = "Library";
      CellType3[CellType3["MerkleProof"] = 3] = "MerkleProof";
      CellType3[CellType3["MerkleUpdate"] = 4] = "MerkleUpdate";
    })(CellType2 || (exports2.CellType = CellType2 = {}));
  }
});

// node_modules/@ton/core/dist/dict/utils/readUnaryLength.js
var require_readUnaryLength = __commonJS({
  "node_modules/@ton/core/dist/dict/utils/readUnaryLength.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.readUnaryLength = void 0;
    function readUnaryLength(slice) {
      let res = 0;
      while (slice.loadBit()) {
        res++;
      }
      return res;
    }
    exports2.readUnaryLength = readUnaryLength;
  }
});

// node_modules/@ton/core/dist/boc/BitReader.js
var require_BitReader = __commonJS({
  "node_modules/@ton/core/dist/boc/BitReader.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BitReader = void 0;
    var Address_1 = require_Address();
    var ExternalAddress_1 = require_ExternalAddress();
    var BitReader2 = class _BitReader {
      constructor(bits, offset = 0) {
        this._checkpoints = [];
        this._bits = bits;
        this._offset = offset;
      }
      /**
       * Offset in source bit string
       */
      get offset() {
        return this._offset;
      }
      /**
       * Number of bits remaining
       */
      get remaining() {
        return this._bits.length - this._offset;
      }
      /**
       * Skip bits
       * @param bits number of bits to skip
       */
      skip(bits) {
        if (bits < 0 || this._offset + bits > this._bits.length) {
          throw new Error(`Index ${this._offset + bits} is out of bounds`);
        }
        this._offset += bits;
      }
      /**
       * Reset to the beginning or latest checkpoint
       */
      reset() {
        if (this._checkpoints.length > 0) {
          this._offset = this._checkpoints.pop();
        } else {
          this._offset = 0;
        }
      }
      /**
       * Save checkpoint
       */
      save() {
        this._checkpoints.push(this._offset);
      }
      /**
       * Load a single bit
       * @returns true if the bit is set, false otherwise
       */
      loadBit() {
        let r = this._bits.at(this._offset);
        this._offset++;
        return r;
      }
      /**
       * Preload bit
       * @returns true if the bit is set, false otherwise
       */
      preloadBit() {
        return this._bits.at(this._offset);
      }
      /**
       * Load bit string
       * @param bits number of bits to read
       * @returns new bitstring
       */
      loadBits(bits) {
        let r = this._bits.substring(this._offset, bits);
        this._offset += bits;
        return r;
      }
      /**
       * Preload bit string
       * @param bits number of bits to read
       * @returns new bitstring
       */
      preloadBits(bits) {
        return this._bits.substring(this._offset, bits);
      }
      /**
       * Load buffer
       * @param bytes number of bytes
       * @returns new buffer
       */
      loadBuffer(bytes) {
        let buf = this._preloadBuffer(bytes, this._offset);
        this._offset += bytes * 8;
        return buf;
      }
      /**
       * Preload buffer
       * @param bytes number of bytes
       * @returns new buffer
       */
      preloadBuffer(bytes) {
        return this._preloadBuffer(bytes, this._offset);
      }
      /**
       * Load uint value
       * @param bits uint bits
       * @returns read value as number
       */
      loadUint(bits) {
        return this._toSafeInteger(this.loadUintBig(bits), "loadUintBig");
      }
      /**
       * Load uint value as bigint
       * @param bits uint bits
       * @returns read value as bigint
       */
      loadUintBig(bits) {
        let loaded = this.preloadUintBig(bits);
        this._offset += bits;
        return loaded;
      }
      /**
       * Preload uint value
       * @param bits uint bits
       * @returns read value as number
       */
      preloadUint(bits) {
        return this._toSafeInteger(this._preloadUint(bits, this._offset), "preloadUintBig");
      }
      /**
       * Preload uint value as bigint
       * @param bits uint bits
       * @returns read value as bigint
       */
      preloadUintBig(bits) {
        return this._preloadUint(bits, this._offset);
      }
      /**
       * Load int value
       * @param bits int bits
       * @returns read value as bigint
       */
      loadInt(bits) {
        let res = this._preloadInt(bits, this._offset);
        this._offset += bits;
        return this._toSafeInteger(res, "loadUintBig");
      }
      /**
       * Load int value as bigint
       * @param bits int bits
       * @returns read value as bigint
       */
      loadIntBig(bits) {
        let res = this._preloadInt(bits, this._offset);
        this._offset += bits;
        return res;
      }
      /**
       * Preload int value
       * @param bits int bits
       * @returns read value as bigint
       */
      preloadInt(bits) {
        return this._toSafeInteger(this._preloadInt(bits, this._offset), "preloadIntBig");
      }
      /**
       * Preload int value
       * @param bits int bits
       * @returns read value as bigint
       */
      preloadIntBig(bits) {
        return this._preloadInt(bits, this._offset);
      }
      /**
       * Load varuint value
       * @param bits number of bits to read the size
       * @returns read value as bigint
       */
      loadVarUint(bits) {
        let size = Number(this.loadUint(bits));
        return this._toSafeInteger(this.loadUintBig(size * 8), "loadVarUintBig");
      }
      /**
       * Load varuint value
       * @param bits number of bits to read the size
       * @returns read value as bigint
       */
      loadVarUintBig(bits) {
        let size = Number(this.loadUint(bits));
        return this.loadUintBig(size * 8);
      }
      /**
       * Preload varuint value
       * @param bits number of bits to read the size
       * @returns read value as bigint
       */
      preloadVarUint(bits) {
        let size = Number(this._preloadUint(bits, this._offset));
        return this._toSafeInteger(this._preloadUint(size * 8, this._offset + bits), "preloadVarUintBig");
      }
      /**
       * Preload varuint value
       * @param bits number of bits to read the size
       * @returns read value as bigint
       */
      preloadVarUintBig(bits) {
        let size = Number(this._preloadUint(bits, this._offset));
        return this._preloadUint(size * 8, this._offset + bits);
      }
      /**
       * Load varint value
       * @param bits number of bits to read the size
       * @returns read value as bigint
       */
      loadVarInt(bits) {
        let size = Number(this.loadUint(bits));
        return this._toSafeInteger(this.loadIntBig(size * 8), "loadVarIntBig");
      }
      /**
       * Load varint value
       * @param bits number of bits to read the size
       * @returns read value as bigint
       */
      loadVarIntBig(bits) {
        let size = Number(this.loadUint(bits));
        return this.loadIntBig(size * 8);
      }
      /**
       * Preload varint value
       * @param bits number of bits to read the size
       * @returns read value as bigint
       */
      preloadVarInt(bits) {
        let size = Number(this._preloadUint(bits, this._offset));
        return this._toSafeInteger(this._preloadInt(size * 8, this._offset + bits), "preloadVarIntBig");
      }
      /**
       * Preload varint value
       * @param bits number of bits to read the size
       * @returns read value as bigint
       */
      preloadVarIntBig(bits) {
        let size = Number(this._preloadUint(bits, this._offset));
        return this._preloadInt(size * 8, this._offset + bits);
      }
      /**
       * Load coins value
       * @returns read value as bigint
       */
      loadCoins() {
        return this.loadVarUintBig(4);
      }
      /**
       * Preload coins value
       * @returns read value as bigint
       */
      preloadCoins() {
        return this.preloadVarUintBig(4);
      }
      /**
       * Load Address
       * @returns Address
       */
      loadAddress() {
        let type = Number(this._preloadUint(2, this._offset));
        if (type === 2) {
          return this._loadInternalAddress();
        } else {
          throw new Error("Invalid address: " + type);
        }
      }
      /**
       * Load internal address
       * @returns Address or null
       */
      loadMaybeAddress() {
        let type = Number(this._preloadUint(2, this._offset));
        if (type === 0) {
          this._offset += 2;
          return null;
        } else if (type === 2) {
          return this._loadInternalAddress();
        } else {
          throw new Error("Invalid address");
        }
      }
      /**
       * Load external address
       * @returns ExternalAddress
       */
      loadExternalAddress() {
        let type = Number(this._preloadUint(2, this._offset));
        if (type === 1) {
          return this._loadExternalAddress();
        } else {
          throw new Error("Invalid address");
        }
      }
      /**
       * Load external address
       * @returns ExternalAddress or null
       */
      loadMaybeExternalAddress() {
        let type = Number(this._preloadUint(2, this._offset));
        if (type === 0) {
          this._offset += 2;
          return null;
        } else if (type === 1) {
          return this._loadExternalAddress();
        } else {
          throw new Error("Invalid address");
        }
      }
      /**
       * Read address of any type
       * @returns Address or ExternalAddress or null
       */
      loadAddressAny() {
        let type = Number(this._preloadUint(2, this._offset));
        if (type === 0) {
          this._offset += 2;
          return null;
        } else if (type === 2) {
          return this._loadInternalAddress();
        } else if (type === 1) {
          return this._loadExternalAddress();
        } else if (type === 3) {
          throw Error("Unsupported");
        } else {
          throw Error("Unreachable");
        }
      }
      /**
       * Load bit string that was padded to make it byte alligned. Used in BOC serialization
       * @param bytes number of bytes to read
       */
      loadPaddedBits(bits) {
        if (bits % 8 !== 0) {
          throw new Error("Invalid number of bits");
        }
        let length = bits;
        while (true) {
          if (this._bits.at(this._offset + length - 1)) {
            length--;
            break;
          } else {
            length--;
          }
        }
        let r = this._bits.substring(this._offset, length);
        this._offset += bits;
        return r;
      }
      /**
       * Clone BitReader
       */
      clone() {
        return new _BitReader(this._bits, this._offset);
      }
      /**
       * Preload int from specific offset
       * @param bits bits to preload
       * @param offset offset to start from
       * @returns read value as bigint
       */
      _preloadInt(bits, offset) {
        if (bits == 0) {
          return 0n;
        }
        let sign = this._bits.at(offset);
        let res = 0n;
        for (let i = 0; i < bits - 1; i++) {
          if (this._bits.at(offset + 1 + i)) {
            res += 1n << BigInt(bits - i - 1 - 1);
          }
        }
        if (sign) {
          res = res - (1n << BigInt(bits - 1));
        }
        return res;
      }
      /**
       * Preload uint from specific offset
       * @param bits bits to preload
       * @param offset offset to start from
       * @returns read value as bigint
       */
      _preloadUint(bits, offset) {
        if (bits == 0) {
          return 0n;
        }
        let res = 0n;
        for (let i = 0; i < bits; i++) {
          if (this._bits.at(offset + i)) {
            res += 1n << BigInt(bits - i - 1);
          }
        }
        return res;
      }
      _preloadBuffer(bytes, offset) {
        let fastBuffer = this._bits.subbuffer(offset, bytes * 8);
        if (fastBuffer) {
          return fastBuffer;
        }
        let buf = Buffer.alloc(bytes);
        for (let i = 0; i < bytes; i++) {
          buf[i] = Number(this._preloadUint(8, offset + i * 8));
        }
        return buf;
      }
      _loadInternalAddress() {
        let type = Number(this._preloadUint(2, this._offset));
        if (type !== 2) {
          throw Error("Invalid address");
        }
        if (this._preloadUint(1, this._offset + 2) !== 0n) {
          throw Error("Invalid address");
        }
        let wc = Number(this._preloadInt(8, this._offset + 3));
        let hash = this._preloadBuffer(32, this._offset + 11);
        this._offset += 267;
        return new Address_1.Address(wc, hash);
      }
      _loadExternalAddress() {
        let type = Number(this._preloadUint(2, this._offset));
        if (type !== 1) {
          throw Error("Invalid address");
        }
        let bits = Number(this._preloadUint(9, this._offset + 2));
        let value = this._preloadUint(bits, this._offset + 11);
        this._offset += 11 + bits;
        return new ExternalAddress_1.ExternalAddress(value, bits);
      }
      _toSafeInteger(src, alt) {
        if (BigInt(Number.MAX_SAFE_INTEGER) < src || src < BigInt(Number.MIN_SAFE_INTEGER)) {
          throw new TypeError(`${src} is out of safe integer range. Use ${alt} instead`);
        }
        return Number(src);
      }
    };
    exports2.BitReader = BitReader2;
  }
});

// node_modules/@ton/core/dist/boc/cell/exoticMerkleProof.js
var require_exoticMerkleProof = __commonJS({
  "node_modules/@ton/core/dist/boc/cell/exoticMerkleProof.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.convertToMerkleProof = exports2.exoticMerkleProof = void 0;
    var BitReader_1 = require_BitReader();
    var Builder_1 = require_Builder();
    function exoticMerkleProof2(bits, refs) {
      const reader = new BitReader_1.BitReader(bits);
      const size = 8 + 256 + 16;
      if (bits.length !== size) {
        throw new Error(`Merkle Proof cell must have exactly (8 + 256 + 16) bits, got "${bits.length}"`);
      }
      if (refs.length !== 1) {
        throw new Error(`Merkle Proof cell must have exactly 1 ref, got "${refs.length}"`);
      }
      let type = reader.loadUint(8);
      if (type !== 3) {
        throw new Error(`Merkle Proof cell must have type 3, got "${type}"`);
      }
      const proofHash = reader.loadBuffer(32);
      const proofDepth = reader.loadUint(16);
      const refHash = refs[0].hash(0);
      const refDepth = refs[0].depth(0);
      if (proofDepth !== refDepth) {
        throw new Error(`Merkle Proof cell ref depth must be exactly "${proofDepth}", got "${refDepth}"`);
      }
      if (!proofHash.equals(refHash)) {
        throw new Error(`Merkle Proof cell ref hash must be exactly "${proofHash.toString("hex")}", got "${refHash.toString("hex")}"`);
      }
      return {
        proofDepth,
        proofHash
      };
    }
    exports2.exoticMerkleProof = exoticMerkleProof2;
    function convertToMerkleProof2(c) {
      return (0, Builder_1.beginCell)().storeUint(3, 8).storeBuffer(c.hash(0)).storeUint(c.depth(0), 16).storeRef(c).endCell({ exotic: true });
    }
    exports2.convertToMerkleProof = convertToMerkleProof2;
  }
});

// node_modules/@ton/core/dist/dict/generateMerkleProof.js
var require_generateMerkleProof = __commonJS({
  "node_modules/@ton/core/dist/dict/generateMerkleProof.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.generateMerkleProof = exports2.generateMerkleProofDirect = void 0;
    var Builder_1 = require_Builder();
    var readUnaryLength_1 = require_readUnaryLength();
    var exoticMerkleProof_1 = require_exoticMerkleProof();
    function convertToPrunedBranch(c) {
      return (0, Builder_1.beginCell)().storeUint(1, 8).storeUint(1, 8).storeBuffer(c.hash(0)).storeUint(c.depth(0), 16).endCell({ exotic: true });
    }
    function doGenerateMerkleProof(prefix, slice, n, keys) {
      const originalCell = slice.asCell();
      if (keys.length == 0) {
        return convertToPrunedBranch(originalCell);
      }
      let lb0 = slice.loadBit() ? 1 : 0;
      let prefixLength = 0;
      let pp = prefix;
      if (lb0 === 0) {
        prefixLength = (0, readUnaryLength_1.readUnaryLength)(slice);
        for (let i = 0; i < prefixLength; i++) {
          pp += slice.loadBit() ? "1" : "0";
        }
      } else {
        let lb1 = slice.loadBit() ? 1 : 0;
        if (lb1 === 0) {
          prefixLength = slice.loadUint(Math.ceil(Math.log2(n + 1)));
          for (let i = 0; i < prefixLength; i++) {
            pp += slice.loadBit() ? "1" : "0";
          }
        } else {
          let bit = slice.loadBit() ? "1" : "0";
          prefixLength = slice.loadUint(Math.ceil(Math.log2(n + 1)));
          for (let i = 0; i < prefixLength; i++) {
            pp += bit;
          }
        }
      }
      if (n - prefixLength === 0) {
        return originalCell;
      } else {
        let sl = originalCell.beginParse();
        let left = sl.loadRef();
        let right = sl.loadRef();
        if (!left.isExotic) {
          const leftKeys = keys.filter((key) => {
            return pp + "0" === key.slice(0, pp.length + 1);
          });
          left = doGenerateMerkleProof(pp + "0", left.beginParse(), n - prefixLength - 1, leftKeys);
        }
        if (!right.isExotic) {
          const rightKeys = keys.filter((key) => {
            return pp + "1" === key.slice(0, pp.length + 1);
          });
          right = doGenerateMerkleProof(pp + "1", right.beginParse(), n - prefixLength - 1, rightKeys);
        }
        return (0, Builder_1.beginCell)().storeSlice(sl).storeRef(left).storeRef(right).endCell();
      }
    }
    function generateMerkleProofDirect2(dict, keys, keyObject) {
      keys.forEach((key) => {
        if (!dict.has(key)) {
          throw new Error(`Trying to generate merkle proof for a missing key "${key}"`);
        }
      });
      const s = (0, Builder_1.beginCell)().storeDictDirect(dict).asSlice();
      return doGenerateMerkleProof("", s, keyObject.bits, keys.map((key) => keyObject.serialize(key).toString(2).padStart(keyObject.bits, "0")));
    }
    exports2.generateMerkleProofDirect = generateMerkleProofDirect2;
    function generateMerkleProof2(dict, keys, keyObject) {
      return (0, exoticMerkleProof_1.convertToMerkleProof)(generateMerkleProofDirect2(dict, keys, keyObject));
    }
    exports2.generateMerkleProof = generateMerkleProof2;
  }
});

// node_modules/@ton/core/dist/dict/generateMerkleUpdate.js
var require_generateMerkleUpdate = __commonJS({
  "node_modules/@ton/core/dist/dict/generateMerkleUpdate.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.generateMerkleUpdate = void 0;
    var Builder_1 = require_Builder();
    var generateMerkleProof_1 = require_generateMerkleProof();
    function convertToMerkleUpdate(c1, c2) {
      return (0, Builder_1.beginCell)().storeUint(4, 8).storeBuffer(c1.hash(0)).storeBuffer(c2.hash(0)).storeUint(c1.depth(0), 16).storeUint(c2.depth(0), 16).storeRef(c1).storeRef(c2).endCell({ exotic: true });
    }
    function generateMerkleUpdate2(dict, key, keyObject, newValue) {
      const oldProof = (0, generateMerkleProof_1.generateMerkleProof)(dict, [key], keyObject).refs[0];
      dict.set(key, newValue);
      const newProof = (0, generateMerkleProof_1.generateMerkleProof)(dict, [key], keyObject).refs[0];
      return convertToMerkleUpdate(oldProof, newProof);
    }
    exports2.generateMerkleUpdate = generateMerkleUpdate2;
  }
});

// node_modules/@ton/core/dist/dict/parseDict.js
var require_parseDict = __commonJS({
  "node_modules/@ton/core/dist/dict/parseDict.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.parseDict = void 0;
    function readUnaryLength(slice) {
      let res = 0;
      while (slice.loadBit()) {
        res++;
      }
      return res;
    }
    function doParse(prefix, slice, n, res, extractor) {
      let lb0 = slice.loadBit() ? 1 : 0;
      let prefixLength = 0;
      let pp = prefix;
      if (lb0 === 0) {
        prefixLength = readUnaryLength(slice);
        for (let i = 0; i < prefixLength; i++) {
          pp += slice.loadBit() ? "1" : "0";
        }
      } else {
        let lb1 = slice.loadBit() ? 1 : 0;
        if (lb1 === 0) {
          prefixLength = slice.loadUint(Math.ceil(Math.log2(n + 1)));
          for (let i = 0; i < prefixLength; i++) {
            pp += slice.loadBit() ? "1" : "0";
          }
        } else {
          let bit = slice.loadBit() ? "1" : "0";
          prefixLength = slice.loadUint(Math.ceil(Math.log2(n + 1)));
          for (let i = 0; i < prefixLength; i++) {
            pp += bit;
          }
        }
      }
      if (n - prefixLength === 0) {
        res.set(BigInt("0b" + pp), extractor(slice));
      } else {
        let left = slice.loadRef();
        let right = slice.loadRef();
        if (!left.isExotic) {
          doParse(pp + "0", left.beginParse(), n - prefixLength - 1, res, extractor);
        }
        if (!right.isExotic) {
          doParse(pp + "1", right.beginParse(), n - prefixLength - 1, res, extractor);
        }
      }
    }
    function parseDict(sc, keySize, extractor) {
      let res = /* @__PURE__ */ new Map();
      if (sc) {
        doParse("", sc, keySize, res, extractor);
      }
      return res;
    }
    exports2.parseDict = parseDict;
  }
});

// node_modules/@ton/core/dist/dict/utils/findCommonPrefix.js
var require_findCommonPrefix = __commonJS({
  "node_modules/@ton/core/dist/dict/utils/findCommonPrefix.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.findCommonPrefix = void 0;
    function findCommonPrefix(src, startPos = 0) {
      if (src.length === 0) {
        return "";
      }
      let r = src[0].slice(startPos);
      for (let i = 1; i < src.length; i++) {
        const s = src[i];
        while (s.indexOf(r, startPos) !== startPos) {
          r = r.substring(0, r.length - 1);
          if (r === "") {
            return r;
          }
        }
      }
      return r;
    }
    exports2.findCommonPrefix = findCommonPrefix;
  }
});

// node_modules/@ton/core/dist/dict/serializeDict.js
var require_serializeDict = __commonJS({
  "node_modules/@ton/core/dist/dict/serializeDict.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.serializeDict = exports2.detectLabelType = exports2.writeLabelSame = exports2.writeLabelLong = exports2.writeLabelShort = exports2.buildTree = void 0;
    var Builder_1 = require_Builder();
    var findCommonPrefix_1 = require_findCommonPrefix();
    function pad(src, size) {
      while (src.length < size) {
        src = "0" + src;
      }
      return src;
    }
    function forkMap(src, prefixLen) {
      if (src.size === 0) {
        throw Error("Internal inconsistency");
      }
      let left = /* @__PURE__ */ new Map();
      let right = /* @__PURE__ */ new Map();
      for (let [k, d] of src.entries()) {
        if (k[prefixLen] === "0") {
          left.set(k, d);
        } else {
          right.set(k, d);
        }
      }
      if (left.size === 0) {
        throw Error("Internal inconsistency. Left emtpy.");
      }
      if (right.size === 0) {
        throw Error("Internal inconsistency. Right emtpy.");
      }
      return { left, right };
    }
    function buildNode(src, prefixLen) {
      if (src.size === 0) {
        throw Error("Internal inconsistency");
      }
      if (src.size === 1) {
        return { type: "leaf", value: Array.from(src.values())[0] };
      }
      let { left, right } = forkMap(src, prefixLen);
      return {
        type: "fork",
        left: buildEdge(left, prefixLen + 1),
        right: buildEdge(right, prefixLen + 1)
      };
    }
    function buildEdge(src, prefixLen = 0) {
      if (src.size === 0) {
        throw Error("Internal inconsistency");
      }
      const label = (0, findCommonPrefix_1.findCommonPrefix)(Array.from(src.keys()), prefixLen);
      return { label, node: buildNode(src, label.length + prefixLen) };
    }
    function buildTree(src, keyLength) {
      let converted = /* @__PURE__ */ new Map();
      for (let k of Array.from(src.keys())) {
        const padded = pad(k.toString(2), keyLength);
        converted.set(padded, src.get(k));
      }
      return buildEdge(converted);
    }
    exports2.buildTree = buildTree;
    function writeLabelShort(src, to) {
      to.storeBit(0);
      for (let i = 0; i < src.length; i++) {
        to.storeBit(1);
      }
      to.storeBit(0);
      if (src.length > 0) {
        to.storeUint(BigInt("0b" + src), src.length);
      }
      return to;
    }
    exports2.writeLabelShort = writeLabelShort;
    function labelShortLength(src) {
      return 1 + src.length + 1 + src.length;
    }
    function writeLabelLong(src, keyLength, to) {
      to.storeBit(1);
      to.storeBit(0);
      let length = Math.ceil(Math.log2(keyLength + 1));
      to.storeUint(src.length, length);
      if (src.length > 0) {
        to.storeUint(BigInt("0b" + src), src.length);
      }
      return to;
    }
    exports2.writeLabelLong = writeLabelLong;
    function labelLongLength(src, keyLength) {
      return 1 + 1 + Math.ceil(Math.log2(keyLength + 1)) + src.length;
    }
    function writeLabelSame(value, length, keyLength, to) {
      to.storeBit(1);
      to.storeBit(1);
      to.storeBit(value);
      let lenLen = Math.ceil(Math.log2(keyLength + 1));
      to.storeUint(length, lenLen);
    }
    exports2.writeLabelSame = writeLabelSame;
    function labelSameLength(keyLength) {
      return 1 + 1 + 1 + Math.ceil(Math.log2(keyLength + 1));
    }
    function isSame(src) {
      if (src.length === 0 || src.length === 1) {
        return true;
      }
      for (let i = 1; i < src.length; i++) {
        if (src[i] !== src[0]) {
          return false;
        }
      }
      return true;
    }
    function detectLabelType(src, keyLength) {
      let kind = "short";
      let kindLength = labelShortLength(src);
      let longLength = labelLongLength(src, keyLength);
      if (longLength < kindLength) {
        kindLength = longLength;
        kind = "long";
      }
      if (isSame(src)) {
        let sameLength = labelSameLength(keyLength);
        if (sameLength < kindLength) {
          kindLength = sameLength;
          kind = "same";
        }
      }
      return kind;
    }
    exports2.detectLabelType = detectLabelType;
    function writeLabel(src, keyLength, to) {
      let type = detectLabelType(src, keyLength);
      if (type === "short") {
        writeLabelShort(src, to);
      } else if (type === "long") {
        writeLabelLong(src, keyLength, to);
      } else if (type === "same") {
        writeLabelSame(src[0] === "1", src.length, keyLength, to);
      }
    }
    function writeNode(src, keyLength, serializer, to) {
      if (src.type === "leaf") {
        serializer(src.value, to);
      }
      if (src.type === "fork") {
        const leftCell = (0, Builder_1.beginCell)();
        const rightCell = (0, Builder_1.beginCell)();
        writeEdge(src.left, keyLength - 1, serializer, leftCell);
        writeEdge(src.right, keyLength - 1, serializer, rightCell);
        to.storeRef(leftCell);
        to.storeRef(rightCell);
      }
    }
    function writeEdge(src, keyLength, serializer, to) {
      writeLabel(src.label, keyLength, to);
      writeNode(src.node, keyLength - src.label.length, serializer, to);
    }
    function serializeDict(src, keyLength, serializer, to) {
      const tree = buildTree(src, keyLength);
      writeEdge(tree, keyLength, serializer, to);
    }
    exports2.serializeDict = serializeDict;
  }
});

// node_modules/@ton/core/dist/dict/utils/internalKeySerializer.js
var require_internalKeySerializer = __commonJS({
  "node_modules/@ton/core/dist/dict/utils/internalKeySerializer.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.deserializeInternalKey = exports2.serializeInternalKey = void 0;
    var Address_1 = require_Address();
    var BitString_1 = require_BitString();
    var paddedBits_1 = require_paddedBits();
    function serializeInternalKey(value) {
      if (typeof value === "number") {
        if (!Number.isSafeInteger(value)) {
          throw Error("Invalid key type: not a safe integer: " + value);
        }
        return "n:" + value.toString(10);
      } else if (typeof value === "bigint") {
        return "b:" + value.toString(10);
      } else if (Address_1.Address.isAddress(value)) {
        return "a:" + value.toString();
      } else if (Buffer.isBuffer(value)) {
        return "f:" + value.toString("hex");
      } else if (BitString_1.BitString.isBitString(value)) {
        return "B:" + value.toString();
      } else {
        throw Error("Invalid key type");
      }
    }
    exports2.serializeInternalKey = serializeInternalKey;
    function deserializeInternalKey(value) {
      let k = value.slice(0, 2);
      let v = value.slice(2);
      if (k === "n:") {
        return parseInt(v, 10);
      } else if (k === "b:") {
        return BigInt(v);
      } else if (k === "a:") {
        return Address_1.Address.parse(v);
      } else if (k === "f:") {
        return Buffer.from(v, "hex");
      } else if (k === "B:") {
        const lastDash = v.slice(-1) == "_";
        const isPadded = lastDash || v.length % 2 != 0;
        if (isPadded) {
          let charLen = lastDash ? v.length - 1 : v.length;
          const padded = v.substr(0, charLen) + "0";
          if (!lastDash && (charLen & 1) !== 0) {
            return new BitString_1.BitString(Buffer.from(padded, "hex"), 0, charLen << 2);
          } else {
            return (0, paddedBits_1.paddedBufferToBits)(Buffer.from(padded, "hex"));
          }
        } else {
          return new BitString_1.BitString(Buffer.from(v, "hex"), 0, v.length << 2);
        }
      }
      throw Error("Invalid key type: " + k);
    }
    exports2.deserializeInternalKey = deserializeInternalKey;
  }
});

// node_modules/@ton/core/dist/dict/Dictionary.js
var require_Dictionary = __commonJS({
  "node_modules/@ton/core/dist/dict/Dictionary.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Dictionary = void 0;
    var Address_1 = require_Address();
    var Builder_1 = require_Builder();
    var Cell_1 = require_Cell();
    var BitString_1 = require_BitString();
    var generateMerkleProof_1 = require_generateMerkleProof();
    var generateMerkleUpdate_1 = require_generateMerkleUpdate();
    var parseDict_1 = require_parseDict();
    var serializeDict_1 = require_serializeDict();
    var internalKeySerializer_1 = require_internalKeySerializer();
    var Dictionary2 = class _Dictionary {
      /**
       * Create an empty map
       * @param key key type
       * @param value value type
       * @returns Dictionary<K, V>
       */
      static empty(key, value) {
        if (key && value) {
          return new _Dictionary(/* @__PURE__ */ new Map(), key, value);
        } else {
          return new _Dictionary(/* @__PURE__ */ new Map(), null, null);
        }
      }
      /**
       * Load dictionary from slice
       * @param key key description
       * @param value value description
       * @param src slice
       * @returns Dictionary<K, V>
       */
      static load(key, value, sc) {
        let slice;
        if (sc instanceof Cell_1.Cell) {
          if (sc.isExotic) {
            return _Dictionary.empty(key, value);
          }
          slice = sc.beginParse();
        } else {
          slice = sc;
        }
        let cell = slice.loadMaybeRef();
        if (cell && !cell.isExotic) {
          return _Dictionary.loadDirect(key, value, cell.beginParse());
        } else {
          return _Dictionary.empty(key, value);
        }
      }
      /**
       * Low level method for rare dictionaries from system contracts.
       * Loads dictionary from slice directly without going to the ref.
       *
       * @param key key description
       * @param value value description
       * @param sc slice
       * @returns Dictionary<K, V>
       */
      static loadDirect(key, value, sc) {
        if (!sc) {
          return _Dictionary.empty(key, value);
        }
        let slice;
        if (sc instanceof Cell_1.Cell) {
          slice = sc.beginParse();
        } else {
          slice = sc;
        }
        let values = (0, parseDict_1.parseDict)(slice, key.bits, value.parse);
        let prepare = /* @__PURE__ */ new Map();
        for (let [k, v] of values) {
          prepare.set((0, internalKeySerializer_1.serializeInternalKey)(key.parse(k)), v);
        }
        return new _Dictionary(prepare, key, value);
      }
      constructor(values, key, value) {
        this._key = key;
        this._value = value;
        this._map = values;
      }
      get size() {
        return this._map.size;
      }
      get(key) {
        return this._map.get((0, internalKeySerializer_1.serializeInternalKey)(key));
      }
      has(key) {
        return this._map.has((0, internalKeySerializer_1.serializeInternalKey)(key));
      }
      set(key, value) {
        this._map.set((0, internalKeySerializer_1.serializeInternalKey)(key), value);
        return this;
      }
      delete(key) {
        const k = (0, internalKeySerializer_1.serializeInternalKey)(key);
        return this._map.delete(k);
      }
      clear() {
        this._map.clear();
      }
      *[Symbol.iterator]() {
        for (const [k, v] of this._map) {
          const key = (0, internalKeySerializer_1.deserializeInternalKey)(k);
          yield [key, v];
        }
      }
      keys() {
        return Array.from(this._map.keys()).map((v) => (0, internalKeySerializer_1.deserializeInternalKey)(v));
      }
      values() {
        return Array.from(this._map.values());
      }
      store(builder, key, value) {
        if (this._map.size === 0) {
          builder.storeBit(0);
        } else {
          let resolvedKey = this._key;
          if (key !== null && key !== void 0) {
            resolvedKey = key;
          }
          let resolvedValue = this._value;
          if (value !== null && value !== void 0) {
            resolvedValue = value;
          }
          if (!resolvedKey) {
            throw Error("Key serializer is not defined");
          }
          if (!resolvedValue) {
            throw Error("Value serializer is not defined");
          }
          let prepared = /* @__PURE__ */ new Map();
          for (const [k, v] of this._map) {
            prepared.set(resolvedKey.serialize((0, internalKeySerializer_1.deserializeInternalKey)(k)), v);
          }
          builder.storeBit(1);
          let dd = (0, Builder_1.beginCell)();
          (0, serializeDict_1.serializeDict)(prepared, resolvedKey.bits, resolvedValue.serialize, dd);
          builder.storeRef(dd.endCell());
        }
      }
      storeDirect(builder, key, value) {
        if (this._map.size === 0) {
          throw Error("Cannot store empty dictionary directly");
        }
        let resolvedKey = this._key;
        if (key !== null && key !== void 0) {
          resolvedKey = key;
        }
        let resolvedValue = this._value;
        if (value !== null && value !== void 0) {
          resolvedValue = value;
        }
        if (!resolvedKey) {
          throw Error("Key serializer is not defined");
        }
        if (!resolvedValue) {
          throw Error("Value serializer is not defined");
        }
        let prepared = /* @__PURE__ */ new Map();
        for (const [k, v] of this._map) {
          prepared.set(resolvedKey.serialize((0, internalKeySerializer_1.deserializeInternalKey)(k)), v);
        }
        (0, serializeDict_1.serializeDict)(prepared, resolvedKey.bits, resolvedValue.serialize, builder);
      }
      /**
       * Generate merkle proof for multiple keys in the dictionary
       * @param keys an array of the keys
       * @returns generated merkle proof cell
       */
      generateMerkleProof(keys) {
        return (0, generateMerkleProof_1.generateMerkleProof)(this, keys, this._key);
      }
      /**
       * Low level method for generating pruned dictionary directly.
       * The result can be used as a part of a bigger merkle proof
       * @param keys an array of the keys
       * @returns cell that contains the pruned dictionary
       */
      generateMerkleProofDirect(keys) {
        return (0, generateMerkleProof_1.generateMerkleProofDirect)(this, keys, this._key);
      }
      generateMerkleUpdate(key, newValue) {
        return (0, generateMerkleUpdate_1.generateMerkleUpdate)(this, key, this._key, newValue);
      }
    };
    exports2.Dictionary = Dictionary2;
    Dictionary2.Keys = {
      /**
       * Standard address key
       * @returns DictionaryKey<Address>
       */
      Address: () => {
        return createAddressKey();
      },
      /**
       * Create standard big integer key
       * @param bits number of bits
       * @returns DictionaryKey<bigint>
       */
      BigInt: (bits) => {
        return createBigIntKey(bits);
      },
      /**
       * Create integer key
       * @param bits bits of integer
       * @returns DictionaryKey<number>
       */
      Int: (bits) => {
        return createIntKey(bits);
      },
      /**
       * Create standard unsigned big integer key
       * @param bits number of bits
       * @returns DictionaryKey<bigint>
       */
      BigUint: (bits) => {
        return createBigUintKey(bits);
      },
      /**
       * Create standard unsigned integer key
       * @param bits number of bits
       * @returns DictionaryKey<number>
       */
      Uint: (bits) => {
        return createUintKey(bits);
      },
      /**
       * Create standard buffer key
       * @param bytes number of bytes of a buffer
       * @returns DictionaryKey<Buffer>
       */
      Buffer: (bytes) => {
        return createBufferKey(bytes);
      },
      /**
       * Create BitString key
       * @param bits key length
       * @returns DictionaryKey<BitString>
       * Point is that Buffer has to be 8 bit aligned,
       * while key is TVM dictionary doesn't have to be
       * aligned at all.
       */
      BitString: (bits) => {
        return createBitStringKey(bits);
      }
    };
    Dictionary2.Values = {
      /**
       * Create standard integer value
       * @returns DictionaryValue<bigint>
       */
      BigInt: (bits) => {
        return createBigIntValue(bits);
      },
      /**
       * Create standard integer value
       * @returns DictionaryValue<number>
       */
      Int: (bits) => {
        return createIntValue(bits);
      },
      /**
       * Create big var int
       * @param bits nubmer of header bits
       * @returns DictionaryValue<bigint>
       */
      BigVarInt: (bits) => {
        return createBigVarIntValue(bits);
      },
      /**
       * Create standard unsigned integer value
       * @param bits number of bits
       * @returns DictionaryValue<bigint>
       */
      BigUint: (bits) => {
        return createBigUintValue(bits);
      },
      /**
       * Create standard unsigned integer value
       * @param bits number of bits
       * @returns DictionaryValue<bigint>
       */
      Uint: (bits) => {
        return createUintValue(bits);
      },
      /**
       * Create big var int
       * @param bits nubmer of header bits
       * @returns DictionaryValue<bigint>
       */
      BigVarUint: (bits) => {
        return createBigVarUintValue(bits);
      },
      /**
       * Create standard boolean value
       * @returns DictionaryValue<boolean>
       */
      Bool: () => {
        return createBooleanValue();
      },
      /**
       * Create standard address value
       * @returns DictionaryValue<Address>
       */
      Address: () => {
        return createAddressValue();
      },
      /**
       * Create standard cell value
       * @returns DictionaryValue<Cell>
       */
      Cell: () => {
        return createCellValue();
      },
      /**
       * Create Builder value
       * @param bytes number of bytes of a buffer
       * @returns DictionaryValue<Builder>
       */
      Buffer: (bytes) => {
        return createBufferValue(bytes);
      },
      /**
       * Create BitString value
       * @param requested bit length
       * @returns DictionaryValue<BitString>
       * Point is that Buffer is not applicable
       * when length is not 8 bit alligned.
       */
      BitString: (bits) => {
        return createBitStringValue(bits);
      },
      /**
       * Create dictionary value
       * @param key
       * @param value
       */
      Dictionary: (key, value) => {
        return createDictionaryValue(key, value);
      }
    };
    function createAddressKey() {
      return {
        bits: 267,
        serialize: (src) => {
          if (!Address_1.Address.isAddress(src)) {
            throw Error("Key is not an address");
          }
          return (0, Builder_1.beginCell)().storeAddress(src).endCell().beginParse().preloadUintBig(267);
        },
        parse: (src) => {
          return (0, Builder_1.beginCell)().storeUint(src, 267).endCell().beginParse().loadAddress();
        }
      };
    }
    function createBigIntKey(bits) {
      return {
        bits,
        serialize: (src) => {
          if (typeof src !== "bigint") {
            throw Error("Key is not a bigint");
          }
          return (0, Builder_1.beginCell)().storeInt(src, bits).endCell().beginParse().loadUintBig(bits);
        },
        parse: (src) => {
          return (0, Builder_1.beginCell)().storeUint(src, bits).endCell().beginParse().loadIntBig(bits);
        }
      };
    }
    function createIntKey(bits) {
      return {
        bits,
        serialize: (src) => {
          if (typeof src !== "number") {
            throw Error("Key is not a number");
          }
          if (!Number.isSafeInteger(src)) {
            throw Error("Key is not a safe integer: " + src);
          }
          return (0, Builder_1.beginCell)().storeInt(src, bits).endCell().beginParse().loadUintBig(bits);
        },
        parse: (src) => {
          return (0, Builder_1.beginCell)().storeUint(src, bits).endCell().beginParse().loadInt(bits);
        }
      };
    }
    function createBigUintKey(bits) {
      return {
        bits,
        serialize: (src) => {
          if (typeof src !== "bigint") {
            throw Error("Key is not a bigint");
          }
          if (src < 0) {
            throw Error("Key is negative: " + src);
          }
          return (0, Builder_1.beginCell)().storeUint(src, bits).endCell().beginParse().loadUintBig(bits);
        },
        parse: (src) => {
          return (0, Builder_1.beginCell)().storeUint(src, bits).endCell().beginParse().loadUintBig(bits);
        }
      };
    }
    function createUintKey(bits) {
      return {
        bits,
        serialize: (src) => {
          if (typeof src !== "number") {
            throw Error("Key is not a number");
          }
          if (!Number.isSafeInteger(src)) {
            throw Error("Key is not a safe integer: " + src);
          }
          if (src < 0) {
            throw Error("Key is negative: " + src);
          }
          return (0, Builder_1.beginCell)().storeUint(src, bits).endCell().beginParse().loadUintBig(bits);
        },
        parse: (src) => {
          return Number((0, Builder_1.beginCell)().storeUint(src, bits).endCell().beginParse().loadUint(bits));
        }
      };
    }
    function createBufferKey(bytes) {
      return {
        bits: bytes * 8,
        serialize: (src) => {
          if (!Buffer.isBuffer(src)) {
            throw Error("Key is not a buffer");
          }
          return (0, Builder_1.beginCell)().storeBuffer(src).endCell().beginParse().loadUintBig(bytes * 8);
        },
        parse: (src) => {
          return (0, Builder_1.beginCell)().storeUint(src, bytes * 8).endCell().beginParse().loadBuffer(bytes);
        }
      };
    }
    function createBitStringKey(bits) {
      return {
        bits,
        serialize: (src) => {
          if (!BitString_1.BitString.isBitString(src))
            throw Error("Key is not a BitString");
          return (0, Builder_1.beginCell)().storeBits(src).endCell().beginParse().loadUintBig(bits);
        },
        parse: (src) => {
          return (0, Builder_1.beginCell)().storeUint(src, bits).endCell().beginParse().loadBits(bits);
        }
      };
    }
    function createIntValue(bits) {
      return {
        serialize: (src, buidler) => {
          buidler.storeInt(src, bits);
        },
        parse: (src) => {
          let value = src.loadInt(bits);
          src.endParse();
          return value;
        }
      };
    }
    function createBigIntValue(bits) {
      return {
        serialize: (src, buidler) => {
          buidler.storeInt(src, bits);
        },
        parse: (src) => {
          let value = src.loadIntBig(bits);
          src.endParse();
          return value;
        }
      };
    }
    function createBigVarIntValue(bits) {
      return {
        serialize: (src, buidler) => {
          buidler.storeVarInt(src, bits);
        },
        parse: (src) => {
          let value = src.loadVarIntBig(bits);
          src.endParse();
          return value;
        }
      };
    }
    function createBigVarUintValue(bits) {
      return {
        serialize: (src, buidler) => {
          buidler.storeVarUint(src, bits);
        },
        parse: (src) => {
          let value = src.loadVarUintBig(bits);
          src.endParse();
          return value;
        }
      };
    }
    function createUintValue(bits) {
      return {
        serialize: (src, buidler) => {
          buidler.storeUint(src, bits);
        },
        parse: (src) => {
          let value = src.loadUint(bits);
          src.endParse();
          return value;
        }
      };
    }
    function createBigUintValue(bits) {
      return {
        serialize: (src, buidler) => {
          buidler.storeUint(src, bits);
        },
        parse: (src) => {
          let value = src.loadUintBig(bits);
          src.endParse();
          return value;
        }
      };
    }
    function createBooleanValue() {
      return {
        serialize: (src, buidler) => {
          buidler.storeBit(src);
        },
        parse: (src) => {
          let value = src.loadBit();
          src.endParse();
          return value;
        }
      };
    }
    function createAddressValue() {
      return {
        serialize: (src, buidler) => {
          buidler.storeAddress(src);
        },
        parse: (src) => {
          let addr = src.loadAddress();
          src.endParse();
          return addr;
        }
      };
    }
    function createCellValue() {
      return {
        serialize: (src, buidler) => {
          buidler.storeRef(src);
        },
        parse: (src) => {
          let value = src.loadRef();
          src.endParse();
          return value;
        }
      };
    }
    function createDictionaryValue(key, value) {
      return {
        serialize: (src, buidler) => {
          src.store(buidler);
        },
        parse: (src) => {
          let dict = Dictionary2.load(key, value, src);
          src.endParse();
          return dict;
        }
      };
    }
    function createBufferValue(size) {
      return {
        serialize: (src, buidler) => {
          if (src.length !== size) {
            throw Error("Invalid buffer size");
          }
          buidler.storeBuffer(src);
        },
        parse: (src) => {
          let value = src.loadBuffer(size);
          src.endParse();
          return value;
        }
      };
    }
    function createBitStringValue(bits) {
      return {
        serialize: (src, builder) => {
          if (src.length !== bits) {
            throw Error("Invalid BitString size");
          }
          builder.storeBits(src);
        },
        parse: (src) => {
          let value = src.loadBits(bits);
          src.endParse();
          return value;
        }
      };
    }
  }
});

// node_modules/@ton/core/dist/boc/utils/strings.js
var require_strings = __commonJS({
  "node_modules/@ton/core/dist/boc/utils/strings.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.writeString = exports2.stringToCell = exports2.readString = void 0;
    var Builder_1 = require_Builder();
    function readBuffer(slice) {
      if (slice.remainingBits % 8 !== 0) {
        throw new Error(`Invalid string length: ${slice.remainingBits}`);
      }
      if (slice.remainingRefs !== 0 && slice.remainingRefs !== 1) {
        throw new Error(`invalid number of refs: ${slice.remainingRefs}`);
      }
      let res;
      if (slice.remainingBits === 0) {
        res = Buffer.alloc(0);
      } else {
        res = slice.loadBuffer(slice.remainingBits / 8);
      }
      if (slice.remainingRefs === 1) {
        res = Buffer.concat([res, readBuffer(slice.loadRef().beginParse())]);
      }
      return res;
    }
    function readString(slice) {
      return readBuffer(slice).toString();
    }
    exports2.readString = readString;
    function writeBuffer(src, builder) {
      if (src.length > 0) {
        let bytes = Math.floor(builder.availableBits / 8);
        if (src.length > bytes) {
          let a = src.subarray(0, bytes);
          let t = src.subarray(bytes);
          builder = builder.storeBuffer(a);
          let bb = (0, Builder_1.beginCell)();
          writeBuffer(t, bb);
          builder = builder.storeRef(bb.endCell());
        } else {
          builder = builder.storeBuffer(src);
        }
      }
    }
    function stringToCell(src) {
      let builder = (0, Builder_1.beginCell)();
      writeBuffer(Buffer.from(src), builder);
      return builder.endCell();
    }
    exports2.stringToCell = stringToCell;
    function writeString(src, builder) {
      writeBuffer(Buffer.from(src), builder);
    }
    exports2.writeString = writeString;
  }
});

// node_modules/@ton/core/dist/boc/Slice.js
var require_Slice = __commonJS({
  "node_modules/@ton/core/dist/boc/Slice.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    var _a;
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Slice = void 0;
    var symbol_inspect_1 = __importDefault(require_symbol());
    var Dictionary_1 = require_Dictionary();
    var Builder_1 = require_Builder();
    var strings_1 = require_strings();
    var Slice2 = class _Slice {
      constructor(reader, refs) {
        this[_a] = () => this.toString();
        this._reader = reader.clone();
        this._refs = [...refs];
        this._refsOffset = 0;
      }
      /**
       * Get remaining bits
       */
      get remainingBits() {
        return this._reader.remaining;
      }
      /**
       * Get offset bits
       */
      get offsetBits() {
        return this._reader.offset;
      }
      /**
       * Get remaining refs
       */
      get remainingRefs() {
        return this._refs.length - this._refsOffset;
      }
      /**
       * Get offset refs
       */
      get offsetRefs() {
        return this._refsOffset;
      }
      /**
       * Skip bits
       * @param bits
       */
      skip(bits) {
        this._reader.skip(bits);
        return this;
      }
      /**
       * Load a single bit
       * @returns true or false depending on the bit value
       */
      loadBit() {
        return this._reader.loadBit();
      }
      /**
       * Preload a signle bit
       * @returns true or false depending on the bit value
       */
      preloadBit() {
        return this._reader.preloadBit();
      }
      /**
       * Load a boolean
       * @returns true or false depending on the bit value
       */
      loadBoolean() {
        return this.loadBit();
      }
      /**
       * Load maybe boolean
       * @returns true or false depending on the bit value or null
       */
      loadMaybeBoolean() {
        if (this.loadBit()) {
          return this.loadBoolean();
        } else {
          return null;
        }
      }
      /**
       * Load bits as a new BitString
       * @param bits number of bits to read
       * @returns new BitString
       */
      loadBits(bits) {
        return this._reader.loadBits(bits);
      }
      /**
       * Preload bits as a new BitString
       * @param bits number of bits to read
       * @returns new BitString
       */
      preloadBits(bits) {
        return this._reader.preloadBits(bits);
      }
      /**
       * Load uint
       * @param bits number of bits to read
       * @returns uint value
       */
      loadUint(bits) {
        return this._reader.loadUint(bits);
      }
      /**
       * Load uint
       * @param bits number of bits to read
       * @returns uint value
       */
      loadUintBig(bits) {
        return this._reader.loadUintBig(bits);
      }
      /**
       * Preload uint
       * @param bits number of bits to read
       * @returns uint value
       */
      preloadUint(bits) {
        return this._reader.preloadUint(bits);
      }
      /**
       * Preload uint
       * @param bits number of bits to read
       * @returns uint value
       */
      preloadUintBig(bits) {
        return this._reader.preloadUintBig(bits);
      }
      /**
       * Load maybe uint
       * @param bits number of bits to read
       * @returns uint value or null
       */
      loadMaybeUint(bits) {
        if (this.loadBit()) {
          return this.loadUint(bits);
        } else {
          return null;
        }
      }
      /**
       * Load maybe uint
       * @param bits number of bits to read
       * @returns uint value or null
       */
      loadMaybeUintBig(bits) {
        if (this.loadBit()) {
          return this.loadUintBig(bits);
        } else {
          return null;
        }
      }
      /**
       * Load int
       * @param bits number of bits to read
       * @returns int value
       */
      loadInt(bits) {
        return this._reader.loadInt(bits);
      }
      /**
       * Load int
       * @param bits number of bits to read
       * @returns int value
       */
      loadIntBig(bits) {
        return this._reader.loadIntBig(bits);
      }
      /**
       * Preload int
       * @param bits number of bits to read
       * @returns int value
       */
      preloadInt(bits) {
        return this._reader.preloadInt(bits);
      }
      /**
       * Preload int
       * @param bits number of bits to read
       * @returns int value
       */
      preloadIntBig(bits) {
        return this._reader.preloadIntBig(bits);
      }
      /**
       * Load maybe uint
       * @param bits number of bits to read
       * @returns uint value or null
       */
      loadMaybeInt(bits) {
        if (this.loadBit()) {
          return this.loadInt(bits);
        } else {
          return null;
        }
      }
      /**
       * Load maybe uint
       * @param bits number of bits to read
       * @returns uint value or null
       */
      loadMaybeIntBig(bits) {
        if (this.loadBit()) {
          return this.loadIntBig(bits);
        } else {
          return null;
        }
      }
      /**
       * Load varuint
       * @param bits number of bits to read in header
       * @returns varuint value
       */
      loadVarUint(bits) {
        return this._reader.loadVarUint(bits);
      }
      /**
       * Load varuint
       * @param bits number of bits to read in header
       * @returns varuint value
       */
      loadVarUintBig(bits) {
        return this._reader.loadVarUintBig(bits);
      }
      /**
       * Preload varuint
       * @param bits number of bits to read in header
       * @returns varuint value
       */
      preloadVarUint(bits) {
        return this._reader.preloadVarUint(bits);
      }
      /**
       * Preload varuint
       * @param bits number of bits to read in header
       * @returns varuint value
       */
      preloadVarUintBig(bits) {
        return this._reader.preloadVarUintBig(bits);
      }
      /**
       * Load varint
       * @param bits number of bits to read in header
       * @returns varint value
       */
      loadVarInt(bits) {
        return this._reader.loadVarInt(bits);
      }
      /**
       * Load varint
       * @param bits number of bits to read in header
       * @returns varint value
       */
      loadVarIntBig(bits) {
        return this._reader.loadVarIntBig(bits);
      }
      /**
       * Preload varint
       * @param bits number of bits to read in header
       * @returns varint value
       */
      preloadVarInt(bits) {
        return this._reader.preloadVarInt(bits);
      }
      /**
       * Preload varint
       * @param bits number of bits to read in header
       * @returns varint value
       */
      preloadVarIntBig(bits) {
        return this._reader.preloadVarIntBig(bits);
      }
      /**
       * Load coins
       * @returns coins value
       */
      loadCoins() {
        return this._reader.loadCoins();
      }
      /**
       * Preload coins
       * @returns coins value
       */
      preloadCoins() {
        return this._reader.preloadCoins();
      }
      /**
       * Load maybe coins
       * @returns coins value or null
       */
      loadMaybeCoins() {
        if (this._reader.loadBit()) {
          return this._reader.loadCoins();
        } else {
          return null;
        }
      }
      /**
       * Load internal Address
       * @returns Address
       */
      loadAddress() {
        return this._reader.loadAddress();
      }
      /**
       * Load optional internal Address
       * @returns Address or null
       */
      loadMaybeAddress() {
        return this._reader.loadMaybeAddress();
      }
      /**
       * Load external address
       * @returns ExternalAddress
       */
      loadExternalAddress() {
        return this._reader.loadExternalAddress();
      }
      /**
       * Load optional external address
       * @returns ExternalAddress or null
       */
      loadMaybeExternalAddress() {
        return this._reader.loadMaybeExternalAddress();
      }
      /**
       * Load address
       * @returns Address, ExternalAddress or null
       */
      loadAddressAny() {
        return this._reader.loadAddressAny();
      }
      /**
       * Load reference
       * @returns Cell
       */
      loadRef() {
        if (this._refsOffset >= this._refs.length) {
          throw new Error("No more references");
        }
        return this._refs[this._refsOffset++];
      }
      /**
       * Preload reference
       * @returns Cell
       */
      preloadRef() {
        if (this._refsOffset >= this._refs.length) {
          throw new Error("No more references");
        }
        return this._refs[this._refsOffset];
      }
      /**
       * Load optional reference
       * @returns Cell or null
       */
      loadMaybeRef() {
        if (this.loadBit()) {
          return this.loadRef();
        } else {
          return null;
        }
      }
      /**
       * Preload optional reference
       * @returns Cell or null
       */
      preloadMaybeRef() {
        if (this.preloadBit()) {
          return this.preloadRef();
        } else {
          return null;
        }
      }
      /**
       * Load byte buffer
       * @param bytes number of bytes to load
       * @returns Buffer
       */
      loadBuffer(bytes) {
        return this._reader.loadBuffer(bytes);
      }
      /**
       * Load byte buffer
       * @param bytes number of bytes to load
       * @returns Buffer
       */
      preloadBuffer(bytes) {
        return this._reader.preloadBuffer(bytes);
      }
      /**
       * Load string tail
       */
      loadStringTail() {
        return (0, strings_1.readString)(this);
      }
      /**
       * Load maybe string tail
       * @returns string or null
       */
      loadMaybeStringTail() {
        if (this.loadBit()) {
          return (0, strings_1.readString)(this);
        } else {
          return null;
        }
      }
      /**
       * Load string tail from ref
       * @returns string
       */
      loadStringRefTail() {
        return (0, strings_1.readString)(this.loadRef().beginParse());
      }
      /**
       * Load maybe string tail from ref
       * @returns string or null
       */
      loadMaybeStringRefTail() {
        const ref = this.loadMaybeRef();
        if (ref) {
          return (0, strings_1.readString)(ref.beginParse());
        } else {
          return null;
        }
      }
      /**
       * Loads dictionary
       * @param key key description
       * @param value value description
       * @returns Dictionary<K, V>
       */
      loadDict(key, value) {
        return Dictionary_1.Dictionary.load(key, value, this);
      }
      /**
       * Loads dictionary directly from current slice
       * @param key key description
       * @param value value description
       * @returns Dictionary<K, V>
       */
      loadDictDirect(key, value) {
        return Dictionary_1.Dictionary.loadDirect(key, value, this);
      }
      /**
       * Checks if slice is empty
       */
      endParse() {
        if (this.remainingBits > 0 || this.remainingRefs > 0) {
          throw new Error("Slice is not empty");
        }
      }
      /**
       * Convert slice to cell
       */
      asCell() {
        return (0, Builder_1.beginCell)().storeSlice(this).endCell();
      }
      /**
       *
       * @returns
       */
      asBuilder() {
        return (0, Builder_1.beginCell)().storeSlice(this);
      }
      /**
       * Clone slice
       * @returns cloned slice
       */
      clone(fromStart = false) {
        if (fromStart) {
          let reader = this._reader.clone();
          reader.reset();
          return new _Slice(reader, this._refs);
        } else {
          let res = new _Slice(this._reader, this._refs);
          res._refsOffset = this._refsOffset;
          return res;
        }
      }
      /**
       * Print slice as string by converting it to cell
       * @returns string
       */
      toString() {
        return this.asCell().toString();
      }
    };
    exports2.Slice = Slice2;
    _a = symbol_inspect_1.default;
  }
});

// node_modules/@ton/core/dist/boc/cell/exoticLibrary.js
var require_exoticLibrary = __commonJS({
  "node_modules/@ton/core/dist/boc/cell/exoticLibrary.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.exoticLibrary = void 0;
    var BitReader_1 = require_BitReader();
    function exoticLibrary(bits, refs) {
      const reader = new BitReader_1.BitReader(bits);
      const size = 8 + 256;
      if (bits.length !== size) {
        throw new Error(`Library cell must have exactly (8 + 256) bits, got "${bits.length}"`);
      }
      let type = reader.loadUint(8);
      if (type !== 2) {
        throw new Error(`Library cell must have type 2, got "${type}"`);
      }
      return {};
    }
    exports2.exoticLibrary = exoticLibrary;
  }
});

// node_modules/@ton/core/dist/boc/cell/exoticMerkleUpdate.js
var require_exoticMerkleUpdate = __commonJS({
  "node_modules/@ton/core/dist/boc/cell/exoticMerkleUpdate.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.exoticMerkleUpdate = void 0;
    var BitReader_1 = require_BitReader();
    function exoticMerkleUpdate2(bits, refs) {
      const reader = new BitReader_1.BitReader(bits);
      const size = 8 + 2 * (256 + 16);
      if (bits.length !== size) {
        throw new Error(`Merkle Update cell must have exactly (8 + (2 * (256 + 16))) bits, got "${bits.length}"`);
      }
      if (refs.length !== 2) {
        throw new Error(`Merkle Update cell must have exactly 2 refs, got "${refs.length}"`);
      }
      let type = reader.loadUint(8);
      if (type !== 4) {
        throw new Error(`Merkle Update cell type must be exactly 4, got "${type}"`);
      }
      const proofHash1 = reader.loadBuffer(32);
      const proofHash2 = reader.loadBuffer(32);
      const proofDepth1 = reader.loadUint(16);
      const proofDepth2 = reader.loadUint(16);
      if (proofDepth1 !== refs[0].depth(0)) {
        throw new Error(`Merkle Update cell ref depth must be exactly "${proofDepth1}", got "${refs[0].depth(0)}"`);
      }
      if (!proofHash1.equals(refs[0].hash(0))) {
        throw new Error(`Merkle Update cell ref hash must be exactly "${proofHash1.toString("hex")}", got "${refs[0].hash(0).toString("hex")}"`);
      }
      if (proofDepth2 !== refs[1].depth(0)) {
        throw new Error(`Merkle Update cell ref depth must be exactly "${proofDepth2}", got "${refs[1].depth(0)}"`);
      }
      if (!proofHash2.equals(refs[1].hash(0))) {
        throw new Error(`Merkle Update cell ref hash must be exactly "${proofHash2.toString("hex")}", got "${refs[1].hash(0).toString("hex")}"`);
      }
      return {
        proofDepth1,
        proofDepth2,
        proofHash1,
        proofHash2
      };
    }
    exports2.exoticMerkleUpdate = exoticMerkleUpdate2;
  }
});

// node_modules/@ton/core/dist/boc/cell/LevelMask.js
var require_LevelMask = __commonJS({
  "node_modules/@ton/core/dist/boc/cell/LevelMask.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.LevelMask = void 0;
    var LevelMask = class _LevelMask {
      constructor(mask = 0) {
        this._mask = 0;
        this._mask = mask;
        this._hashIndex = countSetBits(this._mask);
        this._hashCount = this._hashIndex + 1;
      }
      get value() {
        return this._mask;
      }
      get level() {
        return 32 - Math.clz32(this._mask);
      }
      get hashIndex() {
        return this._hashIndex;
      }
      get hashCount() {
        return this._hashCount;
      }
      apply(level) {
        return new _LevelMask(this._mask & (1 << level) - 1);
      }
      isSignificant(level) {
        let res = level === 0 || (this._mask >> level - 1) % 2 !== 0;
        return res;
      }
    };
    exports2.LevelMask = LevelMask;
    function countSetBits(n) {
      n = n - (n >> 1 & 1431655765);
      n = (n & 858993459) + (n >> 2 & 858993459);
      return (n + (n >> 4) & 252645135) * 16843009 >> 24;
    }
  }
});

// node_modules/@ton/core/dist/boc/cell/exoticPruned.js
var require_exoticPruned = __commonJS({
  "node_modules/@ton/core/dist/boc/cell/exoticPruned.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.exoticPruned = void 0;
    var BitReader_1 = require_BitReader();
    var LevelMask_1 = require_LevelMask();
    function exoticPruned2(bits, refs) {
      let reader = new BitReader_1.BitReader(bits);
      let type = reader.loadUint(8);
      if (type !== 1) {
        throw new Error(`Pruned branch cell must have type 1, got "${type}"`);
      }
      if (refs.length !== 0) {
        throw new Error(`Pruned Branch cell can't has refs, got "${refs.length}"`);
      }
      let mask;
      if (bits.length === 280) {
        mask = new LevelMask_1.LevelMask(1);
      } else {
        mask = new LevelMask_1.LevelMask(reader.loadUint(8));
        if (mask.level < 1 || mask.level > 3) {
          throw new Error(`Pruned Branch cell level must be >= 1 and <= 3, got "${mask.level}/${mask.value}"`);
        }
        const size = 8 + 8 + mask.apply(mask.level - 1).hashCount * (256 + 16);
        if (bits.length !== size) {
          throw new Error(`Pruned branch cell must have exactly ${size} bits, got "${bits.length}"`);
        }
      }
      let pruned = [];
      let hashes = [];
      let depths = [];
      for (let i = 0; i < mask.level; i++) {
        hashes.push(reader.loadBuffer(32));
      }
      for (let i = 0; i < mask.level; i++) {
        depths.push(reader.loadUint(16));
      }
      for (let i = 0; i < mask.level; i++) {
        pruned.push({
          depth: depths[i],
          hash: hashes[i]
        });
      }
      return {
        mask: mask.value,
        pruned
      };
    }
    exports2.exoticPruned = exoticPruned2;
  }
});

// node_modules/@ton/core/dist/boc/cell/resolveExotic.js
var require_resolveExotic = __commonJS({
  "node_modules/@ton/core/dist/boc/cell/resolveExotic.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.resolveExotic = void 0;
    var BitReader_1 = require_BitReader();
    var CellType_1 = require_CellType();
    var exoticLibrary_1 = require_exoticLibrary();
    var exoticMerkleProof_1 = require_exoticMerkleProof();
    var exoticMerkleUpdate_1 = require_exoticMerkleUpdate();
    var exoticPruned_1 = require_exoticPruned();
    var LevelMask_1 = require_LevelMask();
    function resolvePruned(bits, refs) {
      let pruned = (0, exoticPruned_1.exoticPruned)(bits, refs);
      let depths = [];
      let hashes = [];
      let mask = new LevelMask_1.LevelMask(pruned.mask);
      for (let i = 0; i < pruned.pruned.length; i++) {
        depths.push(pruned.pruned[i].depth);
        hashes.push(pruned.pruned[i].hash);
      }
      return {
        type: CellType_1.CellType.PrunedBranch,
        depths,
        hashes,
        mask
      };
    }
    function resolveLibrary(bits, refs) {
      let pruned = (0, exoticLibrary_1.exoticLibrary)(bits, refs);
      let depths = [];
      let hashes = [];
      let mask = new LevelMask_1.LevelMask();
      return {
        type: CellType_1.CellType.Library,
        depths,
        hashes,
        mask
      };
    }
    function resolveMerkleProof(bits, refs) {
      let merkleProof = (0, exoticMerkleProof_1.exoticMerkleProof)(bits, refs);
      let depths = [];
      let hashes = [];
      let mask = new LevelMask_1.LevelMask(refs[0].level() >> 1);
      return {
        type: CellType_1.CellType.MerkleProof,
        depths,
        hashes,
        mask
      };
    }
    function resolveMerkleUpdate(bits, refs) {
      let merkleUpdate = (0, exoticMerkleUpdate_1.exoticMerkleUpdate)(bits, refs);
      let depths = [];
      let hashes = [];
      let mask = new LevelMask_1.LevelMask((refs[0].level() | refs[1].level()) >> 1);
      return {
        type: CellType_1.CellType.MerkleUpdate,
        depths,
        hashes,
        mask
      };
    }
    function resolveExotic(bits, refs) {
      let reader = new BitReader_1.BitReader(bits);
      let type = reader.preloadUint(8);
      if (type === 1) {
        return resolvePruned(bits, refs);
      }
      if (type === 2) {
        return resolveLibrary(bits, refs);
      }
      if (type === 3) {
        return resolveMerkleProof(bits, refs);
      }
      if (type === 4) {
        return resolveMerkleUpdate(bits, refs);
      }
      throw Error("Invalid exotic cell type: " + type);
    }
    exports2.resolveExotic = resolveExotic;
  }
});

// node_modules/@ton/core/dist/boc/cell/descriptor.js
var require_descriptor = __commonJS({
  "node_modules/@ton/core/dist/boc/cell/descriptor.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getRepr = exports2.getBitsDescriptor = exports2.getRefsDescriptor = void 0;
    var CellType_1 = require_CellType();
    var paddedBits_1 = require_paddedBits();
    function getRefsDescriptor(refs, levelMask, type) {
      return refs.length + (type !== CellType_1.CellType.Ordinary ? 1 : 0) * 8 + levelMask * 32;
    }
    exports2.getRefsDescriptor = getRefsDescriptor;
    function getBitsDescriptor(bits) {
      let len = bits.length;
      return Math.ceil(len / 8) + Math.floor(len / 8);
    }
    exports2.getBitsDescriptor = getBitsDescriptor;
    function getRepr(originalBits, bits, refs, level, levelMask, type) {
      const bitsLen = Math.ceil(bits.length / 8);
      const repr = Buffer.alloc(2 + bitsLen + (2 + 32) * refs.length);
      let reprCursor = 0;
      repr[reprCursor++] = getRefsDescriptor(refs, levelMask, type);
      repr[reprCursor++] = getBitsDescriptor(originalBits);
      (0, paddedBits_1.bitsToPaddedBuffer)(bits).copy(repr, reprCursor);
      reprCursor += bitsLen;
      for (const c of refs) {
        let childDepth;
        if (type == CellType_1.CellType.MerkleProof || type == CellType_1.CellType.MerkleUpdate) {
          childDepth = c.depth(level + 1);
        } else {
          childDepth = c.depth(level);
        }
        repr[reprCursor++] = Math.floor(childDepth / 256);
        repr[reprCursor++] = childDepth % 256;
      }
      for (const c of refs) {
        let childHash;
        if (type == CellType_1.CellType.MerkleProof || type == CellType_1.CellType.MerkleUpdate) {
          childHash = c.hash(level + 1);
        } else {
          childHash = c.hash(level);
        }
        childHash.copy(repr, reprCursor);
        reprCursor += 32;
      }
      return repr;
    }
    exports2.getRepr = getRepr;
  }
});

// node_modules/@ton/core/dist/boc/cell/wonderCalculator.js
var require_wonderCalculator = __commonJS({
  "node_modules/@ton/core/dist/boc/cell/wonderCalculator.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.wonderCalculator = void 0;
    var BitString_1 = require_BitString();
    var CellType_1 = require_CellType();
    var LevelMask_1 = require_LevelMask();
    var exoticPruned_1 = require_exoticPruned();
    var exoticMerkleProof_1 = require_exoticMerkleProof();
    var descriptor_1 = require_descriptor();
    var crypto_1 = require("@scom/ton-crypto");
    var exoticMerkleUpdate_1 = require_exoticMerkleUpdate();
    var exoticLibrary_1 = require_exoticLibrary();
    function wonderCalculator(type, bits, refs) {
      let levelMask;
      let pruned = null;
      if (type === CellType_1.CellType.Ordinary) {
        let mask = 0;
        for (let r of refs) {
          mask = mask | r.mask.value;
        }
        levelMask = new LevelMask_1.LevelMask(mask);
      } else if (type === CellType_1.CellType.PrunedBranch) {
        pruned = (0, exoticPruned_1.exoticPruned)(bits, refs);
        levelMask = new LevelMask_1.LevelMask(pruned.mask);
      } else if (type === CellType_1.CellType.MerkleProof) {
        let loaded = (0, exoticMerkleProof_1.exoticMerkleProof)(bits, refs);
        levelMask = new LevelMask_1.LevelMask(refs[0].mask.value >> 1);
      } else if (type === CellType_1.CellType.MerkleUpdate) {
        let loaded = (0, exoticMerkleUpdate_1.exoticMerkleUpdate)(bits, refs);
        levelMask = new LevelMask_1.LevelMask((refs[0].mask.value | refs[1].mask.value) >> 1);
      } else if (type === CellType_1.CellType.Library) {
        let loaded = (0, exoticLibrary_1.exoticLibrary)(bits, refs);
        levelMask = new LevelMask_1.LevelMask();
      } else {
        throw new Error("Unsupported exotic type");
      }
      let depths = [];
      let hashes = [];
      let hashCount = type === CellType_1.CellType.PrunedBranch ? 1 : levelMask.hashCount;
      let totalHashCount = levelMask.hashCount;
      let hashIOffset = totalHashCount - hashCount;
      for (let levelI = 0, hashI = 0; levelI <= levelMask.level; levelI++) {
        if (!levelMask.isSignificant(levelI)) {
          continue;
        }
        if (hashI < hashIOffset) {
          hashI++;
          continue;
        }
        let currentBits;
        if (hashI === hashIOffset) {
          if (!(levelI === 0 || type === CellType_1.CellType.PrunedBranch)) {
            throw Error("Invalid");
          }
          currentBits = bits;
        } else {
          if (!(levelI !== 0 && type !== CellType_1.CellType.PrunedBranch)) {
            throw Error("Invalid: " + levelI + ", " + type);
          }
          currentBits = new BitString_1.BitString(hashes[hashI - hashIOffset - 1], 0, 256);
        }
        let currentDepth = 0;
        for (let c of refs) {
          let childDepth;
          if (type == CellType_1.CellType.MerkleProof || type == CellType_1.CellType.MerkleUpdate) {
            childDepth = c.depth(levelI + 1);
          } else {
            childDepth = c.depth(levelI);
          }
          currentDepth = Math.max(currentDepth, childDepth);
        }
        if (refs.length > 0) {
          currentDepth++;
        }
        let repr = (0, descriptor_1.getRepr)(bits, currentBits, refs, levelI, levelMask.apply(levelI).value, type);
        let hash = (0, crypto_1.sha256_sync)(repr);
        let destI = hashI - hashIOffset;
        depths[destI] = currentDepth;
        hashes[destI] = hash;
        hashI++;
      }
      let resolvedHashes = [];
      let resolvedDepths = [];
      if (pruned) {
        for (let i = 0; i < 4; i++) {
          const { hashIndex } = levelMask.apply(i);
          const { hashIndex: thisHashIndex } = levelMask;
          if (hashIndex !== thisHashIndex) {
            resolvedHashes.push(pruned.pruned[hashIndex].hash);
            resolvedDepths.push(pruned.pruned[hashIndex].depth);
          } else {
            resolvedHashes.push(hashes[0]);
            resolvedDepths.push(depths[0]);
          }
        }
      } else {
        for (let i = 0; i < 4; i++) {
          resolvedHashes.push(hashes[levelMask.apply(i).hashIndex]);
          resolvedDepths.push(depths[levelMask.apply(i).hashIndex]);
        }
      }
      return {
        mask: levelMask,
        hashes: resolvedHashes,
        depths: resolvedDepths
      };
    }
    exports2.wonderCalculator = wonderCalculator;
  }
});

// node_modules/@ton/core/dist/boc/cell/utils/topologicalSort.js
var require_topologicalSort = __commonJS({
  "node_modules/@ton/core/dist/boc/cell/utils/topologicalSort.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.topologicalSort = void 0;
    function topologicalSort(src) {
      let pending = [src];
      let allCells = /* @__PURE__ */ new Map();
      let notPermCells = /* @__PURE__ */ new Set();
      let sorted = [];
      while (pending.length > 0) {
        const cells = [...pending];
        pending = [];
        for (let cell of cells) {
          const hash = cell.hash().toString("hex");
          if (allCells.has(hash)) {
            continue;
          }
          notPermCells.add(hash);
          allCells.set(hash, { cell, refs: cell.refs.map((v) => v.hash().toString("hex")) });
          for (let r of cell.refs) {
            pending.push(r);
          }
        }
      }
      let tempMark = /* @__PURE__ */ new Set();
      function visit(hash) {
        if (!notPermCells.has(hash)) {
          return;
        }
        if (tempMark.has(hash)) {
          throw Error("Not a DAG");
        }
        tempMark.add(hash);
        let refs = allCells.get(hash).refs;
        for (let ci = refs.length - 1; ci >= 0; ci--) {
          visit(refs[ci]);
        }
        sorted.push(hash);
        tempMark.delete(hash);
        notPermCells.delete(hash);
      }
      while (notPermCells.size > 0) {
        const id = Array.from(notPermCells)[0];
        visit(id);
      }
      let indexes = /* @__PURE__ */ new Map();
      for (let i = 0; i < sorted.length; i++) {
        indexes.set(sorted[sorted.length - i - 1], i);
      }
      let result = [];
      for (let i = sorted.length - 1; i >= 0; i--) {
        let ent = sorted[i];
        const rrr = allCells.get(ent);
        result.push({ cell: rrr.cell, refs: rrr.refs.map((v) => indexes.get(v)) });
      }
      return result;
    }
    exports2.topologicalSort = topologicalSort;
  }
});

// node_modules/@ton/core/dist/utils/bitsForNumber.js
var require_bitsForNumber = __commonJS({
  "node_modules/@ton/core/dist/utils/bitsForNumber.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.bitsForNumber = void 0;
    function bitsForNumber(src, mode) {
      let v = BigInt(src);
      if (mode === "int") {
        if (v === 0n || v === -1n) {
          return 1;
        }
        let v2 = v > 0 ? v : -v;
        return v2.toString(2).length + 1;
      } else if (mode === "uint") {
        if (v < 0) {
          throw Error(`value is negative. Got ${src}`);
        }
        return v.toString(2).length;
      } else {
        throw Error(`invalid mode. Got ${mode}`);
      }
    }
    exports2.bitsForNumber = bitsForNumber;
  }
});

// node_modules/@ton/core/dist/utils/crc32c.js
var require_crc32c = __commonJS({
  "node_modules/@ton/core/dist/utils/crc32c.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.crc32c = void 0;
    var POLY = 2197175160;
    function crc32c2(source) {
      let crc = 0 ^ 4294967295;
      for (let n = 0; n < source.length; n++) {
        crc ^= source[n];
        crc = crc & 1 ? crc >>> 1 ^ POLY : crc >>> 1;
        crc = crc & 1 ? crc >>> 1 ^ POLY : crc >>> 1;
        crc = crc & 1 ? crc >>> 1 ^ POLY : crc >>> 1;
        crc = crc & 1 ? crc >>> 1 ^ POLY : crc >>> 1;
        crc = crc & 1 ? crc >>> 1 ^ POLY : crc >>> 1;
        crc = crc & 1 ? crc >>> 1 ^ POLY : crc >>> 1;
        crc = crc & 1 ? crc >>> 1 ^ POLY : crc >>> 1;
        crc = crc & 1 ? crc >>> 1 ^ POLY : crc >>> 1;
      }
      crc = crc ^ 4294967295;
      let res = Buffer.alloc(4);
      res.writeInt32LE(crc);
      return res;
    }
    exports2.crc32c = crc32c2;
  }
});

// node_modules/@ton/core/dist/boc/cell/serialization.js
var require_serialization = __commonJS({
  "node_modules/@ton/core/dist/boc/cell/serialization.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.serializeBoc = exports2.deserializeBoc = exports2.parseBoc = void 0;
    var BitReader_1 = require_BitReader();
    var BitString_1 = require_BitString();
    var Cell_1 = require_Cell();
    var topologicalSort_1 = require_topologicalSort();
    var bitsForNumber_1 = require_bitsForNumber();
    var BitBuilder_1 = require_BitBuilder();
    var descriptor_1 = require_descriptor();
    var paddedBits_1 = require_paddedBits();
    var crc32c_1 = require_crc32c();
    function getHashesCount(levelMask) {
      return getHashesCountFromMask(levelMask & 7);
    }
    function getHashesCountFromMask(mask) {
      let n = 0;
      for (let i = 0; i < 3; i++) {
        n += mask & 1;
        mask = mask >> 1;
      }
      return n + 1;
    }
    function readCell(reader, sizeBytes) {
      const d1 = reader.loadUint(8);
      const refsCount = d1 % 8;
      const exotic = !!(d1 & 8);
      const d2 = reader.loadUint(8);
      const dataBytesize = Math.ceil(d2 / 2);
      const paddingAdded = !!(d2 % 2);
      const levelMask = d1 >> 5;
      const hasHashes = (d1 & 16) != 0;
      const hash_bytes = 32;
      const hashesSize = hasHashes ? getHashesCount(levelMask) * hash_bytes : 0;
      const depthSize = hasHashes ? getHashesCount(levelMask) * 2 : 0;
      reader.skip(hashesSize * 8);
      reader.skip(depthSize * 8);
      let bits = BitString_1.BitString.EMPTY;
      if (dataBytesize > 0) {
        if (paddingAdded) {
          bits = reader.loadPaddedBits(dataBytesize * 8);
        } else {
          bits = reader.loadBits(dataBytesize * 8);
        }
      }
      let refs = [];
      for (let i = 0; i < refsCount; i++) {
        refs.push(reader.loadUint(sizeBytes * 8));
      }
      return {
        bits,
        refs,
        exotic
      };
    }
    function calcCellSize(cell, sizeBytes) {
      return 2 + Math.ceil(cell.bits.length / 8) + cell.refs.length * sizeBytes;
    }
    function parseBoc(src) {
      let reader = new BitReader_1.BitReader(new BitString_1.BitString(src, 0, src.length * 8));
      let magic = reader.loadUint(32);
      if (magic === 1761568243) {
        let size = reader.loadUint(8);
        let offBytes = reader.loadUint(8);
        let cells = reader.loadUint(size * 8);
        let roots = reader.loadUint(size * 8);
        let absent = reader.loadUint(size * 8);
        let totalCellSize = reader.loadUint(offBytes * 8);
        let index = reader.loadBuffer(cells * offBytes);
        let cellData = reader.loadBuffer(totalCellSize);
        return {
          size,
          offBytes,
          cells,
          roots,
          absent,
          totalCellSize,
          index,
          cellData,
          root: [0]
        };
      } else if (magic === 2898503464) {
        let size = reader.loadUint(8);
        let offBytes = reader.loadUint(8);
        let cells = reader.loadUint(size * 8);
        let roots = reader.loadUint(size * 8);
        let absent = reader.loadUint(size * 8);
        let totalCellSize = reader.loadUint(offBytes * 8);
        let index = reader.loadBuffer(cells * offBytes);
        let cellData = reader.loadBuffer(totalCellSize);
        let crc32 = reader.loadBuffer(4);
        if (!(0, crc32c_1.crc32c)(src.subarray(0, src.length - 4)).equals(crc32)) {
          throw Error("Invalid CRC32C");
        }
        return {
          size,
          offBytes,
          cells,
          roots,
          absent,
          totalCellSize,
          index,
          cellData,
          root: [0]
        };
      } else if (magic === 3052313714) {
        let hasIdx = reader.loadUint(1);
        let hasCrc32c = reader.loadUint(1);
        let hasCacheBits = reader.loadUint(1);
        let flags = reader.loadUint(2);
        let size = reader.loadUint(3);
        let offBytes = reader.loadUint(8);
        let cells = reader.loadUint(size * 8);
        let roots = reader.loadUint(size * 8);
        let absent = reader.loadUint(size * 8);
        let totalCellSize = reader.loadUint(offBytes * 8);
        let root = [];
        for (let i = 0; i < roots; i++) {
          root.push(reader.loadUint(size * 8));
        }
        let index = null;
        if (hasIdx) {
          index = reader.loadBuffer(cells * offBytes);
        }
        let cellData = reader.loadBuffer(totalCellSize);
        if (hasCrc32c) {
          let crc32 = reader.loadBuffer(4);
          if (!(0, crc32c_1.crc32c)(src.subarray(0, src.length - 4)).equals(crc32)) {
            throw Error("Invalid CRC32C");
          }
        }
        return {
          size,
          offBytes,
          cells,
          roots,
          absent,
          totalCellSize,
          index,
          cellData,
          root
        };
      } else {
        throw Error("Invalid magic");
      }
    }
    exports2.parseBoc = parseBoc;
    function deserializeBoc(src) {
      let boc = parseBoc(src);
      let reader = new BitReader_1.BitReader(new BitString_1.BitString(boc.cellData, 0, boc.cellData.length * 8));
      let cells = [];
      for (let i = 0; i < boc.cells; i++) {
        let cll = readCell(reader, boc.size);
        cells.push({ ...cll, result: null });
      }
      for (let i = cells.length - 1; i >= 0; i--) {
        if (cells[i].result) {
          throw Error("Impossible");
        }
        let refs = [];
        for (let r of cells[i].refs) {
          if (!cells[r].result) {
            throw Error("Invalid BOC file");
          }
          refs.push(cells[r].result);
        }
        cells[i].result = new Cell_1.Cell({ bits: cells[i].bits, refs, exotic: cells[i].exotic });
      }
      let roots = [];
      for (let i = 0; i < boc.root.length; i++) {
        roots.push(cells[boc.root[i]].result);
      }
      return roots;
    }
    exports2.deserializeBoc = deserializeBoc;
    function writeCellToBuilder(cell, refs, sizeBytes, to) {
      let d1 = (0, descriptor_1.getRefsDescriptor)(cell.refs, cell.mask.value, cell.type);
      let d2 = (0, descriptor_1.getBitsDescriptor)(cell.bits);
      to.writeUint(d1, 8);
      to.writeUint(d2, 8);
      to.writeBuffer((0, paddedBits_1.bitsToPaddedBuffer)(cell.bits));
      for (let r of refs) {
        to.writeUint(r, sizeBytes * 8);
      }
    }
    function serializeBoc(root, opts) {
      let allCells = (0, topologicalSort_1.topologicalSort)(root);
      let cellsNum = allCells.length;
      let has_idx = opts.idx;
      let has_crc32c = opts.crc32;
      let has_cache_bits = false;
      let flags = 0;
      let sizeBytes = Math.max(Math.ceil((0, bitsForNumber_1.bitsForNumber)(cellsNum, "uint") / 8), 1);
      let totalCellSize = 0;
      let index = [];
      for (let c of allCells) {
        let sz = calcCellSize(c.cell, sizeBytes);
        totalCellSize += sz;
        index.push(totalCellSize);
      }
      let offsetBytes = Math.max(Math.ceil((0, bitsForNumber_1.bitsForNumber)(totalCellSize, "uint") / 8), 1);
      let totalSize = (4 + // magic
      1 + // flags and s_bytes
      1 + // offset_bytes
      3 * sizeBytes + // cells_num, roots, complete
      offsetBytes + // full_size
      1 * sizeBytes + // root_idx
      (has_idx ? cellsNum * offsetBytes : 0) + totalCellSize + (has_crc32c ? 4 : 0)) * 8;
      let builder = new BitBuilder_1.BitBuilder(totalSize);
      builder.writeUint(3052313714, 32);
      builder.writeBit(has_idx);
      builder.writeBit(has_crc32c);
      builder.writeBit(has_cache_bits);
      builder.writeUint(flags, 2);
      builder.writeUint(sizeBytes, 3);
      builder.writeUint(offsetBytes, 8);
      builder.writeUint(cellsNum, sizeBytes * 8);
      builder.writeUint(1, sizeBytes * 8);
      builder.writeUint(0, sizeBytes * 8);
      builder.writeUint(totalCellSize, offsetBytes * 8);
      builder.writeUint(0, sizeBytes * 8);
      if (has_idx) {
        for (let i = 0; i < cellsNum; i++) {
          builder.writeUint(index[i], offsetBytes * 8);
        }
      }
      for (let i = 0; i < cellsNum; i++) {
        writeCellToBuilder(allCells[i].cell, allCells[i].refs, sizeBytes, builder);
      }
      if (has_crc32c) {
        let crc32 = (0, crc32c_1.crc32c)(builder.buffer());
        builder.writeBuffer(crc32);
      }
      let res = builder.buffer();
      if (res.length !== totalSize / 8) {
        throw Error("Internal error");
      }
      return res;
    }
    exports2.serializeBoc = serializeBoc;
  }
});

// node_modules/@ton/core/dist/boc/Cell.js
var require_Cell = __commonJS({
  "node_modules/@ton/core/dist/boc/Cell.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    var _a;
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Cell = void 0;
    var symbol_inspect_1 = __importDefault(require_symbol());
    var BitString_1 = require_BitString();
    var CellType_1 = require_CellType();
    var Slice_1 = require_Slice();
    var resolveExotic_1 = require_resolveExotic();
    var wonderCalculator_1 = require_wonderCalculator();
    var serialization_1 = require_serialization();
    var BitReader_1 = require_BitReader();
    var Builder_1 = require_Builder();
    var Cell2 = class _Cell {
      /**
       * Deserialize cells from BOC
       * @param src source buffer
       * @returns array of cells
       */
      static fromBoc(src) {
        return (0, serialization_1.deserializeBoc)(src);
      }
      /**
       * Helper function that deserializes a single cell from BOC in base64
       * @param src source string
       */
      static fromBase64(src) {
        let parsed = _Cell.fromBoc(Buffer.from(src, "base64"));
        if (parsed.length !== 1) {
          throw new Error("Deserialized more than one cell");
        }
        return parsed[0];
      }
      /**
       * Helper function that deserializes a single cell from BOC in hex
       * @param src source string
       */
      static fromHex(src) {
        let parsed = _Cell.fromBoc(Buffer.from(src, "hex"));
        if (parsed.length !== 1) {
          throw new Error("Deserialized more than one cell");
        }
        return parsed[0];
      }
      constructor(opts) {
        this._hashes = [];
        this._depths = [];
        this.beginParse = (allowExotic = false) => {
          if (this.isExotic && !allowExotic) {
            throw new Error("Exotic cells cannot be parsed");
          }
          return new Slice_1.Slice(new BitReader_1.BitReader(this.bits), this.refs);
        };
        this.hash = (level = 3) => {
          return this._hashes[Math.min(this._hashes.length - 1, level)];
        };
        this.depth = (level = 3) => {
          return this._depths[Math.min(this._depths.length - 1, level)];
        };
        this.level = () => {
          return this.mask.level;
        };
        this.equals = (other) => {
          return this.hash().equals(other.hash());
        };
        this[_a] = () => this.toString();
        let bits = BitString_1.BitString.EMPTY;
        if (opts && opts.bits) {
          bits = opts.bits;
        }
        let refs = [];
        if (opts && opts.refs) {
          refs = [...opts.refs];
        }
        let hashes;
        let depths;
        let mask;
        let type = CellType_1.CellType.Ordinary;
        if (opts && opts.exotic) {
          let resolved = (0, resolveExotic_1.resolveExotic)(bits, refs);
          let wonders = (0, wonderCalculator_1.wonderCalculator)(resolved.type, bits, refs);
          mask = wonders.mask;
          depths = wonders.depths;
          hashes = wonders.hashes;
          type = resolved.type;
        } else {
          if (refs.length > 4) {
            throw new Error("Invalid number of references");
          }
          if (bits.length > 1023) {
            throw new Error(`Bits overflow: ${bits.length} > 1023`);
          }
          let wonders = (0, wonderCalculator_1.wonderCalculator)(CellType_1.CellType.Ordinary, bits, refs);
          mask = wonders.mask;
          depths = wonders.depths;
          hashes = wonders.hashes;
          type = CellType_1.CellType.Ordinary;
        }
        this.type = type;
        this.bits = bits;
        this.refs = refs;
        this.mask = mask;
        this._depths = depths;
        this._hashes = hashes;
        Object.freeze(this);
        Object.freeze(this.refs);
        Object.freeze(this.bits);
        Object.freeze(this.mask);
        Object.freeze(this._depths);
        Object.freeze(this._hashes);
      }
      /**
       * Check if cell is exotic
       */
      get isExotic() {
        return this.type !== CellType_1.CellType.Ordinary;
      }
      /**
       * Serializes cell to BOC
       * @param opts options
       */
      toBoc(opts) {
        let idx = opts && opts.idx !== null && opts.idx !== void 0 ? opts.idx : false;
        let crc32 = opts && opts.crc32 !== null && opts.crc32 !== void 0 ? opts.crc32 : true;
        return (0, serialization_1.serializeBoc)(this, { idx, crc32 });
      }
      /**
       * Format cell to string
       * @param indent indentation
       * @returns string representation
       */
      toString(indent) {
        let id = indent || "";
        let t = "x";
        if (this.isExotic) {
          if (this.type === CellType_1.CellType.MerkleProof) {
            t = "p";
          } else if (this.type === CellType_1.CellType.MerkleUpdate) {
            t = "u";
          } else if (this.type === CellType_1.CellType.PrunedBranch) {
            t = "p";
          }
        }
        let s = id + (this.isExotic ? t : "x") + "{" + this.bits.toString() + "}";
        for (let k in this.refs) {
          const i = this.refs[k];
          s += "\n" + i.toString(id + " ");
        }
        return s;
      }
      /**
       * Covnert cell to slice
       * @returns slice
       */
      asSlice() {
        return this.beginParse();
      }
      /**
       * Convert cell to a builder that has this cell stored
       * @returns builder
       */
      asBuilder() {
        return (0, Builder_1.beginCell)().storeSlice(this.asSlice());
      }
    };
    exports2.Cell = Cell2;
    _a = symbol_inspect_1.default;
    Cell2.EMPTY = new Cell2();
  }
});

// node_modules/@ton/core/dist/boc/Builder.js
var require_Builder = __commonJS({
  "node_modules/@ton/core/dist/boc/Builder.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Builder = exports2.beginCell = void 0;
    var BitBuilder_1 = require_BitBuilder();
    var Cell_1 = require_Cell();
    var strings_1 = require_strings();
    function beginCell2() {
      return new Builder2();
    }
    exports2.beginCell = beginCell2;
    var Builder2 = class _Builder {
      constructor() {
        this._bits = new BitBuilder_1.BitBuilder();
        this._refs = [];
      }
      /**
       * Bits written so far
       */
      get bits() {
        return this._bits.length;
      }
      /**
       * References written so far
       */
      get refs() {
        return this._refs.length;
      }
      /**
       * Available bits
       */
      get availableBits() {
        return 1023 - this.bits;
      }
      /**
       * Available references
       */
      get availableRefs() {
        return 4 - this.refs;
      }
      /**
       * Write a single bit
       * @param value bit to write, true or positive number for 1, false or zero or negative for 0
       * @returns this builder
       */
      storeBit(value) {
        this._bits.writeBit(value);
        return this;
      }
      /**
       * Write bits from BitString
       * @param src source bits
       * @returns this builder
       */
      storeBits(src) {
        this._bits.writeBits(src);
        return this;
      }
      /**
       * Store Buffer
       * @param src source buffer
       * @param bytes optional number of bytes to write
       * @returns this builder
       */
      storeBuffer(src, bytes) {
        if (bytes !== void 0 && bytes !== null) {
          if (src.length !== bytes) {
            throw Error(`Buffer length ${src.length} is not equal to ${bytes}`);
          }
        }
        this._bits.writeBuffer(src);
        return this;
      }
      /**
       * Store Maybe Buffer
       * @param src source buffer or null
       * @param bytes optional number of bytes to write
       * @returns this builder
       */
      storeMaybeBuffer(src, bytes) {
        if (src !== null) {
          this.storeBit(1);
          this.storeBuffer(src, bytes);
        } else {
          this.storeBit(0);
        }
        return this;
      }
      /**
       * Store uint value
       * @param value value as bigint or number
       * @param bits number of bits to write
       * @returns this builder
       */
      storeUint(value, bits) {
        this._bits.writeUint(value, bits);
        return this;
      }
      /**
       * Store maybe uint value
       * @param value value as bigint or number, null or undefined
       * @param bits number of bits to write
       * @returns this builder
       */
      storeMaybeUint(value, bits) {
        if (value !== null && value !== void 0) {
          this.storeBit(1);
          this.storeUint(value, bits);
        } else {
          this.storeBit(0);
        }
        return this;
      }
      /**
       * Store int value
       * @param value value as bigint or number
       * @param bits number of bits to write
       * @returns this builder
       */
      storeInt(value, bits) {
        this._bits.writeInt(value, bits);
        return this;
      }
      /**
       * Store maybe int value
       * @param value value as bigint or number, null or undefined
       * @param bits number of bits to write
       * @returns this builder
       */
      storeMaybeInt(value, bits) {
        if (value !== null && value !== void 0) {
          this.storeBit(1);
          this.storeInt(value, bits);
        } else {
          this.storeBit(0);
        }
        return this;
      }
      /**
       * Store varuint value
       * @param value value as bigint or number
       * @param bits number of bits to write to header
       * @returns this builder
       */
      storeVarUint(value, bits) {
        this._bits.writeVarUint(value, bits);
        return this;
      }
      /**
       * Store maybe varuint value
       * @param value value as bigint or number, null or undefined
       * @param bits number of bits to write to header
       * @returns this builder
       */
      storeMaybeVarUint(value, bits) {
        if (value !== null && value !== void 0) {
          this.storeBit(1);
          this.storeVarUint(value, bits);
        } else {
          this.storeBit(0);
        }
        return this;
      }
      /**
       * Store varint value
       * @param value value as bigint or number
       * @param bits number of bits to write to header
       * @returns this builder
       */
      storeVarInt(value, bits) {
        this._bits.writeVarInt(value, bits);
        return this;
      }
      /**
       * Store maybe varint value
       * @param value value as bigint or number, null or undefined
       * @param bits number of bits to write to header
       * @returns this builder
       */
      storeMaybeVarInt(value, bits) {
        if (value !== null && value !== void 0) {
          this.storeBit(1);
          this.storeVarInt(value, bits);
        } else {
          this.storeBit(0);
        }
        return this;
      }
      /**
       * Store coins value
       * @param amount amount of coins
       * @returns this builder
       */
      storeCoins(amount) {
        this._bits.writeCoins(amount);
        return this;
      }
      /**
       * Store maybe coins value
       * @param amount amount of coins, null or undefined
       * @returns this builder
       */
      storeMaybeCoins(amount) {
        if (amount !== null && amount !== void 0) {
          this.storeBit(1);
          this.storeCoins(amount);
        } else {
          this.storeBit(0);
        }
        return this;
      }
      /**
       * Store address
       * @param addres address to store
       * @returns this builder
       */
      storeAddress(address2) {
        this._bits.writeAddress(address2);
        return this;
      }
      /**
       * Store reference
       * @param cell cell or builder to store
       * @returns this builder
       */
      storeRef(cell) {
        if (this._refs.length >= 4) {
          throw new Error("Too many references");
        }
        if (cell instanceof Cell_1.Cell) {
          this._refs.push(cell);
        } else if (cell instanceof _Builder) {
          this._refs.push(cell.endCell());
        } else {
          throw new Error("Invalid argument");
        }
        return this;
      }
      /**
       * Store reference if not null
       * @param cell cell or builder to store
       * @returns this builder
       */
      storeMaybeRef(cell) {
        if (cell) {
          this.storeBit(1);
          this.storeRef(cell);
        } else {
          this.storeBit(0);
        }
        return this;
      }
      /**
       * Store slice it in this builder
       * @param src source slice
       */
      storeSlice(src) {
        let c = src.clone();
        if (c.remainingBits > 0) {
          this.storeBits(c.loadBits(c.remainingBits));
        }
        while (c.remainingRefs > 0) {
          this.storeRef(c.loadRef());
        }
        return this;
      }
      /**
       * Store slice in this builder if not null
       * @param src source slice
       */
      storeMaybeSlice(src) {
        if (src) {
          this.storeBit(1);
          this.storeSlice(src);
        } else {
          this.storeBit(0);
        }
        return this;
      }
      /**
       * Store builder
       * @param src builder to store
       * @returns this builder
       */
      storeBuilder(src) {
        return this.storeSlice(src.endCell().beginParse());
      }
      /**
       * Store builder if not null
       * @param src builder to store
       * @returns this builder
       */
      storeMaybeBuilder(src) {
        if (src) {
          this.storeBit(1);
          this.storeBuilder(src);
        } else {
          this.storeBit(0);
        }
        return this;
      }
      /**
       * Store writer or builder
       * @param writer writer or builder to store
       * @returns this builder
       */
      storeWritable(writer) {
        if (typeof writer === "object") {
          writer.writeTo(this);
        } else {
          writer(this);
        }
        return this;
      }
      /**
       * Store writer or builder if not null
       * @param writer writer or builder to store
       * @returns this builder
       */
      storeMaybeWritable(writer) {
        if (writer) {
          this.storeBit(1);
          this.storeWritable(writer);
        } else {
          this.storeBit(0);
        }
        return this;
      }
      /**
       * Store object in this builder
       * @param writer Writable or writer functuin
       */
      store(writer) {
        this.storeWritable(writer);
        return this;
      }
      /**
       * Store string tail
       * @param src source string
       * @returns this builder
       */
      storeStringTail(src) {
        (0, strings_1.writeString)(src, this);
        return this;
      }
      /**
       * Store string tail
       * @param src source string
       * @returns this builder
       */
      storeMaybeStringTail(src) {
        if (src !== null && src !== void 0) {
          this.storeBit(1);
          (0, strings_1.writeString)(src, this);
        } else {
          this.storeBit(0);
        }
        return this;
      }
      /**
       * Store string tail in ref
       * @param src source string
       * @returns this builder
       */
      storeStringRefTail(src) {
        this.storeRef(beginCell2().storeStringTail(src));
        return this;
      }
      /**
       * Store maybe string tail in ref
       * @param src source string
       * @returns this builder
       */
      storeMaybeStringRefTail(src) {
        if (src !== null && src !== void 0) {
          this.storeBit(1);
          this.storeStringRefTail(src);
        } else {
          this.storeBit(0);
        }
        return this;
      }
      /**
       * Store dictionary in this builder
       * @param dict dictionary to store
       * @returns this builder
       */
      storeDict(dict, key, value) {
        if (dict) {
          dict.store(this, key, value);
        } else {
          this.storeBit(0);
        }
        return this;
      }
      /**
       * Store dictionary in this builder directly
       * @param dict dictionary to store
       * @returns this builder
       */
      storeDictDirect(dict, key, value) {
        dict.storeDirect(this, key, value);
        return this;
      }
      /**
       * Complete cell
       * @param opts options
       * @returns cell
       */
      endCell(opts) {
        return new Cell_1.Cell({
          bits: this._bits.build(),
          refs: this._refs,
          exotic: opts?.exotic
        });
      }
      /**
       * Convert to cell
       * @returns cell
       */
      asCell() {
        return this.endCell();
      }
      /**
       * Convert to slice
       * @returns slice
       */
      asSlice() {
        return this.endCell().beginParse();
      }
    };
    exports2.Builder = Builder2;
  }
});

// node_modules/@ton/core/dist/types/SimpleLibrary.js
var require_SimpleLibrary = __commonJS({
  "node_modules/@ton/core/dist/types/SimpleLibrary.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SimpleLibraryValue = exports2.storeSimpleLibrary = exports2.loadSimpleLibrary = void 0;
    function loadSimpleLibrary(slice) {
      return {
        public: slice.loadBit(),
        root: slice.loadRef()
      };
    }
    exports2.loadSimpleLibrary = loadSimpleLibrary;
    function storeSimpleLibrary(src) {
      return (builder) => {
        builder.storeBit(src.public);
        builder.storeRef(src.root);
      };
    }
    exports2.storeSimpleLibrary = storeSimpleLibrary;
    exports2.SimpleLibraryValue = {
      serialize(src, builder) {
        storeSimpleLibrary(src)(builder);
      },
      parse(src) {
        return loadSimpleLibrary(src);
      }
    };
  }
});

// node_modules/@ton/core/dist/types/TickTock.js
var require_TickTock = __commonJS({
  "node_modules/@ton/core/dist/types/TickTock.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.storeTickTock = exports2.loadTickTock = void 0;
    function loadTickTock(slice) {
      return {
        tick: slice.loadBit(),
        tock: slice.loadBit()
      };
    }
    exports2.loadTickTock = loadTickTock;
    function storeTickTock(src) {
      return (builder) => {
        builder.storeBit(src.tick);
        builder.storeBit(src.tock);
      };
    }
    exports2.storeTickTock = storeTickTock;
  }
});

// node_modules/@ton/core/dist/types/StateInit.js
var require_StateInit = __commonJS({
  "node_modules/@ton/core/dist/types/StateInit.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.storeStateInit = exports2.loadStateInit = void 0;
    var Dictionary_1 = require_Dictionary();
    var SimpleLibrary_1 = require_SimpleLibrary();
    var TickTock_1 = require_TickTock();
    function loadStateInit(slice) {
      let splitDepth;
      if (slice.loadBit()) {
        splitDepth = slice.loadUint(5);
      }
      let special;
      if (slice.loadBit()) {
        special = (0, TickTock_1.loadTickTock)(slice);
      }
      let code = slice.loadMaybeRef();
      let data = slice.loadMaybeRef();
      let libraries = slice.loadDict(Dictionary_1.Dictionary.Keys.BigUint(256), SimpleLibrary_1.SimpleLibraryValue);
      if (libraries.size === 0) {
        libraries = void 0;
      }
      return {
        splitDepth,
        special,
        code,
        data,
        libraries
      };
    }
    exports2.loadStateInit = loadStateInit;
    function storeStateInit(src) {
      return (builder) => {
        if (src.splitDepth !== null && src.splitDepth !== void 0) {
          builder.storeBit(true);
          builder.storeUint(src.splitDepth, 5);
        } else {
          builder.storeBit(false);
        }
        if (src.special !== null && src.special !== void 0) {
          builder.storeBit(true);
          builder.store((0, TickTock_1.storeTickTock)(src.special));
        } else {
          builder.storeBit(false);
        }
        builder.storeMaybeRef(src.code);
        builder.storeMaybeRef(src.data);
        builder.storeDict(src.libraries);
      };
    }
    exports2.storeStateInit = storeStateInit;
  }
});

// node_modules/@ton/core/dist/address/contractAddress.js
var require_contractAddress = __commonJS({
  "node_modules/@ton/core/dist/address/contractAddress.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.contractAddress = void 0;
    var Builder_1 = require_Builder();
    var StateInit_1 = require_StateInit();
    var Address_1 = require_Address();
    function contractAddress2(workchain, init) {
      let hash = (0, Builder_1.beginCell)().store((0, StateInit_1.storeStateInit)(init)).endCell().hash();
      return new Address_1.Address(workchain, hash);
    }
    exports2.contractAddress = contractAddress2;
  }
});

// node_modules/@ton/core/dist/tuple/tuple.js
var require_tuple = __commonJS({
  "node_modules/@ton/core/dist/tuple/tuple.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.parseTuple = exports2.serializeTuple = void 0;
    var Builder_1 = require_Builder();
    var INT64_MIN = BigInt("-9223372036854775808");
    var INT64_MAX = BigInt("9223372036854775807");
    function serializeTupleItem(src, builder) {
      if (src.type === "null") {
        builder.storeUint(0, 8);
      } else if (src.type === "int") {
        if (src.value <= INT64_MAX && src.value >= INT64_MIN) {
          builder.storeUint(1, 8);
          builder.storeInt(src.value, 64);
        } else {
          builder.storeUint(256, 15);
          builder.storeInt(src.value, 257);
        }
      } else if (src.type === "nan") {
        builder.storeInt(767, 16);
      } else if (src.type === "cell") {
        builder.storeUint(3, 8);
        builder.storeRef(src.cell);
      } else if (src.type === "slice") {
        builder.storeUint(4, 8);
        builder.storeUint(0, 10);
        builder.storeUint(src.cell.bits.length, 10);
        builder.storeUint(0, 3);
        builder.storeUint(src.cell.refs.length, 3);
        builder.storeRef(src.cell);
      } else if (src.type === "builder") {
        builder.storeUint(5, 8);
        builder.storeRef(src.cell);
      } else if (src.type === "tuple") {
        let head = null;
        let tail = null;
        for (let i = 0; i < src.items.length; i++) {
          let s = head;
          head = tail;
          tail = s;
          if (i > 1) {
            head = (0, Builder_1.beginCell)().storeRef(tail).storeRef(head).endCell();
          }
          let bc = (0, Builder_1.beginCell)();
          serializeTupleItem(src.items[i], bc);
          tail = bc.endCell();
        }
        builder.storeUint(7, 8);
        builder.storeUint(src.items.length, 16);
        if (head) {
          builder.storeRef(head);
        }
        if (tail) {
          builder.storeRef(tail);
        }
      } else {
        throw Error("Invalid value");
      }
    }
    function parseStackItem(cs) {
      let kind = cs.loadUint(8);
      if (kind === 0) {
        return { type: "null" };
      } else if (kind === 1) {
        return { type: "int", value: cs.loadIntBig(64) };
      } else if (kind === 2) {
        if (cs.loadUint(7) === 0) {
          return { type: "int", value: cs.loadIntBig(257) };
        } else {
          cs.loadBit();
          return { type: "nan" };
        }
      } else if (kind === 3) {
        return { type: "cell", cell: cs.loadRef() };
      } else if (kind === 4) {
        let startBits = cs.loadUint(10);
        let endBits = cs.loadUint(10);
        let startRefs = cs.loadUint(3);
        let endRefs = cs.loadUint(3);
        let rs = cs.loadRef().beginParse();
        rs.skip(startBits);
        let dt = rs.loadBits(endBits - startBits);
        let builder = (0, Builder_1.beginCell)().storeBits(dt);
        if (startRefs < endRefs) {
          for (let i = 0; i < startRefs; i++) {
            rs.loadRef();
          }
          for (let i = 0; i < endRefs - startRefs; i++) {
            builder.storeRef(rs.loadRef());
          }
        }
        return { type: "slice", cell: builder.endCell() };
      } else if (kind === 5) {
        return { type: "builder", cell: cs.loadRef() };
      } else if (kind === 7) {
        let length = cs.loadUint(16);
        let items = [];
        if (length > 1) {
          let head = cs.loadRef().beginParse();
          let tail = cs.loadRef().beginParse();
          items.unshift(parseStackItem(tail));
          for (let i = 0; i < length - 2; i++) {
            let ohead = head;
            head = ohead.loadRef().beginParse();
            tail = ohead.loadRef().beginParse();
            items.unshift(parseStackItem(tail));
          }
          items.unshift(parseStackItem(head));
        } else if (length === 1) {
          items.push(parseStackItem(cs.loadRef().beginParse()));
        }
        return { type: "tuple", items };
      } else {
        throw Error("Unsupported stack item");
      }
    }
    function serializeTupleTail(src, builder) {
      if (src.length > 0) {
        let tail = (0, Builder_1.beginCell)();
        serializeTupleTail(src.slice(0, src.length - 1), tail);
        builder.storeRef(tail.endCell());
        serializeTupleItem(src[src.length - 1], builder);
      }
    }
    function serializeTuple2(src) {
      let builder = (0, Builder_1.beginCell)();
      builder.storeUint(src.length, 24);
      let r = [...src];
      serializeTupleTail(r, builder);
      return builder.endCell();
    }
    exports2.serializeTuple = serializeTuple2;
    function parseTuple2(src) {
      let res = [];
      let cs = src.beginParse();
      let size = cs.loadUint(24);
      for (let i = 0; i < size; i++) {
        let next = cs.loadRef();
        res.unshift(parseStackItem(cs));
        cs = next.beginParse();
      }
      return res;
    }
    exports2.parseTuple = parseTuple2;
  }
});

// node_modules/@ton/core/dist/tuple/reader.js
var require_reader = __commonJS({
  "node_modules/@ton/core/dist/tuple/reader.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TupleReader = void 0;
    var TupleReader2 = class _TupleReader {
      constructor(items) {
        this.items = [...items];
      }
      get remaining() {
        return this.items.length;
      }
      peek() {
        if (this.items.length === 0) {
          throw Error("EOF");
        }
        return this.items[0];
      }
      pop() {
        if (this.items.length === 0) {
          throw Error("EOF");
        }
        let res = this.items[0];
        this.items.splice(0, 1);
        return res;
      }
      skip(num = 1) {
        for (let i = 0; i < num; i++) {
          this.pop();
        }
        return this;
      }
      readBigNumber() {
        let popped = this.pop();
        if (popped.type !== "int") {
          throw Error("Not a number");
        }
        return popped.value;
      }
      readBigNumberOpt() {
        let popped = this.pop();
        if (popped.type === "null") {
          return null;
        }
        if (popped.type !== "int") {
          throw Error("Not a number");
        }
        return popped.value;
      }
      readNumber() {
        return Number(this.readBigNumber());
      }
      readNumberOpt() {
        let r = this.readBigNumberOpt();
        if (r !== null) {
          return Number(r);
        } else {
          return null;
        }
      }
      readBoolean() {
        let res = this.readNumber();
        return res === 0 ? false : true;
      }
      readBooleanOpt() {
        let res = this.readNumberOpt();
        if (res !== null) {
          return res === 0 ? false : true;
        } else {
          return null;
        }
      }
      readAddress() {
        let r = this.readCell().beginParse().loadAddress();
        if (r !== null) {
          return r;
        } else {
          throw Error("Not an address");
        }
      }
      readAddressOpt() {
        let r = this.readCellOpt();
        if (r !== null) {
          return r.beginParse().loadMaybeAddress();
        } else {
          return null;
        }
      }
      readCell() {
        let popped = this.pop();
        if (popped.type !== "cell" && popped.type !== "slice" && popped.type !== "builder") {
          throw Error("Not a cell: " + popped.type);
        }
        return popped.cell;
      }
      readCellOpt() {
        let popped = this.pop();
        if (popped.type === "null") {
          return null;
        }
        if (popped.type !== "cell" && popped.type !== "slice" && popped.type !== "builder") {
          throw Error("Not a cell");
        }
        return popped.cell;
      }
      readTuple() {
        let popped = this.pop();
        if (popped.type !== "tuple") {
          throw Error("Not a tuple");
        }
        return new _TupleReader(popped.items);
      }
      readTupleOpt() {
        let popped = this.pop();
        if (popped.type === "null") {
          return null;
        }
        if (popped.type !== "tuple") {
          throw Error("Not a tuple");
        }
        return new _TupleReader(popped.items);
      }
      static readLispList(reader) {
        const result = [];
        let tail = reader;
        while (tail !== null) {
          var head = tail.pop();
          if (tail.items.length === 0 || tail.items[0].type !== "tuple" && tail.items[0].type !== "null") {
            throw Error("Lisp list consists only from (any, tuple) elements and ends with null");
          }
          tail = tail.readTupleOpt();
          result.push(head);
        }
        return result;
      }
      readLispListDirect() {
        if (this.items.length === 1 && this.items[0].type === "null") {
          return [];
        }
        return _TupleReader.readLispList(this);
      }
      readLispList() {
        return _TupleReader.readLispList(this.readTupleOpt());
      }
      readBuffer() {
        let s = this.readCell().beginParse();
        if (s.remainingRefs !== 0) {
          throw Error("Not a buffer");
        }
        if (s.remainingBits % 8 !== 0) {
          throw Error("Not a buffer");
        }
        return s.loadBuffer(s.remainingBits / 8);
      }
      readBufferOpt() {
        let r = this.readCellOpt();
        if (r !== null) {
          let s = r.beginParse();
          if (s.remainingRefs !== 0 || s.remainingBits % 8 !== 0) {
            throw Error("Not a buffer");
          }
          return s.loadBuffer(s.remainingBits / 8);
        } else {
          return null;
        }
      }
      readString() {
        let s = this.readCell().beginParse();
        return s.loadStringTail();
      }
      readStringOpt() {
        let r = this.readCellOpt();
        if (r !== null) {
          let s = r.beginParse();
          return s.loadStringTail();
        } else {
          return null;
        }
      }
    };
    exports2.TupleReader = TupleReader2;
  }
});

// node_modules/@ton/core/dist/tuple/builder.js
var require_builder = __commonJS({
  "node_modules/@ton/core/dist/tuple/builder.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TupleBuilder = void 0;
    var Builder_1 = require_Builder();
    var Cell_1 = require_Cell();
    var Slice_1 = require_Slice();
    var TupleBuilder2 = class {
      constructor() {
        this._tuple = [];
      }
      writeNumber(v) {
        if (v === null || v === void 0) {
          this._tuple.push({ type: "null" });
        } else {
          this._tuple.push({ type: "int", value: BigInt(v) });
        }
      }
      writeBoolean(v) {
        if (v === null || v === void 0) {
          this._tuple.push({ type: "null" });
        } else {
          this._tuple.push({ type: "int", value: v ? -1n : 0n });
        }
      }
      writeBuffer(v) {
        if (v === null || v === void 0) {
          this._tuple.push({ type: "null" });
        } else {
          this._tuple.push({ type: "slice", cell: (0, Builder_1.beginCell)().storeBuffer(v).endCell() });
        }
      }
      writeString(v) {
        if (v === null || v === void 0) {
          this._tuple.push({ type: "null" });
        } else {
          this._tuple.push({ type: "slice", cell: (0, Builder_1.beginCell)().storeStringTail(v).endCell() });
        }
      }
      writeCell(v) {
        if (v === null || v === void 0) {
          this._tuple.push({ type: "null" });
        } else {
          if (v instanceof Cell_1.Cell) {
            this._tuple.push({ type: "cell", cell: v });
          } else if (v instanceof Slice_1.Slice) {
            this._tuple.push({ type: "cell", cell: v.asCell() });
          }
        }
      }
      writeSlice(v) {
        if (v === null || v === void 0) {
          this._tuple.push({ type: "null" });
        } else {
          if (v instanceof Cell_1.Cell) {
            this._tuple.push({ type: "slice", cell: v });
          } else if (v instanceof Slice_1.Slice) {
            this._tuple.push({ type: "slice", cell: v.asCell() });
          }
        }
      }
      writeBuilder(v) {
        if (v === null || v === void 0) {
          this._tuple.push({ type: "null" });
        } else {
          if (v instanceof Cell_1.Cell) {
            this._tuple.push({ type: "builder", cell: v });
          } else if (v instanceof Slice_1.Slice) {
            this._tuple.push({ type: "builder", cell: v.asCell() });
          }
        }
      }
      writeTuple(v) {
        if (v === null || v === void 0) {
          this._tuple.push({ type: "null" });
        } else {
          this._tuple.push({ type: "tuple", items: v });
        }
      }
      writeAddress(v) {
        if (v === null || v === void 0) {
          this._tuple.push({ type: "null" });
        } else {
          this._tuple.push({ type: "slice", cell: (0, Builder_1.beginCell)().storeAddress(v).endCell() });
        }
      }
      build() {
        return [...this._tuple];
      }
    };
    exports2.TupleBuilder = TupleBuilder2;
  }
});

// node_modules/@ton/core/dist/utils/convert.js
var require_convert = __commonJS({
  "node_modules/@ton/core/dist/utils/convert.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.fromNano = exports2.toNano = void 0;
    function toNano2(src) {
      if (typeof src === "bigint") {
        return src * 1000000000n;
      } else {
        if (typeof src === "number") {
          if (!Number.isFinite(src)) {
            throw Error("Invalid number");
          }
          if (Math.log10(src) <= 6) {
            src = src.toLocaleString("en", { minimumFractionDigits: 9, useGrouping: false });
          } else if (src - Math.trunc(src) === 0) {
            src = src.toLocaleString("en", { maximumFractionDigits: 0, useGrouping: false });
          } else {
            throw Error("Not enough precision for a number value. Use string value instead");
          }
        }
        let neg = false;
        while (src.startsWith("-")) {
          neg = !neg;
          src = src.slice(1);
        }
        if (src === ".") {
          throw Error("Invalid number");
        }
        let parts = src.split(".");
        if (parts.length > 2) {
          throw Error("Invalid number");
        }
        let whole = parts[0];
        let frac = parts[1];
        if (!whole) {
          whole = "0";
        }
        if (!frac) {
          frac = "0";
        }
        if (frac.length > 9) {
          throw Error("Invalid number");
        }
        while (frac.length < 9) {
          frac += "0";
        }
        let r = BigInt(whole) * 1000000000n + BigInt(frac);
        if (neg) {
          r = -r;
        }
        return r;
      }
    }
    exports2.toNano = toNano2;
    function fromNano2(src) {
      let v = BigInt(src);
      let neg = false;
      if (v < 0) {
        neg = true;
        v = -v;
      }
      let frac = v % 1000000000n;
      let facStr = frac.toString();
      while (facStr.length < 9) {
        facStr = "0" + facStr;
      }
      facStr = facStr.match(/^([0-9]*[1-9]|0)(0*)/)[1];
      let whole = v / 1000000000n;
      let wholeStr = whole.toString();
      let value = `${wholeStr}${facStr === "0" ? "" : `.${facStr}`}`;
      if (neg) {
        value = "-" + value;
      }
      return value;
    }
    exports2.fromNano = fromNano2;
  }
});

// node_modules/@ton/core/dist/types/ExtraCurrency.js
var require_ExtraCurrency = __commonJS({
  "node_modules/@ton/core/dist/types/ExtraCurrency.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.packExtraCurrencyCell = exports2.packExtraCurrencyDict = exports2.storeExtraCurrency = exports2.loadMaybeExtraCurrency = exports2.loadExtraCurrency = void 0;
    var Builder_1 = require_Builder();
    var Dictionary_1 = require_Dictionary();
    function loadExtraCurrency(data) {
      let ecDict = data instanceof Dictionary_1.Dictionary ? data : Dictionary_1.Dictionary.loadDirect(Dictionary_1.Dictionary.Keys.Uint(32), Dictionary_1.Dictionary.Values.BigVarUint(5), data);
      let ecMap = {};
      for (let [k, v] of ecDict) {
        ecMap[k] = v;
      }
      return ecMap;
    }
    exports2.loadExtraCurrency = loadExtraCurrency;
    function loadMaybeExtraCurrency(data) {
      const ecData = data.loadMaybeRef();
      return ecData === null ? ecData : loadExtraCurrency(ecData);
    }
    exports2.loadMaybeExtraCurrency = loadMaybeExtraCurrency;
    function storeExtraCurrency(extracurrency) {
      return (builder) => {
        builder.storeDict(packExtraCurrencyDict(extracurrency));
      };
    }
    exports2.storeExtraCurrency = storeExtraCurrency;
    function packExtraCurrencyDict(extracurrency) {
      const resEc = Dictionary_1.Dictionary.empty(Dictionary_1.Dictionary.Keys.Uint(32), Dictionary_1.Dictionary.Values.BigVarUint(5));
      Object.entries(extracurrency).map(([k, v]) => resEc.set(Number(k), v));
      return resEc;
    }
    exports2.packExtraCurrencyDict = packExtraCurrencyDict;
    function packExtraCurrencyCell(extracurrency) {
      return (0, Builder_1.beginCell)().storeDictDirect(packExtraCurrencyDict(extracurrency)).endCell();
    }
    exports2.packExtraCurrencyCell = packExtraCurrencyCell;
  }
});

// node_modules/@ton/core/dist/types/_helpers.js
var require_helpers = __commonJS({
  "node_modules/@ton/core/dist/types/_helpers.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.comment = exports2.external = exports2.internal = void 0;
    var Address_1 = require_Address();
    var Cell_1 = require_Cell();
    var Builder_1 = require_Builder();
    var convert_1 = require_convert();
    var ExtraCurrency_1 = require_ExtraCurrency();
    function internal2(src) {
      let bounce = true;
      if (src.bounce !== null && src.bounce !== void 0) {
        bounce = src.bounce;
      }
      let to;
      if (typeof src.to === "string") {
        to = Address_1.Address.parse(src.to);
      } else if (Address_1.Address.isAddress(src.to)) {
        to = src.to;
      } else {
        throw new Error(`Invalid address ${src.to}`);
      }
      let value;
      if (typeof src.value === "string") {
        value = (0, convert_1.toNano)(src.value);
      } else {
        value = src.value;
      }
      let other;
      if (src.extracurrency) {
        other = (0, ExtraCurrency_1.packExtraCurrencyDict)(src.extracurrency);
      }
      let body = Cell_1.Cell.EMPTY;
      if (typeof src.body === "string") {
        body = (0, Builder_1.beginCell)().storeUint(0, 32).storeStringTail(src.body).endCell();
      } else if (src.body) {
        body = src.body;
      }
      return {
        info: {
          type: "internal",
          dest: to,
          value: { coins: value, other },
          bounce,
          ihrDisabled: true,
          bounced: false,
          ihrFee: 0n,
          forwardFee: 0n,
          createdAt: 0,
          createdLt: 0n
        },
        init: src.init ?? void 0,
        body
      };
    }
    exports2.internal = internal2;
    function external(src) {
      let to;
      if (typeof src.to === "string") {
        to = Address_1.Address.parse(src.to);
      } else if (Address_1.Address.isAddress(src.to)) {
        to = src.to;
      } else {
        throw new Error(`Invalid address ${src.to}`);
      }
      return {
        info: {
          type: "external-in",
          dest: to,
          importFee: 0n
        },
        init: src.init ?? void 0,
        body: src.body || Cell_1.Cell.EMPTY
      };
    }
    exports2.external = external;
    function comment(src) {
      return (0, Builder_1.beginCell)().storeUint(0, 32).storeStringTail(src).endCell();
    }
    exports2.comment = comment;
  }
});

// node_modules/@ton/core/dist/types/AccountState.js
var require_AccountState = __commonJS({
  "node_modules/@ton/core/dist/types/AccountState.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.storeAccountState = exports2.loadAccountState = void 0;
    var StateInit_1 = require_StateInit();
    function loadAccountState(cs) {
      if (cs.loadBit()) {
        return { type: "active", state: (0, StateInit_1.loadStateInit)(cs) };
      } else if (cs.loadBit()) {
        return { type: "frozen", stateHash: cs.loadUintBig(256) };
      } else {
        return { type: "uninit" };
      }
    }
    exports2.loadAccountState = loadAccountState;
    function storeAccountState(src) {
      return (builder) => {
        if (src.type === "active") {
          builder.storeBit(true);
          builder.store((0, StateInit_1.storeStateInit)(src.state));
        } else if (src.type === "frozen") {
          builder.storeBit(false);
          builder.storeBit(true);
          builder.storeUint(src.stateHash, 256);
        } else if (src.type === "uninit") {
          builder.storeBit(false);
          builder.storeBit(false);
        }
      };
    }
    exports2.storeAccountState = storeAccountState;
  }
});

// node_modules/@ton/core/dist/types/CurrencyCollection.js
var require_CurrencyCollection = __commonJS({
  "node_modules/@ton/core/dist/types/CurrencyCollection.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.storeCurrencyCollection = exports2.loadCurrencyCollection = void 0;
    var Dictionary_1 = require_Dictionary();
    function loadCurrencyCollection(slice) {
      const coins = slice.loadCoins();
      const other = slice.loadDict(Dictionary_1.Dictionary.Keys.Uint(32), Dictionary_1.Dictionary.Values.BigVarUint(
        5
        /* log2(32) */
      ));
      if (other.size === 0) {
        return { coins };
      } else {
        return { other, coins };
      }
    }
    exports2.loadCurrencyCollection = loadCurrencyCollection;
    function storeCurrencyCollection(collection) {
      return (builder) => {
        builder.storeCoins(collection.coins);
        if (collection.other) {
          builder.storeDict(collection.other);
        } else {
          builder.storeBit(0);
        }
      };
    }
    exports2.storeCurrencyCollection = storeCurrencyCollection;
  }
});

// node_modules/@ton/core/dist/types/AccountStorage.js
var require_AccountStorage = __commonJS({
  "node_modules/@ton/core/dist/types/AccountStorage.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.storeAccountStorage = exports2.loadAccountStorage = void 0;
    var AccountState_1 = require_AccountState();
    var CurrencyCollection_1 = require_CurrencyCollection();
    function loadAccountStorage(slice) {
      return {
        lastTransLt: slice.loadUintBig(64),
        balance: (0, CurrencyCollection_1.loadCurrencyCollection)(slice),
        state: (0, AccountState_1.loadAccountState)(slice)
      };
    }
    exports2.loadAccountStorage = loadAccountStorage;
    function storeAccountStorage(src) {
      return (builder) => {
        builder.storeUint(src.lastTransLt, 64);
        builder.store((0, CurrencyCollection_1.storeCurrencyCollection)(src.balance));
        builder.store((0, AccountState_1.storeAccountState)(src.state));
      };
    }
    exports2.storeAccountStorage = storeAccountStorage;
  }
});

// node_modules/@ton/core/dist/types/StorageUsed.js
var require_StorageUsed = __commonJS({
  "node_modules/@ton/core/dist/types/StorageUsed.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.storeStorageUsed = exports2.loadStorageUsed = void 0;
    function loadStorageUsed(cs) {
      return {
        cells: cs.loadVarUintBig(3),
        bits: cs.loadVarUintBig(3),
        publicCells: cs.loadVarUintBig(3)
      };
    }
    exports2.loadStorageUsed = loadStorageUsed;
    function storeStorageUsed(src) {
      return (builder) => {
        builder.storeVarUint(src.cells, 3);
        builder.storeVarUint(src.bits, 3);
        builder.storeVarUint(src.publicCells, 3);
      };
    }
    exports2.storeStorageUsed = storeStorageUsed;
  }
});

// node_modules/@ton/core/dist/types/StorageInto.js
var require_StorageInto = __commonJS({
  "node_modules/@ton/core/dist/types/StorageInto.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.storeStorageInfo = exports2.loadStorageInfo = void 0;
    var StorageUsed_1 = require_StorageUsed();
    function loadStorageInfo(slice) {
      return {
        used: (0, StorageUsed_1.loadStorageUsed)(slice),
        lastPaid: slice.loadUint(32),
        duePayment: slice.loadMaybeCoins()
      };
    }
    exports2.loadStorageInfo = loadStorageInfo;
    function storeStorageInfo(src) {
      return (builder) => {
        builder.store((0, StorageUsed_1.storeStorageUsed)(src.used));
        builder.storeUint(src.lastPaid, 32);
        builder.storeMaybeCoins(src.duePayment);
      };
    }
    exports2.storeStorageInfo = storeStorageInfo;
  }
});

// node_modules/@ton/core/dist/types/Account.js
var require_Account = __commonJS({
  "node_modules/@ton/core/dist/types/Account.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.storeAccount = exports2.loadAccount = void 0;
    var AccountStorage_1 = require_AccountStorage();
    var StorageInto_1 = require_StorageInto();
    function loadAccount(slice) {
      return {
        addr: slice.loadAddress(),
        storageStats: (0, StorageInto_1.loadStorageInfo)(slice),
        storage: (0, AccountStorage_1.loadAccountStorage)(slice)
      };
    }
    exports2.loadAccount = loadAccount;
    function storeAccount(src) {
      return (builder) => {
        builder.storeAddress(src.addr);
        builder.store((0, StorageInto_1.storeStorageInfo)(src.storageStats));
        builder.store((0, AccountStorage_1.storeAccountStorage)(src.storage));
      };
    }
    exports2.storeAccount = storeAccount;
  }
});

// node_modules/@ton/core/dist/types/AccountStatus.js
var require_AccountStatus = __commonJS({
  "node_modules/@ton/core/dist/types/AccountStatus.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.storeAccountStatus = exports2.loadAccountStatus = void 0;
    function loadAccountStatus(slice) {
      const status = slice.loadUint(2);
      if (status === 0) {
        return "uninitialized";
      }
      if (status === 1) {
        return "frozen";
      }
      if (status === 2) {
        return "active";
      }
      if (status === 3) {
        return "non-existing";
      }
      throw Error("Invalid data");
    }
    exports2.loadAccountStatus = loadAccountStatus;
    function storeAccountStatus(src) {
      return (builder) => {
        if (src === "uninitialized") {
          builder.storeUint(0, 2);
        } else if (src === "frozen") {
          builder.storeUint(1, 2);
        } else if (src === "active") {
          builder.storeUint(2, 2);
        } else if (src === "non-existing") {
          builder.storeUint(3, 2);
        } else {
          throw Error("Invalid data");
        }
        return builder;
      };
    }
    exports2.storeAccountStatus = storeAccountStatus;
  }
});

// node_modules/@ton/core/dist/types/AccountStatusChange.js
var require_AccountStatusChange = __commonJS({
  "node_modules/@ton/core/dist/types/AccountStatusChange.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.storeAccountStatusChange = exports2.loadAccountStatusChange = void 0;
    function loadAccountStatusChange(slice) {
      if (!slice.loadBit()) {
        return "unchanged";
      }
      if (slice.loadBit()) {
        return "deleted";
      } else {
        return "frozen";
      }
    }
    exports2.loadAccountStatusChange = loadAccountStatusChange;
    function storeAccountStatusChange(src) {
      return (builder) => {
        if (src == "unchanged") {
          builder.storeBit(0);
        } else if (src === "frozen") {
          builder.storeBit(1);
          builder.storeBit(0);
        } else if (src === "deleted") {
          builder.storeBit(1);
          builder.storeBit(1);
        } else {
          throw Error("Invalid account status change");
        }
      };
    }
    exports2.storeAccountStatusChange = storeAccountStatusChange;
  }
});

// node_modules/@ton/core/dist/types/CommonMessageInfoRelaxed.js
var require_CommonMessageInfoRelaxed = __commonJS({
  "node_modules/@ton/core/dist/types/CommonMessageInfoRelaxed.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.storeCommonMessageInfoRelaxed = exports2.loadCommonMessageInfoRelaxed = void 0;
    var CurrencyCollection_1 = require_CurrencyCollection();
    function loadCommonMessageInfoRelaxed(slice) {
      if (!slice.loadBit()) {
        const ihrDisabled = slice.loadBit();
        const bounce = slice.loadBit();
        const bounced = slice.loadBit();
        const src2 = slice.loadMaybeAddress();
        const dest2 = slice.loadAddress();
        const value = (0, CurrencyCollection_1.loadCurrencyCollection)(slice);
        const ihrFee = slice.loadCoins();
        const forwardFee = slice.loadCoins();
        const createdLt2 = slice.loadUintBig(64);
        const createdAt2 = slice.loadUint(32);
        return {
          type: "internal",
          ihrDisabled,
          bounce,
          bounced,
          src: src2,
          dest: dest2,
          value,
          ihrFee,
          forwardFee,
          createdLt: createdLt2,
          createdAt: createdAt2
        };
      }
      if (!slice.loadBit()) {
        throw Error("External In message is not possible for CommonMessageInfoRelaxed");
      }
      const src = slice.loadMaybeAddress();
      const dest = slice.loadMaybeExternalAddress();
      const createdLt = slice.loadUintBig(64);
      const createdAt = slice.loadUint(32);
      return {
        type: "external-out",
        src,
        dest,
        createdLt,
        createdAt
      };
    }
    exports2.loadCommonMessageInfoRelaxed = loadCommonMessageInfoRelaxed;
    function storeCommonMessageInfoRelaxed(source) {
      return (builder) => {
        if (source.type === "internal") {
          builder.storeBit(0);
          builder.storeBit(source.ihrDisabled);
          builder.storeBit(source.bounce);
          builder.storeBit(source.bounced);
          builder.storeAddress(source.src);
          builder.storeAddress(source.dest);
          builder.store((0, CurrencyCollection_1.storeCurrencyCollection)(source.value));
          builder.storeCoins(source.ihrFee);
          builder.storeCoins(source.forwardFee);
          builder.storeUint(source.createdLt, 64);
          builder.storeUint(source.createdAt, 32);
        } else if (source.type === "external-out") {
          builder.storeBit(1);
          builder.storeBit(1);
          builder.storeAddress(source.src);
          builder.storeAddress(source.dest);
          builder.storeUint(source.createdLt, 64);
          builder.storeUint(source.createdAt, 32);
        } else {
          throw new Error("Unknown CommonMessageInfo type");
        }
      };
    }
    exports2.storeCommonMessageInfoRelaxed = storeCommonMessageInfoRelaxed;
  }
});

// node_modules/@ton/core/dist/types/MessageRelaxed.js
var require_MessageRelaxed = __commonJS({
  "node_modules/@ton/core/dist/types/MessageRelaxed.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.storeMessageRelaxed = exports2.loadMessageRelaxed = void 0;
    var Builder_1 = require_Builder();
    var CommonMessageInfoRelaxed_1 = require_CommonMessageInfoRelaxed();
    var StateInit_1 = require_StateInit();
    function loadMessageRelaxed(slice) {
      const info = (0, CommonMessageInfoRelaxed_1.loadCommonMessageInfoRelaxed)(slice);
      let init = null;
      if (slice.loadBit()) {
        if (!slice.loadBit()) {
          init = (0, StateInit_1.loadStateInit)(slice);
        } else {
          init = (0, StateInit_1.loadStateInit)(slice.loadRef().beginParse());
        }
      }
      const body = slice.loadBit() ? slice.loadRef() : slice.asCell();
      return {
        info,
        init,
        body
      };
    }
    exports2.loadMessageRelaxed = loadMessageRelaxed;
    function storeMessageRelaxed2(message, opts) {
      return (builder) => {
        builder.store((0, CommonMessageInfoRelaxed_1.storeCommonMessageInfoRelaxed)(message.info));
        if (message.init) {
          builder.storeBit(true);
          let initCell = (0, Builder_1.beginCell)().store((0, StateInit_1.storeStateInit)(message.init));
          let needRef2 = false;
          if (opts && opts.forceRef) {
            needRef2 = true;
          } else {
            if (builder.availableBits - 2 >= initCell.bits) {
              needRef2 = false;
            } else {
              needRef2 = true;
            }
          }
          if (needRef2) {
            builder.storeBit(true);
            builder.storeRef(initCell);
          } else {
            builder.storeBit(false);
            builder.storeBuilder(initCell);
          }
        } else {
          builder.storeBit(false);
        }
        let needRef = false;
        if (opts && opts.forceRef) {
          needRef = true;
        } else {
          if (builder.availableBits - 1 >= message.body.bits.length && builder.refs + message.body.refs.length <= 4 && !message.body.isExotic) {
            needRef = false;
          } else {
            needRef = true;
          }
        }
        if (needRef) {
          builder.storeBit(true);
          builder.storeRef(message.body);
        } else {
          builder.storeBit(false);
          builder.storeBuilder(message.body.asBuilder());
        }
      };
    }
    exports2.storeMessageRelaxed = storeMessageRelaxed2;
  }
});

// node_modules/@ton/core/dist/types/LibRef.js
var require_LibRef = __commonJS({
  "node_modules/@ton/core/dist/types/LibRef.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.storeLibRef = exports2.loadLibRef = void 0;
    function loadLibRef(slice) {
      const type = slice.loadUint(1);
      if (type === 0) {
        return {
          type: "hash",
          libHash: slice.loadBuffer(32)
        };
      } else {
        return {
          type: "ref",
          library: slice.loadRef()
        };
      }
    }
    exports2.loadLibRef = loadLibRef;
    function storeLibRef(src) {
      return (builder) => {
        if (src.type === "hash") {
          builder.storeUint(0, 1);
          builder.storeBuffer(src.libHash);
        } else {
          builder.storeUint(1, 1);
          builder.storeRef(src.library);
        }
      };
    }
    exports2.storeLibRef = storeLibRef;
  }
});

// node_modules/@ton/core/dist/types/OutList.js
var require_OutList = __commonJS({
  "node_modules/@ton/core/dist/types/OutList.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.loadOutList = exports2.storeOutList = exports2.loadOutAction = exports2.storeOutAction = void 0;
    var MessageRelaxed_1 = require_MessageRelaxed();
    var Builder_1 = require_Builder();
    var CurrencyCollection_1 = require_CurrencyCollection();
    var LibRef_1 = require_LibRef();
    function storeOutAction(action) {
      switch (action.type) {
        case "sendMsg":
          return storeOutActionSendMsg(action);
        case "setCode":
          return storeOutActionSetCode(action);
        case "reserve":
          return storeOutActionReserve(action);
        case "changeLibrary":
          return storeOutActionChangeLibrary(action);
        default:
          throw new Error(`Unknown action type ${action.type}`);
      }
    }
    exports2.storeOutAction = storeOutAction;
    var outActionSendMsgTag = 247711853;
    function storeOutActionSendMsg(action) {
      return (builder) => {
        builder.storeUint(outActionSendMsgTag, 32).storeUint(action.mode, 8).storeRef((0, Builder_1.beginCell)().store((0, MessageRelaxed_1.storeMessageRelaxed)(action.outMsg)).endCell());
      };
    }
    var outActionSetCodeTag = 2907562126;
    function storeOutActionSetCode(action) {
      return (builder) => {
        builder.storeUint(outActionSetCodeTag, 32).storeRef(action.newCode);
      };
    }
    var outActionReserveTag = 921090057;
    function storeOutActionReserve(action) {
      return (builder) => {
        builder.storeUint(outActionReserveTag, 32).storeUint(action.mode, 8).store((0, CurrencyCollection_1.storeCurrencyCollection)(action.currency));
      };
    }
    var outActionChangeLibraryTag = 653925844;
    function storeOutActionChangeLibrary(action) {
      return (builder) => {
        builder.storeUint(outActionChangeLibraryTag, 32).storeUint(action.mode, 7).store((0, LibRef_1.storeLibRef)(action.libRef));
      };
    }
    function loadOutAction(slice) {
      const tag = slice.loadUint(32);
      if (tag === outActionSendMsgTag) {
        const mode = slice.loadUint(8);
        const outMsg = (0, MessageRelaxed_1.loadMessageRelaxed)(slice.loadRef().beginParse());
        return {
          type: "sendMsg",
          mode,
          outMsg
        };
      }
      if (tag === outActionSetCodeTag) {
        const newCode = slice.loadRef();
        return {
          type: "setCode",
          newCode
        };
      }
      if (tag === outActionReserveTag) {
        const mode = slice.loadUint(8);
        const currency = (0, CurrencyCollection_1.loadCurrencyCollection)(slice);
        return {
          type: "reserve",
          mode,
          currency
        };
      }
      if (tag === outActionChangeLibraryTag) {
        const mode = slice.loadUint(7);
        const libRef = (0, LibRef_1.loadLibRef)(slice);
        return {
          type: "changeLibrary",
          mode,
          libRef
        };
      }
      throw new Error(`Unknown out action tag 0x${tag.toString(16)}`);
    }
    exports2.loadOutAction = loadOutAction;
    function storeOutList(actions) {
      const cell = actions.reduce((cell2, action) => (0, Builder_1.beginCell)().storeRef(cell2).store(storeOutAction(action)).endCell(), (0, Builder_1.beginCell)().endCell());
      return (builder) => {
        builder.storeSlice(cell.beginParse());
      };
    }
    exports2.storeOutList = storeOutList;
    function loadOutList(slice) {
      const actions = [];
      while (slice.remainingRefs) {
        const nextCell = slice.loadRef();
        actions.push(loadOutAction(slice));
        slice = nextCell.beginParse();
      }
      return actions.reverse();
    }
    exports2.loadOutList = loadOutList;
  }
});

// node_modules/@ton/core/dist/types/CommonMessageInfo.js
var require_CommonMessageInfo = __commonJS({
  "node_modules/@ton/core/dist/types/CommonMessageInfo.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.storeCommonMessageInfo = exports2.loadCommonMessageInfo = void 0;
    var CurrencyCollection_1 = require_CurrencyCollection();
    function loadCommonMessageInfo(slice) {
      if (!slice.loadBit()) {
        const ihrDisabled = slice.loadBit();
        const bounce = slice.loadBit();
        const bounced = slice.loadBit();
        const src2 = slice.loadAddress();
        const dest2 = slice.loadAddress();
        const value = (0, CurrencyCollection_1.loadCurrencyCollection)(slice);
        const ihrFee = slice.loadCoins();
        const forwardFee = slice.loadCoins();
        const createdLt2 = slice.loadUintBig(64);
        const createdAt2 = slice.loadUint(32);
        return {
          type: "internal",
          ihrDisabled,
          bounce,
          bounced,
          src: src2,
          dest: dest2,
          value,
          ihrFee,
          forwardFee,
          createdLt: createdLt2,
          createdAt: createdAt2
        };
      }
      if (!slice.loadBit()) {
        const src2 = slice.loadMaybeExternalAddress();
        const dest2 = slice.loadAddress();
        const importFee = slice.loadCoins();
        return {
          type: "external-in",
          src: src2,
          dest: dest2,
          importFee
        };
      }
      const src = slice.loadAddress();
      const dest = slice.loadMaybeExternalAddress();
      const createdLt = slice.loadUintBig(64);
      const createdAt = slice.loadUint(32);
      return {
        type: "external-out",
        src,
        dest,
        createdLt,
        createdAt
      };
    }
    exports2.loadCommonMessageInfo = loadCommonMessageInfo;
    function storeCommonMessageInfo(source) {
      return (builder) => {
        if (source.type === "internal") {
          builder.storeBit(0);
          builder.storeBit(source.ihrDisabled);
          builder.storeBit(source.bounce);
          builder.storeBit(source.bounced);
          builder.storeAddress(source.src);
          builder.storeAddress(source.dest);
          builder.store((0, CurrencyCollection_1.storeCurrencyCollection)(source.value));
          builder.storeCoins(source.ihrFee);
          builder.storeCoins(source.forwardFee);
          builder.storeUint(source.createdLt, 64);
          builder.storeUint(source.createdAt, 32);
        } else if (source.type === "external-in") {
          builder.storeBit(1);
          builder.storeBit(0);
          builder.storeAddress(source.src);
          builder.storeAddress(source.dest);
          builder.storeCoins(source.importFee);
        } else if (source.type === "external-out") {
          builder.storeBit(1);
          builder.storeBit(1);
          builder.storeAddress(source.src);
          builder.storeAddress(source.dest);
          builder.storeUint(source.createdLt, 64);
          builder.storeUint(source.createdAt, 32);
        } else {
          throw new Error("Unknown CommonMessageInfo type");
        }
      };
    }
    exports2.storeCommonMessageInfo = storeCommonMessageInfo;
  }
});

// node_modules/@ton/core/dist/types/ComputeSkipReason.js
var require_ComputeSkipReason = __commonJS({
  "node_modules/@ton/core/dist/types/ComputeSkipReason.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.storeComputeSkipReason = exports2.loadComputeSkipReason = void 0;
    function loadComputeSkipReason(slice) {
      let reason = slice.loadUint(2);
      if (reason === 0) {
        return "no-state";
      } else if (reason === 1) {
        return "bad-state";
      } else if (reason === 2) {
        return "no-gas";
      }
      throw new Error(`Unknown ComputeSkipReason: ${reason}`);
    }
    exports2.loadComputeSkipReason = loadComputeSkipReason;
    function storeComputeSkipReason(src) {
      return (builder) => {
        if (src === "no-state") {
          builder.storeUint(0, 2);
        } else if (src === "bad-state") {
          builder.storeUint(1, 2);
        } else if (src === "no-gas") {
          builder.storeUint(2, 2);
        } else {
          throw new Error(`Unknown ComputeSkipReason: ${src}`);
        }
      };
    }
    exports2.storeComputeSkipReason = storeComputeSkipReason;
  }
});

// node_modules/@ton/core/dist/types/DepthBalanceInfo.js
var require_DepthBalanceInfo = __commonJS({
  "node_modules/@ton/core/dist/types/DepthBalanceInfo.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.storeDepthBalanceInfo = exports2.loadDepthBalanceInfo = void 0;
    var CurrencyCollection_1 = require_CurrencyCollection();
    function loadDepthBalanceInfo(slice) {
      let splitDepth = slice.loadUint(5);
      return {
        splitDepth,
        balance: (0, CurrencyCollection_1.loadCurrencyCollection)(slice)
      };
    }
    exports2.loadDepthBalanceInfo = loadDepthBalanceInfo;
    function storeDepthBalanceInfo(src) {
      return (builder) => {
        builder.storeUint(src.splitDepth, 5);
        builder.store((0, CurrencyCollection_1.storeCurrencyCollection)(src.balance));
      };
    }
    exports2.storeDepthBalanceInfo = storeDepthBalanceInfo;
  }
});

// node_modules/@ton/core/dist/types/HashUpdate.js
var require_HashUpdate = __commonJS({
  "node_modules/@ton/core/dist/types/HashUpdate.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.storeHashUpdate = exports2.loadHashUpdate = void 0;
    function loadHashUpdate(slice) {
      if (slice.loadUint(8) !== 114) {
        throw Error("Invalid data");
      }
      const oldHash = slice.loadBuffer(32);
      const newHash = slice.loadBuffer(32);
      return { oldHash, newHash };
    }
    exports2.loadHashUpdate = loadHashUpdate;
    function storeHashUpdate(src) {
      return (builder) => {
        builder.storeUint(114, 8);
        builder.storeBuffer(src.oldHash);
        builder.storeBuffer(src.newHash);
      };
    }
    exports2.storeHashUpdate = storeHashUpdate;
  }
});

// node_modules/@ton/core/dist/types/MasterchainStateExtra.js
var require_MasterchainStateExtra = __commonJS({
  "node_modules/@ton/core/dist/types/MasterchainStateExtra.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.loadMasterchainStateExtra = void 0;
    var Dictionary_1 = require_Dictionary();
    var CurrencyCollection_1 = require_CurrencyCollection();
    function loadMasterchainStateExtra(cs) {
      if (cs.loadUint(16) !== 52262) {
        throw Error("Invalid data");
      }
      if (cs.loadBit()) {
        cs.loadRef();
      }
      let configAddress = cs.loadUintBig(256);
      let config = Dictionary_1.Dictionary.load(Dictionary_1.Dictionary.Keys.Int(32), Dictionary_1.Dictionary.Values.Cell(), cs);
      const globalBalance = (0, CurrencyCollection_1.loadCurrencyCollection)(cs);
      return {
        config,
        configAddress,
        globalBalance
      };
    }
    exports2.loadMasterchainStateExtra = loadMasterchainStateExtra;
  }
});

// node_modules/@ton/core/dist/types/Message.js
var require_Message = __commonJS({
  "node_modules/@ton/core/dist/types/Message.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MessageValue = exports2.storeMessage = exports2.loadMessage = void 0;
    var Builder_1 = require_Builder();
    var CommonMessageInfo_1 = require_CommonMessageInfo();
    var StateInit_1 = require_StateInit();
    function loadMessage(slice) {
      const info = (0, CommonMessageInfo_1.loadCommonMessageInfo)(slice);
      let init = null;
      if (slice.loadBit()) {
        if (!slice.loadBit()) {
          init = (0, StateInit_1.loadStateInit)(slice);
        } else {
          init = (0, StateInit_1.loadStateInit)(slice.loadRef().beginParse());
        }
      }
      const body = slice.loadBit() ? slice.loadRef() : slice.asCell();
      return {
        info,
        init,
        body
      };
    }
    exports2.loadMessage = loadMessage;
    function storeMessage2(message, opts) {
      return (builder) => {
        builder.store((0, CommonMessageInfo_1.storeCommonMessageInfo)(message.info));
        if (message.init) {
          builder.storeBit(true);
          let initCell = (0, Builder_1.beginCell)().store((0, StateInit_1.storeStateInit)(message.init));
          let needRef2 = false;
          if (opts && opts.forceRef) {
            needRef2 = true;
          } else {
            needRef2 = builder.availableBits - 2 < initCell.bits + message.body.bits.length;
          }
          if (needRef2) {
            builder.storeBit(true);
            builder.storeRef(initCell);
          } else {
            builder.storeBit(false);
            builder.storeBuilder(initCell);
          }
        } else {
          builder.storeBit(false);
        }
        let needRef = false;
        if (opts && opts.forceRef) {
          needRef = true;
        } else {
          needRef = builder.availableBits - 1 < message.body.bits.length || builder.refs + message.body.refs.length > 4;
        }
        if (needRef) {
          builder.storeBit(true);
          builder.storeRef(message.body);
        } else {
          builder.storeBit(false);
          builder.storeBuilder(message.body.asBuilder());
        }
      };
    }
    exports2.storeMessage = storeMessage2;
    exports2.MessageValue = {
      serialize(src, builder) {
        builder.storeRef((0, Builder_1.beginCell)().store(storeMessage2(src)));
      },
      parse(slice) {
        return loadMessage(slice.loadRef().beginParse());
      }
    };
  }
});

// node_modules/@ton/core/dist/types/SendMode.js
var require_SendMode = __commonJS({
  "node_modules/@ton/core/dist/types/SendMode.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SendMode = void 0;
    var SendMode2;
    (function(SendMode3) {
      SendMode3[SendMode3["CARRY_ALL_REMAINING_BALANCE"] = 128] = "CARRY_ALL_REMAINING_BALANCE";
      SendMode3[SendMode3["CARRY_ALL_REMAINING_INCOMING_VALUE"] = 64] = "CARRY_ALL_REMAINING_INCOMING_VALUE";
      SendMode3[SendMode3["DESTROY_ACCOUNT_IF_ZERO"] = 32] = "DESTROY_ACCOUNT_IF_ZERO";
      SendMode3[SendMode3["PAY_GAS_SEPARATELY"] = 1] = "PAY_GAS_SEPARATELY";
      SendMode3[SendMode3["IGNORE_ERRORS"] = 2] = "IGNORE_ERRORS";
      SendMode3[SendMode3["NONE"] = 0] = "NONE";
    })(SendMode2 || (exports2.SendMode = SendMode2 = {}));
  }
});

// node_modules/@ton/core/dist/types/ReserveMode.js
var require_ReserveMode = __commonJS({
  "node_modules/@ton/core/dist/types/ReserveMode.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ReserveMode = void 0;
    var ReserveMode;
    (function(ReserveMode2) {
      ReserveMode2[ReserveMode2["THIS_AMOUNT"] = 0] = "THIS_AMOUNT";
      ReserveMode2[ReserveMode2["LEAVE_THIS_AMOUNT"] = 1] = "LEAVE_THIS_AMOUNT";
      ReserveMode2[ReserveMode2["AT_MOST_THIS_AMOUNT"] = 2] = "AT_MOST_THIS_AMOUNT";
      ReserveMode2[ReserveMode2["LEAVE_MAX_THIS_AMOUNT"] = 3] = "LEAVE_MAX_THIS_AMOUNT";
      ReserveMode2[ReserveMode2["BEFORE_BALANCE_PLUS_THIS_AMOUNT"] = 4] = "BEFORE_BALANCE_PLUS_THIS_AMOUNT";
      ReserveMode2[ReserveMode2["LEAVE_BBALANCE_PLUS_THIS_AMOUNT"] = 5] = "LEAVE_BBALANCE_PLUS_THIS_AMOUNT";
      ReserveMode2[ReserveMode2["BEFORE_BALANCE_MINUS_THIS_AMOUNT"] = 12] = "BEFORE_BALANCE_MINUS_THIS_AMOUNT";
      ReserveMode2[ReserveMode2["LEAVE_BEFORE_BALANCE_MINUS_THIS_AMOUNT"] = 13] = "LEAVE_BEFORE_BALANCE_MINUS_THIS_AMOUNT";
    })(ReserveMode || (exports2.ReserveMode = ReserveMode = {}));
  }
});

// node_modules/@ton/core/dist/types/ShardAccount.js
var require_ShardAccount = __commonJS({
  "node_modules/@ton/core/dist/types/ShardAccount.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.storeShardAccount = exports2.loadShardAccount = void 0;
    var Builder_1 = require_Builder();
    var Account_1 = require_Account();
    function loadShardAccount2(slice) {
      let accountRef = slice.loadRef();
      let account = void 0;
      if (!accountRef.isExotic) {
        let accountSlice = accountRef.beginParse();
        if (accountSlice.loadBit()) {
          account = (0, Account_1.loadAccount)(accountSlice);
        }
      }
      return {
        account,
        lastTransactionHash: slice.loadUintBig(256),
        lastTransactionLt: slice.loadUintBig(64)
      };
    }
    exports2.loadShardAccount = loadShardAccount2;
    function storeShardAccount2(src) {
      return (builder) => {
        if (src.account) {
          builder.storeRef((0, Builder_1.beginCell)().storeBit(true).store((0, Account_1.storeAccount)(src.account)));
        } else {
          builder.storeRef((0, Builder_1.beginCell)().storeBit(false));
        }
        builder.storeUint(src.lastTransactionHash, 256);
        builder.storeUint(src.lastTransactionLt, 64);
      };
    }
    exports2.storeShardAccount = storeShardAccount2;
  }
});

// node_modules/@ton/core/dist/types/ShardAccounts.js
var require_ShardAccounts = __commonJS({
  "node_modules/@ton/core/dist/types/ShardAccounts.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.storeShardAccounts = exports2.loadShardAccounts = exports2.ShardAccountRefValue = void 0;
    var Dictionary_1 = require_Dictionary();
    var DepthBalanceInfo_1 = require_DepthBalanceInfo();
    var ShardAccount_1 = require_ShardAccount();
    exports2.ShardAccountRefValue = {
      parse: (cs) => {
        let depthBalanceInfo = (0, DepthBalanceInfo_1.loadDepthBalanceInfo)(cs);
        let shardAccount = (0, ShardAccount_1.loadShardAccount)(cs);
        return {
          depthBalanceInfo,
          shardAccount
        };
      },
      serialize(src, builder) {
        builder.store((0, DepthBalanceInfo_1.storeDepthBalanceInfo)(src.depthBalanceInfo));
        builder.store((0, ShardAccount_1.storeShardAccount)(src.shardAccount));
      }
    };
    function loadShardAccounts(cs) {
      return Dictionary_1.Dictionary.load(Dictionary_1.Dictionary.Keys.BigUint(256), exports2.ShardAccountRefValue, cs);
    }
    exports2.loadShardAccounts = loadShardAccounts;
    function storeShardAccounts(src) {
      return (Builder2) => {
        Builder2.storeDict(src);
      };
    }
    exports2.storeShardAccounts = storeShardAccounts;
  }
});

// node_modules/@ton/core/dist/types/ShardIdent.js
var require_ShardIdent = __commonJS({
  "node_modules/@ton/core/dist/types/ShardIdent.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.storeShardIdent = exports2.loadShardIdent = void 0;
    function loadShardIdent(slice) {
      if (slice.loadUint(2) !== 0) {
        throw Error("Invalid data");
      }
      return {
        shardPrefixBits: slice.loadUint(6),
        workchainId: slice.loadInt(32),
        shardPrefix: slice.loadUintBig(64)
      };
    }
    exports2.loadShardIdent = loadShardIdent;
    function storeShardIdent(src) {
      return (builder) => {
        builder.storeUint(0, 2);
        builder.storeUint(src.shardPrefixBits, 6);
        builder.storeInt(src.workchainId, 32);
        builder.storeUint(src.shardPrefix, 64);
      };
    }
    exports2.storeShardIdent = storeShardIdent;
  }
});

// node_modules/@ton/core/dist/types/ShardStateUnsplit.js
var require_ShardStateUnsplit = __commonJS({
  "node_modules/@ton/core/dist/types/ShardStateUnsplit.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.loadShardStateUnsplit = void 0;
    var MasterchainStateExtra_1 = require_MasterchainStateExtra();
    var ShardAccounts_1 = require_ShardAccounts();
    var ShardIdent_1 = require_ShardIdent();
    function loadShardStateUnsplit(cs) {
      if (cs.loadUint(32) !== 2418257890) {
        throw Error("Invalid data");
      }
      let globalId = cs.loadInt(32);
      let shardId = (0, ShardIdent_1.loadShardIdent)(cs);
      let seqno = cs.loadUint(32);
      let vertSeqNo = cs.loadUint(32);
      let genUtime = cs.loadUint(32);
      let genLt = cs.loadUintBig(64);
      let minRefMcSeqno = cs.loadUint(32);
      cs.loadRef();
      let beforeSplit = cs.loadBit();
      let shardAccountsRef = cs.loadRef();
      let accounts = void 0;
      if (!shardAccountsRef.isExotic) {
        accounts = (0, ShardAccounts_1.loadShardAccounts)(shardAccountsRef.beginParse());
      }
      cs.loadRef();
      let mcStateExtra = cs.loadBit();
      let extras = null;
      if (mcStateExtra) {
        let cell = cs.loadRef();
        if (!cell.isExotic) {
          extras = (0, MasterchainStateExtra_1.loadMasterchainStateExtra)(cell.beginParse());
        }
      }
      ;
      return {
        globalId,
        shardId,
        seqno,
        vertSeqNo,
        genUtime,
        genLt,
        minRefMcSeqno,
        beforeSplit,
        accounts,
        extras
      };
    }
    exports2.loadShardStateUnsplit = loadShardStateUnsplit;
  }
});

// node_modules/@ton/core/dist/types/SplitMergeInfo.js
var require_SplitMergeInfo = __commonJS({
  "node_modules/@ton/core/dist/types/SplitMergeInfo.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.storeSplitMergeInfo = exports2.loadSplitMergeInfo = void 0;
    function loadSplitMergeInfo(slice) {
      let currentShardPrefixLength = slice.loadUint(6);
      let accountSplitDepth = slice.loadUint(6);
      let thisAddress = slice.loadUintBig(256);
      let siblingAddress = slice.loadUintBig(256);
      return {
        currentShardPrefixLength,
        accountSplitDepth,
        thisAddress,
        siblingAddress
      };
    }
    exports2.loadSplitMergeInfo = loadSplitMergeInfo;
    function storeSplitMergeInfo(src) {
      return (builder) => {
        builder.storeUint(src.currentShardPrefixLength, 6);
        builder.storeUint(src.accountSplitDepth, 6);
        builder.storeUint(src.thisAddress, 256);
        builder.storeUint(src.siblingAddress, 256);
      };
    }
    exports2.storeSplitMergeInfo = storeSplitMergeInfo;
  }
});

// node_modules/@ton/core/dist/types/StorageUsedShort.js
var require_StorageUsedShort = __commonJS({
  "node_modules/@ton/core/dist/types/StorageUsedShort.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.storeStorageUsedShort = exports2.loadStorageUsedShort = void 0;
    function loadStorageUsedShort(slice) {
      let cells = slice.loadVarUintBig(3);
      let bits = slice.loadVarUintBig(3);
      return {
        cells,
        bits
      };
    }
    exports2.loadStorageUsedShort = loadStorageUsedShort;
    function storeStorageUsedShort(src) {
      return (builder) => {
        builder.storeVarUint(src.cells, 3);
        builder.storeVarUint(src.bits, 3);
      };
    }
    exports2.storeStorageUsedShort = storeStorageUsedShort;
  }
});

// node_modules/@ton/core/dist/types/TransactionActionPhase.js
var require_TransactionActionPhase = __commonJS({
  "node_modules/@ton/core/dist/types/TransactionActionPhase.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.storeTransactionActionPhase = exports2.loadTransactionActionPhase = void 0;
    var AccountStatusChange_1 = require_AccountStatusChange();
    var StorageUsedShort_1 = require_StorageUsedShort();
    function loadTransactionActionPhase(slice) {
      let success = slice.loadBit();
      let valid = slice.loadBit();
      let noFunds = slice.loadBit();
      let statusChange = (0, AccountStatusChange_1.loadAccountStatusChange)(slice);
      let totalFwdFees = slice.loadBit() ? slice.loadCoins() : void 0;
      let totalActionFees = slice.loadBit() ? slice.loadCoins() : void 0;
      let resultCode = slice.loadInt(32);
      let resultArg = slice.loadBit() ? slice.loadInt(32) : void 0;
      let totalActions = slice.loadUint(16);
      let specActions = slice.loadUint(16);
      let skippedActions = slice.loadUint(16);
      let messagesCreated = slice.loadUint(16);
      let actionListHash = slice.loadUintBig(256);
      let totalMessageSize = (0, StorageUsedShort_1.loadStorageUsedShort)(slice);
      return {
        success,
        valid,
        noFunds,
        statusChange,
        totalFwdFees,
        totalActionFees,
        resultCode,
        resultArg,
        totalActions,
        specActions,
        skippedActions,
        messagesCreated,
        actionListHash,
        totalMessageSize
      };
    }
    exports2.loadTransactionActionPhase = loadTransactionActionPhase;
    function storeTransactionActionPhase(src) {
      return (builder) => {
        builder.storeBit(src.success);
        builder.storeBit(src.valid);
        builder.storeBit(src.noFunds);
        builder.store((0, AccountStatusChange_1.storeAccountStatusChange)(src.statusChange));
        builder.storeMaybeCoins(src.totalFwdFees);
        builder.storeMaybeCoins(src.totalActionFees);
        builder.storeInt(src.resultCode, 32);
        builder.storeMaybeInt(src.resultArg, 32);
        builder.storeUint(src.totalActions, 16);
        builder.storeUint(src.specActions, 16);
        builder.storeUint(src.skippedActions, 16);
        builder.storeUint(src.messagesCreated, 16);
        builder.storeUint(src.actionListHash, 256);
        builder.store((0, StorageUsedShort_1.storeStorageUsedShort)(src.totalMessageSize));
      };
    }
    exports2.storeTransactionActionPhase = storeTransactionActionPhase;
  }
});

// node_modules/@ton/core/dist/types/TransactionBouncePhase.js
var require_TransactionBouncePhase = __commonJS({
  "node_modules/@ton/core/dist/types/TransactionBouncePhase.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.storeTransactionBouncePhase = exports2.loadTransactionBouncePhase = void 0;
    var StorageUsedShort_1 = require_StorageUsedShort();
    function loadTransactionBouncePhase(slice) {
      if (slice.loadBit()) {
        let messageSize = (0, StorageUsedShort_1.loadStorageUsedShort)(slice);
        let messageFees = slice.loadCoins();
        let forwardFees = slice.loadCoins();
        return {
          type: "ok",
          messageSize,
          messageFees,
          forwardFees
        };
      }
      if (slice.loadBit()) {
        let messageSize = (0, StorageUsedShort_1.loadStorageUsedShort)(slice);
        let requiredForwardFees = slice.loadCoins();
        return {
          type: "no-funds",
          messageSize,
          requiredForwardFees
        };
      }
      return {
        type: "negative-funds"
      };
    }
    exports2.loadTransactionBouncePhase = loadTransactionBouncePhase;
    function storeTransactionBouncePhase(src) {
      return (builder) => {
        if (src.type === "ok") {
          builder.storeBit(true);
          builder.store((0, StorageUsedShort_1.storeStorageUsedShort)(src.messageSize));
          builder.storeCoins(src.messageFees);
          builder.storeCoins(src.forwardFees);
        } else if (src.type === "negative-funds") {
          builder.storeBit(false);
          builder.storeBit(false);
        } else if (src.type === "no-funds") {
          builder.storeBit(false);
          builder.storeBit(true);
          builder.store((0, StorageUsedShort_1.storeStorageUsedShort)(src.messageSize));
          builder.storeCoins(src.requiredForwardFees);
        } else {
          throw new Error("Invalid TransactionBouncePhase type");
        }
      };
    }
    exports2.storeTransactionBouncePhase = storeTransactionBouncePhase;
  }
});

// node_modules/@ton/core/dist/types/TransactionComputePhase.js
var require_TransactionComputePhase = __commonJS({
  "node_modules/@ton/core/dist/types/TransactionComputePhase.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.storeTransactionComputePhase = exports2.loadTransactionComputePhase = void 0;
    var Builder_1 = require_Builder();
    var ComputeSkipReason_1 = require_ComputeSkipReason();
    function loadTransactionComputePhase(slice) {
      if (!slice.loadBit()) {
        let reason = (0, ComputeSkipReason_1.loadComputeSkipReason)(slice);
        return {
          type: "skipped",
          reason
        };
      }
      let success = slice.loadBit();
      let messageStateUsed = slice.loadBit();
      let accountActivated = slice.loadBit();
      let gasFees = slice.loadCoins();
      const vmState = slice.loadRef().beginParse();
      let gasUsed = vmState.loadVarUintBig(3);
      let gasLimit = vmState.loadVarUintBig(3);
      let gasCredit = vmState.loadBit() ? vmState.loadVarUintBig(2) : void 0;
      let mode = vmState.loadUint(8);
      let exitCode = vmState.loadInt(32);
      let exitArg = vmState.loadBit() ? vmState.loadInt(32) : void 0;
      let vmSteps = vmState.loadUint(32);
      let vmInitStateHash = vmState.loadUintBig(256);
      let vmFinalStateHash = vmState.loadUintBig(256);
      return {
        type: "vm",
        success,
        messageStateUsed,
        accountActivated,
        gasFees,
        gasUsed,
        gasLimit,
        gasCredit,
        mode,
        exitCode,
        exitArg,
        vmSteps,
        vmInitStateHash,
        vmFinalStateHash
      };
    }
    exports2.loadTransactionComputePhase = loadTransactionComputePhase;
    function storeTransactionComputePhase(src) {
      return (builder) => {
        if (src.type === "skipped") {
          builder.storeBit(0);
          builder.store((0, ComputeSkipReason_1.storeComputeSkipReason)(src.reason));
          return;
        }
        builder.storeBit(1);
        builder.storeBit(src.success);
        builder.storeBit(src.messageStateUsed);
        builder.storeBit(src.accountActivated);
        builder.storeCoins(src.gasFees);
        builder.storeRef((0, Builder_1.beginCell)().storeVarUint(src.gasUsed, 3).storeVarUint(src.gasLimit, 3).store((b) => src.gasCredit !== void 0 && src.gasCredit !== null ? b.storeBit(1).storeVarUint(src.gasCredit, 2) : b.storeBit(0)).storeUint(src.mode, 8).storeInt(src.exitCode, 32).store((b) => src.exitArg !== void 0 && src.exitArg !== null ? b.storeBit(1).storeInt(src.exitArg, 32) : b.storeBit(0)).storeUint(src.vmSteps, 32).storeUint(src.vmInitStateHash, 256).storeUint(src.vmFinalStateHash, 256).endCell());
      };
    }
    exports2.storeTransactionComputePhase = storeTransactionComputePhase;
  }
});

// node_modules/@ton/core/dist/types/TransactionCreditPhase.js
var require_TransactionCreditPhase = __commonJS({
  "node_modules/@ton/core/dist/types/TransactionCreditPhase.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.storeTransactionCreditPhase = exports2.loadTransactionCreditPhase = void 0;
    var CurrencyCollection_1 = require_CurrencyCollection();
    function loadTransactionCreditPhase(slice) {
      const dueFeesColelcted = slice.loadBit() ? slice.loadCoins() : void 0;
      const credit = (0, CurrencyCollection_1.loadCurrencyCollection)(slice);
      return {
        dueFeesColelcted,
        credit
      };
    }
    exports2.loadTransactionCreditPhase = loadTransactionCreditPhase;
    function storeTransactionCreditPhase(src) {
      return (builder) => {
        if (src.dueFeesColelcted === null || src.dueFeesColelcted === void 0) {
          builder.storeBit(false);
        } else {
          builder.storeBit(true);
          builder.storeCoins(src.dueFeesColelcted);
        }
        builder.store((0, CurrencyCollection_1.storeCurrencyCollection)(src.credit));
      };
    }
    exports2.storeTransactionCreditPhase = storeTransactionCreditPhase;
  }
});

// node_modules/@ton/core/dist/types/TransactionStoragePhase.js
var require_TransactionStoragePhase = __commonJS({
  "node_modules/@ton/core/dist/types/TransactionStoragePhase.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.storeTransactionsStoragePhase = exports2.loadTransactionStoragePhase = void 0;
    var AccountStatusChange_1 = require_AccountStatusChange();
    function loadTransactionStoragePhase(slice) {
      const storageFeesCollected = slice.loadCoins();
      let storageFeesDue = void 0;
      if (slice.loadBit()) {
        storageFeesDue = slice.loadCoins();
      }
      const statusChange = (0, AccountStatusChange_1.loadAccountStatusChange)(slice);
      return {
        storageFeesCollected,
        storageFeesDue,
        statusChange
      };
    }
    exports2.loadTransactionStoragePhase = loadTransactionStoragePhase;
    function storeTransactionsStoragePhase(src) {
      return (builder) => {
        builder.storeCoins(src.storageFeesCollected);
        if (src.storageFeesDue === null || src.storageFeesDue === void 0) {
          builder.storeBit(false);
        } else {
          builder.storeBit(true);
          builder.storeCoins(src.storageFeesDue);
        }
        builder.store((0, AccountStatusChange_1.storeAccountStatusChange)(src.statusChange));
      };
    }
    exports2.storeTransactionsStoragePhase = storeTransactionsStoragePhase;
  }
});

// node_modules/@ton/core/dist/types/TransactionDescription.js
var require_TransactionDescription = __commonJS({
  "node_modules/@ton/core/dist/types/TransactionDescription.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.storeTransactionDescription = exports2.loadTransactionDescription = void 0;
    var Builder_1 = require_Builder();
    var SplitMergeInfo_1 = require_SplitMergeInfo();
    var Transaction_1 = require_Transaction();
    var TransactionActionPhase_1 = require_TransactionActionPhase();
    var TransactionBouncePhase_1 = require_TransactionBouncePhase();
    var TransactionComputePhase_1 = require_TransactionComputePhase();
    var TransactionCreditPhase_1 = require_TransactionCreditPhase();
    var TransactionStoragePhase_1 = require_TransactionStoragePhase();
    function loadTransactionDescription(slice) {
      let type = slice.loadUint(4);
      if (type === 0) {
        const creditFirst = slice.loadBit();
        let storagePhase = void 0;
        if (slice.loadBit()) {
          storagePhase = (0, TransactionStoragePhase_1.loadTransactionStoragePhase)(slice);
        }
        let creditPhase = void 0;
        if (slice.loadBit()) {
          creditPhase = (0, TransactionCreditPhase_1.loadTransactionCreditPhase)(slice);
        }
        let computePhase = (0, TransactionComputePhase_1.loadTransactionComputePhase)(slice);
        let actionPhase = void 0;
        if (slice.loadBit()) {
          actionPhase = (0, TransactionActionPhase_1.loadTransactionActionPhase)(slice.loadRef().beginParse());
        }
        let aborted = slice.loadBit();
        let bouncePhase = void 0;
        if (slice.loadBit()) {
          bouncePhase = (0, TransactionBouncePhase_1.loadTransactionBouncePhase)(slice);
        }
        const destroyed = slice.loadBit();
        return {
          type: "generic",
          creditFirst,
          storagePhase,
          creditPhase,
          computePhase,
          actionPhase,
          bouncePhase,
          aborted,
          destroyed
        };
      }
      if (type === 1) {
        return {
          type: "storage",
          storagePhase: (0, TransactionStoragePhase_1.loadTransactionStoragePhase)(slice)
        };
      }
      if (type === 2 || type === 3) {
        const isTock = type === 3;
        let storagePhase = (0, TransactionStoragePhase_1.loadTransactionStoragePhase)(slice);
        let computePhase = (0, TransactionComputePhase_1.loadTransactionComputePhase)(slice);
        let actionPhase = void 0;
        if (slice.loadBit()) {
          actionPhase = (0, TransactionActionPhase_1.loadTransactionActionPhase)(slice.loadRef().beginParse());
        }
        const aborted = slice.loadBit();
        const destroyed = slice.loadBit();
        return {
          type: "tick-tock",
          isTock,
          storagePhase,
          computePhase,
          actionPhase,
          aborted,
          destroyed
        };
      }
      if (type === 4) {
        let splitInfo = (0, SplitMergeInfo_1.loadSplitMergeInfo)(slice);
        let storagePhase = void 0;
        if (slice.loadBit()) {
          storagePhase = (0, TransactionStoragePhase_1.loadTransactionStoragePhase)(slice);
        }
        let computePhase = (0, TransactionComputePhase_1.loadTransactionComputePhase)(slice);
        let actionPhase = void 0;
        if (slice.loadBit()) {
          actionPhase = (0, TransactionActionPhase_1.loadTransactionActionPhase)(slice.loadRef().beginParse());
        }
        const aborted = slice.loadBit();
        const destroyed = slice.loadBit();
        return {
          type: "split-prepare",
          splitInfo,
          storagePhase,
          computePhase,
          actionPhase,
          aborted,
          destroyed
        };
      }
      if (type === 5) {
        let splitInfo = (0, SplitMergeInfo_1.loadSplitMergeInfo)(slice);
        let prepareTransaction = (0, Transaction_1.loadTransaction)(slice.loadRef().beginParse());
        const installed = slice.loadBit();
        return {
          type: "split-install",
          splitInfo,
          prepareTransaction,
          installed
        };
      }
      throw Error(`Unsupported transaction description type ${type}`);
    }
    exports2.loadTransactionDescription = loadTransactionDescription;
    function storeTransactionDescription(src) {
      return (builder) => {
        if (src.type === "generic") {
          builder.storeUint(0, 4);
          builder.storeBit(src.creditFirst);
          if (src.storagePhase) {
            builder.storeBit(true);
            builder.store((0, TransactionStoragePhase_1.storeTransactionsStoragePhase)(src.storagePhase));
          } else {
            builder.storeBit(false);
          }
          if (src.creditPhase) {
            builder.storeBit(true);
            builder.store((0, TransactionCreditPhase_1.storeTransactionCreditPhase)(src.creditPhase));
          } else {
            builder.storeBit(false);
          }
          builder.store((0, TransactionComputePhase_1.storeTransactionComputePhase)(src.computePhase));
          if (src.actionPhase) {
            builder.storeBit(true);
            builder.storeRef((0, Builder_1.beginCell)().store((0, TransactionActionPhase_1.storeTransactionActionPhase)(src.actionPhase)));
          } else {
            builder.storeBit(false);
          }
          builder.storeBit(src.aborted);
          if (src.bouncePhase) {
            builder.storeBit(true);
            builder.store((0, TransactionBouncePhase_1.storeTransactionBouncePhase)(src.bouncePhase));
          } else {
            builder.storeBit(false);
          }
          builder.storeBit(src.destroyed);
        } else if (src.type === "storage") {
          builder.storeUint(1, 4);
          builder.store((0, TransactionStoragePhase_1.storeTransactionsStoragePhase)(src.storagePhase));
        } else if (src.type === "tick-tock") {
          builder.storeUint(src.isTock ? 3 : 2, 4);
          builder.store((0, TransactionStoragePhase_1.storeTransactionsStoragePhase)(src.storagePhase));
          builder.store((0, TransactionComputePhase_1.storeTransactionComputePhase)(src.computePhase));
          if (src.actionPhase) {
            builder.storeBit(true);
            builder.storeRef((0, Builder_1.beginCell)().store((0, TransactionActionPhase_1.storeTransactionActionPhase)(src.actionPhase)));
          } else {
            builder.storeBit(false);
          }
          builder.storeBit(src.aborted);
          builder.storeBit(src.destroyed);
        } else if (src.type === "split-prepare") {
          builder.storeUint(4, 4);
          builder.store((0, SplitMergeInfo_1.storeSplitMergeInfo)(src.splitInfo));
          if (src.storagePhase) {
            builder.storeBit(true);
            builder.store((0, TransactionStoragePhase_1.storeTransactionsStoragePhase)(src.storagePhase));
          } else {
            builder.storeBit(false);
          }
          builder.store((0, TransactionComputePhase_1.storeTransactionComputePhase)(src.computePhase));
          if (src.actionPhase) {
            builder.storeBit(true);
            builder.store((0, TransactionActionPhase_1.storeTransactionActionPhase)(src.actionPhase));
          } else {
            builder.storeBit(false);
          }
          builder.storeBit(src.aborted);
          builder.storeBit(src.destroyed);
        } else if (src.type === "split-install") {
          builder.storeUint(5, 4);
          builder.store((0, SplitMergeInfo_1.storeSplitMergeInfo)(src.splitInfo));
          builder.storeRef((0, Builder_1.beginCell)().store((0, Transaction_1.storeTransaction)(src.prepareTransaction)));
          builder.storeBit(src.installed);
        } else {
          throw Error(`Unsupported transaction description type ${src.type}`);
        }
      };
    }
    exports2.storeTransactionDescription = storeTransactionDescription;
  }
});

// node_modules/@ton/core/dist/types/Transaction.js
var require_Transaction = __commonJS({
  "node_modules/@ton/core/dist/types/Transaction.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.storeTransaction = exports2.loadTransaction = void 0;
    var Builder_1 = require_Builder();
    var Dictionary_1 = require_Dictionary();
    var AccountStatus_1 = require_AccountStatus();
    var CurrencyCollection_1 = require_CurrencyCollection();
    var HashUpdate_1 = require_HashUpdate();
    var Message_1 = require_Message();
    var TransactionDescription_1 = require_TransactionDescription();
    function loadTransaction2(slice) {
      let raw = slice.asCell();
      if (slice.loadUint(4) !== 7) {
        throw Error("Invalid data");
      }
      let address2 = slice.loadUintBig(256);
      let lt = slice.loadUintBig(64);
      let prevTransactionHash = slice.loadUintBig(256);
      let prevTransactionLt = slice.loadUintBig(64);
      let now = slice.loadUint(32);
      let outMessagesCount = slice.loadUint(15);
      let oldStatus = (0, AccountStatus_1.loadAccountStatus)(slice);
      let endStatus = (0, AccountStatus_1.loadAccountStatus)(slice);
      let msgRef = slice.loadRef();
      let msgSlice = msgRef.beginParse();
      let inMessage = msgSlice.loadBit() ? (0, Message_1.loadMessage)(msgSlice.loadRef().beginParse()) : void 0;
      let outMessages = msgSlice.loadDict(Dictionary_1.Dictionary.Keys.Uint(15), Message_1.MessageValue);
      msgSlice.endParse();
      let totalFees = (0, CurrencyCollection_1.loadCurrencyCollection)(slice);
      let stateUpdate = (0, HashUpdate_1.loadHashUpdate)(slice.loadRef().beginParse());
      let description = (0, TransactionDescription_1.loadTransactionDescription)(slice.loadRef().beginParse());
      return {
        address: address2,
        lt,
        prevTransactionHash,
        prevTransactionLt,
        now,
        outMessagesCount,
        oldStatus,
        endStatus,
        inMessage,
        outMessages,
        totalFees,
        stateUpdate,
        description,
        raw,
        hash: () => raw.hash()
      };
    }
    exports2.loadTransaction = loadTransaction2;
    function storeTransaction(src) {
      return (builder) => {
        builder.storeUint(7, 4);
        builder.storeUint(src.address, 256);
        builder.storeUint(src.lt, 64);
        builder.storeUint(src.prevTransactionHash, 256);
        builder.storeUint(src.prevTransactionLt, 64);
        builder.storeUint(src.now, 32);
        builder.storeUint(src.outMessagesCount, 15);
        builder.store((0, AccountStatus_1.storeAccountStatus)(src.oldStatus));
        builder.store((0, AccountStatus_1.storeAccountStatus)(src.endStatus));
        let msgBuilder = (0, Builder_1.beginCell)();
        if (src.inMessage) {
          msgBuilder.storeBit(true);
          msgBuilder.storeRef((0, Builder_1.beginCell)().store((0, Message_1.storeMessage)(src.inMessage)));
        } else {
          msgBuilder.storeBit(false);
        }
        msgBuilder.storeDict(src.outMessages);
        builder.storeRef(msgBuilder);
        builder.store((0, CurrencyCollection_1.storeCurrencyCollection)(src.totalFees));
        builder.storeRef((0, Builder_1.beginCell)().store((0, HashUpdate_1.storeHashUpdate)(src.stateUpdate)));
        builder.storeRef((0, Builder_1.beginCell)().store((0, TransactionDescription_1.storeTransactionDescription)(src.description)));
      };
    }
    exports2.storeTransaction = storeTransaction;
  }
});

// node_modules/@ton/core/dist/types/_export.js
var require_export = __commonJS({
  "node_modules/@ton/core/dist/types/_export.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.loadSimpleLibrary = exports2.loadShardStateUnsplit = exports2.storeShardIdent = exports2.loadShardIdent = exports2.storeShardAccounts = exports2.loadShardAccounts = exports2.ShardAccountRefValue = exports2.storeShardAccount = exports2.loadShardAccount = exports2.ReserveMode = exports2.SendMode = exports2.storeMessageRelaxed = exports2.loadMessageRelaxed = exports2.storeMessage = exports2.loadMessage = exports2.loadMasterchainStateExtra = exports2.storeHashUpdate = exports2.loadHashUpdate = exports2.storeExtraCurrency = exports2.loadMaybeExtraCurrency = exports2.loadExtraCurrency = exports2.packExtraCurrencyDict = exports2.packExtraCurrencyCell = exports2.storeDepthBalanceInfo = exports2.loadDepthBalanceInfo = exports2.storeCurrencyCollection = exports2.loadCurrencyCollection = exports2.storeComputeSkipReason = exports2.loadComputeSkipReason = exports2.storeCommonMessageInfoRelaxed = exports2.loadCommonMessageInfoRelaxed = exports2.storeCommonMessageInfo = exports2.loadCommonMessageInfo = exports2.storeOutList = exports2.loadOutList = exports2.storeOutAction = exports2.loadOutAction = exports2.storeAccountStorage = exports2.loadAccountStorage = exports2.storeAccountStatusChange = exports2.loadAccountStatusChange = exports2.storeAccountStatus = exports2.loadAccountStatus = exports2.storeAccountState = exports2.loadAccountState = exports2.storeAccount = exports2.loadAccount = exports2.comment = exports2.external = exports2.internal = void 0;
    exports2.storeTransactionsStoragePhase = exports2.loadTransactionStoragePhase = exports2.storeTransactionDescription = exports2.loadTransactionDescription = exports2.storeTransactionCreditPhase = exports2.loadTransactionCreditPhase = exports2.storeTransactionComputePhase = exports2.loadTransactionComputePhase = exports2.storeTransactionBouncePhase = exports2.loadTransactionBouncePhase = exports2.storeTransactionActionPhase = exports2.loadTransactionActionPhase = exports2.storeTransaction = exports2.loadTransaction = exports2.storeTickTock = exports2.loadTickTock = exports2.storeStorageUsedShort = exports2.loadStorageUsedShort = exports2.storeStorageUsed = exports2.loadStorageUsed = exports2.storeStorageInfo = exports2.loadStorageInfo = exports2.storeStateInit = exports2.loadStateInit = exports2.storeSplitMergeInfo = exports2.loadSplitMergeInfo = exports2.storeLibRef = exports2.loadLibRef = exports2.storeSimpleLibrary = void 0;
    var _helpers_1 = require_helpers();
    Object.defineProperty(exports2, "internal", { enumerable: true, get: function() {
      return _helpers_1.internal;
    } });
    Object.defineProperty(exports2, "external", { enumerable: true, get: function() {
      return _helpers_1.external;
    } });
    Object.defineProperty(exports2, "comment", { enumerable: true, get: function() {
      return _helpers_1.comment;
    } });
    var Account_1 = require_Account();
    Object.defineProperty(exports2, "loadAccount", { enumerable: true, get: function() {
      return Account_1.loadAccount;
    } });
    Object.defineProperty(exports2, "storeAccount", { enumerable: true, get: function() {
      return Account_1.storeAccount;
    } });
    var AccountState_1 = require_AccountState();
    Object.defineProperty(exports2, "loadAccountState", { enumerable: true, get: function() {
      return AccountState_1.loadAccountState;
    } });
    Object.defineProperty(exports2, "storeAccountState", { enumerable: true, get: function() {
      return AccountState_1.storeAccountState;
    } });
    var AccountStatus_1 = require_AccountStatus();
    Object.defineProperty(exports2, "loadAccountStatus", { enumerable: true, get: function() {
      return AccountStatus_1.loadAccountStatus;
    } });
    Object.defineProperty(exports2, "storeAccountStatus", { enumerable: true, get: function() {
      return AccountStatus_1.storeAccountStatus;
    } });
    var AccountStatusChange_1 = require_AccountStatusChange();
    Object.defineProperty(exports2, "loadAccountStatusChange", { enumerable: true, get: function() {
      return AccountStatusChange_1.loadAccountStatusChange;
    } });
    Object.defineProperty(exports2, "storeAccountStatusChange", { enumerable: true, get: function() {
      return AccountStatusChange_1.storeAccountStatusChange;
    } });
    var AccountStorage_1 = require_AccountStorage();
    Object.defineProperty(exports2, "loadAccountStorage", { enumerable: true, get: function() {
      return AccountStorage_1.loadAccountStorage;
    } });
    Object.defineProperty(exports2, "storeAccountStorage", { enumerable: true, get: function() {
      return AccountStorage_1.storeAccountStorage;
    } });
    var OutList_1 = require_OutList();
    Object.defineProperty(exports2, "loadOutAction", { enumerable: true, get: function() {
      return OutList_1.loadOutAction;
    } });
    Object.defineProperty(exports2, "storeOutAction", { enumerable: true, get: function() {
      return OutList_1.storeOutAction;
    } });
    Object.defineProperty(exports2, "loadOutList", { enumerable: true, get: function() {
      return OutList_1.loadOutList;
    } });
    Object.defineProperty(exports2, "storeOutList", { enumerable: true, get: function() {
      return OutList_1.storeOutList;
    } });
    var CommonMessageInfo_1 = require_CommonMessageInfo();
    Object.defineProperty(exports2, "loadCommonMessageInfo", { enumerable: true, get: function() {
      return CommonMessageInfo_1.loadCommonMessageInfo;
    } });
    Object.defineProperty(exports2, "storeCommonMessageInfo", { enumerable: true, get: function() {
      return CommonMessageInfo_1.storeCommonMessageInfo;
    } });
    var CommonMessageInfoRelaxed_1 = require_CommonMessageInfoRelaxed();
    Object.defineProperty(exports2, "loadCommonMessageInfoRelaxed", { enumerable: true, get: function() {
      return CommonMessageInfoRelaxed_1.loadCommonMessageInfoRelaxed;
    } });
    Object.defineProperty(exports2, "storeCommonMessageInfoRelaxed", { enumerable: true, get: function() {
      return CommonMessageInfoRelaxed_1.storeCommonMessageInfoRelaxed;
    } });
    var ComputeSkipReason_1 = require_ComputeSkipReason();
    Object.defineProperty(exports2, "loadComputeSkipReason", { enumerable: true, get: function() {
      return ComputeSkipReason_1.loadComputeSkipReason;
    } });
    Object.defineProperty(exports2, "storeComputeSkipReason", { enumerable: true, get: function() {
      return ComputeSkipReason_1.storeComputeSkipReason;
    } });
    var CurrencyCollection_1 = require_CurrencyCollection();
    Object.defineProperty(exports2, "loadCurrencyCollection", { enumerable: true, get: function() {
      return CurrencyCollection_1.loadCurrencyCollection;
    } });
    Object.defineProperty(exports2, "storeCurrencyCollection", { enumerable: true, get: function() {
      return CurrencyCollection_1.storeCurrencyCollection;
    } });
    var DepthBalanceInfo_1 = require_DepthBalanceInfo();
    Object.defineProperty(exports2, "loadDepthBalanceInfo", { enumerable: true, get: function() {
      return DepthBalanceInfo_1.loadDepthBalanceInfo;
    } });
    Object.defineProperty(exports2, "storeDepthBalanceInfo", { enumerable: true, get: function() {
      return DepthBalanceInfo_1.storeDepthBalanceInfo;
    } });
    var ExtraCurrency_1 = require_ExtraCurrency();
    Object.defineProperty(exports2, "packExtraCurrencyCell", { enumerable: true, get: function() {
      return ExtraCurrency_1.packExtraCurrencyCell;
    } });
    Object.defineProperty(exports2, "packExtraCurrencyDict", { enumerable: true, get: function() {
      return ExtraCurrency_1.packExtraCurrencyDict;
    } });
    Object.defineProperty(exports2, "loadExtraCurrency", { enumerable: true, get: function() {
      return ExtraCurrency_1.loadExtraCurrency;
    } });
    Object.defineProperty(exports2, "loadMaybeExtraCurrency", { enumerable: true, get: function() {
      return ExtraCurrency_1.loadMaybeExtraCurrency;
    } });
    Object.defineProperty(exports2, "storeExtraCurrency", { enumerable: true, get: function() {
      return ExtraCurrency_1.storeExtraCurrency;
    } });
    var HashUpdate_1 = require_HashUpdate();
    Object.defineProperty(exports2, "loadHashUpdate", { enumerable: true, get: function() {
      return HashUpdate_1.loadHashUpdate;
    } });
    Object.defineProperty(exports2, "storeHashUpdate", { enumerable: true, get: function() {
      return HashUpdate_1.storeHashUpdate;
    } });
    var MasterchainStateExtra_1 = require_MasterchainStateExtra();
    Object.defineProperty(exports2, "loadMasterchainStateExtra", { enumerable: true, get: function() {
      return MasterchainStateExtra_1.loadMasterchainStateExtra;
    } });
    var Message_1 = require_Message();
    Object.defineProperty(exports2, "loadMessage", { enumerable: true, get: function() {
      return Message_1.loadMessage;
    } });
    Object.defineProperty(exports2, "storeMessage", { enumerable: true, get: function() {
      return Message_1.storeMessage;
    } });
    var MessageRelaxed_1 = require_MessageRelaxed();
    Object.defineProperty(exports2, "loadMessageRelaxed", { enumerable: true, get: function() {
      return MessageRelaxed_1.loadMessageRelaxed;
    } });
    Object.defineProperty(exports2, "storeMessageRelaxed", { enumerable: true, get: function() {
      return MessageRelaxed_1.storeMessageRelaxed;
    } });
    var SendMode_1 = require_SendMode();
    Object.defineProperty(exports2, "SendMode", { enumerable: true, get: function() {
      return SendMode_1.SendMode;
    } });
    var ReserveMode_1 = require_ReserveMode();
    Object.defineProperty(exports2, "ReserveMode", { enumerable: true, get: function() {
      return ReserveMode_1.ReserveMode;
    } });
    var ShardAccount_1 = require_ShardAccount();
    Object.defineProperty(exports2, "loadShardAccount", { enumerable: true, get: function() {
      return ShardAccount_1.loadShardAccount;
    } });
    Object.defineProperty(exports2, "storeShardAccount", { enumerable: true, get: function() {
      return ShardAccount_1.storeShardAccount;
    } });
    var ShardAccounts_1 = require_ShardAccounts();
    Object.defineProperty(exports2, "ShardAccountRefValue", { enumerable: true, get: function() {
      return ShardAccounts_1.ShardAccountRefValue;
    } });
    Object.defineProperty(exports2, "loadShardAccounts", { enumerable: true, get: function() {
      return ShardAccounts_1.loadShardAccounts;
    } });
    Object.defineProperty(exports2, "storeShardAccounts", { enumerable: true, get: function() {
      return ShardAccounts_1.storeShardAccounts;
    } });
    var ShardIdent_1 = require_ShardIdent();
    Object.defineProperty(exports2, "loadShardIdent", { enumerable: true, get: function() {
      return ShardIdent_1.loadShardIdent;
    } });
    Object.defineProperty(exports2, "storeShardIdent", { enumerable: true, get: function() {
      return ShardIdent_1.storeShardIdent;
    } });
    var ShardStateUnsplit_1 = require_ShardStateUnsplit();
    Object.defineProperty(exports2, "loadShardStateUnsplit", { enumerable: true, get: function() {
      return ShardStateUnsplit_1.loadShardStateUnsplit;
    } });
    var SimpleLibrary_1 = require_SimpleLibrary();
    Object.defineProperty(exports2, "loadSimpleLibrary", { enumerable: true, get: function() {
      return SimpleLibrary_1.loadSimpleLibrary;
    } });
    Object.defineProperty(exports2, "storeSimpleLibrary", { enumerable: true, get: function() {
      return SimpleLibrary_1.storeSimpleLibrary;
    } });
    var LibRef_1 = require_LibRef();
    Object.defineProperty(exports2, "loadLibRef", { enumerable: true, get: function() {
      return LibRef_1.loadLibRef;
    } });
    Object.defineProperty(exports2, "storeLibRef", { enumerable: true, get: function() {
      return LibRef_1.storeLibRef;
    } });
    var SplitMergeInfo_1 = require_SplitMergeInfo();
    Object.defineProperty(exports2, "loadSplitMergeInfo", { enumerable: true, get: function() {
      return SplitMergeInfo_1.loadSplitMergeInfo;
    } });
    Object.defineProperty(exports2, "storeSplitMergeInfo", { enumerable: true, get: function() {
      return SplitMergeInfo_1.storeSplitMergeInfo;
    } });
    var StateInit_1 = require_StateInit();
    Object.defineProperty(exports2, "loadStateInit", { enumerable: true, get: function() {
      return StateInit_1.loadStateInit;
    } });
    Object.defineProperty(exports2, "storeStateInit", { enumerable: true, get: function() {
      return StateInit_1.storeStateInit;
    } });
    var StorageInto_1 = require_StorageInto();
    Object.defineProperty(exports2, "loadStorageInfo", { enumerable: true, get: function() {
      return StorageInto_1.loadStorageInfo;
    } });
    Object.defineProperty(exports2, "storeStorageInfo", { enumerable: true, get: function() {
      return StorageInto_1.storeStorageInfo;
    } });
    var StorageUsed_1 = require_StorageUsed();
    Object.defineProperty(exports2, "loadStorageUsed", { enumerable: true, get: function() {
      return StorageUsed_1.loadStorageUsed;
    } });
    Object.defineProperty(exports2, "storeStorageUsed", { enumerable: true, get: function() {
      return StorageUsed_1.storeStorageUsed;
    } });
    var StorageUsedShort_1 = require_StorageUsedShort();
    Object.defineProperty(exports2, "loadStorageUsedShort", { enumerable: true, get: function() {
      return StorageUsedShort_1.loadStorageUsedShort;
    } });
    Object.defineProperty(exports2, "storeStorageUsedShort", { enumerable: true, get: function() {
      return StorageUsedShort_1.storeStorageUsedShort;
    } });
    var TickTock_1 = require_TickTock();
    Object.defineProperty(exports2, "loadTickTock", { enumerable: true, get: function() {
      return TickTock_1.loadTickTock;
    } });
    Object.defineProperty(exports2, "storeTickTock", { enumerable: true, get: function() {
      return TickTock_1.storeTickTock;
    } });
    var Transaction_1 = require_Transaction();
    Object.defineProperty(exports2, "loadTransaction", { enumerable: true, get: function() {
      return Transaction_1.loadTransaction;
    } });
    Object.defineProperty(exports2, "storeTransaction", { enumerable: true, get: function() {
      return Transaction_1.storeTransaction;
    } });
    var TransactionActionPhase_1 = require_TransactionActionPhase();
    Object.defineProperty(exports2, "loadTransactionActionPhase", { enumerable: true, get: function() {
      return TransactionActionPhase_1.loadTransactionActionPhase;
    } });
    Object.defineProperty(exports2, "storeTransactionActionPhase", { enumerable: true, get: function() {
      return TransactionActionPhase_1.storeTransactionActionPhase;
    } });
    var TransactionBouncePhase_1 = require_TransactionBouncePhase();
    Object.defineProperty(exports2, "loadTransactionBouncePhase", { enumerable: true, get: function() {
      return TransactionBouncePhase_1.loadTransactionBouncePhase;
    } });
    Object.defineProperty(exports2, "storeTransactionBouncePhase", { enumerable: true, get: function() {
      return TransactionBouncePhase_1.storeTransactionBouncePhase;
    } });
    var TransactionComputePhase_1 = require_TransactionComputePhase();
    Object.defineProperty(exports2, "loadTransactionComputePhase", { enumerable: true, get: function() {
      return TransactionComputePhase_1.loadTransactionComputePhase;
    } });
    Object.defineProperty(exports2, "storeTransactionComputePhase", { enumerable: true, get: function() {
      return TransactionComputePhase_1.storeTransactionComputePhase;
    } });
    var TransactionCreditPhase_1 = require_TransactionCreditPhase();
    Object.defineProperty(exports2, "loadTransactionCreditPhase", { enumerable: true, get: function() {
      return TransactionCreditPhase_1.loadTransactionCreditPhase;
    } });
    Object.defineProperty(exports2, "storeTransactionCreditPhase", { enumerable: true, get: function() {
      return TransactionCreditPhase_1.storeTransactionCreditPhase;
    } });
    var TransactionDescription_1 = require_TransactionDescription();
    Object.defineProperty(exports2, "loadTransactionDescription", { enumerable: true, get: function() {
      return TransactionDescription_1.loadTransactionDescription;
    } });
    Object.defineProperty(exports2, "storeTransactionDescription", { enumerable: true, get: function() {
      return TransactionDescription_1.storeTransactionDescription;
    } });
    var TransactionStoragePhase_1 = require_TransactionStoragePhase();
    Object.defineProperty(exports2, "loadTransactionStoragePhase", { enumerable: true, get: function() {
      return TransactionStoragePhase_1.loadTransactionStoragePhase;
    } });
    Object.defineProperty(exports2, "storeTransactionsStoragePhase", { enumerable: true, get: function() {
      return TransactionStoragePhase_1.storeTransactionsStoragePhase;
    } });
  }
});

// node_modules/@ton/core/dist/contract/openContract.js
var require_openContract = __commonJS({
  "node_modules/@ton/core/dist/contract/openContract.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.openContract = void 0;
    var Address_1 = require_Address();
    var Cell_1 = require_Cell();
    function openContract2(src, factory) {
      let address2;
      let init = null;
      if (!Address_1.Address.isAddress(src.address)) {
        throw Error("Invalid address");
      }
      address2 = src.address;
      if (src.init) {
        if (!(src.init.code instanceof Cell_1.Cell)) {
          throw Error("Invalid init.code");
        }
        if (!(src.init.data instanceof Cell_1.Cell)) {
          throw Error("Invalid init.data");
        }
        init = src.init;
      }
      let executor = factory({ address: address2, init });
      return new Proxy(src, {
        get(target, prop) {
          const value = target[prop];
          if (typeof prop === "string" && (prop.startsWith("get") || prop.startsWith("send") || prop.startsWith("is"))) {
            if (typeof value === "function") {
              return (...args) => value.apply(target, [executor, ...args]);
            }
          }
          return value;
        }
      });
    }
    exports2.openContract = openContract2;
  }
});

// node_modules/@ton/core/dist/contract/ComputeError.js
var require_ComputeError = __commonJS({
  "node_modules/@ton/core/dist/contract/ComputeError.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ComputeError = void 0;
    var ComputeError2 = class _ComputeError extends Error {
      constructor(message, exitCode, opts) {
        super(message);
        this.exitCode = exitCode;
        this.debugLogs = opts && opts.debugLogs ? opts.debugLogs : null;
        this.logs = opts && opts.logs ? opts.logs : null;
        Object.setPrototypeOf(this, _ComputeError.prototype);
      }
    };
    exports2.ComputeError = ComputeError2;
  }
});

// node_modules/@ton/core/dist/utils/getMethodId.js
var require_getMethodId = __commonJS({
  "node_modules/@ton/core/dist/utils/getMethodId.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getMethodId = void 0;
    var TABLE = new Int16Array([
      0,
      4129,
      8258,
      12387,
      16516,
      20645,
      24774,
      28903,
      33032,
      37161,
      41290,
      45419,
      49548,
      53677,
      57806,
      61935,
      4657,
      528,
      12915,
      8786,
      21173,
      17044,
      29431,
      25302,
      37689,
      33560,
      45947,
      41818,
      54205,
      50076,
      62463,
      58334,
      9314,
      13379,
      1056,
      5121,
      25830,
      29895,
      17572,
      21637,
      42346,
      46411,
      34088,
      38153,
      58862,
      62927,
      50604,
      54669,
      13907,
      9842,
      5649,
      1584,
      30423,
      26358,
      22165,
      18100,
      46939,
      42874,
      38681,
      34616,
      63455,
      59390,
      55197,
      51132,
      18628,
      22757,
      26758,
      30887,
      2112,
      6241,
      10242,
      14371,
      51660,
      55789,
      59790,
      63919,
      35144,
      39273,
      43274,
      47403,
      23285,
      19156,
      31415,
      27286,
      6769,
      2640,
      14899,
      10770,
      56317,
      52188,
      64447,
      60318,
      39801,
      35672,
      47931,
      43802,
      27814,
      31879,
      19684,
      23749,
      11298,
      15363,
      3168,
      7233,
      60846,
      64911,
      52716,
      56781,
      44330,
      48395,
      36200,
      40265,
      32407,
      28342,
      24277,
      20212,
      15891,
      11826,
      7761,
      3696,
      65439,
      61374,
      57309,
      53244,
      48923,
      44858,
      40793,
      36728,
      37256,
      33193,
      45514,
      41451,
      53516,
      49453,
      61774,
      57711,
      4224,
      161,
      12482,
      8419,
      20484,
      16421,
      28742,
      24679,
      33721,
      37784,
      41979,
      46042,
      49981,
      54044,
      58239,
      62302,
      689,
      4752,
      8947,
      13010,
      16949,
      21012,
      25207,
      29270,
      46570,
      42443,
      38312,
      34185,
      62830,
      58703,
      54572,
      50445,
      13538,
      9411,
      5280,
      1153,
      29798,
      25671,
      21540,
      17413,
      42971,
      47098,
      34713,
      38840,
      59231,
      63358,
      50973,
      55100,
      9939,
      14066,
      1681,
      5808,
      26199,
      30326,
      17941,
      22068,
      55628,
      51565,
      63758,
      59695,
      39368,
      35305,
      47498,
      43435,
      22596,
      18533,
      30726,
      26663,
      6336,
      2273,
      14466,
      10403,
      52093,
      56156,
      60223,
      64286,
      35833,
      39896,
      43963,
      48026,
      19061,
      23124,
      27191,
      31254,
      2801,
      6864,
      10931,
      14994,
      64814,
      60687,
      56684,
      52557,
      48554,
      44427,
      40424,
      36297,
      31782,
      27655,
      23652,
      19525,
      15522,
      11395,
      7392,
      3265,
      61215,
      65342,
      53085,
      57212,
      44955,
      49082,
      36825,
      40952,
      28183,
      32310,
      20053,
      24180,
      11923,
      16050,
      3793,
      7920
    ]);
    function crc162(data) {
      if (!(data instanceof Buffer)) {
        data = Buffer.from(data);
      }
      let crc = 0;
      for (let index = 0; index < data.length; index++) {
        const byte = data[index];
        crc = (TABLE[(crc >> 8 ^ byte) & 255] ^ crc << 8) & 65535;
      }
      return crc;
    }
    function getMethodId2(name) {
      return crc162(name) & 65535 | 65536;
    }
    exports2.getMethodId = getMethodId2;
  }
});

// node_modules/@ton/core/dist/crypto/safeSign.js
var require_safeSign = __commonJS({
  "node_modules/@ton/core/dist/crypto/safeSign.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.safeSignVerify = exports2.safeSign = void 0;
    var crypto_1 = require("@scom/ton-crypto");
    var MIN_SEED_LENGTH = 8;
    var MAX_SEED_LENGTH = 64;
    function createSafeSignHash(cell, seed) {
      let seedData = Buffer.from(seed);
      if (seedData.length > MAX_SEED_LENGTH) {
        throw Error("Seed can	 be longer than 64 bytes");
      }
      if (seedData.length < MIN_SEED_LENGTH) {
        throw Error("Seed must be at least 8 bytes");
      }
      return (0, crypto_1.sha256_sync)(Buffer.concat([Buffer.from([255, 255]), seedData, cell.hash()]));
    }
    function safeSign2(cell, secretKey, seed = "ton-safe-sign-magic") {
      return (0, crypto_1.sign)(createSafeSignHash(cell, seed), secretKey);
    }
    exports2.safeSign = safeSign2;
    function safeSignVerify2(cell, signature, publicKey, seed = "ton-safe-sign-magic") {
      return (0, crypto_1.signVerify)(createSafeSignHash(cell, seed), signature, publicKey);
    }
    exports2.safeSignVerify = safeSignVerify2;
  }
});

// node_modules/@ton/core/dist/index.js
var require_dist = __commonJS({
  "node_modules/@ton/core/dist/index.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.safeSignVerify = exports2.safeSign = exports2.getMethodId = exports2.base32Encode = exports2.base32Decode = exports2.crc32c = exports2.crc16 = exports2.fromNano = exports2.toNano = exports2.ComputeError = exports2.openContract = exports2.TupleBuilder = exports2.TupleReader = exports2.serializeTuple = exports2.parseTuple = exports2.generateMerkleUpdate = exports2.generateMerkleProofDirect = exports2.generateMerkleProof = exports2.exoticPruned = exports2.exoticMerkleUpdate = exports2.convertToMerkleProof = exports2.exoticMerkleProof = exports2.Dictionary = exports2.Cell = exports2.CellType = exports2.Slice = exports2.beginCell = exports2.Builder = exports2.BitBuilder = exports2.BitReader = exports2.BitString = exports2.contractAddress = exports2.ADNLAddress = exports2.ExternalAddress = exports2.address = exports2.Address = void 0;
    var Address_1 = require_Address();
    Object.defineProperty(exports2, "Address", { enumerable: true, get: function() {
      return Address_1.Address;
    } });
    Object.defineProperty(exports2, "address", { enumerable: true, get: function() {
      return Address_1.address;
    } });
    var ExternalAddress_1 = require_ExternalAddress();
    Object.defineProperty(exports2, "ExternalAddress", { enumerable: true, get: function() {
      return ExternalAddress_1.ExternalAddress;
    } });
    var ADNLAddress_1 = require_ADNLAddress();
    Object.defineProperty(exports2, "ADNLAddress", { enumerable: true, get: function() {
      return ADNLAddress_1.ADNLAddress;
    } });
    var contractAddress_1 = require_contractAddress();
    Object.defineProperty(exports2, "contractAddress", { enumerable: true, get: function() {
      return contractAddress_1.contractAddress;
    } });
    var BitString_1 = require_BitString();
    Object.defineProperty(exports2, "BitString", { enumerable: true, get: function() {
      return BitString_1.BitString;
    } });
    var BitReader_1 = require_BitReader();
    Object.defineProperty(exports2, "BitReader", { enumerable: true, get: function() {
      return BitReader_1.BitReader;
    } });
    var BitBuilder_1 = require_BitBuilder();
    Object.defineProperty(exports2, "BitBuilder", { enumerable: true, get: function() {
      return BitBuilder_1.BitBuilder;
    } });
    var Builder_1 = require_Builder();
    Object.defineProperty(exports2, "Builder", { enumerable: true, get: function() {
      return Builder_1.Builder;
    } });
    Object.defineProperty(exports2, "beginCell", { enumerable: true, get: function() {
      return Builder_1.beginCell;
    } });
    var Slice_1 = require_Slice();
    Object.defineProperty(exports2, "Slice", { enumerable: true, get: function() {
      return Slice_1.Slice;
    } });
    var CellType_1 = require_CellType();
    Object.defineProperty(exports2, "CellType", { enumerable: true, get: function() {
      return CellType_1.CellType;
    } });
    var Cell_1 = require_Cell();
    Object.defineProperty(exports2, "Cell", { enumerable: true, get: function() {
      return Cell_1.Cell;
    } });
    var Dictionary_1 = require_Dictionary();
    Object.defineProperty(exports2, "Dictionary", { enumerable: true, get: function() {
      return Dictionary_1.Dictionary;
    } });
    var exoticMerkleProof_1 = require_exoticMerkleProof();
    Object.defineProperty(exports2, "exoticMerkleProof", { enumerable: true, get: function() {
      return exoticMerkleProof_1.exoticMerkleProof;
    } });
    Object.defineProperty(exports2, "convertToMerkleProof", { enumerable: true, get: function() {
      return exoticMerkleProof_1.convertToMerkleProof;
    } });
    var exoticMerkleUpdate_1 = require_exoticMerkleUpdate();
    Object.defineProperty(exports2, "exoticMerkleUpdate", { enumerable: true, get: function() {
      return exoticMerkleUpdate_1.exoticMerkleUpdate;
    } });
    var exoticPruned_1 = require_exoticPruned();
    Object.defineProperty(exports2, "exoticPruned", { enumerable: true, get: function() {
      return exoticPruned_1.exoticPruned;
    } });
    var generateMerkleProof_1 = require_generateMerkleProof();
    Object.defineProperty(exports2, "generateMerkleProof", { enumerable: true, get: function() {
      return generateMerkleProof_1.generateMerkleProof;
    } });
    Object.defineProperty(exports2, "generateMerkleProofDirect", { enumerable: true, get: function() {
      return generateMerkleProof_1.generateMerkleProofDirect;
    } });
    var generateMerkleUpdate_1 = require_generateMerkleUpdate();
    Object.defineProperty(exports2, "generateMerkleUpdate", { enumerable: true, get: function() {
      return generateMerkleUpdate_1.generateMerkleUpdate;
    } });
    var tuple_1 = require_tuple();
    Object.defineProperty(exports2, "parseTuple", { enumerable: true, get: function() {
      return tuple_1.parseTuple;
    } });
    Object.defineProperty(exports2, "serializeTuple", { enumerable: true, get: function() {
      return tuple_1.serializeTuple;
    } });
    var reader_1 = require_reader();
    Object.defineProperty(exports2, "TupleReader", { enumerable: true, get: function() {
      return reader_1.TupleReader;
    } });
    var builder_1 = require_builder();
    Object.defineProperty(exports2, "TupleBuilder", { enumerable: true, get: function() {
      return builder_1.TupleBuilder;
    } });
    __exportStar(require_export(), exports2);
    var openContract_1 = require_openContract();
    Object.defineProperty(exports2, "openContract", { enumerable: true, get: function() {
      return openContract_1.openContract;
    } });
    var ComputeError_1 = require_ComputeError();
    Object.defineProperty(exports2, "ComputeError", { enumerable: true, get: function() {
      return ComputeError_1.ComputeError;
    } });
    var convert_1 = require_convert();
    Object.defineProperty(exports2, "toNano", { enumerable: true, get: function() {
      return convert_1.toNano;
    } });
    Object.defineProperty(exports2, "fromNano", { enumerable: true, get: function() {
      return convert_1.fromNano;
    } });
    var crc16_1 = require_crc16();
    Object.defineProperty(exports2, "crc16", { enumerable: true, get: function() {
      return crc16_1.crc16;
    } });
    var crc32c_1 = require_crc32c();
    Object.defineProperty(exports2, "crc32c", { enumerable: true, get: function() {
      return crc32c_1.crc32c;
    } });
    var base32_1 = require_base32();
    Object.defineProperty(exports2, "base32Decode", { enumerable: true, get: function() {
      return base32_1.base32Decode;
    } });
    Object.defineProperty(exports2, "base32Encode", { enumerable: true, get: function() {
      return base32_1.base32Encode;
    } });
    var getMethodId_1 = require_getMethodId();
    Object.defineProperty(exports2, "getMethodId", { enumerable: true, get: function() {
      return getMethodId_1.getMethodId;
    } });
    var safeSign_1 = require_safeSign();
    Object.defineProperty(exports2, "safeSign", { enumerable: true, get: function() {
      return safeSign_1.safeSign;
    } });
    Object.defineProperty(exports2, "safeSignVerify", { enumerable: true, get: function() {
      return safeSign_1.safeSignVerify;
    } });
  }
});

// src/index.ts
var import_core = __toESM(require_dist());
var import_core2 = __toESM(require_dist());
var import_core3 = __toESM(require_dist());
var import_core4 = __toESM(require_dist());
var import_core5 = __toESM(require_dist());
var import_core6 = __toESM(require_dist());
var import_core7 = __toESM(require_dist());
var import_core8 = __toESM(require_dist());
var import_core9 = __toESM(require_dist());
var import_core10 = __toESM(require_dist());
var import_core11 = __toESM(require_dist());
var import_core12 = __toESM(require_dist());
var import_core13 = __toESM(require_dist());
var import_core14 = __toESM(require_dist());
var import_core15 = __toESM(require_dist());
var import_core16 = __toESM(require_dist());
var import_core17 = __toESM(require_dist());
var import_core18 = __toESM(require_dist());
var import_core19 = __toESM(require_dist());
var import_core20 = __toESM(require_dist());
var import_core21 = __toESM(require_dist());
var import_core22 = __toESM(require_dist());
var import_core23 = __toESM(require_dist());
var import_core24 = __toESM(require_dist());
var import_core25 = __toESM(require_dist());
var import_core26 = __toESM(require_dist());
var import_core27 = __toESM(require_dist());
var import_core28 = __toESM(require_dist());
var import_core29 = __toESM(require_dist());
var import_core30 = __toESM(require_dist());
var import_core31 = __toESM(require_dist());
exports.Address = import_core.Address;
exports.address = import_core.address;
exports.ExternalAddress = import_core2.ExternalAddress;
exports.ADNLAddress = import_core3.ADNLAddress;
exports.contractAddress = import_core4.contractAddress;
exports.BitString = import_core5.BitString;
exports.BitReader = import_core6.BitReader;
exports.BitBuilder = import_core7.BitBuilder;
exports.Builder = import_core8.Builder;
exports.beginCell = import_core8.beginCell;
exports.Slice = import_core9.Slice;
exports.CellType = import_core10.CellType;
exports.Cell = import_core11.Cell;
exports.Dictionary = import_core12.Dictionary;
exports.exoticMerkleProof = import_core13.exoticMerkleProof;
exports.convertToMerkleProof = import_core13.convertToMerkleProof;
exports.exoticMerkleUpdate = import_core14.exoticMerkleUpdate;
exports.exoticPruned = import_core15.exoticPruned;
exports.generateMerkleProof = import_core16.generateMerkleProof;
exports.generateMerkleProofDirect = import_core16.generateMerkleProofDirect;
exports.generateMerkleUpdate = import_core17.generateMerkleUpdate;
exports.parseTuple = import_core18.parseTuple;
exports.serializeTuple = import_core18.serializeTuple;
exports.TupleReader = import_core19.TupleReader;
exports.TupleBuilder = import_core20.TupleBuilder;
exports.openContract = import_core21.openContract;
exports.ComputeError = import_core22.ComputeError;
exports.toNano = import_core23.toNano;
exports.fromNano = import_core23.fromNano;
exports.crc16 = import_core24.crc16;
exports.crc32c = import_core25.crc32c;
exports.base32Decode = import_core26.base32Decode;
exports.base32Encode = import_core26.base32Encode;
exports.getMethodId = import_core27.getMethodId;
exports.safeSign = import_core28.safeSign;
exports.safeSignVerify = import_core28.safeSignVerify;
exports.internal = import_core29.internal;
exports.SendMode = import_core29.SendMode;
exports.storeMessageRelaxed = import_core29.storeMessageRelaxed;
exports.paddedBufferToBits = import_core30.paddedBufferToBits;
exports.storeShardAccount = import_core31.storeShardAccount;
exports.storeMessage = import_core31.storeMessage;
exports.loadTransaction = import_core31.loadTransaction;
exports.loadShardAccount = import_core31.loadShardAccount;

});