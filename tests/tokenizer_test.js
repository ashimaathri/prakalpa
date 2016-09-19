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

    assert.strictEqual(tokenizer.getNext().type, 'ENDMARKER');
  };

  assertError = function (sourceText, expectedExceptionInfo) {
    var tokenizer, tokenInfo;

    tokenizer = new Tokenizer({ sourceText: sourceText });

    do {
      try {
        tokenInfo = tokenizer.getNext();
      } catch(e) {
        for(var key in expectedExceptionInfo) {
          assert.deepEqual(expectedExceptionInfo[key], e[key]);
        }
      }
    } while(tokenInfo.type !== 'ENDMARKER'); 
  };

  registerSuite({
    name: 'Tokenizer',

    'Hello world!': function () {
      assertTokensEqual('Hello world!', [
        { type: 'NAME', start: { column: 0, lineNum: 1 }, end: { column: 5, lineNum: 1 }},
        { type: 'NAME', start: { column: 6, lineNum: 1 }, end: { column: 11, lineNum: 1 }},
        { type: 'OP', start: { column: 11, lineNum: 1 }, end: { column: 12, lineNum: 1 }}
      ]);
    },

    '1 + 1': function () {
      assertTokensEqual('1 + 1', [
        { type: 'NUMBER', start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
        { type: 'PLUS', start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
        { type: 'NUMBER', start: { column: 4, lineNum: 1 }, end: { column: 5, lineNum: 1 }}
      ]);
    },

    'if False:\n    # NL\n    True = False # NEWLINE\n': function () {
      assertTokensEqual('if False:\n    # NL\n    True = False # NEWLINE\n', [
        { type: 'NAME', start: { column: 0, lineNum: 1 }, end: { column: 2, lineNum: 1 }},
        { type: 'NAME', start: { column: 3, lineNum: 1 }, end: { column: 8, lineNum: 1 }},
        { type: 'COLON', start: { column: 8, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
        { type: 'NEWLINE', start: { column: 9, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
        { type: 'INDENT', start: { column: 4, lineNum: 3 }},
        { type: 'NAME', start: { column: 4, lineNum: 3 }, end: { column: 8, lineNum: 3 }},
        { type: 'EQUAL', start: { column: 9, lineNum: 3 }, end: { column: 10, lineNum: 3 }},
        { type: 'NAME', start: { column: 11, lineNum: 3 }, end: { column: 16, lineNum: 3 }},
        { type: 'NEWLINE', start: { column: 17, lineNum: 3 }, end: { column: 26, lineNum: 3 }},
        { type: 'DEDENT', start: { column: 0, lineNum: 3 }},
      ]);
    },

    'indent error': function () {
      assertError('def k(x):\n    x += 2\n  x += 5\n', {
        message: 'No matching outer block for dedent',
        type: 'ERRORTOKEN',
        lineNum: 3,
      });
    },

    'if x == 1:\n    print(x)\n': function () {
      assertTokensEqual('if x == 1:\n    print(x)\n', [
        { type: 'NAME', start: { column: 0, lineNum: 1 }, end: { column: 2, lineNum: 1 }},
        { type: 'NAME', start: { column: 3, lineNum: 1 }, end: { column: 4, lineNum: 1 }},
        { type: 'EQEQUAL', start: { column: 5, lineNum: 1 }, end: { column: 7, lineNum: 1 }},
        { type: 'NUMBER', start: { column: 8, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
        { type: 'COLON', start: { column: 9, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
        { type: 'NEWLINE', start: { column: 10, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
        { type: 'INDENT', start: { column: 4, lineNum: 2 }}, 
        { type: 'NAME', start: { column: 4, lineNum: 2 }, end: { column: 9, lineNum: 2 }},
        { type: 'LPAR', start: { column: 9, lineNum: 2 }, end: { column: 10, lineNum: 2 }},
        { type: 'NAME', start: { column: 10, lineNum: 2 }, end: { column: 11, lineNum: 2 }},
        { type: 'RPAR', start: { column: 11, lineNum: 2 }, end: { column: 12, lineNum: 2 }},
        { type: 'NEWLINE', start: { column: 12, lineNum: 2 }, end: { column: 12, lineNum: 2 }},
        { type: 'DEDENT', start: { column: 0, lineNum: 2 }}
      ]);
    },

    '# This is a comment\n# This also': function () {
      assertTokensEqual('# This is a comment\n# This also', []);
    },

    'if x == 1 : \n  print(x)\n': function () {
      assertTokensEqual('if x == 1 : \n  print(x)\n', [
        { type: 'NAME', start: { column: 0, lineNum: 1 }, end: { column: 2, lineNum: 1 }},
        { type: 'NAME', start: { column: 3, lineNum: 1 }, end: { column: 4, lineNum: 1 }},
        { type: 'EQEQUAL', start: { column: 5, lineNum: 1 }, end: { column: 7, lineNum: 1 }},
        { type: 'NUMBER', start: { column: 8, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
        { type: 'COLON', start: { column: 10, lineNum: 1 }, end: { column: 11, lineNum: 1 }},
        { type: 'NEWLINE', start: { column: 12, lineNum: 1 }, end: { column: 12, lineNum: 1 }},
        { type: 'INDENT', start: { column: 2, lineNum: 2 }}, 
        { type: 'NAME', start: { column: 2, lineNum: 2 }, end: { column: 7, lineNum: 2 }},
        { type: 'LPAR', start: { column: 7, lineNum: 2 }, end: { column: 8, lineNum: 2 }},
        { type: 'NAME', start: { column: 8, lineNum: 2 }, end: { column: 9, lineNum: 2 }},
        { type: 'RPAR', start: { column: 9, lineNum: 2 }, end: { column: 10, lineNum: 2 }},
        { type: 'NEWLINE', start: { column: 10, lineNum: 2 }, end: { column: 10, lineNum: 2 }},
        { type: 'DEDENT', start: { column: 0, lineNum: 2 }}
      ]);
    },

    'comments': function () {
      assertTokensEqual('# Comments\n"#"\n#\'\n#"\n#\\\n      #\n    # abc\n\'\'\'#\n#\'\'\'\n\nx = 1  #\n', [
        {type: "STRING", start: { column: 0, lineNum: 2 }, end: { column: 3, lineNum: 2 }},
        {type: "NEWLINE", start: { column: 3, lineNum: 2 }, end: { column: 3, lineNum: 2 }},
        {type: "STRING", start: { column: 0, lineNum: 8 }, end: { column: 4, lineNum: 9 }},
        {type: "NEWLINE", start: { column: 4, lineNum: 9 }, end: { column: 4, lineNum: 9 }},
        {type: "NAME", start: { column: 0, lineNum: 11 }, end: { column: 1, lineNum: 11 }},
        {type: "EQUAL", start: { column: 2, lineNum: 11 }, end: { column: 3, lineNum: 11 }},
        {type: "NUMBER", start: { column: 4, lineNum: 11 }, end: { column: 5, lineNum: 11 }},
        {type: "NEWLINE", start: { column: 7, lineNum: 11 }, end: { column: 8, lineNum: 11 }}
      ]);
    },

    'balancing continuation': function () {
      assertTokensEqual("a = (3, 4,\n  5, 6)\ny = [3, 4,\n  5]\nz = {'a':5,\n  'b':6}\nx = (len(repr(y)) + 5*x - a[\n   3 ]\n   - x + len({\n   }\n    )\n  )", [
            { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
            { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
            { type: "LPAR", start: { column: 4, lineNum: 1 }, end: { column: 5, lineNum: 1 }},
            { type: "NUMBER", start: { column: 5, lineNum: 1 }, end: { column: 6, lineNum: 1 }},
            { type: "COMMA", start: { column: 6, lineNum: 1 }, end: { column: 7, lineNum: 1 }},
            { type: "NUMBER", start: { column: 8, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
            { type: "COMMA", start: { column: 9, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
            { type: "NUMBER", start: { column: 2, lineNum: 2 }, end: { column: 3, lineNum: 2 }},
            { type: "COMMA", start: { column: 3, lineNum: 2 }, end: { column: 4, lineNum: 2 }},
            { type: "NUMBER", start: { column: 5, lineNum: 2 }, end: { column: 6, lineNum: 2 }},
            { type: "RPAR", start: { column: 6, lineNum: 2 }, end: { column: 7, lineNum: 2 }},
            { type: "NEWLINE", start: { column: 7, lineNum: 2 }, end: { column: 7, lineNum: 2 }},
            { type: "NAME", start: { column: 0, lineNum: 3 }, end: { column: 1, lineNum: 3 }},
            { type: "EQUAL", start: { column: 2, lineNum: 3 }, end: { column: 3, lineNum: 3 }},
            { type: "LSQB", start: { column: 4, lineNum: 3 }, end: { column: 5, lineNum: 3 }},
            { type: "NUMBER", start: { column: 5, lineNum: 3 }, end: { column: 6, lineNum: 3 }},
            { type: "COMMA", start: { column: 6, lineNum: 3 }, end: { column: 7, lineNum: 3 }},
            { type: "NUMBER", start: { column: 8, lineNum: 3 }, end: { column: 9, lineNum: 3 }},
            { type: "COMMA", start: { column: 9, lineNum: 3 }, end: { column: 10, lineNum: 3 }},
            { type: "NUMBER", start: { column: 2, lineNum: 4 }, end: { column: 3, lineNum: 4 }},
            { type: "RSQB", start: { column: 3, lineNum: 4 }, end: { column: 4, lineNum: 4 }},
            { type: "NEWLINE", start: { column: 4, lineNum: 4 }, end: { column: 4, lineNum: 4 }},
            { type: "NAME", start: { column: 0, lineNum: 5 }, end: { column: 1, lineNum: 5 }},
            { type: "EQUAL", start: { column: 2, lineNum: 5 }, end: { column: 3, lineNum: 5 }},
            { type: "LBRACE", start: { column: 4, lineNum: 5 }, end: { column: 5, lineNum: 5 }},
            { type: "STRING", start: { column: 5, lineNum: 5 }, end: { column: 8, lineNum: 5 }},
            { type: "COLON", start: { column: 8, lineNum: 5 }, end: { column: 9, lineNum: 5 }},
            { type: "NUMBER", start: { column: 9, lineNum: 5 }, end: { column: 10, lineNum: 5 }},
            { type: "COMMA", start: { column: 10, lineNum: 5 }, end: { column: 11, lineNum: 5 }},
            { type: "STRING", start: { column: 2, lineNum: 6 }, end: { column: 5, lineNum: 6 }},
            { type: "COLON", start: { column: 5, lineNum: 6 }, end: { column: 6, lineNum: 6 }},
            { type: "NUMBER", start: { column: 6, lineNum: 6 }, end: { column: 7, lineNum: 6 }},
            { type: "RBRACE", start: { column: 7, lineNum: 6 }, end: { column: 8, lineNum: 6 }},
            { type: "NEWLINE", start: { column: 8, lineNum: 6 }, end: { column: 8, lineNum: 6 }},
            { type: "NAME", start: { column: 0, lineNum: 7 }, end: { column: 1, lineNum: 7 }},
            { type: "EQUAL", start: { column: 2, lineNum: 7 }, end: { column: 3, lineNum: 7 }},
            { type: "LPAR", start: { column: 4, lineNum: 7 }, end: { column: 5, lineNum: 7 }},
            { type: "NAME", start: { column: 5, lineNum: 7 }, end: { column: 8, lineNum: 7 }},
            { type: "LPAR", start: { column: 8, lineNum: 7 }, end: { column: 9, lineNum: 7 }},
            { type: "NAME", start: { column: 9, lineNum: 7 }, end: { column: 13, lineNum: 7 }},
            { type: "LPAR", start: { column: 13, lineNum: 7 }, end: { column: 14, lineNum: 7 }},
            { type: "NAME", start: { column: 14, lineNum: 7 }, end: { column: 15, lineNum: 7 }},
            { type: "RPAR", start: { column: 15, lineNum: 7 }, end: { column: 16, lineNum: 7 }},
            { type: "RPAR", start: { column: 16, lineNum: 7 }, end: { column: 17, lineNum: 7 }},
            { type: "PLUS", start: { column: 18, lineNum: 7 }, end: { column: 19, lineNum: 7 }},
            { type: "NUMBER", start: { column: 20, lineNum: 7 }, end: { column: 21, lineNum: 7 }},
            { type: "STAR", start: { column: 21, lineNum: 7 }, end: { column: 22, lineNum: 7 }},
            { type: "NAME", start: { column: 22, lineNum: 7 }, end: { column: 23, lineNum: 7 }},
            { type: "MINUS", start: { column: 24, lineNum: 7 }, end: { column: 25, lineNum: 7 }},
            { type: "NAME", start: { column: 26, lineNum: 7 }, end: { column: 27, lineNum: 7 }},
            { type: "LSQB", start: { column: 27, lineNum: 7 }, end: { column: 28, lineNum: 7 }},
            { type: "NUMBER", start: { column: 3, lineNum: 8 }, end: { column: 4, lineNum: 8 }},
            { type: "RSQB", start: { column: 5, lineNum: 8 }, end: { column: 6, lineNum: 8 }},
            { type: "MINUS", start: { column: 3, lineNum: 9 }, end: { column: 4, lineNum: 9 }},
            { type: "NAME", start: { column: 5, lineNum: 9 }, end: { column: 6, lineNum: 9 }},
            { type: "PLUS", start: { column: 7, lineNum: 9 }, end: { column: 8, lineNum: 9 }},
            { type: "NAME", start: { column: 9, lineNum: 9 }, end: { column: 12, lineNum: 9 }},
            { type: "LPAR", start: { column: 12, lineNum: 9 }, end: { column: 13, lineNum: 9 }},
            { type: "LBRACE", start: { column: 13, lineNum: 9 }, end: { column: 14, lineNum: 9 }},
            { type: "RBRACE", start: { column: 3, lineNum: 10 }, end: { column: 4, lineNum: 10 }},
            { type: "RPAR", start: { column: 4, lineNum: 11 }, end: { column: 5, lineNum: 11 }},
            { type: "RPAR", start: { column: 2, lineNum: 12 }, end: { column: 3, lineNum: 12 }}
      ]);
    },

    'backslash means line continuation': function () {
      assertTokensEqual('x = 1 \\\n+ 1', [
        { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
        { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
        { type: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 5, lineNum: 1 }},
        { type: "PLUS", start: { column: 0, lineNum: 2 }, end: { column: 1, lineNum: 2 }},
        { type: "NUMBER", start: { column: 2, lineNum: 2 }, end: { column: 3, lineNum: 2 }}
      ]);
    },

    'backslash does not mean line continuation in comments': function () {
      assertTokensEqual('# Backslash does not means continuation in comments :\\\nx = 0', [
        { type: "NAME", start: { column: 0, lineNum: 2 }, end: { column: 1, lineNum: 2 }},
        { type: "EQUAL", start: { column: 2, lineNum: 2 }, end: { column: 3, lineNum: 2 }},
        { type: "NUMBER", start: { column: 4, lineNum: 2 }, end: { column: 5, lineNum: 2 }}
      ]);
    },

    'ordinary integers': {
      '0xff != 255': function () {
        assertTokensEqual('0xff != 255', [
          { type: "NUMBER", start: { column: 0, lineNum: 1 }, end: { column: 4, lineNum: 1 }},
          { type: "NOTEQUAL", start: { column: 5, lineNum: 1 }, end: { column: 7, lineNum: 1 }},
          { type: "NUMBER", start: { column: 8, lineNum: 1 }, end: { column: 11, lineNum: 1 }}
        ]);
      },
      '0o377 != 255': function () {
        assertTokensEqual('0o377 != 255', [
          { type: "NUMBER", start: { column: 0, lineNum: 1 }, end: { column: 5, lineNum: 1 }},
          { type: "NOTEQUAL", start: { column: 6, lineNum: 1 }, end: { column: 8, lineNum: 1 }},
          { type: "NUMBER", start: { column: 9, lineNum: 1 }, end: { column: 12, lineNum: 1 }},
        ]);
      },
      '2147483647   != 0o17777777777': function () {
        assertTokensEqual('2147483647   != 0o17777777777', [
          { type: "NUMBER", start: { column: 0, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
          { type: "NOTEQUAL", start: { column: 13, lineNum: 1 }, end: { column: 15, lineNum: 1 }},
          { type: "NUMBER", start: { column: 16, lineNum: 1 }, end: { column: 29, lineNum: 1 }},
        ]);
      },
      '-2147483647-1 != 0o20000000000': function () {
        assertTokensEqual('-2147483647-1 != 0o20000000000', [
          { type: "MINUS", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "NUMBER", start: { column: 1, lineNum: 1 }, end: { column: 11, lineNum: 1 }},
          { type: "MINUS", start: { column: 11, lineNum: 1 }, end: { column: 12, lineNum: 1 }},
          { type: "NUMBER", start: { column: 12, lineNum: 1 }, end: { column: 13, lineNum: 1 }},
          { type: "NOTEQUAL", start: { column: 14, lineNum: 1 }, end: { column: 16, lineNum: 1 }},
          { type: "NUMBER", start: { column: 17, lineNum: 1 }, end: { column: 30, lineNum: 1 }}
        ]);
      },
      '0o37777777777 != -1': function () {
        assertTokensEqual('0o37777777777 != -1', [
          { type: "NUMBER", start: { column: 0, lineNum: 1 }, end: { column: 13, lineNum: 1 }},
          { type: "NOTEQUAL", start: { column: 14, lineNum: 1 }, end: { column: 16, lineNum: 1 }},
          { type: "MINUS", start: { column: 17, lineNum: 1 }, end: { column: 18, lineNum: 1 }},
          { type: "NUMBER", start: { column: 18, lineNum: 1 }, end: { column: 19, lineNum: 1 }}
        ]);
      },
      '0xffffffff != -1; 0o37777777777 != -1; -0o1234567 == 0O001234567; 0b10101 == 0B00010101': function () {
        assertTokensEqual('0xffffffff != -1; 0o37777777777 != -1; -0o1234567 == 0O001234567; 0b10101 == 0B00010101', [
          { type: "NUMBER", start: { column: 0, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
          { type: "NOTEQUAL", start: { column: 11, lineNum: 1 }, end: { column: 13, lineNum: 1 }},
          { type: "MINUS", start: { column: 14, lineNum: 1 }, end: { column: 15, lineNum: 1 }},
          { type: "NUMBER", start: { column: 15, lineNum: 1 }, end: { column: 16, lineNum: 1 }},
          { type: "SEMI", start: { column: 16, lineNum: 1 }, end: { column: 17, lineNum: 1 }},
          { type: "NUMBER", start: { column: 18, lineNum: 1 }, end: { column: 31, lineNum: 1 }},
          { type: "NOTEQUAL", start: { column: 32, lineNum: 1 }, end: { column: 34, lineNum: 1 }},
          { type: "MINUS", start: { column: 35, lineNum: 1 }, end: { column: 36, lineNum: 1 }},
          { type: "NUMBER", start: { column: 36, lineNum: 1 }, end: { column: 37, lineNum: 1 }},
          { type: "SEMI", start: { column: 37, lineNum: 1 }, end: { column: 38, lineNum: 1 }},
          { type: "MINUS", start: { column: 39, lineNum: 1 }, end: { column: 40, lineNum: 1 }},
          { type: "NUMBER", start: { column: 40, lineNum: 1 }, end: { column: 49, lineNum: 1 }},
          { type: "EQEQUAL", start: { column: 50, lineNum: 1 }, end: { column: 52, lineNum: 1 }},
          { type: "NUMBER", start: { column: 53, lineNum: 1 }, end: { column: 64, lineNum: 1 }},
          { type: "SEMI", start: { column: 64, lineNum: 1 }, end: { column: 65, lineNum: 1 }},
          { type: "NUMBER", start: { column: 66, lineNum: 1 }, end: { column: 73, lineNum: 1 }},
          { type: "EQEQUAL", start: { column: 74, lineNum: 1 }, end: { column: 76, lineNum: 1 }},
          { type: "NUMBER", start: { column: 77, lineNum: 1 }, end: { column: 87, lineNum: 1 }}
        ]);
      }
    },

    'long integers': {
      'x = 0': function () {
        assertTokensEqual('x = 0', [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 5, lineNum: 1 }}
        ]);
      },
      'x = 0xffffffffffffffff': function () {
        assertTokensEqual('x = 0xffffffffffffffff', [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 22, lineNum: 1 }}
        ]);
      },
      'x = 0o77777777777777777': function () {
        assertTokensEqual('x = 0o77777777777777777', [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }}, 
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }}, 
          { type: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 23, lineNum: 1 }}
        ]);
      },
      'x = 0B11101010111111111': function () {
        assertTokensEqual('x = 0B11101010111111111', [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }}, 
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }}, 
          { type: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 23, lineNum: 1 }}
        ]);
      },
      'x = 123456789012345678901234567890': function () {
        assertTokensEqual('x = 123456789012345678901234567890', [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }}, 
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }}, 
          { type: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 34, lineNum: 1 }}
        ]);
      },
    },

    'floating point numbers': {
      'x = 3.14': function () {
        assertTokensEqual('x = 3.14', [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 8, lineNum: 1 }}
        ]);
      },
      'x = 314.': function () {
        assertTokensEqual('x = 314.', [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 8, lineNum: 1 }},
        ]);
      },
      'x = 0.314': function () {
        assertTokensEqual('x = 0.314', [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
        ]);
      },
      'x = 000.314': function () {
        assertTokensEqual('x = 000.314', [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 11, lineNum: 1 }},
        ]);
      },
      'x = .314': function () {
        assertTokensEqual('x = .314', [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 8, lineNum: 1 }},
        ]);
      },
      'x = 3e14': function () {
        assertTokensEqual('x = 3e14', [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 8, lineNum: 1 }},
        ]);
      },
      'x = 3E14': function () {
        assertTokensEqual('x = 3E14', [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 8, lineNum: 1 }},
        ]);
      },
      'x = 3e-14': function () {
        assertTokensEqual('x = 3e-14', [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
        ]);
      },
      'x = 3e+14': function () {
        assertTokensEqual('x = 3e+14', [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
        ]);
      },
      'x = 3.e14': function () {
        assertTokensEqual('x = 3.e14', [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
        ]);
      },
      'x = .3e14': function () {
        assertTokensEqual('x = .3e14', [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
        ]);
      },
      'x = 3.1e4': function () {
        assertTokensEqual('x = 3.1e4', [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
        ]);
      }
    },

    'string literals': {
      'x = \'\'; y = "";': function () {
        assertTokensEqual('x = \'\'; y = "";', [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 6, lineNum: 1 }},
          { type: "SEMI", start: { column: 6, lineNum: 1 }, end: { column: 7, lineNum: 1 }},
          { type: "NAME", start: { column: 8, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
          { type: "EQUAL", start: { column: 10, lineNum: 1 }, end: { column: 11, lineNum: 1 }},
          { type: "STRING", start: { column: 12, lineNum: 1 }, end: { column: 14, lineNum: 1 }},
          { type: "SEMI", start: { column: 14, lineNum: 1 }, end: { column: 15, lineNum: 1 }}
        ]);
      },
      "x = '\\''; y = \"'\";": function () {
        assertTokensEqual("x = '\\''; y = \"'\";", [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 8, lineNum: 1 }},
          { type: "SEMI", start: { column: 8, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
          { type: "NAME", start: { column: 10, lineNum: 1 }, end: { column: 11, lineNum: 1 }},
          { type: "EQUAL", start: { column: 12, lineNum: 1 }, end: { column: 13, lineNum: 1 }},
          { type: "STRING", start: { column: 14, lineNum: 1 }, end: { column: 17, lineNum: 1 }},
          { type: "SEMI", start: { column: 17, lineNum: 1 }, end: { column: 18, lineNum: 1 }}
        ]);
      },
      'x = \'"\'; y = "\\"";': function () {
        assertTokensEqual('x = \'"\'; y = "\\"";', [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 7, lineNum: 1 }},
          { type: "SEMI", start: { column: 7, lineNum: 1 }, end: { column: 8, lineNum: 1 }},
          { type: "NAME", start: { column: 9, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
          { type: "EQUAL", start: { column: 11, lineNum: 1 }, end: { column: 12, lineNum: 1 }},
          { type: "STRING", start: { column: 13, lineNum: 1 }, end: { column: 17, lineNum: 1 }},
          { type: "SEMI", start: { column: 17, lineNum: 1 }, end: { column: 18, lineNum: 1 }}
        ]);
      },
      'x = "doesn\'t \\"shrink\\" does it"': function () {
        assertTokensEqual('x = "doesn\'t \\"shrink\\" does it"', [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 32, lineNum: 1 }}
        ]);
      },
      "y = 'doesn\\'t \"shrink\" does it'": function () {
        assertTokensEqual("y = 'doesn\\'t \"shrink\" does it'", [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 31, lineNum: 1 }}
        ]);
      },
      'x = "does \\"shrink\\" doesn\'t it"': function () {
        assertTokensEqual('x = "does \\"shrink\\" doesn\'t it"', [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 32, lineNum: 1 }}
        ]);
      },
      "y = 'does \"shrink\" doesn\\'t it'": function () {
        assertTokensEqual("y = 'does \"shrink\" doesn\\'t it'", [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 31, lineNum: 1 }}
        ]);
      },
      "y = '''\nThe \"quick\"\nbrown fox\njumps over\nthe 'lazy' dog.\n'''": function () {
        assertTokensEqual("y = '''\nThe \"quick\"\nbrown fox\njumps over\nthe 'lazy' dog.\n'''", [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 3, lineNum: 6 }}
        ]);
      },
      "y = '\\nThe \"quick\"\\nbrown fox\\njumps over\\nthe \\'lazy\\' dog.\\n'": function () {
        assertTokensEqual("y = '\\nThe \"quick\"\\nbrown fox\\njumps over\\nthe \\'lazy\\' dog.\\n'", [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 63, lineNum: 1 }}
        ]);
      },
      'x = """\nThe "quick"\nbrown fox\njumps over\nthe \'lazy\' dog.\n"""': function () {
        assertTokensEqual('x = """\nThe "quick"\nbrown fox\njumps over\nthe \'lazy\' dog.\n"""', [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 3, lineNum: 6 }}
        ]);
      },
      'y = "\\n\\\nThe \\"quick\\"\\n\\\nbrown fox\\n\\\njumps over\\n\\\nthe \'lazy\' dog.\\n\\\n";': function () {
        assertTokensEqual('y = "\\n\\\nThe \\"quick\\"\\n\\\nbrown fox\\n\\\njumps over\\n\\\nthe \'lazy\' dog.\\n\\\n";', [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 1, lineNum: 6 }},
          { type: "SEMI", start: { column: 1, lineNum: 6 }, end: { column: 2, lineNum: 6 }}
        ]);
      },
      'y = \'\\n\\\nThe \\"quick\\"\\n\\\nbrown fox\\n\\\njumps over\\n\\\nthe \\\'lazy\\\' dog.\\n\\\n\';': function () {
        assertTokensEqual('y = "\\n\\\nThe \\"quick\\"\\n\\\nbrown fox\\n\\\njumps over\\n\\\nthe \'lazy\' dog.\\n\\\n";', [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 1, lineNum: 6 }},
          { type: "SEMI", start: { column: 1, lineNum: 6 }, end: { column: 2, lineNum: 6 }}
        ]);
      },
      "x = r'\\\\' + R'\\\\'": function () {
        assertTokensEqual("x = r'\\\\' + R'\\\\'", [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
          { type: "PLUS", start: { column: 10, lineNum: 1 }, end: { column: 11, lineNum: 1 }},
          { type: "STRING", start: { column: 12, lineNum: 1 }, end: { column: 17, lineNum: 1 }}
        ]);
      },
      "x = r'\\'' + ''": function () {
        assertTokensEqual("x = r'\\'' + ''", [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
          { type: "PLUS", start: { column: 10, lineNum: 1 }, end: { column: 11, lineNum: 1 }},
          { type: "STRING", start: { column: 12, lineNum: 1 }, end: { column: 14, lineNum: 1 }}
        ]);
      },
      "y = r'''\nfoo bar \\\\\nbaz''' + R'''\nfoo'''": function () {
        assertTokensEqual("y = r'''\nfoo bar \\\\\nbaz''' + R'''\nfoo'''", [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 6, lineNum: 3 }},
          { type: "PLUS", start: { column: 7, lineNum: 3 }, end: { column: 8, lineNum: 3 }},
          { type: "STRING", start: { column: 9, lineNum: 3 }, end: { column: 6, lineNum: 4 }}
        ]);
      },
      "y = r\"\"\"foo\nbar \\\\ baz\n\"\"\" + R'''spam\n'''": function () {
        assertTokensEqual("y = r\"\"\"foo\nbar \\\\ baz\n\"\"\" + R'''spam\n'''", [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 3, lineNum: 3 }},
          { type: "PLUS", start: { column: 4, lineNum: 3 }, end: { column: 5, lineNum: 3 }},
          { type: "STRING", start: { column: 6, lineNum: 3 }, end: { column: 3, lineNum: 4 }}
        ]);
      },
      "x = b'abc' + B'ABC'": function () {
        assertTokensEqual("x = b'abc' + B'ABC'", [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
          { type: "PLUS", start: { column: 11, lineNum: 1 }, end: { column: 12, lineNum: 1 }},
          { type: "STRING", start: { column: 13, lineNum: 1 }, end: { column: 19, lineNum: 1 }}
        ]);
      },
      'y = b"abc" + B"ABC"': function () {
        assertTokensEqual('y = b"abc" + B"ABC"', [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
          { type: "PLUS", start: { column: 11, lineNum: 1 }, end: { column: 12, lineNum: 1 }},
          { type: "STRING", start: { column: 13, lineNum: 1 }, end: { column: 19, lineNum: 1 }}
        ]);
      },
      "x = br'abc' + Br'ABC' + bR'ABC' + BR'ABC'": function () {
        assertTokensEqual("x = br'abc' + Br'ABC' + bR'ABC' + BR'ABC'", [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 11, lineNum: 1 }},
          { type: "PLUS", start: { column: 12, lineNum: 1 }, end: { column: 13, lineNum: 1 }},
          { type: "STRING", start: { column: 14, lineNum: 1 }, end: { column: 21, lineNum: 1 }},
          { type: "PLUS", start: { column: 22, lineNum: 1 }, end: { column: 23, lineNum: 1 }},
          { type: "STRING", start: { column: 24, lineNum: 1 }, end: { column: 31, lineNum: 1 }},
          { type: "PLUS", start: { column: 32, lineNum: 1 }, end: { column: 33, lineNum: 1 }},
          { type: "STRING", start: { column: 34, lineNum: 1 }, end: { column: 41, lineNum: 1 }}
        ]);
      },
      'y = br"abc" + Br"ABC" + bR"ABC" + BR"ABC"': function () {
        assertTokensEqual('y = br"abc" + Br"ABC" + bR"ABC" + BR"ABC"', [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 11, lineNum: 1 }},
          { type: "PLUS", start: { column: 12, lineNum: 1 }, end: { column: 13, lineNum: 1 }},
          { type: "STRING", start: { column: 14, lineNum: 1 }, end: { column: 21, lineNum: 1 }},
          { type: "PLUS", start: { column: 22, lineNum: 1 }, end: { column: 23, lineNum: 1 }},
          { type: "STRING", start: { column: 24, lineNum: 1 }, end: { column: 31, lineNum: 1 }},
          { type: "PLUS", start: { column: 32, lineNum: 1 }, end: { column: 33, lineNum: 1 }},
          { type: "STRING", start: { column: 34, lineNum: 1 }, end: { column: 41, lineNum: 1 }}
        ]);
      },
      "x = rb'abc' + rB'ABC' + Rb'ABC' + RB'ABC'": function () {
        assertTokensEqual("x = rb'abc' + rB'ABC' + Rb'ABC' + RB'ABC'", [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 11, lineNum: 1 }},
          { type: "PLUS", start: { column: 12, lineNum: 1 }, end: { column: 13, lineNum: 1 }},
          { type: "STRING", start: { column: 14, lineNum: 1 }, end: { column: 21, lineNum: 1 }},
          { type: "PLUS", start: { column: 22, lineNum: 1 }, end: { column: 23, lineNum: 1 }},
          { type: "STRING", start: { column: 24, lineNum: 1 }, end: { column: 31, lineNum: 1 }},
          { type: "PLUS", start: { column: 32, lineNum: 1 }, end: { column: 33, lineNum: 1 }},
          { type: "STRING", start: { column: 34, lineNum: 1 }, end: { column: 41, lineNum: 1 }}
        ]);
      },
      'y = rb"abc" + rB"ABC" + Rb"ABC" + RB"ABC"': function () {
        assertTokensEqual('y = rb"abc" + rB"ABC" + Rb"ABC" + RB"ABC"', [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 11, lineNum: 1 }},
          { type: "PLUS", start: { column: 12, lineNum: 1 }, end: { column: 13, lineNum: 1 }},
          { type: "STRING", start: { column: 14, lineNum: 1 }, end: { column: 21, lineNum: 1 }},
          { type: "PLUS", start: { column: 22, lineNum: 1 }, end: { column: 23, lineNum: 1 }},
          { type: "STRING", start: { column: 24, lineNum: 1 }, end: { column: 31, lineNum: 1 }},
          { type: "PLUS", start: { column: 32, lineNum: 1 }, end: { column: 33, lineNum: 1 }},
          { type: "STRING", start: { column: 34, lineNum: 1 }, end: { column: 41, lineNum: 1 }}
        ]);
      },
      "x = br'\\\\' + BR'\\\\'": function () {
        assertTokensEqual("x = br'\\\\' + BR'\\\\'", [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
          { type: "PLUS", start: { column: 11, lineNum: 1 }, end: { column: 12, lineNum: 1 }},
          { type: "STRING", start: { column: 13, lineNum: 1 }, end: { column: 19, lineNum: 1 }}
        ]);
      },
      "x = rb'\\\\' + RB'\\\\'": function () {
        assertTokensEqual("x = rb'\\\\' + RB'\\\\'", [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
          { type: "PLUS", start: { column: 11, lineNum: 1 }, end: { column: 12, lineNum: 1 }},
          { type: "STRING", start: { column: 13, lineNum: 1 }, end: { column: 19, lineNum: 1 }}
        ]);
      },
      "x = br'\\'' + ''": function () {
        assertTokensEqual("x = br'\\'' + ''", [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
          { type: "PLUS", start: { column: 11, lineNum: 1 }, end: { column: 12, lineNum: 1 }},
          { type: "STRING", start: { column: 13, lineNum: 1 }, end: { column: 15, lineNum: 1 }}
        ]);
      },
      "x = rb'\\'' + ''": function () {
        assertTokensEqual("x = rb'\\'' + ''", [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
          { type: "PLUS", start: { column: 11, lineNum: 1 }, end: { column: 12, lineNum: 1 }},
          { type: "STRING", start: { column: 13, lineNum: 1 }, end: { column: 15, lineNum: 1 }}
        ]);
      },
      "y = br'''\nfoo bar \\\\\nbaz''' + BR'''\nfoo'''": function () {
        assertTokensEqual("y = br'''\nfoo bar \\\\\nbaz''' + BR'''\nfoo'''", [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 6, lineNum: 3 }},
          { type: "PLUS", start: { column: 7, lineNum: 3 }, end: { column: 8, lineNum: 3 }},
          { type: "STRING", start: { column: 9, lineNum: 3 }, end: { column: 6, lineNum: 4 }},
        ]);
      },
      'y = rB"""foo\nbar \\\\ baz\n""" + Rb\'\'\'spam\n\'\'\'': function () {
        assertTokensEqual('y = rB"""foo\nbar \\\\ baz\n""" + Rb\'\'\'spam\n\'\'\'', [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 3, lineNum: 3 }},
          { type: "PLUS", start: { column: 4, lineNum: 3 }, end: { column: 5, lineNum: 3 }},
          { type: "STRING", start: { column: 6, lineNum: 3 }, end: { column: 3, lineNum: 4 }},
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
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 2, lineNum: 1 }},
          { type: "NUMBER", start: { column: 3, lineNum: 1 }, end: { column: 4, lineNum: 1 }},
          { type: "COLON", start: { column: 4, lineNum: 1 }, end: { column: 5, lineNum: 1 }},
          { type: "NEWLINE", start: { column: 5, lineNum: 1 }, end: { column: 5, lineNum: 1 }},
          { type: "INDENT", start: { column: 4, lineNum: 2 }},
          { type: "NAME", start: { column: 4, lineNum: 2 }, end: { column: 5, lineNum: 2 }},
          { type: "EQUAL", start: { column: 6, lineNum: 2 }, end: { column: 7, lineNum: 2 }},
          { type: "NUMBER", start: { column: 8, lineNum: 2 }, end: { column: 9, lineNum: 2 }},
          { type: "NEWLINE", start: { column: 9, lineNum: 2 }, end: { column: 9, lineNum: 2 }},
          { type: "DEDENT", start: { column: 0, lineNum: 2 }},
          { type: "NAME", start: { column: 0, lineNum: 3 }, end: { column: 2, lineNum: 3 }},
          { type: "NUMBER", start: { column: 3, lineNum: 3 }, end: { column: 4, lineNum: 3 }},
          { type: "COLON", start: { column: 4, lineNum: 3 }, end: { column: 5, lineNum: 3 }},
          { type: "NEWLINE", start: { column: 5, lineNum: 3 }, end: { column: 5, lineNum: 3 }},
          { type: "INDENT", start: { column: 8, lineNum: 4 }},
          { type: "NAME", start: { column: 8, lineNum: 4 }, end: { column: 9, lineNum: 4 }},
          { type: "EQUAL", start: { column: 10, lineNum: 4 }, end: { column: 11, lineNum: 4 }},
          { type: "NUMBER", start: { column: 12, lineNum: 4 }, end: { column: 13, lineNum: 4 }},
          { type: "NEWLINE", start: { column: 13, lineNum: 4 }, end: { column: 13, lineNum: 4 }},
          { type: "DEDENT", start: { column: 0, lineNum: 4 }},
          { type: "NAME", start: { column: 0, lineNum: 5 }, end: { column: 2, lineNum: 5 }},
          { type: "NUMBER", start: { column: 3, lineNum: 5 }, end: { column: 4, lineNum: 5 }},
          { type: "COLON", start: { column: 4, lineNum: 5 }, end: { column: 5, lineNum: 5 }},
          { type: "NEWLINE", start: { column: 5, lineNum: 5 }, end: { column: 5, lineNum: 5 }},
          { type: "INDENT", start: { column: 4, lineNum: 6 }},
          { type: "NAME", start: { column: 4, lineNum: 6 }, end: { column: 9, lineNum: 6 }},
          { type: "NUMBER", start: { column: 10, lineNum: 6 }, end: { column: 11, lineNum: 6 }},
          { type: "COLON", start: { column: 11, lineNum: 6 }, end: { column: 12, lineNum: 6 }},
          { type: "NEWLINE", start: { column: 12, lineNum: 6 }, end: { column: 12, lineNum: 6 }},
          { type: "INDENT", start: { column: 5, lineNum: 7 }},
          { type: "NAME", start: { column: 5, lineNum: 7 }, end: { column: 7, lineNum: 7 }},
          { type: "NUMBER", start: { column: 8, lineNum: 7 }, end: { column: 9, lineNum: 7 }},
          { type: "COLON", start: { column: 9, lineNum: 7 }, end: { column: 10, lineNum: 7 }},
          { type: "NEWLINE", start: { column: 10, lineNum: 7 }, end: { column: 10, lineNum: 7 }},
          { type: "INDENT", start: { column: 11, lineNum: 8 }},
          { type: "NAME", start: { column: 11, lineNum: 8 }, end: { column: 12, lineNum: 8 }},
          { type: "EQUAL", start: { column: 13, lineNum: 8 }, end: { column: 14, lineNum: 8 }},
          { type: "NUMBER", start: { column: 15, lineNum: 8 }, end: { column: 16, lineNum: 8 }},
          { type: "NEWLINE", start: { column: 16, lineNum: 8 }, end: { column: 16, lineNum: 8 }},
          { type: "DEDENT", start: { column: 5, lineNum: 9 }},
          { type: "NAME", start: { column: 5, lineNum: 9 }, end: { column: 6, lineNum: 9 }},
          { type: "EQUAL", start: { column: 7, lineNum: 9 }, end: { column: 8, lineNum: 9 }},
          { type: "NUMBER", start: { column: 9, lineNum: 9 }, end: { column: 10, lineNum: 9 }},
          { type: "NEWLINE", start: { column: 10, lineNum: 9 }, end: { column: 10, lineNum: 9 }},
          { type: "DEDENT", start: { column: 0, lineNum: 9 }},
          { type: "DEDENT", start: { column: 0, lineNum: 9 }},
          { type: "NAME", start: { column: 0, lineNum: 10 }, end: { column: 2, lineNum: 10 }},
          { type: "NUMBER", start: { column: 3, lineNum: 10 }, end: { column: 4, lineNum: 10 }},
          { type: "COLON", start: { column: 4, lineNum: 10 }, end: { column: 5, lineNum: 10 }},
          { type: "NEWLINE", start: { column: 5, lineNum: 10 }, end: { column: 5, lineNum: 10 }},
          { type: "INDENT", start: { column: 2, lineNum: 11 }},
          { type: "NAME", start: { column: 2, lineNum: 11 }, end: { column: 4, lineNum: 11 }},
          { type: "NUMBER", start: { column: 5, lineNum: 11 }, end: { column: 6, lineNum: 11 }},
          { type: "COLON", start: { column: 6, lineNum: 11 }, end: { column: 7, lineNum: 11 }},
          { type: "NEWLINE", start: { column: 7, lineNum: 11 }, end: { column: 7, lineNum: 11 }},
          { type: "INDENT", start: { column: 3, lineNum: 12 }},
          { type: "NAME", start: { column: 3, lineNum: 12 }, end: { column: 8, lineNum: 12 }},
          { type: "NUMBER", start: { column: 9, lineNum: 12 }, end: { column: 10, lineNum: 12 }},
          { type: "COLON", start: { column: 10, lineNum: 12 }, end: { column: 11, lineNum: 12 }},
          { type: "NEWLINE", start: { column: 11, lineNum: 12 }, end: { column: 11, lineNum: 12 }},
          { type: "INDENT", start: { column: 8, lineNum: 13 }},
          { type: "NAME", start: { column: 8, lineNum: 13 }, end: { column: 10, lineNum: 13 }},
          { type: "NUMBER", start: { column: 11, lineNum: 13 }, end: { column: 12, lineNum: 13 }},
          { type: "COLON", start: { column: 12, lineNum: 13 }, end: { column: 13, lineNum: 13 }},
          { type: "NEWLINE", start: { column: 13, lineNum: 13 }, end: { column: 13, lineNum: 13 }},
          { type: "INDENT", start: { column: 10, lineNum: 14 }},
          { type: "NAME", start: { column: 10, lineNum: 14 }, end: { column: 11, lineNum: 14 }},
          { type: "EQUAL", start: { column: 12, lineNum: 14 }, end: { column: 13, lineNum: 14 }},
          { type: "NUMBER", start: { column: 14, lineNum: 14 }, end: { column: 15, lineNum: 14 }},
          { type: "NEWLINE", start: { column: 15, lineNum: 14 }, end: { column: 15, lineNum: 14 }},
          { type: "DEDENT", start: { column: 0, lineNum: 14 }},
          { type: "DEDENT", start: { column: 0, lineNum: 14 }},
          { type: "DEDENT", start: { column: 0, lineNum: 14 }},
          { type: "DEDENT", start: { column: 0, lineNum: 14 }}
        ]
      );
    },

    'operators': {
      'def d22(a, b, c=1, d=2): pass': function () {
        assertTokensEqual('def d22(a, b, c=1, d=2): pass', [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "NAME", start: { column: 4, lineNum: 1 }, end: { column: 7, lineNum: 1 }},
          { type: "LPAR", start: { column: 7, lineNum: 1 }, end: { column: 8, lineNum: 1 }},
          { type: "NAME", start: { column: 8, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
          { type: "COMMA", start: { column: 9, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
          { type: "NAME", start: { column: 11, lineNum: 1 }, end: { column: 12, lineNum: 1 }},
          { type: "COMMA", start: { column: 12, lineNum: 1 }, end: { column: 13, lineNum: 1 }},
          { type: "NAME", start: { column: 14, lineNum: 1 }, end: { column: 15, lineNum: 1 }},
          { type: "EQUAL", start: { column: 15, lineNum: 1 }, end: { column: 16, lineNum: 1 }},
          { type: "NUMBER", start: { column: 16, lineNum: 1 }, end: { column: 17, lineNum: 1 }},
          { type: "COMMA", start: { column: 17, lineNum: 1 }, end: { column: 18, lineNum: 1 }},
          { type: "NAME", start: { column: 19, lineNum: 1 }, end: { column: 20, lineNum: 1 }},
          { type: "EQUAL", start: { column: 20, lineNum: 1 }, end: { column: 21, lineNum: 1 }},
          { type: "NUMBER", start: { column: 21, lineNum: 1 }, end: { column: 22, lineNum: 1 }},
          { type: "RPAR", start: { column: 22, lineNum: 1 }, end: { column: 23, lineNum: 1 }},
          { type: "COLON", start: { column: 23, lineNum: 1 }, end: { column: 24, lineNum: 1 }},
          { type: "NAME", start: { column: 25, lineNum: 1 }, end: { column: 29, lineNum: 1 }}
        ]);
      },

      'def d01v(a=1, *restt, **restd): pass': function () {
        assertTokensEqual('def d01v(a=1, *restt, **restd): pass', [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "NAME", start: { column: 4, lineNum: 1 }, end: { column: 8, lineNum: 1 }},
          { type: "LPAR", start: { column: 8, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
          { type: "NAME", start: { column: 9, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
          { type: "EQUAL", start: { column: 10, lineNum: 1 }, end: { column: 11, lineNum: 1 }},
          { type: "NUMBER", start: { column: 11, lineNum: 1 }, end: { column: 12, lineNum: 1 }},
          { type: "COMMA", start: { column: 12, lineNum: 1 }, end: { column: 13, lineNum: 1 }},
          { type: "STAR", start: { column: 14, lineNum: 1 }, end: { column: 15, lineNum: 1 }},
          { type: "NAME", start: { column: 15, lineNum: 1 }, end: { column: 20, lineNum: 1 }},
          { type: "COMMA", start: { column: 20, lineNum: 1 }, end: { column: 21, lineNum: 1 }},
          { type: "DOUBLESTAR", start: { column: 22, lineNum: 1 }, end: { column: 24, lineNum: 1 }},
          { type: "NAME", start: { column: 24, lineNum: 1 }, end: { column: 29, lineNum: 1 }},
          { type: "RPAR", start: { column: 29, lineNum: 1 }, end: { column: 30, lineNum: 1 }},
          { type: "COLON", start: { column: 30, lineNum: 1 }, end: { column: 31, lineNum: 1 }},
          { type: "NAME", start: { column: 32, lineNum: 1 }, end: { column: 36, lineNum: 1 }}
        ]);
      },

      "(x, y) != ({'a':1}, {'b':2})": function () {
        assertTokensEqual("(x, y) != ({'a':1}, {'b':2})", [
          { type: "LPAR", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "NAME", start: { column: 1, lineNum: 1 }, end: { column: 2, lineNum: 1 }},
          { type: "COMMA", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "NAME", start: { column: 4, lineNum: 1 }, end: { column: 5, lineNum: 1 }},
          { type: "RPAR", start: { column: 5, lineNum: 1 }, end: { column: 6, lineNum: 1 }},
          { type: "NOTEQUAL", start: { column: 7, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
          { type: "LPAR", start: { column: 10, lineNum: 1 }, end: { column: 11, lineNum: 1 }},
          { type: "LBRACE", start: { column: 11, lineNum: 1 }, end: { column: 12, lineNum: 1 }},
          { type: "STRING", start: { column: 12, lineNum: 1 }, end: { column: 15, lineNum: 1 }},
          { type: "COLON", start: { column: 15, lineNum: 1 }, end: { column: 16, lineNum: 1 }},
          { type: "NUMBER", start: { column: 16, lineNum: 1 }, end: { column: 17, lineNum: 1 }},
          { type: "RBRACE", start: { column: 17, lineNum: 1 }, end: { column: 18, lineNum: 1 }},
          { type: "COMMA", start: { column: 18, lineNum: 1 }, end: { column: 19, lineNum: 1 }},
          { type: "LBRACE", start: { column: 20, lineNum: 1 }, end: { column: 21, lineNum: 1 }},
          { type: "STRING", start: { column: 21, lineNum: 1 }, end: { column: 24, lineNum: 1 }},
          { type: "COLON", start: { column: 24, lineNum: 1 }, end: { column: 25, lineNum: 1 }},
          { type: "NUMBER", start: { column: 25, lineNum: 1 }, end: { column: 26, lineNum: 1 }},
          { type: "RBRACE", start: { column: 26, lineNum: 1 }, end: { column: 27, lineNum: 1 }},
          { type: "RPAR", start: { column: 27, lineNum: 1 }, end: { column: 28, lineNum: 1 }}
        ]);
      },

      'comparison': function () {
        assertTokensEqual('if 1 < 1 > 1 == 1 >= 1 <= 1 != 1 != 1 in 1 not in 1 is 1 is not 1: pass', [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 2, lineNum: 1 }},
          { type: "NUMBER", start: { column: 3, lineNum: 1 }, end: { column: 4, lineNum: 1 }},
          { type: "LESS", start: { column: 5, lineNum: 1 }, end: { column: 6, lineNum: 1 }},
          { type: "NUMBER", start: { column: 7, lineNum: 1 }, end: { column: 8, lineNum: 1 }},
          { type: "GREATER", start: { column: 9, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
          { type: "NUMBER", start: { column: 11, lineNum: 1 }, end: { column: 12, lineNum: 1 }},
          { type: "EQEQUAL", start: { column: 13, lineNum: 1 }, end: { column: 15, lineNum: 1 }},
          { type: "NUMBER", start: { column: 16, lineNum: 1 }, end: { column: 17, lineNum: 1 }},
          { type: "GREATEREQUAL", start: { column: 18, lineNum: 1 }, end: { column: 20, lineNum: 1 }},
          { type: "NUMBER", start: { column: 21, lineNum: 1 }, end: { column: 22, lineNum: 1 }},
          { type: "LESSEQUAL", start: { column: 23, lineNum: 1 }, end: { column: 25, lineNum: 1 }},
          { type: "NUMBER", start: { column: 26, lineNum: 1 }, end: { column: 27, lineNum: 1 }},
          { type: "NOTEQUAL", start: { column: 28, lineNum: 1 }, end: { column: 30, lineNum: 1 }},
          { type: "NUMBER", start: { column: 31, lineNum: 1 }, end: { column: 32, lineNum: 1 }},
          { type: "NOTEQUAL", start: { column: 33, lineNum: 1 }, end: { column: 35, lineNum: 1 }},
          { type: "NUMBER", start: { column: 36, lineNum: 1 }, end: { column: 37, lineNum: 1 }},
          { type: "NAME", start: { column: 38, lineNum: 1 }, end: { column: 40, lineNum: 1 }},
          { type: "NUMBER", start: { column: 41, lineNum: 1 }, end: { column: 42, lineNum: 1 }},
          { type: "NAME", start: { column: 43, lineNum: 1 }, end: { column: 46, lineNum: 1 }},
          { type: "NAME", start: { column: 47, lineNum: 1 }, end: { column: 49, lineNum: 1 }},
          { type: "NUMBER", start: { column: 50, lineNum: 1 }, end: { column: 51, lineNum: 1 }},
          { type: "NAME", start: { column: 52, lineNum: 1 }, end: { column: 54, lineNum: 1 }},
          { type: "NUMBER", start: { column: 55, lineNum: 1 }, end: { column: 56, lineNum: 1 }},
          { type: "NAME", start: { column: 57, lineNum: 1 }, end: { column: 59, lineNum: 1 }},
          { type: "NAME", start: { column: 60, lineNum: 1 }, end: { column: 63, lineNum: 1 }},
          { type: "NUMBER", start: { column: 64, lineNum: 1 }, end: { column: 65, lineNum: 1 }},
          { type: "COLON", start: { column: 65, lineNum: 1 }, end: { column: 66, lineNum: 1 }},
          { type: "NAME", start: { column: 67, lineNum: 1 }, end: { column: 71, lineNum: 1 }}
        ]);
      },

      'binary': {
        'x = 1 & 1': function () {
          assertTokensEqual('x = 1 & 1', [
            { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
            { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
            { type: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 5, lineNum: 1 }},
            { type: "AMPER", start: { column: 6, lineNum: 1 }, end: { column: 7, lineNum: 1 }},
            { type: "NUMBER", start: { column: 8, lineNum: 1 }, end: { column: 9, lineNum: 1 }}
          ]);
        },
        'x = 1 ^ 1': function () {
          assertTokensEqual('x = 1 ^ 1', [
            { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
            { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
            { type: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 5, lineNum: 1 }},
            { type: "CIRCUMFLEX", start: { column: 6, lineNum: 1 }, end: { column: 7, lineNum: 1 }},
            { type: "NUMBER", start: { column: 8, lineNum: 1 }, end: { column: 9, lineNum: 1 }}
          ]);
        },
        'x = 1 | 1': function () {
          assertTokensEqual('x = 1 | 1', [
            { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
            { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
            { type: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 5, lineNum: 1 }},
            { type: "VBAR", start: { column: 6, lineNum: 1 }, end: { column: 7, lineNum: 1 }},
            { type: "NUMBER", start: { column: 8, lineNum: 1 }, end: { column: 9, lineNum: 1 }}
          ]);
        },
      },

      'shift': function () {
        assertTokensEqual('x = 1 << 1 >> 1', [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 5, lineNum: 1 }},
          { type: "LEFTSHIFT", start: { column: 6, lineNum: 1 }, end: { column: 8, lineNum: 1 }},
          { type: "NUMBER", start: { column: 9, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
          { type: "RIGHTSHIFT", start: { column: 11, lineNum: 1 }, end: { column: 13, lineNum: 1 }},
          { type: "NUMBER", start: { column: 14, lineNum: 1 }, end: { column: 15, lineNum: 1 }}
        ]);
      },

      'additive': function () {
        assertTokensEqual('x = 1 - 1 + 1 - 1 + 1', [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 5, lineNum: 1 }},
          { type: "MINUS", start: { column: 6, lineNum: 1 }, end: { column: 7, lineNum: 1 }},
          { type: "NUMBER", start: { column: 8, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
          { type: "PLUS", start: { column: 10, lineNum: 1 }, end: { column: 11, lineNum: 1 }},
          { type: "NUMBER", start: { column: 12, lineNum: 1 }, end: { column: 13, lineNum: 1 }},
          { type: "MINUS", start: { column: 14, lineNum: 1 }, end: { column: 15, lineNum: 1 }},
          { type: "NUMBER", start: { column: 16, lineNum: 1 }, end: { column: 17, lineNum: 1 }},
          { type: "PLUS", start: { column: 18, lineNum: 1 }, end: { column: 19, lineNum: 1 }},
          { type: "NUMBER", start: { column: 20, lineNum: 1 }, end: { column: 21, lineNum: 1 }}
        ]);
      },

      'multiplicative': function () {
        assertTokensEqual('x = 1 / 1 * 1 % 1', [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { type: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 5, lineNum: 1 }},
          { type: "SLASH", start: { column: 6, lineNum: 1 }, end: { column: 7, lineNum: 1 }},
          { type: "NUMBER", start: { column: 8, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
          { type: "STAR", start: { column: 10, lineNum: 1 }, end: { column: 11, lineNum: 1 }},
          { type: "NUMBER", start: { column: 12, lineNum: 1 }, end: { column: 13, lineNum: 1 }},
          { type: "PERCENT", start: { column: 14, lineNum: 1 }, end: { column: 15, lineNum: 1 }},
          { type: "NUMBER", start: { column: 16, lineNum: 1 }, end: { column: 17, lineNum: 1 }}
        ]);
      },

      'unary': {
        'x = ~1 ^ 1 & 1 | 1 & 1 ^ -1': function () {
          assertTokensEqual('x = ~1 ^ 1 & 1 | 1 & 1 ^ -1', [
            { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
            { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
            { type: "TILDE", start: { column: 4, lineNum: 1 }, end: { column: 5, lineNum: 1 }},
            { type: "NUMBER", start: { column: 5, lineNum: 1 }, end: { column: 6, lineNum: 1 }},
            { type: "CIRCUMFLEX", start: { column: 7, lineNum: 1 }, end: { column: 8, lineNum: 1 }},
            { type: "NUMBER", start: { column: 9, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
            { type: "AMPER", start: { column: 11, lineNum: 1 }, end: { column: 12, lineNum: 1 }},
            { type: "NUMBER", start: { column: 13, lineNum: 1 }, end: { column: 14, lineNum: 1 }},
            { type: "VBAR", start: { column: 15, lineNum: 1 }, end: { column: 16, lineNum: 1 }},
            { type: "NUMBER", start: { column: 17, lineNum: 1 }, end: { column: 18, lineNum: 1 }},
            { type: "AMPER", start: { column: 19, lineNum: 1 }, end: { column: 20, lineNum: 1 }},
            { type: "NUMBER", start: { column: 21, lineNum: 1 }, end: { column: 22, lineNum: 1 }},
            { type: "CIRCUMFLEX", start: { column: 23, lineNum: 1 }, end: { column: 24, lineNum: 1 }},
            { type: "MINUS", start: { column: 25, lineNum: 1 }, end: { column: 26, lineNum: 1 }},
            { type: "NUMBER", start: { column: 26, lineNum: 1 }, end: { column: 27, lineNum: 1 }}
          ]);
        },
        'x = -1*1/1 + 1*1 - ---1*1': function () {
          assertTokensEqual('x = -1*1/1 + 1*1 - ---1*1', [
            { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
            { type: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
            { type: "MINUS", start: { column: 4, lineNum: 1 }, end: { column: 5, lineNum: 1 }},
            { type: "NUMBER", start: { column: 5, lineNum: 1 }, end: { column: 6, lineNum: 1 }},
            { type: "STAR", start: { column: 6, lineNum: 1 }, end: { column: 7, lineNum: 1 }},
            { type: "NUMBER", start: { column: 7, lineNum: 1 }, end: { column: 8, lineNum: 1 }},
            { type: "SLASH", start: { column: 8, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
            { type: "NUMBER", start: { column: 9, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
            { type: "PLUS", start: { column: 11, lineNum: 1 }, end: { column: 12, lineNum: 1 }},
            { type: "NUMBER", start: { column: 13, lineNum: 1 }, end: { column: 14, lineNum: 1 }},
            { type: "STAR", start: { column: 14, lineNum: 1 }, end: { column: 15, lineNum: 1 }},
            { type: "NUMBER", start: { column: 15, lineNum: 1 }, end: { column: 16, lineNum: 1 }},
            { type: "MINUS", start: { column: 17, lineNum: 1 }, end: { column: 18, lineNum: 1 }},
            { type: "MINUS", start: { column: 19, lineNum: 1 }, end: { column: 20, lineNum: 1 }},
            { type: "MINUS", start: { column: 20, lineNum: 1 }, end: { column: 21, lineNum: 1 }},
            { type: "MINUS", start: { column: 21, lineNum: 1 }, end: { column: 22, lineNum: 1 }},
            { type: "NUMBER", start: { column: 22, lineNum: 1 }, end: { column: 23, lineNum: 1 }},
            { type: "STAR", start: { column: 23, lineNum: 1 }, end: { column: 24, lineNum: 1 }},
            { type: "NUMBER", start: { column: 24, lineNum: 1 }, end: { column: 25, lineNum: 1 }}
          ]);
        },
      },

      'selector': function () {
        assertTokensEqual("import sys, time\nx = sys.modules['time'].time()", [
          { type: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 6, lineNum: 1 }},
          { type: "NAME", start: { column: 7, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
          { type: "COMMA", start: { column: 10, lineNum: 1 }, end: { column: 11, lineNum: 1 }},
          { type: "NAME", start: { column: 12, lineNum: 1 }, end: { column: 16, lineNum: 1 }},
          { type: "NEWLINE", start: { column: 16, lineNum: 1 }, end: { column: 16, lineNum: 1 }},
          { type: "NAME", start: { column: 0, lineNum: 2 }, end: { column: 1, lineNum: 2 }},
          { type: "EQUAL", start: { column: 2, lineNum: 2 }, end: { column: 3, lineNum: 2 }},
          { type: "NAME", start: { column: 4, lineNum: 2 }, end: { column: 7, lineNum: 2 }},
          { type: "DOT", start: { column: 7, lineNum: 2 }, end: { column: 8, lineNum: 2 }},
          { type: "NAME", start: { column: 8, lineNum: 2 }, end: { column: 15, lineNum: 2 }},
          { type: "LSQB", start: { column: 15, lineNum: 2 }, end: { column: 16, lineNum: 2 }},
          { type: "STRING", start: { column: 16, lineNum: 2 }, end: { column: 22, lineNum: 2 }},
          { type: "RSQB", start: { column: 22, lineNum: 2 }, end: { column: 23, lineNum: 2 }},
          { type: "DOT", start: { column: 23, lineNum: 2 }, end: { column: 24, lineNum: 2 }},
          { type: "NAME", start: { column: 24, lineNum: 2 }, end: { column: 28, lineNum: 2 }},
          { type: "LPAR", start: { column: 28, lineNum: 2 }, end: { column: 29, lineNum: 2 }},
          { type: "RPAR", start: { column: 29, lineNum: 2 }, end: { column: 30, lineNum: 2 }}
        ]);
      }
    },

    '@staticmethod\ndef foo(): pass': function () {
      assertTokensEqual('@staticmethod\ndef foo(): pass', [
        { type: "AT", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
        { type: "NAME", start: { column: 1, lineNum: 1 }, end: { column: 13, lineNum: 1 }},
        { type: "NEWLINE", start: { column: 13, lineNum: 1 }, end: { column: 13, lineNum: 1 }},
        { type: "NAME", start: { column: 0, lineNum: 2 }, end: { column: 3, lineNum: 2 }},
        { type: "NAME", start: { column: 4, lineNum: 2 }, end: { column: 7, lineNum: 2 }},
        { type: "LPAR", start: { column: 7, lineNum: 2 }, end: { column: 8, lineNum: 2 }},
        { type: "RPAR", start: { column: 8, lineNum: 2 }, end: { column: 9, lineNum: 2 }},
        { type: "COLON", start: { column: 9, lineNum: 2 }, end: { column: 10, lineNum: 2 }},
        { type: "NAME", start: { column: 11, lineNum: 2 }, end: { column: 15, lineNum: 2 }}
      ]);
    },

    '@staticmethod\ndef foo(x:1)->1: pass': function () {
      assertTokensEqual('@staticmethod\ndef foo(x:1)->1: pass', [
        { type: "AT", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
        { type: "NAME", start: { column: 1, lineNum: 1 }, end: { column: 13, lineNum: 1 }},
        { type: "NEWLINE", start: { column: 13, lineNum: 1 }, end: { column: 13, lineNum: 1 }},
        { type: "NAME", start: { column: 0, lineNum: 2 }, end: { column: 3, lineNum: 2 }},
        { type: "NAME", start: { column: 4, lineNum: 2 }, end: { column: 7, lineNum: 2 }},
        { type: "LPAR", start: { column: 7, lineNum: 2 }, end: { column: 8, lineNum: 2 }},
        { type: "NAME", start: { column: 8, lineNum: 2 }, end: { column: 9, lineNum: 2 }},
        { type: "COLON", start: { column: 9, lineNum: 2 }, end: { column: 10, lineNum: 2 }},
        { type: "NUMBER", start: { column: 10, lineNum: 2 }, end: { column: 11, lineNum: 2 }},
        { type: "RPAR", start: { column: 11, lineNum: 2 }, end: { column: 12, lineNum: 2 }},
        { type: "RARROW", start: { column: 12, lineNum: 2 }, end: { column: 14, lineNum: 2 }},
        { type: "NUMBER", start: { column: 14, lineNum: 2 }, end: { column: 15, lineNum: 2 }},
        { type: "COLON", start: { column: 15, lineNum: 2 }, end: { column: 16, lineNum: 2 }},
        { type: "NAME", start: { column: 17, lineNum: 2 }, end: { column: 21, lineNum: 2 }}
      ]);
    },

    'myList[1:2, ..., 0]': function () {
      assertTokensEqual('myList[1:2, ..., 0]', [
				{"type":"NAME","start":{"column":0,"lineNum":1},"end":{"column":6,"lineNum":1},"string":"myList"},
				{"type":"LSQB","start":{"column":6,"lineNum":1},"end":{"column":7,"lineNum":1},"string":"["},
				{"type":"NUMBER","start":{"column":7,"lineNum":1},"end":{"column":8,"lineNum":1},"string":"1"},
				{"type":"COLON","start":{"column":8,"lineNum":1},"end":{"column":9,"lineNum":1},"string":":"},
				{"type":"NUMBER","start":{"column":9,"lineNum":1},"end":{"column":10,"lineNum":1},"string":"2"},
				{"type":"COMMA","start":{"column":10,"lineNum":1},"end":{"column":11,"lineNum":1},"string":","},
				{"type":"ELLIPSIS","start":{"column":12,"lineNum":1},"end":{"column":15,"lineNum":1},"string":"..."},
				{"type":"COMMA","start":{"column":15,"lineNum":1},"end":{"column":16,"lineNum":1},"string":","},
				{"type":"NUMBER","start":{"column":17,"lineNum":1},"end":{"column":18,"lineNum":1},"string":"0"},
				{"type":"RSQB","start":{"column":18,"lineNum":1},"end":{"column":19,"lineNum":1},"string":"]"}
      ]);
    }
  });
}); 

