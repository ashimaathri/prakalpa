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
      this.appendObjectToTextBox(this.tokenizer.getNext());
    },

    appendObjectToTextBox: function (tokenInfo) {
      var text;

      text = this.resultElt.text();
      text += JSON.stringify(tokenInfo);
      text += '\n';

      this.resultElt.text(text);
    },

    getAllTokens: function () {
      var tokenInfo;

      do {
        tokenInfo = this.tokenizer.getNext();
        this.appendObjectToTextBox(tokenInfo);
      } while(tokenInfo.token !== 'ENDMARKER');
    }
  });
});
