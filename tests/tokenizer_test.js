/*
 * Tests taken from cpython's Lib/test/test_tokenize.py
 */
define([
  'intern!object',
  'intern/chai!assert',
  'prakalpa/tokenizer',
  'dojo/_base/array'
], function (registerSuite, assert, Tokenizer, array) {
  var assertTokensEqual, assertError;

  assertTokensEqual = function (sourceText, expectedTokenInfos) {
    var tokenizer;

    tokenizer = new Tokenizer({ sourceText: sourceText });

    array.forEach(expectedTokenInfos, function (expectedTokenInfo) {
      var tokenInfo;

      tokenInfo = tokenizer.getNext();

      for(var key in expectedTokenInfo) {
        assert.deepEqual(expectedTokenInfo[key], tokenInfo[key]);
      }
    });

    assert.strictEqual(tokenizer.getNext().token, 'ENDMARKER');
  };

  assertError = function (sourceText, errorString) {
    var tokenizer, tokenInfo;

    tokenizer = new Tokenizer({ sourceText: sourceText });

    do {
      tokenInfo = tokenizer.getNext();
    } while(tokenInfo.token !== 'ERRORTOKEN' && tokenInfo.token !== 'ENDMARKER'); 

    assert.strictEqual(tokenInfo.token, 'ERRORTOKEN');
    assert.strictEqual(tokenInfo.error, errorString);
  };

  registerSuite({
    name: 'Tokenzier',

    'Hello world!': function () {
      assertTokensEqual('Hello world!', [
        { token: 'NAME', start: [0, 1], end: [5, 1] },
        { token: 'NAME', start: [6, 1], end: [11, 1] },
        { token: 'OP', start: [11, 1], end: [12, 1] }
      ]);
    },

    '1 + 1': function () {
      assertTokensEqual('1 + 1', [
        { token: 'NUMBER', start: [0, 1], end: [1, 1] },
        { token: 'PLUS', start: [2, 1], end: [3, 1] },
        { token: 'NUMBER', start: [4, 1], end: [5, 1] }
      ]);
    },

    'if False:\n    # NL\n    True = False # NEWLINE\n': function () {
      assertTokensEqual('if False:\n    # NL\n    True = False # NEWLINE\n', [
        { token: 'NAME', start: [0, 1], end: [2, 1] },
        { token: 'NAME', start: [3, 1], end: [8, 1] },
        { token: 'COLON', start: [8, 1], end: [9, 1] },
        { token: 'NEWLINE', start: [9, 1], end: [9, 1] },
        { token: 'INDENT', lineNum: 3},
        { token: 'NAME', start: [4, 3], end: [8, 3] },
        { token: 'EQUAL', start: [9, 3], end: [10, 3] },
        { token: 'NAME', start: [11, 3], end: [16, 3] },
        { token: 'NEWLINE', start: [17, 3], end: [26, 3] },
        { token: 'DEDENT', lineNum: 3},
      ]);
    },

    'indent error': function () {
      assertError('def k(x):\n    x += 2\n  x += 5\n', 'No matching outer block for dedent');
    },

    'if x == 1:\n    print(x)\n': function () {
      assertTokensEqual('if x == 1:\n    print(x)\n', [
        { token: 'NAME', start: [0, 1], end: [2, 1] },
        { token: 'NAME', start: [3, 1], end: [4, 1] },
        { token: 'EQEQUAL', start: [5, 1], end: [7, 1] },
        { token: 'NUMBER', start: [8, 1], end: [9, 1] },
        { token: 'COLON', start: [9, 1], end: [10, 1] },
        { token: 'NEWLINE', start: [10, 1], end: [10, 1] },
        { token: 'INDENT', lineNum: 2}, 
        { token: 'NAME', start: [4, 2], end: [9, 2] },
        { token: 'LPAR', start: [9, 2], end: [10, 2] },
        { token: 'NAME', start: [10, 2], end: [11, 2] },
        { token: 'RPAR', start: [11, 2], end: [12, 2] },
        { token: 'NEWLINE', start: [12, 2], end: [12, 2] },
        { token: 'DEDENT', lineNum: 2}
      ]);
    },

    '# This is a comment\n# This also': function () {
      assertTokensEqual('# This is a comment\n# This also', []);
    },

    'if x == 1 : \n  print(x)\n': function () {
      assertTokensEqual('if x == 1 : \n  print(x)\n', [
        { token: 'NAME', start: [0, 1], end: [2, 1] },
        { token: 'NAME', start: [3, 1], end: [4, 1] },
        { token: 'EQEQUAL', start: [5, 1], end: [7, 1] },
        { token: 'NUMBER', start: [8, 1], end: [9, 1] },
        { token: 'COLON', start: [10, 1], end: [11, 1] },
        { token: 'NEWLINE', start: [12, 1], end: [12, 1] },
        { token: 'INDENT', lineNum: 2}, 
        { token: 'NAME', start: [2, 2], end: [7, 2] },
        { token: 'LPAR', start: [7, 2], end: [8, 2] },
        { token: 'NAME', start: [8, 2], end: [9, 2] },
        { token: 'RPAR', start: [9, 2], end: [10, 2] },
        { token: 'NEWLINE', start: [10, 2], end: [10, 2] },
        { token: 'DEDENT', lineNum: 2}
      ]);
    },

    'comments': function () {
      assertTokensEqual('# Comments\n"#"\n#\'\n#"\n#\\\n      #\n    # abc\n\'\'\'#\n#\'\'\'\n\nx = 1  #\n', [
        {token: "STRING", start: [0, 2], end: [3, 2]},
        {token: "NEWLINE", start: [3, 2], end: [3, 2]},
        {token: "STRING", start: [0, 8], end: [4, 9]},
        {token: "NEWLINE", start: [4, 9], end: [4, 9]},
        {token: "NAME", start: [0, 11], end: [1, 11]},
        {token: "EQUAL", start: [2, 11], end: [3, 11]},
        {token: "NUMBER", start: [4, 11], end: [5, 11]},
        {token: "NEWLINE", start: [7, 11], end: [8, 11]}
      ]);
    },

    'balancing continuation': function () {
      assertTokensEqual("a = (3, 4,\n  5, 6)\ny = [3, 4,\n  5]\nz = {'a':5,\n  'b':6}\nx = (len(repr(y)) + 5*x - a[\n   3 ]\n   - x + len({\n   }\n    )\n  )", [
            { token: "NAME", start: [0, 1], end: [1, 1] },
            { token: "EQUAL", start: [2, 1], end: [3, 1] },
            { token: "LPAR", start: [4, 1], end: [5, 1] },
            { token: "NUMBER", start: [5, 1], end: [6, 1] },
            { token: "COMMA", start: [6, 1], end: [7, 1] },
            { token: "NUMBER", start: [8, 1], end: [9, 1] },
            { token: "COMMA", start: [9, 1], end: [10, 1] },
            { token: "NUMBER", start: [2, 2], end: [3, 2] },
            { token: "COMMA", start: [3, 2], end: [4, 2] },
            { token: "NUMBER", start: [5, 2], end: [6, 2] },
            { token: "RPAR", start: [6, 2], end: [7, 2] },
            { token: "NEWLINE", start: [7, 2], end: [7, 2] },
            { token: "NAME", start: [0, 3], end: [1, 3] },
            { token: "EQUAL", start: [2, 3], end: [3, 3] },
            { token: "LSQB", start: [4, 3], end: [5, 3] },
            { token: "NUMBER", start: [5, 3], end: [6, 3] },
            { token: "COMMA", start: [6, 3], end: [7, 3] },
            { token: "NUMBER", start: [8, 3], end: [9, 3] },
            { token: "COMMA", start: [9, 3], end: [10, 3] },
            { token: "NUMBER", start: [2, 4], end: [3, 4] },
            { token: "RSQB", start: [3, 4], end: [4, 4] },
            { token: "NEWLINE", start: [4, 4], end: [4, 4] },
            { token: "NAME", start: [0, 5], end: [1, 5] },
            { token: "EQUAL", start: [2, 5], end: [3, 5] },
            { token: "LBRACE", start: [4, 5], end: [5, 5] },
            { token: "STRING", start: [5, 5], end: [8, 5] },
            { token: "COLON", start: [8, 5], end: [9, 5] },
            { token: "NUMBER", start: [9, 5], end: [10, 5] },
            { token: "COMMA", start: [10, 5], end: [11, 5] },
            { token: "STRING", start: [2, 6], end: [5, 6] },
            { token: "COLON", start: [5, 6], end: [6, 6] },
            { token: "NUMBER", start: [6, 6], end: [7, 6] },
            { token: "RBRACE", start: [7, 6], end: [8, 6] },
            { token: "NEWLINE", start: [8, 6], end: [8, 6] },
            { token: "NAME", start: [0, 7], end: [1, 7] },
            { token: "EQUAL", start: [2, 7], end: [3, 7] },
            { token: "LPAR", start: [4, 7], end: [5, 7] },
            { token: "NAME", start: [5, 7], end: [8, 7] },
            { token: "LPAR", start: [8, 7], end: [9, 7] },
            { token: "NAME", start: [9, 7], end: [13, 7] },
            { token: "LPAR", start: [13, 7], end: [14, 7] },
            { token: "NAME", start: [14, 7], end: [15, 7] },
            { token: "RPAR", start: [15, 7], end: [16, 7] },
            { token: "RPAR", start: [16, 7], end: [17, 7] },
            { token: "PLUS", start: [18, 7], end: [19, 7] },
            { token: "NUMBER", start: [20, 7], end: [21, 7] },
            { token: "STAR", start: [21, 7], end: [22, 7] },
            { token: "NAME", start: [22, 7], end: [23, 7] },
            { token: "MINUS", start: [24, 7], end: [25, 7] },
            { token: "NAME", start: [26, 7], end: [27, 7] },
            { token: "LSQB", start: [27, 7], end: [28, 7] },
            { token: "NUMBER", start: [3, 8], end: [4, 8] },
            { token: "RSQB", start: [5, 8], end: [6, 8] },
            { token: "MINUS", start: [3, 9], end: [4, 9] },
            { token: "NAME", start: [5, 9], end: [6, 9] },
            { token: "PLUS", start: [7, 9], end: [8, 9] },
            { token: "NAME", start: [9, 9], end: [12, 9] },
            { token: "LPAR", start: [12, 9], end: [13, 9] },
            { token: "LBRACE", start: [13, 9], end: [14, 9] },
            { token: "RBRACE", start: [3, 10], end: [4, 10] },
            { token: "RPAR", start: [4, 11], end: [5, 11] },
            { token: "RPAR", start: [2, 12], end: [3, 12] }
      ]);
    },

    'backslash means line continuation': function () {
      assertTokensEqual('x = 1 \\\n+ 1', [
        { token: "NAME", start: [0, 1], end: [1, 1] },
        { token: "EQUAL", start: [2, 1], end: [3, 1] },
        { token: "NUMBER", start: [4, 1], end: [5, 1] },
        { token: "PLUS", start: [0, 2], end: [1, 2] },
        { token: "NUMBER", start: [2, 2], end: [3, 2] }
      ]);
    },

    'backslash does not mean line continuation in comments': function () {
      assertTokensEqual('# Backslash does not means continuation in comments :\\\nx = 0', [
        { token: "NAME", start: [0, 2], end: [1, 2] },
        { token: "EQUAL", start: [2, 2], end: [3, 2] },
        { token: "NUMBER", start: [4, 2], end: [5, 2] }
      ]);
    },

    'ordinary integers': {
      '0xff != 255': function () {
        assertTokensEqual('0xff != 255', [
          { token: "NUMBER", start: [0, 1], end: [4, 1] },
          { token: "NOTEQUAL", start: [5, 1], end: [7, 1] },
          { token: "NUMBER", start: [8, 1], end: [11, 1] }
        ]);
      },
      '0o377 != 255': function () {
        assertTokensEqual('0o377 != 255', [
          { token: "NUMBER", start: [0, 1], end: [5, 1] },
          { token: "NOTEQUAL", start: [6, 1], end: [8, 1] },
          { token: "NUMBER", start: [9, 1], end: [12, 1] },
        ]);
      },
      '2147483647   != 0o17777777777': function () {
        assertTokensEqual('2147483647   != 0o17777777777', [
          { token: "NUMBER", start: [0, 1], end: [10, 1] },
          { token: "NOTEQUAL", start: [13, 1], end: [15, 1] },
          { token: "NUMBER", start: [16, 1], end: [29, 1] },
        ]);
      },
      '-2147483647-1 != 0o20000000000': function () {
        assertTokensEqual('-2147483647-1 != 0o20000000000', [
          { token: "MINUS", start: [0, 1], end: [1, 1] },
          { token: "NUMBER", start: [1, 1], end: [11, 1] },
          { token: "MINUS", start: [11, 1], end: [12, 1] },
          { token: "NUMBER", start: [12, 1], end: [13, 1] },
          { token: "NOTEQUAL", start: [14, 1], end: [16, 1] },
          { token: "NUMBER", start: [17, 1], end: [30, 1] }
        ]);
      },
      '0o37777777777 != -1': function () {
        assertTokensEqual('0o37777777777 != -1', [
          { token: "NUMBER", start: [0, 1], end: [13, 1] },
          { token: "NOTEQUAL", start: [14, 1], end: [16, 1] },
          { token: "MINUS", start: [17, 1], end: [18, 1] },
          { token: "NUMBER", start: [18, 1], end: [19, 1] }
        ]);
      },
      '0xffffffff != -1; 0o37777777777 != -1; -0o1234567 == 0O001234567; 0b10101 == 0B00010101': function () {
        assertTokensEqual('0xffffffff != -1; 0o37777777777 != -1; -0o1234567 == 0O001234567; 0b10101 == 0B00010101', [
          { token: "NUMBER", start: [0, 1], end: [10, 1] },
          { token: "NOTEQUAL", start: [11, 1], end: [13, 1] },
          { token: "MINUS", start: [14, 1], end: [15, 1] },
          { token: "NUMBER", start: [15, 1], end: [16, 1] },
          { token: "SEMI", start: [16, 1], end: [17, 1] },
          { token: "NUMBER", start: [18, 1], end: [31, 1] },
          { token: "NOTEQUAL", start: [32, 1], end: [34, 1] },
          { token: "MINUS", start: [35, 1], end: [36, 1] },
          { token: "NUMBER", start: [36, 1], end: [37, 1] },
          { token: "SEMI", start: [37, 1], end: [38, 1] },
          { token: "MINUS", start: [39, 1], end: [40, 1] },
          { token: "NUMBER", start: [40, 1], end: [49, 1] },
          { token: "EQEQUAL", start: [50, 1], end: [52, 1] },
          { token: "NUMBER", start: [53, 1], end: [64, 1] },
          { token: "SEMI", start: [64, 1], end: [65, 1] },
          { token: "NUMBER", start: [66, 1], end: [73, 1] },
          { token: "EQEQUAL", start: [74, 1], end: [76, 1] },
          { token: "NUMBER", start: [77, 1], end: [87, 1] }
        ]);
      }
    },

    'long integers': {
      'x = 0': function () {
        assertTokensEqual('x = 0', [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "NUMBER", start: [4, 1], end: [5, 1] }
        ]);
      },
      'x = 0xffffffffffffffff': function () {
        assertTokensEqual('x = 0xffffffffffffffff', [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "NUMBER", start: [4, 1], end: [22, 1] }
        ]);
      },
      'x = 0o77777777777777777': function () {
        assertTokensEqual('x = 0o77777777777777777', [
          { token: "NAME", start: [0, 1], end: [1, 1] }, 
          { token: "EQUAL", start: [2, 1], end: [3, 1] }, 
          { token: "NUMBER", start: [4, 1], end: [23, 1] }
        ]);
      },
      'x = 0B11101010111111111': function () {
        assertTokensEqual('x = 0B11101010111111111', [
          { token: "NAME", start: [0, 1], end: [1, 1] }, 
          { token: "EQUAL", start: [2, 1], end: [3, 1] }, 
          { token: "NUMBER", start: [4, 1], end: [23, 1] }
        ]);
      },
      'x = 123456789012345678901234567890': function () {
        assertTokensEqual('x = 123456789012345678901234567890', [
          { token: "NAME", start: [0, 1], end: [1, 1] }, 
          { token: "EQUAL", start: [2, 1], end: [3, 1] }, 
          { token: "NUMBER", start: [4, 1], end: [34, 1] }
        ]);
      },
    },

    'floating point numbers': {
      'x = 3.14': function () {
        assertTokensEqual('x = 3.14', [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "NUMBER", start: [4, 1], end: [8, 1] }
        ]);
      },
      'x = 314.': function () {
        assertTokensEqual('x = 314.', [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "NUMBER", start: [4, 1], end: [8, 1] },
        ]);
      },
      'x = 0.314': function () {
        assertTokensEqual('x = 0.314', [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "NUMBER", start: [4, 1], end: [9, 1] },
        ]);
      },
      'x = 000.314': function () {
        assertTokensEqual('x = 000.314', [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "NUMBER", start: [4, 1], end: [11, 1] },
        ]);
      },
      'x = .314': function () {
        assertTokensEqual('x = .314', [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "NUMBER", start: [4, 1], end: [8, 1] },
        ]);
      },
      'x = 3e14': function () {
        assertTokensEqual('x = 3e14', [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "NUMBER", start: [4, 1], end: [8, 1] },
        ]);
      },
      'x = 3E14': function () {
        assertTokensEqual('x = 3E14', [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "NUMBER", start: [4, 1], end: [8, 1] },
        ]);
      },
      'x = 3e-14': function () {
        assertTokensEqual('x = 3e-14', [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "NUMBER", start: [4, 1], end: [9, 1] },
        ]);
      },
      'x = 3e+14': function () {
        assertTokensEqual('x = 3e+14', [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "NUMBER", start: [4, 1], end: [9, 1] },
        ]);
      },
      'x = 3.e14': function () {
        assertTokensEqual('x = 3.e14', [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "NUMBER", start: [4, 1], end: [9, 1] },
        ]);
      },
      'x = .3e14': function () {
        assertTokensEqual('x = .3e14', [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "NUMBER", start: [4, 1], end: [9, 1] },
        ]);
      },
      'x = 3.1e4': function () {
        assertTokensEqual('x = 3.1e4', [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "NUMBER", start: [4, 1], end: [9, 1] },
        ]);
      }
    },

    'string literals': {
      'x = \'\'; y = "";': function () {
        assertTokensEqual('x = \'\'; y = "";', [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "STRING", start: [4, 1], end: [6, 1] },
          { token: "SEMI", start: [6, 1], end: [7, 1] },
          { token: "NAME", start: [8, 1], end: [9, 1] },
          { token: "EQUAL", start: [10, 1], end: [11, 1] },
          { token: "STRING", start: [12, 1], end: [14, 1] },
          { token: "SEMI", start: [14, 1], end: [15, 1] }
        ]);
      },
      "x = '\\''; y = \"'\";": function () {
        assertTokensEqual("x = '\\''; y = \"'\";", [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "STRING", start: [4, 1], end: [8, 1] },
          { token: "SEMI", start: [8, 1], end: [9, 1] },
          { token: "NAME", start: [10, 1], end: [11, 1] },
          { token: "EQUAL", start: [12, 1], end: [13, 1] },
          { token: "STRING", start: [14, 1], end: [17, 1] },
          { token: "SEMI", start: [17, 1], end: [18, 1] }
        ]);
      },
      'x = \'"\'; y = "\\"";': function () {
        assertTokensEqual('x = \'"\'; y = "\\"";', [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "STRING", start: [4, 1], end: [7, 1] },
          { token: "SEMI", start: [7, 1], end: [8, 1] },
          { token: "NAME", start: [9, 1], end: [10, 1] },
          { token: "EQUAL", start: [11, 1], end: [12, 1] },
          { token: "STRING", start: [13, 1], end: [17, 1] },
          { token: "SEMI", start: [17, 1], end: [18, 1] }
        ]);
      },
      'x = "doesn\'t \\"shrink\\" does it"': function () {
        assertTokensEqual('x = "doesn\'t \\"shrink\\" does it"', [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "STRING", start: [4, 1], end: [32, 1] }
        ]);
      },
      "y = 'doesn\\'t \"shrink\" does it'": function () {
        assertTokensEqual("y = 'doesn\\'t \"shrink\" does it'", [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "STRING", start: [4, 1], end: [31, 1] }
        ]);
      },
      'x = "does \\"shrink\\" doesn\'t it"': function () {
        assertTokensEqual('x = "does \\"shrink\\" doesn\'t it"', [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "STRING", start: [4, 1], end: [32, 1] }
        ]);
      },
      "y = 'does \"shrink\" doesn\\'t it'": function () {
        assertTokensEqual("y = 'does \"shrink\" doesn\\'t it'", [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "STRING", start: [4, 1], end: [31, 1] }
        ]);
      },
      "y = '''\nThe \"quick\"\nbrown fox\njumps over\nthe 'lazy' dog.\n'''": function () {
        assertTokensEqual("y = '''\nThe \"quick\"\nbrown fox\njumps over\nthe 'lazy' dog.\n'''", [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "STRING", start: [4, 1], end: [3, 6] }
        ]);
      },
      "y = '\\nThe \"quick\"\\nbrown fox\\njumps over\\nthe \\'lazy\\' dog.\\n'": function () {
        assertTokensEqual("y = '\\nThe \"quick\"\\nbrown fox\\njumps over\\nthe \\'lazy\\' dog.\\n'", [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "STRING", start: [4, 1], end: [63, 1] }
        ]);
      },
      'x = """\nThe "quick"\nbrown fox\njumps over\nthe \'lazy\' dog.\n"""': function () {
        assertTokensEqual('x = """\nThe "quick"\nbrown fox\njumps over\nthe \'lazy\' dog.\n"""', [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "STRING", start: [4, 1], end: [3, 6] }
        ]);
      },
      'y = "\\n\\\nThe \\"quick\\"\\n\\\nbrown fox\\n\\\njumps over\\n\\\nthe \'lazy\' dog.\\n\\\n";': function () {
        assertTokensEqual('y = "\\n\\\nThe \\"quick\\"\\n\\\nbrown fox\\n\\\njumps over\\n\\\nthe \'lazy\' dog.\\n\\\n";', [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "STRING", start: [4, 1], end: [1, 6] },
          { token: "SEMI", start: [1, 6], end: [2, 6] }
        ]);
      },
      'y = \'\\n\\\nThe \\"quick\\"\\n\\\nbrown fox\\n\\\njumps over\\n\\\nthe \\\'lazy\\\' dog.\\n\\\n\';': function () {
        assertTokensEqual('y = "\\n\\\nThe \\"quick\\"\\n\\\nbrown fox\\n\\\njumps over\\n\\\nthe \'lazy\' dog.\\n\\\n";', [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "STRING", start: [4, 1], end: [1, 6] },
          { token: "SEMI", start: [1, 6], end: [2, 6] }
        ]);
      },
      "x = r'\\\\' + R'\\\\'": function () {
        assertTokensEqual("x = r'\\\\' + R'\\\\'", [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "STRING", start: [4, 1], end: [9, 1] },
          { token: "PLUS", start: [10, 1], end: [11, 1] },
          { token: "STRING", start: [12, 1], end: [17, 1] }
        ]);
      },
      "x = r'\\'' + ''": function () {
        assertTokensEqual("x = r'\\'' + ''", [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "STRING", start: [4, 1], end: [9, 1] },
          { token: "PLUS", start: [10, 1], end: [11, 1] },
          { token: "STRING", start: [12, 1], end: [14, 1] }
        ]);
      },
      "y = r'''\nfoo bar \\\\\nbaz''' + R'''\nfoo'''": function () {
        assertTokensEqual("y = r'''\nfoo bar \\\\\nbaz''' + R'''\nfoo'''", [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "STRING", start: [4, 1], end: [6, 3] },
          { token: "PLUS", start: [7, 3], end: [8, 3] },
          { token: "STRING", start: [9, 3], end: [6, 4] }
        ]);
      },
      "y = r\"\"\"foo\nbar \\\\ baz\n\"\"\" + R'''spam\n'''": function () {
        assertTokensEqual("y = r\"\"\"foo\nbar \\\\ baz\n\"\"\" + R'''spam\n'''", [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "STRING", start: [4, 1], end: [3, 3] },
          { token: "PLUS", start: [4, 3], end: [5, 3] },
          { token: "STRING", start: [6, 3], end: [3, 4] }
        ]);
      },
      "x = b'abc' + B'ABC'": function () {
        assertTokensEqual("x = b'abc' + B'ABC'", [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "STRING", start: [4, 1], end: [10, 1] },
          { token: "PLUS", start: [11, 1], end: [12, 1] },
          { token: "STRING", start: [13, 1], end: [19, 1] }
        ]);
      },
      'y = b"abc" + B"ABC"': function () {
        assertTokensEqual('y = b"abc" + B"ABC"', [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "STRING", start: [4, 1], end: [10, 1] },
          { token: "PLUS", start: [11, 1], end: [12, 1] },
          { token: "STRING", start: [13, 1], end: [19, 1] }
        ]);
      },
      "x = br'abc' + Br'ABC' + bR'ABC' + BR'ABC'": function () {
        assertTokensEqual("x = br'abc' + Br'ABC' + bR'ABC' + BR'ABC'", [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "STRING", start: [4, 1], end: [11, 1] },
          { token: "PLUS", start: [12, 1], end: [13, 1] },
          { token: "STRING", start: [14, 1], end: [21, 1] },
          { token: "PLUS", start: [22, 1], end: [23, 1] },
          { token: "STRING", start: [24, 1], end: [31, 1] },
          { token: "PLUS", start: [32, 1], end: [33, 1] },
          { token: "STRING", start: [34, 1], end: [41, 1] }
        ]);
      },
      'y = br"abc" + Br"ABC" + bR"ABC" + BR"ABC"': function () {
        assertTokensEqual('y = br"abc" + Br"ABC" + bR"ABC" + BR"ABC"', [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "STRING", start: [4, 1], end: [11, 1] },
          { token: "PLUS", start: [12, 1], end: [13, 1] },
          { token: "STRING", start: [14, 1], end: [21, 1] },
          { token: "PLUS", start: [22, 1], end: [23, 1] },
          { token: "STRING", start: [24, 1], end: [31, 1] },
          { token: "PLUS", start: [32, 1], end: [33, 1] },
          { token: "STRING", start: [34, 1], end: [41, 1] }
        ]);
      },
      "x = rb'abc' + rB'ABC' + Rb'ABC' + RB'ABC'": function () {
        assertTokensEqual("x = rb'abc' + rB'ABC' + Rb'ABC' + RB'ABC'", [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "STRING", start: [4, 1], end: [11, 1] },
          { token: "PLUS", start: [12, 1], end: [13, 1] },
          { token: "STRING", start: [14, 1], end: [21, 1] },
          { token: "PLUS", start: [22, 1], end: [23, 1] },
          { token: "STRING", start: [24, 1], end: [31, 1] },
          { token: "PLUS", start: [32, 1], end: [33, 1] },
          { token: "STRING", start: [34, 1], end: [41, 1] }
        ]);
      },
      'y = rb"abc" + rB"ABC" + Rb"ABC" + RB"ABC"': function () {
        assertTokensEqual('y = rb"abc" + rB"ABC" + Rb"ABC" + RB"ABC"', [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "STRING", start: [4, 1], end: [11, 1] },
          { token: "PLUS", start: [12, 1], end: [13, 1] },
          { token: "STRING", start: [14, 1], end: [21, 1] },
          { token: "PLUS", start: [22, 1], end: [23, 1] },
          { token: "STRING", start: [24, 1], end: [31, 1] },
          { token: "PLUS", start: [32, 1], end: [33, 1] },
          { token: "STRING", start: [34, 1], end: [41, 1] }
        ]);
      },
      "x = br'\\\\' + BR'\\\\'": function () {
        assertTokensEqual("x = br'\\\\' + BR'\\\\'", [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "STRING", start: [4, 1], end: [10, 1] },
          { token: "PLUS", start: [11, 1], end: [12, 1] },
          { token: "STRING", start: [13, 1], end: [19, 1] }
        ]);
      },
      "x = rb'\\\\' + RB'\\\\'": function () {
        assertTokensEqual("x = rb'\\\\' + RB'\\\\'", [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "STRING", start: [4, 1], end: [10, 1] },
          { token: "PLUS", start: [11, 1], end: [12, 1] },
          { token: "STRING", start: [13, 1], end: [19, 1] }
        ]);
      },
      "x = br'\\'' + ''": function () {
        assertTokensEqual("x = br'\\'' + ''", [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "STRING", start: [4, 1], end: [10, 1] },
          { token: "PLUS", start: [11, 1], end: [12, 1] },
          { token: "STRING", start: [13, 1], end: [15, 1] }
        ]);
      },
      "x = rb'\\'' + ''": function () {
        assertTokensEqual("x = rb'\\'' + ''", [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "STRING", start: [4, 1], end: [10, 1] },
          { token: "PLUS", start: [11, 1], end: [12, 1] },
          { token: "STRING", start: [13, 1], end: [15, 1] }
        ]);
      },
      "y = br'''\nfoo bar \\\\\nbaz''' + BR'''\nfoo'''": function () {
        assertTokensEqual("y = br'''\nfoo bar \\\\\nbaz''' + BR'''\nfoo'''", [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "STRING", start: [4, 1], end: [6, 3] },
          { token: "PLUS", start: [7, 3], end: [8, 3] },
          { token: "STRING", start: [9, 3], end: [6, 4] },
        ]);
      },
      'y = rB"""foo\nbar \\\\ baz\n""" + Rb\'\'\'spam\n\'\'\'': function () {
        assertTokensEqual('y = rB"""foo\nbar \\\\ baz\n""" + Rb\'\'\'spam\n\'\'\'', [
          { token: "NAME", start: [0, 1], end: [1, 1] },
          { token: "EQUAL", start: [2, 1], end: [3, 1] },
          { token: "STRING", start: [4, 1], end: [3, 3] },
          { token: "PLUS", start: [4, 3], end: [5, 3] },
          { token: "STRING", start: [6, 3], end: [3, 4] },
        ]);
      }
    },

    'indentation': function () {
      assertTokensEqual(
        'if 1:\n' +
        '    x = 2\n' +
        'if 1:\n' +
        '        x = 2\n' +
        'if 1:\n' +
        '    while 0:\n' +
        '     if 0:\n' +
        '           x = 2\n' +
        '     x = 2\n' +
        'if 0:\n' +
        '  if 2:\n' +
        '   while 0:\n' +
        '        if 1:\n' +
        '          x = 2\n',
        [
          { token: "NAME", start: [0, 1], end: [2, 1] },
          { token: "NUMBER", start: [3, 1], end: [4, 1] },
          { token: "COLON", start: [4, 1], end: [5, 1] },
          { token: "NEWLINE", start: [5, 1], end: [5, 1] },
          { token: "INDENT", lineNum: 2 },
          { token: "NAME", start: [4, 2], end: [5, 2] },
          { token: "EQUAL", start: [6, 2], end: [7, 2] },
          { token: "NUMBER", start: [8, 2], end: [9, 2] },
          { token: "NEWLINE", start: [9, 2], end: [9, 2] },
          { token: "DEDENT", lineNum: 2 },
          { token: "NAME", start: [0, 3], end: [2, 3] },
          { token: "NUMBER", start: [3, 3], end: [4, 3] },
          { token: "COLON", start: [4, 3], end: [5, 3] },
          { token: "NEWLINE", start: [5, 3], end: [5, 3] },
          { token: "INDENT", lineNum: 4 },
          { token: "NAME", start: [8, 4], end: [9, 4] },
          { token: "EQUAL", start: [10, 4], end: [11, 4] },
          { token: "NUMBER", start: [12, 4], end: [13, 4] },
          { token: "NEWLINE", start: [13, 4], end: [13, 4] },
          { token: "DEDENT", lineNum: 4 },
          { token: "NAME", start: [0, 5], end: [2, 5] },
          { token: "NUMBER", start: [3, 5], end: [4, 5] },
          { token: "COLON", start: [4, 5], end: [5, 5] },
          { token: "NEWLINE", start: [5, 5], end: [5, 5] },
          { token: "INDENT", lineNum: 6 },
          { token: "NAME", start: [4, 6], end: [9, 6] },
          { token: "NUMBER", start: [10, 6], end: [11, 6] },
          { token: "COLON", start: [11, 6], end: [12, 6] },
          { token: "NEWLINE", start: [12, 6], end: [12, 6] },
          { token: "INDENT", lineNum: 7 },
          { token: "NAME", start: [5, 7], end: [7, 7] },
          { token: "NUMBER", start: [8, 7], end: [9, 7] },
          { token: "COLON", start: [9, 7], end: [10, 7] },
          { token: "NEWLINE", start: [10, 7], end: [10, 7] },
          { token: "INDENT", lineNum: 8 },
          { token: "NAME", start: [11, 8], end: [12, 8] },
          { token: "EQUAL", start: [13, 8], end: [14, 8] },
          { token: "NUMBER", start: [15, 8], end: [16, 8] },
          { token: "NEWLINE", start: [16, 8], end: [16, 8] },
          { token: "DEDENT", lineNum: 9 },
          { token: "NAME", start: [5, 9], end: [6, 9] },
          { token: "EQUAL", start: [7, 9], end: [8, 9] },
          { token: "NUMBER", start: [9, 9], end: [10, 9] },
          { token: "NEWLINE", start: [10, 9], end: [10, 9] },
          { token: "DEDENT", lineNum: 9 },
          { token: "DEDENT", lineNum: 9 },
          { token: "NAME", start: [0, 10], end: [2, 10] },
          { token: "NUMBER", start: [3, 10], end: [4, 10] },
          { token: "COLON", start: [4, 10], end: [5, 10] },
          { token: "NEWLINE", start: [5, 10], end: [5, 10] },
          { token: "INDENT", lineNum: 11 },
          { token: "NAME", start: [2, 11], end: [4, 11] },
          { token: "NUMBER", start: [5, 11], end: [6, 11] },
          { token: "COLON", start: [6, 11], end: [7, 11] },
          { token: "NEWLINE", start: [7, 11], end: [7, 11] },
          { token: "INDENT", lineNum: 12 },
          { token: "NAME", start: [3, 12], end: [8, 12] },
          { token: "NUMBER", start: [9, 12], end: [10, 12] },
          { token: "COLON", start: [10, 12], end: [11, 12] },
          { token: "NEWLINE", start: [11, 12], end: [11, 12] },
          { token: "INDENT", lineNum: 13 },
          { token: "NAME", start: [8, 13], end: [10, 13] },
          { token: "NUMBER", start: [11, 13], end: [12, 13] },
          { token: "COLON", start: [12, 13], end: [13, 13] },
          { token: "NEWLINE", start: [13, 13], end: [13, 13] },
          { token: "INDENT", lineNum: 14 },
          { token: "NAME", start: [10, 14], end: [11, 14] },
          { token: "EQUAL", start: [12, 14], end: [13, 14] },
          { token: "NUMBER", start: [14, 14], end: [15, 14] },
          { token: "NEWLINE", start: [15, 14], end: [15, 14] },
          { token: "DEDENT", lineNum: 14 },
          { token: "DEDENT", lineNum: 14 },
          { token: "DEDENT", lineNum: 14 },
          { token: "DEDENT", lineNum: 14 }
        ]
      );
    }
  });
}); 

