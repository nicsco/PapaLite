/* @license
PapaLite v5.5.3
based on PapaParse by @mholt
https://github.com/nicsco/PapaLite
License: MIT
*/

export const PapaLite = (() => {
  const defaults = {
    delimiter: ",",
    header: false,
    dynamicTyping: false,
    skipEmptyLines: false,
    newline: "\n",
  };

  function convertType(val) {
    if (val === '') return '';
    if (!isNaN(val)) return Number(val);
    if (/^(true|false)$/i.test(val)) return val.toLowerCase() === 'true';
    return val;
  }

  function parse(input, userConfig = {}) {
    const config = { ...defaults, ...userConfig };
    const errors = [];
    const data = [];
    const newline = config.newline;
    const delim = config.delimiter;

    if (typeof input !== 'string') {
      return {
        result: null,
        errors: [{
          type: "ParseError",
          code: "INVALID_INPUT",
          message: "Input must be a string",
        }]
      };
    }

    const lines = input.split(newline);
    let headerFields = [];
    let expectedLength = null;

    for (let rowIdx = 0; rowIdx < lines.length; rowIdx++) {
      const line = lines[rowIdx];
      if (config.skipEmptyLines && line.trim() === "") continue;

      const row = [];
      let i = 0, cur = "", inQuotes = false;

      while (i < line.length) {
        const ch = line[i];
        const next = line[i + 1];

        if (inQuotes) {
          if (ch === '"' && next === '"') {
            cur += '"';
            i += 2;
          } else if (ch === '"') {
            inQuotes = false;
            i++;
          } else {
            cur += ch;
            i++;
          }
        } else {
          if (ch === '"') {
            inQuotes = true;
            i++;
          } else if (ch === delim) {
            row.push(config.dynamicTyping ? convertType(cur) : cur);
            cur = "";
            i++;
          } else {
            cur += ch;
            i++;
          }
        }
      }

      if (inQuotes) {
        errors.push({
          type: "Quotes",
          code: "UNMATCHED_QUOTES",
          message: `Unmatched quote at row ${rowIdx + 1}`,
          row: rowIdx
        });
        return { result: null, errors };
      }

      row.push(config.dynamicTyping ? convertType(cur) : cur);

      // Header handling
      if (config.header && rowIdx === 0) {
        headerFields = row;
        expectedLength = row.length;
        continue;
      }

      // Row length check
      if (expectedLength === null) expectedLength = row.length;
      if (row.length !== expectedLength) {
        errors.push({
          type: "FieldMismatch",
          code: "ROW_LENGTH_MISMATCH",
          message: `Row ${rowIdx + 1} has ${row.length} fields, expected ${expectedLength}`,
          row: rowIdx
        });
      }

      if (config.header) {
        const obj = {};
        headerFields.forEach((h, idx) => {
          obj[h] = row[idx] !== undefined ? row[idx] : '';
        });
        data.push(obj);
      } else {
        data.push(row);
      }
    }

    return {
      result: data,
      errors: errors.length ? errors : null
    };
  }

  function unparse(input, userConfig = {}) {
    const config = { ...defaults, ...userConfig };
    const newline = config.newline;
    const errors = [];

    if (!Array.isArray(input)) {
      return {
        result: null,
        errors: [{
          type: "UnparseError",
          code: "INVALID_INPUT",
          message: "Input must be an array of arrays or array of objects"
        }]
      };
    }

    let output = "";
    let isObjectArray = Array.isArray(input) && typeof input[0] === "object" && !Array.isArray(input[0]);
    let fields = [];

    if (isObjectArray) {
      fields = Object.keys(input[0]);
      output += fields.map(escapeField).join(config.delimiter) + newline;
      for (const row of input) {
        output += fields.map(f => escapeField(row[f])).join(config.delimiter) + newline;
      }
    } else {
      for (const row of input) {
        if (!Array.isArray(row)) {
          errors.push({
            type: "UnparseError",
            code: "INVALID_ROW",
            message: "Each row must be an array or all rows must be objects"
          });
          return { result: null, errors };
        }
        output += row.map(escapeField).join(config.delimiter) + newline;
      }
    }

    function escapeField(val) {
      if (val == null) val = '';
      const str = val.toString();
      const quote = '"';
      const needsQuotes = str.includes(config.delimiter) || str.includes('"') || str.includes(newline);
      const escaped = str.replace(/"/g, '""');
      return needsQuotes ? quote + escaped + quote : escaped;
    }

    return {
      result: output.trimEnd(),
      errors: errors.length ? errors : null
    };
  }

  return {
    parse,
    unparse
  };
})();
