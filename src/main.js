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
      var tokenInfo, origText;

      tokenInfo = this.tokenizer.getNext();
      origText = this.resultElt.text();
      this.resultElt.text(origText +
          tokenInfo.token +
          (typeof(tokenInfo.start) !== 'undefined' ? ' Start:' + tokenInfo.start + ' End:' + tokenInfo.end : '') +
          '\n');
    }
  });
});
