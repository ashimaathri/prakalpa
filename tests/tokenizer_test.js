/*
 * Tests taken from cpython's Lib/test/test_tokenize.py
 */
define([
  'intern!object',
  'intern/chai!assert',
  'prakalpa/tokenizer',
  'dojo/_base/array'
], function (registerSuite, assert, Tokenizer, array) {
  var assertTokensEqual;

  assertTokensEqual = function (sourceText, expectedTokenInfos) {
    var tokenizer;

    tokenizer = new Tokenizer({ sourceText: sourceText });

    array.forEach(expectedTokenInfos, function (expectedTokenInfo) {
      var tokenInfo;

      tokenInfo = tokenizer.getNext();

      for(var key in expectedTokenInfo) {
        assert.strictEqual(expectedTokenInfo[key], tokenInfo[key]);
      }
    });

    assert.strictEqual(tokenizer.getNext().token, 'ENDMARKER');
  };

  registerSuite({
    name: 'Tokenzier',

    'Hello world!': function () {
      assertTokensEqual('Hello world!', [
        { token: 'NAME', start: 0, end: 5, lineNum: 1 },
        { token: 'NAME', start: 6, end: 11, lineNum: 1 },
        { token: 'OP', start: 11, end: 12, lineNum: 1 }
      ]);
    },

    '1 + 1': function () {
      assertTokensEqual('1 + 1', [
        { token: 'NUMBER', start: 0, end: 1, lineNum: 1 },
        { token: 'PLUS', start: 2, end: 3, lineNum: 1 },
        { token: 'NUMBER', start: 4, end: 5, lineNum: 1 }
      ]);
    },

    'if False:\n    # NL\n    True = False # NEWLINE\n': function () {
      assertTokensEqual('if False:\n    # NL\n    True = False # NEWLINE\n', [
        { token: 'NAME', start: 0, end: 2, lineNum: 1},
        { token: 'NAME', start: 3, end: 8, lineNum: 1},
        { token: 'COLON', start: 8, end: 9, lineNum: 1},
        { token: 'NEWLINE', start: 9, end: 9, lineNum: 1},
        { token: 'INDENT', lineNum: 3},
        { token: 'NAME', start: 4, end: 8, lineNum: 3},
        { token: 'EQUAL', start: 9, end: 10, lineNum: 3},
        { token: 'NAME', start: 11, end: 16, lineNum: 3},
        { token: 'NEWLINE', start: 17, end: 26, lineNum: 3},
        { token: 'DEDENT', lineNum: 4},
      ]);
    }
  });
}); 

