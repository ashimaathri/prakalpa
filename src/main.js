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
      this.populateTextBox(this.tokenizer.getNext());
    },

    populateTextBox: function (tokenInfo) {
      this.resultElt.text(this.resultElt.text() +
          tokenInfo.token +
          (typeof(tokenInfo.start) !== 'undefined' ? ' Start:' + tokenInfo.start + ' End:' + tokenInfo.end : '') +
          (typeof(tokenInfo.error) !== 'undefined' ? ' ' + tokenInfo.error : '') +
          '\n');
    },

    getAllTokens: function () {
      var tokenInfo;

      do {
        tokenInfo = this.tokenizer.getNext();
        this.populateTextBox(tokenInfo);
      } while(tokenInfo.token != 'ENDMARKER');
    }
  });
});
