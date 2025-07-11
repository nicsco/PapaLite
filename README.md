# PapaLite

**PapaLite** is a lightweight, modular version of the excellent [PapaParse](https://github.com/mholt/PapaParse) library for parsing and generating CSV in JavaScript.

This version strips away advanced features like streaming or Node.js-specific code, while retaining the core functionality needed for in-browser CSV handling.

&nbsp;

## 📦 Install

Since **PapaLite** is a standalone ES module, you can simply clone and import `papa-lite.js` into your project:

```js
import { PapaLite } from './papa-lite.js';

// you can now use PapaLite in your code, see examples below!
```

💡 **HINT**: For production, use the minified version (`papa-lite.min.js`) to reduce file size and improve load time.

&nbsp;

## 🚀 Feature Summary

| Feature                          | Supported |
| -------------------------------- | --------- |
| 🆕 Modular ES6 importable API    | ✅ NEW!   |
| 🆕 Custom newline (`\n`, `\r\n`) | ✅ NEW!   |
| Parse CSV string                 | ✅        |
| Unparse to CSV                   | ✅        |
| Custom delimiter                 | ✅        |
| Header row mapping               | ✅        |
| Dynamic typing                   | ✅        |
| Skip empty lines                 | ✅        |
| Error reporting                  | ✅        |
| Node.js support                  | ❌        |
| Web workers                      | ❌        |
| Streaming/chunking               | ❌        |

&nbsp;

## 🧪 Usage Examples

### 🔁 Parsing CSV -> JSON

#### 🔹 Basic Parsing

Default Settings: { header: false, dynamicTyping: false }

```js
const csv = "a,b,c\n1,2,3\n4,5,6";
const { result, errors } = PapaLite.parse(csv);

console.log(result);
// [
//   ["a", "b", "c"],
//   ["1", "2", "3"],
//   ["4", "5", "6"]
// ]
```

#### 🔹 Header Row Support

```js
const csv = "name,age\nAlice,30\nBob,25";
const { result, errors } = PapaLite.parse(csv, { header: true });

console.log(result);
// [
//   { name: "Alice", age: "30" },
//   { name: "Bob", age: "25" }
// ]
```

#### 🔹 Dynamic Typing

```js
const csv = "value,bool\n42,true\n7,false";
const { result } = PapaLite.parse(csv, {
  header: true,
  dynamicTyping: true,
});

console.log(result);
// [
//   { value: 42, bool: true },
//   { value: 7, bool: false }
// ]
```

#### 🔹 Skipping Empty Lines

```js
const csv = "a,b\n1,2\n\n3,4";
const { result } = PapaLite.parse(csv, {
  skipEmptyLines: true,
});

console.log(result);
// [
//   ["a", "b"],
//   ["1", "2"],
//   ["3", "4"]
// ]
```

#### 🔹 Custom Newline Character

```js
const csv = "a;b\r\n1;2\r\n3;4";
const { result } = PapaLite.parse(csv, {
  delimiter: ";",
  newline: "\r\n"
});

console.log(result);
// [
//   ["a", "b"],
//   ["1", "2"],
//   ["3", "4"]
// ]
```

### 🔁 Unparsing (Object or Array to CSV)


#### Object Array with Header

```js
const input = [
  { name: "Alice", age: 30 },
  { name: "Bob", age: 25 }
];

const { result } = PapaLite.unparse(input);
console.log(result);
// name,age
// Alice,30
// Bob,25
```

#### Array of Arrays

```js
const rows = [
  ["a", "b", "c"],
  ["1", "2", "3"],
];

const { result } = PapaLite.unparse(rows);
console.log(result);
// a,b,c
// 1,2,3
```

&nbsp;

## ⚠️ Error Handling

**All results return an object:**

```js
{
  result: <parsed or unparsed output>,
  errors: <array of error objects or null>
}
```

**Each error object includes:**

```js
{
  type: "Quotes" | "FieldMismatch" | "ParseError" | "UnparseError",
  code: "UNMATCHED_QUOTES" | "ROW_LENGTH_MISMATCH" | "INVALID_INPUT",
  message: "Human-readable message",
  row: <row number if applicable>
}
```

&nbsp;

## 📘 License

MIT License. Based on PapaParse by @mholt.

&nbsp;

## ❤️ Credits

PapaLite is a fork of PapaParse, ideal for browser-only apps where size and simplicity matter more than streaming or large-scale performance.
