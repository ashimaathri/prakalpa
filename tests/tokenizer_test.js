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
        { token: 'NAME', start: { column: 0, lineNum: 1 }, end: { column: 5, lineNum: 1 }},
        { token: 'NAME', start: { column: 6, lineNum: 1 }, end: { column: 11, lineNum: 1 }},
        { token: 'OP', start: { column: 11, lineNum: 1 }, end: { column: 12, lineNum: 1 }}
      ]);
    },

    '1 + 1': function () {
      assertTokensEqual('1 + 1', [
        { token: 'NUMBER', start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
        { token: 'PLUS', start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
        { token: 'NUMBER', start: { column: 4, lineNum: 1 }, end: { column: 5, lineNum: 1 }}
      ]);
    },

    'if False:\n    # NL\n    True = False # NEWLINE\n': function () {
      assertTokensEqual('if False:\n    # NL\n    True = False # NEWLINE\n', [
        { token: 'NAME', start: { column: 0, lineNum: 1 }, end: { column: 2, lineNum: 1 }},
        { token: 'NAME', start: { column: 3, lineNum: 1 }, end: { column: 8, lineNum: 1 }},
        { token: 'COLON', start: { column: 8, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
        { token: 'NEWLINE', start: { column: 9, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
        { token: 'INDENT', lineNum: 3},
        { token: 'NAME', start: { column: 4, lineNum: 3 }, end: { column: 8, lineNum: 3 }},
        { token: 'EQUAL', start: { column: 9, lineNum: 3 }, end: { column: 10, lineNum: 3 }},
        { token: 'NAME', start: { column: 11, lineNum: 3 }, end: { column: 16, lineNum: 3 }},
        { token: 'NEWLINE', start: { column: 17, lineNum: 3 }, end: { column: 26, lineNum: 3 }},
        { token: 'DEDENT', lineNum: 3},
      ]);
    },

    'indent error': function () {
      assertError('def k(x):\n    x += 2\n  x += 5\n', 'No matching outer block for dedent');
    },

    'if x == 1:\n    print(x)\n': function () {
      assertTokensEqual('if x == 1:\n    print(x)\n', [
        { token: 'NAME', start: { column: 0, lineNum: 1 }, end: { column: 2, lineNum: 1 }},
        { token: 'NAME', start: { column: 3, lineNum: 1 }, end: { column: 4, lineNum: 1 }},
        { token: 'EQEQUAL', start: { column: 5, lineNum: 1 }, end: { column: 7, lineNum: 1 }},
        { token: 'NUMBER', start: { column: 8, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
        { token: 'COLON', start: { column: 9, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
        { token: 'NEWLINE', start: { column: 10, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
        { token: 'INDENT', lineNum: 2}, 
        { token: 'NAME', start: { column: 4, lineNum: 2 }, end: { column: 9, lineNum: 2 }},
        { token: 'LPAR', start: { column: 9, lineNum: 2 }, end: { column: 10, lineNum: 2 }},
        { token: 'NAME', start: { column: 10, lineNum: 2 }, end: { column: 11, lineNum: 2 }},
        { token: 'RPAR', start: { column: 11, lineNum: 2 }, end: { column: 12, lineNum: 2 }},
        { token: 'NEWLINE', start: { column: 12, lineNum: 2 }, end: { column: 12, lineNum: 2 }},
        { token: 'DEDENT', lineNum: 2}
      ]);
    },

    '# This is a comment\n# This also': function () {
      assertTokensEqual('# This is a comment\n# This also', []);
    },

    'if x == 1 : \n  print(x)\n': function () {
      assertTokensEqual('if x == 1 : \n  print(x)\n', [
        { token: 'NAME', start: { column: 0, lineNum: 1 }, end: { column: 2, lineNum: 1 }},
        { token: 'NAME', start: { column: 3, lineNum: 1 }, end: { column: 4, lineNum: 1 }},
        { token: 'EQEQUAL', start: { column: 5, lineNum: 1 }, end: { column: 7, lineNum: 1 }},
        { token: 'NUMBER', start: { column: 8, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
        { token: 'COLON', start: { column: 10, lineNum: 1 }, end: { column: 11, lineNum: 1 }},
        { token: 'NEWLINE', start: { column: 12, lineNum: 1 }, end: { column: 12, lineNum: 1 }},
        { token: 'INDENT', lineNum: 2}, 
        { token: 'NAME', start: { column: 2, lineNum: 2 }, end: { column: 7, lineNum: 2 }},
        { token: 'LPAR', start: { column: 7, lineNum: 2 }, end: { column: 8, lineNum: 2 }},
        { token: 'NAME', start: { column: 8, lineNum: 2 }, end: { column: 9, lineNum: 2 }},
        { token: 'RPAR', start: { column: 9, lineNum: 2 }, end: { column: 10, lineNum: 2 }},
        { token: 'NEWLINE', start: { column: 10, lineNum: 2 }, end: { column: 10, lineNum: 2 }},
        { token: 'DEDENT', lineNum: 2}
      ]);
    },

    'comments': function () {
      assertTokensEqual('# Comments\n"#"\n#\'\n#"\n#\\\n      #\n    # abc\n\'\'\'#\n#\'\'\'\n\nx = 1  #\n', [
        {token: "STRING", start: { column: 0, lineNum: 2 }, end: { column: 3, lineNum: 2 }},
        {token: "NEWLINE", start: { column: 3, lineNum: 2 }, end: { column: 3, lineNum: 2 }},
        {token: "STRING", start: { column: 0, lineNum: 8 }, end: { column: 4, lineNum: 9 }},
        {token: "NEWLINE", start: { column: 4, lineNum: 9 }, end: { column: 4, lineNum: 9 }},
        {token: "NAME", start: { column: 0, lineNum: 11 }, end: { column: 1, lineNum: 11 }},
        {token: "EQUAL", start: { column: 2, lineNum: 11 }, end: { column: 3, lineNum: 11 }},
        {token: "NUMBER", start: { column: 4, lineNum: 11 }, end: { column: 5, lineNum: 11 }},
        {token: "NEWLINE", start: { column: 7, lineNum: 11 }, end: { column: 8, lineNum: 11 }}
      ]);
    },

    'balancing continuation': function () {
      assertTokensEqual("a = (3, 4,\n  5, 6)\ny = [3, 4,\n  5]\nz = {'a':5,\n  'b':6}\nx = (len(repr(y)) + 5*x - a[\n   3 ]\n   - x + len({\n   }\n    )\n  )", [
            { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
            { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
            { token: "LPAR", start: { column: 4, lineNum: 1 }, end: { column: 5, lineNum: 1 }},
            { token: "NUMBER", start: { column: 5, lineNum: 1 }, end: { column: 6, lineNum: 1 }},
            { token: "COMMA", start: { column: 6, lineNum: 1 }, end: { column: 7, lineNum: 1 }},
            { token: "NUMBER", start: { column: 8, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
            { token: "COMMA", start: { column: 9, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
            { token: "NUMBER", start: { column: 2, lineNum: 2 }, end: { column: 3, lineNum: 2 }},
            { token: "COMMA", start: { column: 3, lineNum: 2 }, end: { column: 4, lineNum: 2 }},
            { token: "NUMBER", start: { column: 5, lineNum: 2 }, end: { column: 6, lineNum: 2 }},
            { token: "RPAR", start: { column: 6, lineNum: 2 }, end: { column: 7, lineNum: 2 }},
            { token: "NEWLINE", start: { column: 7, lineNum: 2 }, end: { column: 7, lineNum: 2 }},
            { token: "NAME", start: { column: 0, lineNum: 3 }, end: { column: 1, lineNum: 3 }},
            { token: "EQUAL", start: { column: 2, lineNum: 3 }, end: { column: 3, lineNum: 3 }},
            { token: "LSQB", start: { column: 4, lineNum: 3 }, end: { column: 5, lineNum: 3 }},
            { token: "NUMBER", start: { column: 5, lineNum: 3 }, end: { column: 6, lineNum: 3 }},
            { token: "COMMA", start: { column: 6, lineNum: 3 }, end: { column: 7, lineNum: 3 }},
            { token: "NUMBER", start: { column: 8, lineNum: 3 }, end: { column: 9, lineNum: 3 }},
            { token: "COMMA", start: { column: 9, lineNum: 3 }, end: { column: 10, lineNum: 3 }},
            { token: "NUMBER", start: { column: 2, lineNum: 4 }, end: { column: 3, lineNum: 4 }},
            { token: "RSQB", start: { column: 3, lineNum: 4 }, end: { column: 4, lineNum: 4 }},
            { token: "NEWLINE", start: { column: 4, lineNum: 4 }, end: { column: 4, lineNum: 4 }},
            { token: "NAME", start: { column: 0, lineNum: 5 }, end: { column: 1, lineNum: 5 }},
            { token: "EQUAL", start: { column: 2, lineNum: 5 }, end: { column: 3, lineNum: 5 }},
            { token: "LBRACE", start: { column: 4, lineNum: 5 }, end: { column: 5, lineNum: 5 }},
            { token: "STRING", start: { column: 5, lineNum: 5 }, end: { column: 8, lineNum: 5 }},
            { token: "COLON", start: { column: 8, lineNum: 5 }, end: { column: 9, lineNum: 5 }},
            { token: "NUMBER", start: { column: 9, lineNum: 5 }, end: { column: 10, lineNum: 5 }},
            { token: "COMMA", start: { column: 10, lineNum: 5 }, end: { column: 11, lineNum: 5 }},
            { token: "STRING", start: { column: 2, lineNum: 6 }, end: { column: 5, lineNum: 6 }},
            { token: "COLON", start: { column: 5, lineNum: 6 }, end: { column: 6, lineNum: 6 }},
            { token: "NUMBER", start: { column: 6, lineNum: 6 }, end: { column: 7, lineNum: 6 }},
            { token: "RBRACE", start: { column: 7, lineNum: 6 }, end: { column: 8, lineNum: 6 }},
            { token: "NEWLINE", start: { column: 8, lineNum: 6 }, end: { column: 8, lineNum: 6 }},
            { token: "NAME", start: { column: 0, lineNum: 7 }, end: { column: 1, lineNum: 7 }},
            { token: "EQUAL", start: { column: 2, lineNum: 7 }, end: { column: 3, lineNum: 7 }},
            { token: "LPAR", start: { column: 4, lineNum: 7 }, end: { column: 5, lineNum: 7 }},
            { token: "NAME", start: { column: 5, lineNum: 7 }, end: { column: 8, lineNum: 7 }},
            { token: "LPAR", start: { column: 8, lineNum: 7 }, end: { column: 9, lineNum: 7 }},
            { token: "NAME", start: { column: 9, lineNum: 7 }, end: { column: 13, lineNum: 7 }},
            { token: "LPAR", start: { column: 13, lineNum: 7 }, end: { column: 14, lineNum: 7 }},
            { token: "NAME", start: { column: 14, lineNum: 7 }, end: { column: 15, lineNum: 7 }},
            { token: "RPAR", start: { column: 15, lineNum: 7 }, end: { column: 16, lineNum: 7 }},
            { token: "RPAR", start: { column: 16, lineNum: 7 }, end: { column: 17, lineNum: 7 }},
            { token: "PLUS", start: { column: 18, lineNum: 7 }, end: { column: 19, lineNum: 7 }},
            { token: "NUMBER", start: { column: 20, lineNum: 7 }, end: { column: 21, lineNum: 7 }},
            { token: "STAR", start: { column: 21, lineNum: 7 }, end: { column: 22, lineNum: 7 }},
            { token: "NAME", start: { column: 22, lineNum: 7 }, end: { column: 23, lineNum: 7 }},
            { token: "MINUS", start: { column: 24, lineNum: 7 }, end: { column: 25, lineNum: 7 }},
            { token: "NAME", start: { column: 26, lineNum: 7 }, end: { column: 27, lineNum: 7 }},
            { token: "LSQB", start: { column: 27, lineNum: 7 }, end: { column: 28, lineNum: 7 }},
            { token: "NUMBER", start: { column: 3, lineNum: 8 }, end: { column: 4, lineNum: 8 }},
            { token: "RSQB", start: { column: 5, lineNum: 8 }, end: { column: 6, lineNum: 8 }},
            { token: "MINUS", start: { column: 3, lineNum: 9 }, end: { column: 4, lineNum: 9 }},
            { token: "NAME", start: { column: 5, lineNum: 9 }, end: { column: 6, lineNum: 9 }},
            { token: "PLUS", start: { column: 7, lineNum: 9 }, end: { column: 8, lineNum: 9 }},
            { token: "NAME", start: { column: 9, lineNum: 9 }, end: { column: 12, lineNum: 9 }},
            { token: "LPAR", start: { column: 12, lineNum: 9 }, end: { column: 13, lineNum: 9 }},
            { token: "LBRACE", start: { column: 13, lineNum: 9 }, end: { column: 14, lineNum: 9 }},
            { token: "RBRACE", start: { column: 3, lineNum: 10 }, end: { column: 4, lineNum: 10 }},
            { token: "RPAR", start: { column: 4, lineNum: 11 }, end: { column: 5, lineNum: 11 }},
            { token: "RPAR", start: { column: 2, lineNum: 12 }, end: { column: 3, lineNum: 12 }}
      ]);
    },

    'backslash means line continuation': function () {
      assertTokensEqual('x = 1 \\\n+ 1', [
        { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
        { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
        { token: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 5, lineNum: 1 }},
        { token: "PLUS", start: { column: 0, lineNum: 2 }, end: { column: 1, lineNum: 2 }},
        { token: "NUMBER", start: { column: 2, lineNum: 2 }, end: { column: 3, lineNum: 2 }}
      ]);
    },

    'backslash does not mean line continuation in comments': function () {
      assertTokensEqual('# Backslash does not means continuation in comments :\\\nx = 0', [
        { token: "NAME", start: { column: 0, lineNum: 2 }, end: { column: 1, lineNum: 2 }},
        { token: "EQUAL", start: { column: 2, lineNum: 2 }, end: { column: 3, lineNum: 2 }},
        { token: "NUMBER", start: { column: 4, lineNum: 2 }, end: { column: 5, lineNum: 2 }}
      ]);
    },

    'ordinary integers': {
      '0xff != 255': function () {
        assertTokensEqual('0xff != 255', [
          { token: "NUMBER", start: { column: 0, lineNum: 1 }, end: { column: 4, lineNum: 1 }},
          { token: "NOTEQUAL", start: { column: 5, lineNum: 1 }, end: { column: 7, lineNum: 1 }},
          { token: "NUMBER", start: { column: 8, lineNum: 1 }, end: { column: 11, lineNum: 1 }}
        ]);
      },
      '0o377 != 255': function () {
        assertTokensEqual('0o377 != 255', [
          { token: "NUMBER", start: { column: 0, lineNum: 1 }, end: { column: 5, lineNum: 1 }},
          { token: "NOTEQUAL", start: { column: 6, lineNum: 1 }, end: { column: 8, lineNum: 1 }},
          { token: "NUMBER", start: { column: 9, lineNum: 1 }, end: { column: 12, lineNum: 1 }},
        ]);
      },
      '2147483647   != 0o17777777777': function () {
        assertTokensEqual('2147483647   != 0o17777777777', [
          { token: "NUMBER", start: { column: 0, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
          { token: "NOTEQUAL", start: { column: 13, lineNum: 1 }, end: { column: 15, lineNum: 1 }},
          { token: "NUMBER", start: { column: 16, lineNum: 1 }, end: { column: 29, lineNum: 1 }},
        ]);
      },
      '-2147483647-1 != 0o20000000000': function () {
        assertTokensEqual('-2147483647-1 != 0o20000000000', [
          { token: "MINUS", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "NUMBER", start: { column: 1, lineNum: 1 }, end: { column: 11, lineNum: 1 }},
          { token: "MINUS", start: { column: 11, lineNum: 1 }, end: { column: 12, lineNum: 1 }},
          { token: "NUMBER", start: { column: 12, lineNum: 1 }, end: { column: 13, lineNum: 1 }},
          { token: "NOTEQUAL", start: { column: 14, lineNum: 1 }, end: { column: 16, lineNum: 1 }},
          { token: "NUMBER", start: { column: 17, lineNum: 1 }, end: { column: 30, lineNum: 1 }}
        ]);
      },
      '0o37777777777 != -1': function () {
        assertTokensEqual('0o37777777777 != -1', [
          { token: "NUMBER", start: { column: 0, lineNum: 1 }, end: { column: 13, lineNum: 1 }},
          { token: "NOTEQUAL", start: { column: 14, lineNum: 1 }, end: { column: 16, lineNum: 1 }},
          { token: "MINUS", start: { column: 17, lineNum: 1 }, end: { column: 18, lineNum: 1 }},
          { token: "NUMBER", start: { column: 18, lineNum: 1 }, end: { column: 19, lineNum: 1 }}
        ]);
      },
      '0xffffffff != -1; 0o37777777777 != -1; -0o1234567 == 0O001234567; 0b10101 == 0B00010101': function () {
        assertTokensEqual('0xffffffff != -1; 0o37777777777 != -1; -0o1234567 == 0O001234567; 0b10101 == 0B00010101', [
          { token: "NUMBER", start: { column: 0, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
          { token: "NOTEQUAL", start: { column: 11, lineNum: 1 }, end: { column: 13, lineNum: 1 }},
          { token: "MINUS", start: { column: 14, lineNum: 1 }, end: { column: 15, lineNum: 1 }},
          { token: "NUMBER", start: { column: 15, lineNum: 1 }, end: { column: 16, lineNum: 1 }},
          { token: "SEMI", start: { column: 16, lineNum: 1 }, end: { column: 17, lineNum: 1 }},
          { token: "NUMBER", start: { column: 18, lineNum: 1 }, end: { column: 31, lineNum: 1 }},
          { token: "NOTEQUAL", start: { column: 32, lineNum: 1 }, end: { column: 34, lineNum: 1 }},
          { token: "MINUS", start: { column: 35, lineNum: 1 }, end: { column: 36, lineNum: 1 }},
          { token: "NUMBER", start: { column: 36, lineNum: 1 }, end: { column: 37, lineNum: 1 }},
          { token: "SEMI", start: { column: 37, lineNum: 1 }, end: { column: 38, lineNum: 1 }},
          { token: "MINUS", start: { column: 39, lineNum: 1 }, end: { column: 40, lineNum: 1 }},
          { token: "NUMBER", start: { column: 40, lineNum: 1 }, end: { column: 49, lineNum: 1 }},
          { token: "EQEQUAL", start: { column: 50, lineNum: 1 }, end: { column: 52, lineNum: 1 }},
          { token: "NUMBER", start: { column: 53, lineNum: 1 }, end: { column: 64, lineNum: 1 }},
          { token: "SEMI", start: { column: 64, lineNum: 1 }, end: { column: 65, lineNum: 1 }},
          { token: "NUMBER", start: { column: 66, lineNum: 1 }, end: { column: 73, lineNum: 1 }},
          { token: "EQEQUAL", start: { column: 74, lineNum: 1 }, end: { column: 76, lineNum: 1 }},
          { token: "NUMBER", start: { column: 77, lineNum: 1 }, end: { column: 87, lineNum: 1 }}
        ]);
      }
    },

    'long integers': {
      'x = 0': function () {
        assertTokensEqual('x = 0', [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 5, lineNum: 1 }}
        ]);
      },
      'x = 0xffffffffffffffff': function () {
        assertTokensEqual('x = 0xffffffffffffffff', [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 22, lineNum: 1 }}
        ]);
      },
      'x = 0o77777777777777777': function () {
        assertTokensEqual('x = 0o77777777777777777', [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }}, 
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }}, 
          { token: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 23, lineNum: 1 }}
        ]);
      },
      'x = 0B11101010111111111': function () {
        assertTokensEqual('x = 0B11101010111111111', [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }}, 
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }}, 
          { token: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 23, lineNum: 1 }}
        ]);
      },
      'x = 123456789012345678901234567890': function () {
        assertTokensEqual('x = 123456789012345678901234567890', [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }}, 
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }}, 
          { token: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 34, lineNum: 1 }}
        ]);
      },
    },

    'floating point numbers': {
      'x = 3.14': function () {
        assertTokensEqual('x = 3.14', [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 8, lineNum: 1 }}
        ]);
      },
      'x = 314.': function () {
        assertTokensEqual('x = 314.', [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 8, lineNum: 1 }},
        ]);
      },
      'x = 0.314': function () {
        assertTokensEqual('x = 0.314', [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
        ]);
      },
      'x = 000.314': function () {
        assertTokensEqual('x = 000.314', [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 11, lineNum: 1 }},
        ]);
      },
      'x = .314': function () {
        assertTokensEqual('x = .314', [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 8, lineNum: 1 }},
        ]);
      },
      'x = 3e14': function () {
        assertTokensEqual('x = 3e14', [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 8, lineNum: 1 }},
        ]);
      },
      'x = 3E14': function () {
        assertTokensEqual('x = 3E14', [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 8, lineNum: 1 }},
        ]);
      },
      'x = 3e-14': function () {
        assertTokensEqual('x = 3e-14', [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
        ]);
      },
      'x = 3e+14': function () {
        assertTokensEqual('x = 3e+14', [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
        ]);
      },
      'x = 3.e14': function () {
        assertTokensEqual('x = 3.e14', [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
        ]);
      },
      'x = .3e14': function () {
        assertTokensEqual('x = .3e14', [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
        ]);
      },
      'x = 3.1e4': function () {
        assertTokensEqual('x = 3.1e4', [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
        ]);
      }
    },

    'string literals': {
      'x = \'\'; y = "";': function () {
        assertTokensEqual('x = \'\'; y = "";', [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 6, lineNum: 1 }},
          { token: "SEMI", start: { column: 6, lineNum: 1 }, end: { column: 7, lineNum: 1 }},
          { token: "NAME", start: { column: 8, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
          { token: "EQUAL", start: { column: 10, lineNum: 1 }, end: { column: 11, lineNum: 1 }},
          { token: "STRING", start: { column: 12, lineNum: 1 }, end: { column: 14, lineNum: 1 }},
          { token: "SEMI", start: { column: 14, lineNum: 1 }, end: { column: 15, lineNum: 1 }}
        ]);
      },
      "x = '\\''; y = \"'\";": function () {
        assertTokensEqual("x = '\\''; y = \"'\";", [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 8, lineNum: 1 }},
          { token: "SEMI", start: { column: 8, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
          { token: "NAME", start: { column: 10, lineNum: 1 }, end: { column: 11, lineNum: 1 }},
          { token: "EQUAL", start: { column: 12, lineNum: 1 }, end: { column: 13, lineNum: 1 }},
          { token: "STRING", start: { column: 14, lineNum: 1 }, end: { column: 17, lineNum: 1 }},
          { token: "SEMI", start: { column: 17, lineNum: 1 }, end: { column: 18, lineNum: 1 }}
        ]);
      },
      'x = \'"\'; y = "\\"";': function () {
        assertTokensEqual('x = \'"\'; y = "\\"";', [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 7, lineNum: 1 }},
          { token: "SEMI", start: { column: 7, lineNum: 1 }, end: { column: 8, lineNum: 1 }},
          { token: "NAME", start: { column: 9, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
          { token: "EQUAL", start: { column: 11, lineNum: 1 }, end: { column: 12, lineNum: 1 }},
          { token: "STRING", start: { column: 13, lineNum: 1 }, end: { column: 17, lineNum: 1 }},
          { token: "SEMI", start: { column: 17, lineNum: 1 }, end: { column: 18, lineNum: 1 }}
        ]);
      },
      'x = "doesn\'t \\"shrink\\" does it"': function () {
        assertTokensEqual('x = "doesn\'t \\"shrink\\" does it"', [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 32, lineNum: 1 }}
        ]);
      },
      "y = 'doesn\\'t \"shrink\" does it'": function () {
        assertTokensEqual("y = 'doesn\\'t \"shrink\" does it'", [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 31, lineNum: 1 }}
        ]);
      },
      'x = "does \\"shrink\\" doesn\'t it"': function () {
        assertTokensEqual('x = "does \\"shrink\\" doesn\'t it"', [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 32, lineNum: 1 }}
        ]);
      },
      "y = 'does \"shrink\" doesn\\'t it'": function () {
        assertTokensEqual("y = 'does \"shrink\" doesn\\'t it'", [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 31, lineNum: 1 }}
        ]);
      },
      "y = '''\nThe \"quick\"\nbrown fox\njumps over\nthe 'lazy' dog.\n'''": function () {
        assertTokensEqual("y = '''\nThe \"quick\"\nbrown fox\njumps over\nthe 'lazy' dog.\n'''", [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 3, lineNum: 6 }}
        ]);
      },
      "y = '\\nThe \"quick\"\\nbrown fox\\njumps over\\nthe \\'lazy\\' dog.\\n'": function () {
        assertTokensEqual("y = '\\nThe \"quick\"\\nbrown fox\\njumps over\\nthe \\'lazy\\' dog.\\n'", [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 63, lineNum: 1 }}
        ]);
      },
      'x = """\nThe "quick"\nbrown fox\njumps over\nthe \'lazy\' dog.\n"""': function () {
        assertTokensEqual('x = """\nThe "quick"\nbrown fox\njumps over\nthe \'lazy\' dog.\n"""', [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 3, lineNum: 6 }}
        ]);
      },
      'y = "\\n\\\nThe \\"quick\\"\\n\\\nbrown fox\\n\\\njumps over\\n\\\nthe \'lazy\' dog.\\n\\\n";': function () {
        assertTokensEqual('y = "\\n\\\nThe \\"quick\\"\\n\\\nbrown fox\\n\\\njumps over\\n\\\nthe \'lazy\' dog.\\n\\\n";', [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 1, lineNum: 6 }},
          { token: "SEMI", start: { column: 1, lineNum: 6 }, end: { column: 2, lineNum: 6 }}
        ]);
      },
      'y = \'\\n\\\nThe \\"quick\\"\\n\\\nbrown fox\\n\\\njumps over\\n\\\nthe \\\'lazy\\\' dog.\\n\\\n\';': function () {
        assertTokensEqual('y = "\\n\\\nThe \\"quick\\"\\n\\\nbrown fox\\n\\\njumps over\\n\\\nthe \'lazy\' dog.\\n\\\n";', [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 1, lineNum: 6 }},
          { token: "SEMI", start: { column: 1, lineNum: 6 }, end: { column: 2, lineNum: 6 }}
        ]);
      },
      "x = r'\\\\' + R'\\\\'": function () {
        assertTokensEqual("x = r'\\\\' + R'\\\\'", [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
          { token: "PLUS", start: { column: 10, lineNum: 1 }, end: { column: 11, lineNum: 1 }},
          { token: "STRING", start: { column: 12, lineNum: 1 }, end: { column: 17, lineNum: 1 }}
        ]);
      },
      "x = r'\\'' + ''": function () {
        assertTokensEqual("x = r'\\'' + ''", [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
          { token: "PLUS", start: { column: 10, lineNum: 1 }, end: { column: 11, lineNum: 1 }},
          { token: "STRING", start: { column: 12, lineNum: 1 }, end: { column: 14, lineNum: 1 }}
        ]);
      },
      "y = r'''\nfoo bar \\\\\nbaz''' + R'''\nfoo'''": function () {
        assertTokensEqual("y = r'''\nfoo bar \\\\\nbaz''' + R'''\nfoo'''", [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 6, lineNum: 3 }},
          { token: "PLUS", start: { column: 7, lineNum: 3 }, end: { column: 8, lineNum: 3 }},
          { token: "STRING", start: { column: 9, lineNum: 3 }, end: { column: 6, lineNum: 4 }}
        ]);
      },
      "y = r\"\"\"foo\nbar \\\\ baz\n\"\"\" + R'''spam\n'''": function () {
        assertTokensEqual("y = r\"\"\"foo\nbar \\\\ baz\n\"\"\" + R'''spam\n'''", [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 3, lineNum: 3 }},
          { token: "PLUS", start: { column: 4, lineNum: 3 }, end: { column: 5, lineNum: 3 }},
          { token: "STRING", start: { column: 6, lineNum: 3 }, end: { column: 3, lineNum: 4 }}
        ]);
      },
      "x = b'abc' + B'ABC'": function () {
        assertTokensEqual("x = b'abc' + B'ABC'", [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
          { token: "PLUS", start: { column: 11, lineNum: 1 }, end: { column: 12, lineNum: 1 }},
          { token: "STRING", start: { column: 13, lineNum: 1 }, end: { column: 19, lineNum: 1 }}
        ]);
      },
      'y = b"abc" + B"ABC"': function () {
        assertTokensEqual('y = b"abc" + B"ABC"', [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
          { token: "PLUS", start: { column: 11, lineNum: 1 }, end: { column: 12, lineNum: 1 }},
          { token: "STRING", start: { column: 13, lineNum: 1 }, end: { column: 19, lineNum: 1 }}
        ]);
      },
      "x = br'abc' + Br'ABC' + bR'ABC' + BR'ABC'": function () {
        assertTokensEqual("x = br'abc' + Br'ABC' + bR'ABC' + BR'ABC'", [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 11, lineNum: 1 }},
          { token: "PLUS", start: { column: 12, lineNum: 1 }, end: { column: 13, lineNum: 1 }},
          { token: "STRING", start: { column: 14, lineNum: 1 }, end: { column: 21, lineNum: 1 }},
          { token: "PLUS", start: { column: 22, lineNum: 1 }, end: { column: 23, lineNum: 1 }},
          { token: "STRING", start: { column: 24, lineNum: 1 }, end: { column: 31, lineNum: 1 }},
          { token: "PLUS", start: { column: 32, lineNum: 1 }, end: { column: 33, lineNum: 1 }},
          { token: "STRING", start: { column: 34, lineNum: 1 }, end: { column: 41, lineNum: 1 }}
        ]);
      },
      'y = br"abc" + Br"ABC" + bR"ABC" + BR"ABC"': function () {
        assertTokensEqual('y = br"abc" + Br"ABC" + bR"ABC" + BR"ABC"', [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 11, lineNum: 1 }},
          { token: "PLUS", start: { column: 12, lineNum: 1 }, end: { column: 13, lineNum: 1 }},
          { token: "STRING", start: { column: 14, lineNum: 1 }, end: { column: 21, lineNum: 1 }},
          { token: "PLUS", start: { column: 22, lineNum: 1 }, end: { column: 23, lineNum: 1 }},
          { token: "STRING", start: { column: 24, lineNum: 1 }, end: { column: 31, lineNum: 1 }},
          { token: "PLUS", start: { column: 32, lineNum: 1 }, end: { column: 33, lineNum: 1 }},
          { token: "STRING", start: { column: 34, lineNum: 1 }, end: { column: 41, lineNum: 1 }}
        ]);
      },
      "x = rb'abc' + rB'ABC' + Rb'ABC' + RB'ABC'": function () {
        assertTokensEqual("x = rb'abc' + rB'ABC' + Rb'ABC' + RB'ABC'", [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 11, lineNum: 1 }},
          { token: "PLUS", start: { column: 12, lineNum: 1 }, end: { column: 13, lineNum: 1 }},
          { token: "STRING", start: { column: 14, lineNum: 1 }, end: { column: 21, lineNum: 1 }},
          { token: "PLUS", start: { column: 22, lineNum: 1 }, end: { column: 23, lineNum: 1 }},
          { token: "STRING", start: { column: 24, lineNum: 1 }, end: { column: 31, lineNum: 1 }},
          { token: "PLUS", start: { column: 32, lineNum: 1 }, end: { column: 33, lineNum: 1 }},
          { token: "STRING", start: { column: 34, lineNum: 1 }, end: { column: 41, lineNum: 1 }}
        ]);
      },
      'y = rb"abc" + rB"ABC" + Rb"ABC" + RB"ABC"': function () {
        assertTokensEqual('y = rb"abc" + rB"ABC" + Rb"ABC" + RB"ABC"', [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 11, lineNum: 1 }},
          { token: "PLUS", start: { column: 12, lineNum: 1 }, end: { column: 13, lineNum: 1 }},
          { token: "STRING", start: { column: 14, lineNum: 1 }, end: { column: 21, lineNum: 1 }},
          { token: "PLUS", start: { column: 22, lineNum: 1 }, end: { column: 23, lineNum: 1 }},
          { token: "STRING", start: { column: 24, lineNum: 1 }, end: { column: 31, lineNum: 1 }},
          { token: "PLUS", start: { column: 32, lineNum: 1 }, end: { column: 33, lineNum: 1 }},
          { token: "STRING", start: { column: 34, lineNum: 1 }, end: { column: 41, lineNum: 1 }}
        ]);
      },
      "x = br'\\\\' + BR'\\\\'": function () {
        assertTokensEqual("x = br'\\\\' + BR'\\\\'", [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
          { token: "PLUS", start: { column: 11, lineNum: 1 }, end: { column: 12, lineNum: 1 }},
          { token: "STRING", start: { column: 13, lineNum: 1 }, end: { column: 19, lineNum: 1 }}
        ]);
      },
      "x = rb'\\\\' + RB'\\\\'": function () {
        assertTokensEqual("x = rb'\\\\' + RB'\\\\'", [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
          { token: "PLUS", start: { column: 11, lineNum: 1 }, end: { column: 12, lineNum: 1 }},
          { token: "STRING", start: { column: 13, lineNum: 1 }, end: { column: 19, lineNum: 1 }}
        ]);
      },
      "x = br'\\'' + ''": function () {
        assertTokensEqual("x = br'\\'' + ''", [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
          { token: "PLUS", start: { column: 11, lineNum: 1 }, end: { column: 12, lineNum: 1 }},
          { token: "STRING", start: { column: 13, lineNum: 1 }, end: { column: 15, lineNum: 1 }}
        ]);
      },
      "x = rb'\\'' + ''": function () {
        assertTokensEqual("x = rb'\\'' + ''", [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
          { token: "PLUS", start: { column: 11, lineNum: 1 }, end: { column: 12, lineNum: 1 }},
          { token: "STRING", start: { column: 13, lineNum: 1 }, end: { column: 15, lineNum: 1 }}
        ]);
      },
      "y = br'''\nfoo bar \\\\\nbaz''' + BR'''\nfoo'''": function () {
        assertTokensEqual("y = br'''\nfoo bar \\\\\nbaz''' + BR'''\nfoo'''", [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 6, lineNum: 3 }},
          { token: "PLUS", start: { column: 7, lineNum: 3 }, end: { column: 8, lineNum: 3 }},
          { token: "STRING", start: { column: 9, lineNum: 3 }, end: { column: 6, lineNum: 4 }},
        ]);
      },
      'y = rB"""foo\nbar \\\\ baz\n""" + Rb\'\'\'spam\n\'\'\'': function () {
        assertTokensEqual('y = rB"""foo\nbar \\\\ baz\n""" + Rb\'\'\'spam\n\'\'\'', [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "STRING", start: { column: 4, lineNum: 1 }, end: { column: 3, lineNum: 3 }},
          { token: "PLUS", start: { column: 4, lineNum: 3 }, end: { column: 5, lineNum: 3 }},
          { token: "STRING", start: { column: 6, lineNum: 3 }, end: { column: 3, lineNum: 4 }},
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
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 2, lineNum: 1 }},
          { token: "NUMBER", start: { column: 3, lineNum: 1 }, end: { column: 4, lineNum: 1 }},
          { token: "COLON", start: { column: 4, lineNum: 1 }, end: { column: 5, lineNum: 1 }},
          { token: "NEWLINE", start: { column: 5, lineNum: 1 }, end: { column: 5, lineNum: 1 }},
          { token: "INDENT", lineNum: 2 },
          { token: "NAME", start: { column: 4, lineNum: 2 }, end: { column: 5, lineNum: 2 }},
          { token: "EQUAL", start: { column: 6, lineNum: 2 }, end: { column: 7, lineNum: 2 }},
          { token: "NUMBER", start: { column: 8, lineNum: 2 }, end: { column: 9, lineNum: 2 }},
          { token: "NEWLINE", start: { column: 9, lineNum: 2 }, end: { column: 9, lineNum: 2 }},
          { token: "DEDENT", lineNum: 2 },
          { token: "NAME", start: { column: 0, lineNum: 3 }, end: { column: 2, lineNum: 3 }},
          { token: "NUMBER", start: { column: 3, lineNum: 3 }, end: { column: 4, lineNum: 3 }},
          { token: "COLON", start: { column: 4, lineNum: 3 }, end: { column: 5, lineNum: 3 }},
          { token: "NEWLINE", start: { column: 5, lineNum: 3 }, end: { column: 5, lineNum: 3 }},
          { token: "INDENT", lineNum: 4 },
          { token: "NAME", start: { column: 8, lineNum: 4 }, end: { column: 9, lineNum: 4 }},
          { token: "EQUAL", start: { column: 10, lineNum: 4 }, end: { column: 11, lineNum: 4 }},
          { token: "NUMBER", start: { column: 12, lineNum: 4 }, end: { column: 13, lineNum: 4 }},
          { token: "NEWLINE", start: { column: 13, lineNum: 4 }, end: { column: 13, lineNum: 4 }},
          { token: "DEDENT", lineNum: 4 },
          { token: "NAME", start: { column: 0, lineNum: 5 }, end: { column: 2, lineNum: 5 }},
          { token: "NUMBER", start: { column: 3, lineNum: 5 }, end: { column: 4, lineNum: 5 }},
          { token: "COLON", start: { column: 4, lineNum: 5 }, end: { column: 5, lineNum: 5 }},
          { token: "NEWLINE", start: { column: 5, lineNum: 5 }, end: { column: 5, lineNum: 5 }},
          { token: "INDENT", lineNum: 6 },
          { token: "NAME", start: { column: 4, lineNum: 6 }, end: { column: 9, lineNum: 6 }},
          { token: "NUMBER", start: { column: 10, lineNum: 6 }, end: { column: 11, lineNum: 6 }},
          { token: "COLON", start: { column: 11, lineNum: 6 }, end: { column: 12, lineNum: 6 }},
          { token: "NEWLINE", start: { column: 12, lineNum: 6 }, end: { column: 12, lineNum: 6 }},
          { token: "INDENT", lineNum: 7 },
          { token: "NAME", start: { column: 5, lineNum: 7 }, end: { column: 7, lineNum: 7 }},
          { token: "NUMBER", start: { column: 8, lineNum: 7 }, end: { column: 9, lineNum: 7 }},
          { token: "COLON", start: { column: 9, lineNum: 7 }, end: { column: 10, lineNum: 7 }},
          { token: "NEWLINE", start: { column: 10, lineNum: 7 }, end: { column: 10, lineNum: 7 }},
          { token: "INDENT", lineNum: 8 },
          { token: "NAME", start: { column: 11, lineNum: 8 }, end: { column: 12, lineNum: 8 }},
          { token: "EQUAL", start: { column: 13, lineNum: 8 }, end: { column: 14, lineNum: 8 }},
          { token: "NUMBER", start: { column: 15, lineNum: 8 }, end: { column: 16, lineNum: 8 }},
          { token: "NEWLINE", start: { column: 16, lineNum: 8 }, end: { column: 16, lineNum: 8 }},
          { token: "DEDENT", lineNum: 9 },
          { token: "NAME", start: { column: 5, lineNum: 9 }, end: { column: 6, lineNum: 9 }},
          { token: "EQUAL", start: { column: 7, lineNum: 9 }, end: { column: 8, lineNum: 9 }},
          { token: "NUMBER", start: { column: 9, lineNum: 9 }, end: { column: 10, lineNum: 9 }},
          { token: "NEWLINE", start: { column: 10, lineNum: 9 }, end: { column: 10, lineNum: 9 }},
          { token: "DEDENT", lineNum: 9 },
          { token: "DEDENT", lineNum: 9 },
          { token: "NAME", start: { column: 0, lineNum: 10 }, end: { column: 2, lineNum: 10 }},
          { token: "NUMBER", start: { column: 3, lineNum: 10 }, end: { column: 4, lineNum: 10 }},
          { token: "COLON", start: { column: 4, lineNum: 10 }, end: { column: 5, lineNum: 10 }},
          { token: "NEWLINE", start: { column: 5, lineNum: 10 }, end: { column: 5, lineNum: 10 }},
          { token: "INDENT", lineNum: 11 },
          { token: "NAME", start: { column: 2, lineNum: 11 }, end: { column: 4, lineNum: 11 }},
          { token: "NUMBER", start: { column: 5, lineNum: 11 }, end: { column: 6, lineNum: 11 }},
          { token: "COLON", start: { column: 6, lineNum: 11 }, end: { column: 7, lineNum: 11 }},
          { token: "NEWLINE", start: { column: 7, lineNum: 11 }, end: { column: 7, lineNum: 11 }},
          { token: "INDENT", lineNum: 12 },
          { token: "NAME", start: { column: 3, lineNum: 12 }, end: { column: 8, lineNum: 12 }},
          { token: "NUMBER", start: { column: 9, lineNum: 12 }, end: { column: 10, lineNum: 12 }},
          { token: "COLON", start: { column: 10, lineNum: 12 }, end: { column: 11, lineNum: 12 }},
          { token: "NEWLINE", start: { column: 11, lineNum: 12 }, end: { column: 11, lineNum: 12 }},
          { token: "INDENT", lineNum: 13 },
          { token: "NAME", start: { column: 8, lineNum: 13 }, end: { column: 10, lineNum: 13 }},
          { token: "NUMBER", start: { column: 11, lineNum: 13 }, end: { column: 12, lineNum: 13 }},
          { token: "COLON", start: { column: 12, lineNum: 13 }, end: { column: 13, lineNum: 13 }},
          { token: "NEWLINE", start: { column: 13, lineNum: 13 }, end: { column: 13, lineNum: 13 }},
          { token: "INDENT", lineNum: 14 },
          { token: "NAME", start: { column: 10, lineNum: 14 }, end: { column: 11, lineNum: 14 }},
          { token: "EQUAL", start: { column: 12, lineNum: 14 }, end: { column: 13, lineNum: 14 }},
          { token: "NUMBER", start: { column: 14, lineNum: 14 }, end: { column: 15, lineNum: 14 }},
          { token: "NEWLINE", start: { column: 15, lineNum: 14 }, end: { column: 15, lineNum: 14 }},
          { token: "DEDENT", lineNum: 14 },
          { token: "DEDENT", lineNum: 14 },
          { token: "DEDENT", lineNum: 14 },
          { token: "DEDENT", lineNum: 14 }
        ]
      );
    },

    'operators': {
      'def d22(a, b, c=1, d=2): pass': function () {
        assertTokensEqual('def d22(a, b, c=1, d=2): pass', [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "NAME", start: { column: 4, lineNum: 1 }, end: { column: 7, lineNum: 1 }},
          { token: "LPAR", start: { column: 7, lineNum: 1 }, end: { column: 8, lineNum: 1 }},
          { token: "NAME", start: { column: 8, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
          { token: "COMMA", start: { column: 9, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
          { token: "NAME", start: { column: 11, lineNum: 1 }, end: { column: 12, lineNum: 1 }},
          { token: "COMMA", start: { column: 12, lineNum: 1 }, end: { column: 13, lineNum: 1 }},
          { token: "NAME", start: { column: 14, lineNum: 1 }, end: { column: 15, lineNum: 1 }},
          { token: "EQUAL", start: { column: 15, lineNum: 1 }, end: { column: 16, lineNum: 1 }},
          { token: "NUMBER", start: { column: 16, lineNum: 1 }, end: { column: 17, lineNum: 1 }},
          { token: "COMMA", start: { column: 17, lineNum: 1 }, end: { column: 18, lineNum: 1 }},
          { token: "NAME", start: { column: 19, lineNum: 1 }, end: { column: 20, lineNum: 1 }},
          { token: "EQUAL", start: { column: 20, lineNum: 1 }, end: { column: 21, lineNum: 1 }},
          { token: "NUMBER", start: { column: 21, lineNum: 1 }, end: { column: 22, lineNum: 1 }},
          { token: "RPAR", start: { column: 22, lineNum: 1 }, end: { column: 23, lineNum: 1 }},
          { token: "COLON", start: { column: 23, lineNum: 1 }, end: { column: 24, lineNum: 1 }},
          { token: "NAME", start: { column: 25, lineNum: 1 }, end: { column: 29, lineNum: 1 }}
        ]);
      },

      'def d01v(a=1, *restt, **restd): pass': function () {
        assertTokensEqual('def d01v(a=1, *restt, **restd): pass', [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "NAME", start: { column: 4, lineNum: 1 }, end: { column: 8, lineNum: 1 }},
          { token: "LPAR", start: { column: 8, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
          { token: "NAME", start: { column: 9, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
          { token: "EQUAL", start: { column: 10, lineNum: 1 }, end: { column: 11, lineNum: 1 }},
          { token: "NUMBER", start: { column: 11, lineNum: 1 }, end: { column: 12, lineNum: 1 }},
          { token: "COMMA", start: { column: 12, lineNum: 1 }, end: { column: 13, lineNum: 1 }},
          { token: "STAR", start: { column: 14, lineNum: 1 }, end: { column: 15, lineNum: 1 }},
          { token: "NAME", start: { column: 15, lineNum: 1 }, end: { column: 20, lineNum: 1 }},
          { token: "COMMA", start: { column: 20, lineNum: 1 }, end: { column: 21, lineNum: 1 }},
          { token: "DOUBLESTAR", start: { column: 22, lineNum: 1 }, end: { column: 24, lineNum: 1 }},
          { token: "NAME", start: { column: 24, lineNum: 1 }, end: { column: 29, lineNum: 1 }},
          { token: "RPAR", start: { column: 29, lineNum: 1 }, end: { column: 30, lineNum: 1 }},
          { token: "COLON", start: { column: 30, lineNum: 1 }, end: { column: 31, lineNum: 1 }},
          { token: "NAME", start: { column: 32, lineNum: 1 }, end: { column: 36, lineNum: 1 }},
          { token: "ENDMARKER", "lineNum": 1 }
        ]);
      },

      "(x, y) != ({'a':1}, {'b':2})": function () {
        assertTokensEqual("(x, y) != ({'a':1}, {'b':2})", [
          { token: "LPAR", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "NAME", start: { column: 1, lineNum: 1 }, end: { column: 2, lineNum: 1 }},
          { token: "COMMA", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "NAME", start: { column: 4, lineNum: 1 }, end: { column: 5, lineNum: 1 }},
          { token: "RPAR", start: { column: 5, lineNum: 1 }, end: { column: 6, lineNum: 1 }},
          { token: "NOTEQUAL", start: { column: 7, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
          { token: "LPAR", start: { column: 10, lineNum: 1 }, end: { column: 11, lineNum: 1 }},
          { token: "LBRACE", start: { column: 11, lineNum: 1 }, end: { column: 12, lineNum: 1 }},
          { token: "STRING", start: { column: 12, lineNum: 1 }, end: { column: 15, lineNum: 1 }},
          { token: "COLON", start: { column: 15, lineNum: 1 }, end: { column: 16, lineNum: 1 }},
          { token: "NUMBER", start: { column: 16, lineNum: 1 }, end: { column: 17, lineNum: 1 }},
          { token: "RBRACE", start: { column: 17, lineNum: 1 }, end: { column: 18, lineNum: 1 }},
          { token: "COMMA", start: { column: 18, lineNum: 1 }, end: { column: 19, lineNum: 1 }},
          { token: "LBRACE", start: { column: 20, lineNum: 1 }, end: { column: 21, lineNum: 1 }},
          { token: "STRING", start: { column: 21, lineNum: 1 }, end: { column: 24, lineNum: 1 }},
          { token: "COLON", start: { column: 24, lineNum: 1 }, end: { column: 25, lineNum: 1 }},
          { token: "NUMBER", start: { column: 25, lineNum: 1 }, end: { column: 26, lineNum: 1 }},
          { token: "RBRACE", start: { column: 26, lineNum: 1 }, end: { column: 27, lineNum: 1 }},
          { token: "RPAR", start: { column: 27, lineNum: 1 }, end: { column: 28, lineNum: 1 }}
        ]);
      },

      'comparison': function () {
        assertTokensEqual('if 1 < 1 > 1 == 1 >= 1 <= 1 != 1 != 1 in 1 not in 1 is 1 is not 1: pass', [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 2, lineNum: 1 }},
          { token: "NUMBER", start: { column: 3, lineNum: 1 }, end: { column: 4, lineNum: 1 }},
          { token: "LESS", start: { column: 5, lineNum: 1 }, end: { column: 6, lineNum: 1 }},
          { token: "NUMBER", start: { column: 7, lineNum: 1 }, end: { column: 8, lineNum: 1 }},
          { token: "GREATER", start: { column: 9, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
          { token: "NUMBER", start: { column: 11, lineNum: 1 }, end: { column: 12, lineNum: 1 }},
          { token: "EQEQUAL", start: { column: 13, lineNum: 1 }, end: { column: 15, lineNum: 1 }},
          { token: "NUMBER", start: { column: 16, lineNum: 1 }, end: { column: 17, lineNum: 1 }},
          { token: "GREATEREQUAL", start: { column: 18, lineNum: 1 }, end: { column: 20, lineNum: 1 }},
          { token: "NUMBER", start: { column: 21, lineNum: 1 }, end: { column: 22, lineNum: 1 }},
          { token: "LESSEQUAL", start: { column: 23, lineNum: 1 }, end: { column: 25, lineNum: 1 }},
          { token: "NUMBER", start: { column: 26, lineNum: 1 }, end: { column: 27, lineNum: 1 }},
          { token: "NOTEQUAL", start: { column: 28, lineNum: 1 }, end: { column: 30, lineNum: 1 }},
          { token: "NUMBER", start: { column: 31, lineNum: 1 }, end: { column: 32, lineNum: 1 }},
          { token: "NOTEQUAL", start: { column: 33, lineNum: 1 }, end: { column: 35, lineNum: 1 }},
          { token: "NUMBER", start: { column: 36, lineNum: 1 }, end: { column: 37, lineNum: 1 }},
          { token: "NAME", start: { column: 38, lineNum: 1 }, end: { column: 40, lineNum: 1 }},
          { token: "NUMBER", start: { column: 41, lineNum: 1 }, end: { column: 42, lineNum: 1 }},
          { token: "NAME", start: { column: 43, lineNum: 1 }, end: { column: 46, lineNum: 1 }},
          { token: "NAME", start: { column: 47, lineNum: 1 }, end: { column: 49, lineNum: 1 }},
          { token: "NUMBER", start: { column: 50, lineNum: 1 }, end: { column: 51, lineNum: 1 }},
          { token: "NAME", start: { column: 52, lineNum: 1 }, end: { column: 54, lineNum: 1 }},
          { token: "NUMBER", start: { column: 55, lineNum: 1 }, end: { column: 56, lineNum: 1 }},
          { token: "NAME", start: { column: 57, lineNum: 1 }, end: { column: 59, lineNum: 1 }},
          { token: "NAME", start: { column: 60, lineNum: 1 }, end: { column: 63, lineNum: 1 }},
          { token: "NUMBER", start: { column: 64, lineNum: 1 }, end: { column: 65, lineNum: 1 }},
          { token: "COLON", start: { column: 65, lineNum: 1 }, end: { column: 66, lineNum: 1 }},
          { token: "NAME", start: { column: 67, lineNum: 1 }, end: { column: 71, lineNum: 1 }}
        ]);
      },

      'binary': {
        'x = 1 & 1': function () {
          assertTokensEqual('x = 1 & 1', [
            { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
            { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
            { token: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 5, lineNum: 1 }},
            { token: "AMPER", start: { column: 6, lineNum: 1 }, end: { column: 7, lineNum: 1 }},
            { token: "NUMBER", start: { column: 8, lineNum: 1 }, end: { column: 9, lineNum: 1 }}
          ]);
        },
        'x = 1 ^ 1': function () {
          assertTokensEqual('x = 1 ^ 1', [
            { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
            { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
            { token: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 5, lineNum: 1 }},
            { token: "CIRCUMFLEX", start: { column: 6, lineNum: 1 }, end: { column: 7, lineNum: 1 }},
            { token: "NUMBER", start: { column: 8, lineNum: 1 }, end: { column: 9, lineNum: 1 }}
          ]);
        },
        'x = 1 | 1': function () {
          assertTokensEqual('x = 1 | 1', [
            { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
            { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
            { token: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 5, lineNum: 1 }},
            { token: "VBAR", start: { column: 6, lineNum: 1 }, end: { column: 7, lineNum: 1 }},
            { token: "NUMBER", start: { column: 8, lineNum: 1 }, end: { column: 9, lineNum: 1 }}
          ]);
        },
      },

      'shift': function () {
        assertTokensEqual('x = 1 << 1 >> 1', [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 5, lineNum: 1 }},
          { token: "LEFTSHIFT", start: { column: 6, lineNum: 1 }, end: { column: 8, lineNum: 1 }},
          { token: "NUMBER", start: { column: 9, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
          { token: "RIGHTSHIFT", start: { column: 11, lineNum: 1 }, end: { column: 13, lineNum: 1 }},
          { token: "NUMBER", start: { column: 14, lineNum: 1 }, end: { column: 15, lineNum: 1 }}
        ]);
      },

      'additive': function () {
        assertTokensEqual('x = 1 - 1 + 1 - 1 + 1', [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 5, lineNum: 1 }},
          { token: "MINUS", start: { column: 6, lineNum: 1 }, end: { column: 7, lineNum: 1 }},
          { token: "NUMBER", start: { column: 8, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
          { token: "PLUS", start: { column: 10, lineNum: 1 }, end: { column: 11, lineNum: 1 }},
          { token: "NUMBER", start: { column: 12, lineNum: 1 }, end: { column: 13, lineNum: 1 }},
          { token: "MINUS", start: { column: 14, lineNum: 1 }, end: { column: 15, lineNum: 1 }},
          { token: "NUMBER", start: { column: 16, lineNum: 1 }, end: { column: 17, lineNum: 1 }},
          { token: "PLUS", start: { column: 18, lineNum: 1 }, end: { column: 19, lineNum: 1 }},
          { token: "NUMBER", start: { column: 20, lineNum: 1 }, end: { column: 21, lineNum: 1 }}
        ]);
      },

      'multiplicative': function () {
        assertTokensEqual('x = 1 / 1 * 1 % 1', [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
          { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
          { token: "NUMBER", start: { column: 4, lineNum: 1 }, end: { column: 5, lineNum: 1 }},
          { token: "SLASH", start: { column: 6, lineNum: 1 }, end: { column: 7, lineNum: 1 }},
          { token: "NUMBER", start: { column: 8, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
          { token: "STAR", start: { column: 10, lineNum: 1 }, end: { column: 11, lineNum: 1 }},
          { token: "NUMBER", start: { column: 12, lineNum: 1 }, end: { column: 13, lineNum: 1 }},
          { token: "PERCENT", start: { column: 14, lineNum: 1 }, end: { column: 15, lineNum: 1 }},
          { token: "NUMBER", start: { column: 16, lineNum: 1 }, end: { column: 17, lineNum: 1 }}
        ]);
      },

      'unary': {
        'x = ~1 ^ 1 & 1 | 1 & 1 ^ -1': function () {
          assertTokensEqual('x = ~1 ^ 1 & 1 | 1 & 1 ^ -1', [
            { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
            { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
            { token: "TILDE", start: { column: 4, lineNum: 1 }, end: { column: 5, lineNum: 1 }},
            { token: "NUMBER", start: { column: 5, lineNum: 1 }, end: { column: 6, lineNum: 1 }},
            { token: "CIRCUMFLEX", start: { column: 7, lineNum: 1 }, end: { column: 8, lineNum: 1 }},
            { token: "NUMBER", start: { column: 9, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
            { token: "AMPER", start: { column: 11, lineNum: 1 }, end: { column: 12, lineNum: 1 }},
            { token: "NUMBER", start: { column: 13, lineNum: 1 }, end: { column: 14, lineNum: 1 }},
            { token: "VBAR", start: { column: 15, lineNum: 1 }, end: { column: 16, lineNum: 1 }},
            { token: "NUMBER", start: { column: 17, lineNum: 1 }, end: { column: 18, lineNum: 1 }},
            { token: "AMPER", start: { column: 19, lineNum: 1 }, end: { column: 20, lineNum: 1 }},
            { token: "NUMBER", start: { column: 21, lineNum: 1 }, end: { column: 22, lineNum: 1 }},
            { token: "CIRCUMFLEX", start: { column: 23, lineNum: 1 }, end: { column: 24, lineNum: 1 }},
            { token: "MINUS", start: { column: 25, lineNum: 1 }, end: { column: 26, lineNum: 1 }},
            { token: "NUMBER", start: { column: 26, lineNum: 1 }, end: { column: 27, lineNum: 1 }}
          ]);
        },
        'x = -1*1/1 + 1*1 - ---1*1': function () {
          assertTokensEqual('x = -1*1/1 + 1*1 - ---1*1', [
            { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
            { token: "EQUAL", start: { column: 2, lineNum: 1 }, end: { column: 3, lineNum: 1 }},
            { token: "MINUS", start: { column: 4, lineNum: 1 }, end: { column: 5, lineNum: 1 }},
            { token: "NUMBER", start: { column: 5, lineNum: 1 }, end: { column: 6, lineNum: 1 }},
            { token: "STAR", start: { column: 6, lineNum: 1 }, end: { column: 7, lineNum: 1 }},
            { token: "NUMBER", start: { column: 7, lineNum: 1 }, end: { column: 8, lineNum: 1 }},
            { token: "SLASH", start: { column: 8, lineNum: 1 }, end: { column: 9, lineNum: 1 }},
            { token: "NUMBER", start: { column: 9, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
            { token: "PLUS", start: { column: 11, lineNum: 1 }, end: { column: 12, lineNum: 1 }},
            { token: "NUMBER", start: { column: 13, lineNum: 1 }, end: { column: 14, lineNum: 1 }},
            { token: "STAR", start: { column: 14, lineNum: 1 }, end: { column: 15, lineNum: 1 }},
            { token: "NUMBER", start: { column: 15, lineNum: 1 }, end: { column: 16, lineNum: 1 }},
            { token: "MINUS", start: { column: 17, lineNum: 1 }, end: { column: 18, lineNum: 1 }},
            { token: "MINUS", start: { column: 19, lineNum: 1 }, end: { column: 20, lineNum: 1 }},
            { token: "MINUS", start: { column: 20, lineNum: 1 }, end: { column: 21, lineNum: 1 }},
            { token: "MINUS", start: { column: 21, lineNum: 1 }, end: { column: 22, lineNum: 1 }},
            { token: "NUMBER", start: { column: 22, lineNum: 1 }, end: { column: 23, lineNum: 1 }},
            { token: "STAR", start: { column: 23, lineNum: 1 }, end: { column: 24, lineNum: 1 }},
            { token: "NUMBER", start: { column: 24, lineNum: 1 }, end: { column: 25, lineNum: 1 }}
          ]);
        },
      },

      'selector': function () {
        assertTokensEqual("import sys, time\nx = sys.modules['time'].time()", [
          { token: "NAME", start: { column: 0, lineNum: 1 }, end: { column: 6, lineNum: 1 }},
          { token: "NAME", start: { column: 7, lineNum: 1 }, end: { column: 10, lineNum: 1 }},
          { token: "COMMA", start: { column: 10, lineNum: 1 }, end: { column: 11, lineNum: 1 }},
          { token: "NAME", start: { column: 12, lineNum: 1 }, end: { column: 16, lineNum: 1 }},
          { token: "NEWLINE", start: { column: 16, lineNum: 1 }, end: { column: 16, lineNum: 1 }},
          { token: "NAME", start: { column: 0, lineNum: 2 }, end: { column: 1, lineNum: 2 }},
          { token: "EQUAL", start: { column: 2, lineNum: 2 }, end: { column: 3, lineNum: 2 }},
          { token: "NAME", start: { column: 4, lineNum: 2 }, end: { column: 7, lineNum: 2 }},
          { token: "DOT", start: { column: 7, lineNum: 2 }, end: { column: 8, lineNum: 2 }},
          { token: "NAME", start: { column: 8, lineNum: 2 }, end: { column: 15, lineNum: 2 }},
          { token: "LSQB", start: { column: 15, lineNum: 2 }, end: { column: 16, lineNum: 2 }},
          { token: "STRING", start: { column: 16, lineNum: 2 }, end: { column: 22, lineNum: 2 }},
          { token: "RSQB", start: { column: 22, lineNum: 2 }, end: { column: 23, lineNum: 2 }},
          { token: "DOT", start: { column: 23, lineNum: 2 }, end: { column: 24, lineNum: 2 }},
          { token: "NAME", start: { column: 24, lineNum: 2 }, end: { column: 28, lineNum: 2 }},
          { token: "LPAR", start: { column: 28, lineNum: 2 }, end: { column: 29, lineNum: 2 }},
          { token: "RPAR", start: { column: 29, lineNum: 2 }, end: { column: 30, lineNum: 2 }}
        ]);
      }
    },

    '@staticmethod\ndef foo(): pass': function () {
      assertTokensEqual('@staticmethod\ndef foo(): pass', [
        { token: "AT", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
        { token: "NAME", start: { column: 1, lineNum: 1 }, end: { column: 13, lineNum: 1 }},
        { token: "NEWLINE", start: { column: 13, lineNum: 1 }, end: { column: 13, lineNum: 1 }},
        { token: "NAME", start: { column: 0, lineNum: 2 }, end: { column: 3, lineNum: 2 }},
        { token: "NAME", start: { column: 4, lineNum: 2 }, end: { column: 7, lineNum: 2 }},
        { token: "LPAR", start: { column: 7, lineNum: 2 }, end: { column: 8, lineNum: 2 }},
        { token: "RPAR", start: { column: 8, lineNum: 2 }, end: { column: 9, lineNum: 2 }},
        { token: "COLON", start: { column: 9, lineNum: 2 }, end: { column: 10, lineNum: 2 }},
        { token: "NAME", start: { column: 11, lineNum: 2 }, end: { column: 15, lineNum: 2 }}
      ]);
    },

    '@staticmethod\ndef foo(x:1)->1: pass': function () {
      assertTokensEqual('@staticmethod\ndef foo(x:1)->1: pass', [
        { token: "AT", start: { column: 0, lineNum: 1 }, end: { column: 1, lineNum: 1 }},
        { token: "NAME", start: { column: 1, lineNum: 1 }, end: { column: 13, lineNum: 1 }},
        { token: "NEWLINE", start: { column: 13, lineNum: 1 }, end: { column: 13, lineNum: 1 }},
        { token: "NAME", start: { column: 0, lineNum: 2 }, end: { column: 3, lineNum: 2 }},
        { token: "NAME", start: { column: 4, lineNum: 2 }, end: { column: 7, lineNum: 2 }},
        { token: "LPAR", start: { column: 7, lineNum: 2 }, end: { column: 8, lineNum: 2 }},
        { token: "NAME", start: { column: 8, lineNum: 2 }, end: { column: 9, lineNum: 2 }},
        { token: "COLON", start: { column: 9, lineNum: 2 }, end: { column: 10, lineNum: 2 }},
        { token: "NUMBER", start: { column: 10, lineNum: 2 }, end: { column: 11, lineNum: 2 }},
        { token: "RPAR", start: { column: 11, lineNum: 2 }, end: { column: 12, lineNum: 2 }},
        { token: "RARROW", start: { column: 12, lineNum: 2 }, end: { column: 14, lineNum: 2 }},
        { token: "NUMBER", start: { column: 14, lineNum: 2 }, end: { column: 15, lineNum: 2 }},
        { token: "COLON", start: { column: 15, lineNum: 2 }, end: { column: 16, lineNum: 2 }},
        { token: "NAME", start: { column: 17, lineNum: 2 }, end: { column: 21, lineNum: 2 }}
      ]);
    }
  });
}); 

