define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/query',
  './tokenizer',
  'dojo/NodeList-manipulate'
], function (declare, lang, query, Tokenizer) {
  return declare([], {
    constructor: function (opts) {
      lang.mixin(this, opts);
    },

    load: function (code, resultEltId) {
      this.tokenizer = new Tokenizer({ sourceText: code });
      this.resultElt = query(resultEltId);
      this.resultElt.text('');
    },

    getNextToken: function () {
      this.appendToTextBox(this.tokenizer.getNext());
    },

    appendToTextBox: function (tokenInfo) {
      var key, text;

      text = this.resultElt.text(); 
      for(key in tokenInfo) {
        text += key + ': ' + tokenInfo[key] + ' ';
      }
      text += '\n';

      this.resultElt.text(text);
    },

    getAllTokens: function () {
      var tokenInfo;

      do {
        tokenInfo = this.tokenizer.getNext();
        this.appendToTextBox(tokenInfo);
      } while(tokenInfo.token !== 'ENDMARKER');
    }
  });
});
