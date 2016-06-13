define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/query',
  './tokenizer',
  './parser/meta_grammar',
  './parser/main',
  './parser/pgen',
  './parser/non_terminals',
  'dojo/request/xhr',
  'dojo/NodeList-manipulate'
], function (declare, lang, query, Tokenizer, metagrammarDFAs, Parser,
             ParserGenerator, NonTerminals, xhr) {
  return declare([], {
    /**
     * sourceText: Source that needs to be tokenized
     */
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
    },

    construct_parse_tree: function (pathToGrammarFile, callback) {
      xhr(pathToGrammarFile)
        .then(function (pythonGrammar) {
          callback(
            new Parser({
              grammar: metagrammarDFAs,
              start: NonTerminals.MSTART,
              sourceText: pythonGrammar
            }).parse());
        });
    },

    constructNFAGrammar: function (parseTreeRoot) {
      var pgen;

      pgen = new ParserGenerator({ parseTreeRoot: parseTreeRoot });
      return pgen.nfaGrammar;
    }
  });
});
