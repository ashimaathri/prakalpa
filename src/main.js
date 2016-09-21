/**
  * @namespace prakalpa
  */
define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/query',
  'prakalpa/tokenizer',
  'prakalpa/parser/meta_grammar',
  'prakalpa/parser/main',
  'prakalpa/parser/pgen',
  'prakalpa/constants/non_terminals',
  'dojo/request/xhr',
  'dojo/NodeList-manipulate'
], function (declare, lang, query, Tokenizer, metagrammarDFAs, Parser,
             ParserGenerator, NonTerminals, xhr) {
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
      try {
        this.appendObjectToTextBox(this.tokenizer.getNext());
      } catch(e) {
        this.appendObjectToTextBox(e);
      }
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
        try {
          tokenInfo = this.tokenizer.getNext();
          this.appendObjectToTextBox(tokenInfo);
        } catch (e) {
          this.appendObjectToTextBox(e);
          break;
        }
      } while(tokenInfo.type !== 'ENDMARKER');
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

    constructPgen: function (parseTreeRoot) {
      var pgen;

      pgen = new ParserGenerator({ parseTreeRoot: parseTreeRoot });
      window.labels = pgen.labels;
      window.dfas= pgen.dfas;
    }
  });
});
