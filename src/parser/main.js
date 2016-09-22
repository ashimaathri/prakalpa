/*
 * Port of cpython's parser, Parser/parser.c,
 * in particular the PyParser_AddToken function.
 */
/**
  * @namespace prakalpa.parser
  */
define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'prakalpa/tokenizer',
  'prakalpa/parser/stack',
  'prakalpa/parser/parse_tree_node',
  'prakalpa/constants/status_codes',
  'prakalpa/constants/tokens',
  'prakalpa/exceptions',
], function (declare, lang, Tokenizer, Stack, ParseTreeNode,
             ParserStatus, Tokens, Exceptions) {
  /**
    * @class prakalpa.parser.Parser
    * @param {Object} opts
    * @param {Object.<String, prakalpa.parser.Parser.DFA>} opts.grammar - The grammar containing all the DFAs
    * @param {String} opts.start - The start symbol of the grammar
    * @param {String} opts.sourceText - The text that needs to be parsed using this grammar
    */
  return declare([], /** @lends prakalpa.parser.Parser.prototype */{
    constructor: function (opts) {
      var start_dfa, start_state, nonTerminal, dfa;

      lang.mixin(this, opts);

      this.tokenizer = new Tokenizer({ sourceText: this.sourceText });

      this.parseTreeRoot = new ParseTreeNode({
        symbol: this.start,
        string: null,
        lineNum: 0,
        columnOffset: 0
      });


      start_dfa = this.grammar[this.start];
      start_state = start_dfa.states[0];

      this.stack = new Stack();

      this.stack.push({
        dfa: start_dfa,
        currentParseTreeNode: this.parseTreeRoot,
        currentState: start_state 
      });

      for(nonTerminal in this.grammar) {
        dfa = this.grammar[nonTerminal];
        dfa.constructFollowSet(this.grammar);
      }
    },

    /**
      * Entrypoint into the parser.
      * @returns {prakalpa.parser.ParseTreeNode} parseTreeRoot - The root of the concrete syntax tree
      */
    parse: function () {
      var token;

      do {
        token = this.tokenizer.getNext();
        this._addToken(token);
      } while(token.type !== Tokens.ENDMARKER);

      return this.parseTreeRoot;
    },

    /**
      * Adds node to CST and moves current dfa to the next state 
      * Top of the stack will point to the current dfa at the `parserState.nextState` at the end of this method 
      * @private
      * @param {Object} parserState - Current state of parser
      * @param {prakalpa.parser.ParseTreeNode} currentParseTreeNode - The concrete syntax tree node which we are processing currently
      * @returns {prakalpa.parser.ParseTreeNode} childNode - New node added to `currentParseTreeNode` as a child
      */
    _shift: function (parserState, currentParseTreeNode) {
      var childNode;

      if(this.stack.isEmpty()) {
        throw new Error('Stack was not expected to be empty');
      }

      childNode = new ParseTreeNode({
        symbol: parserState.symbol,
        lineNum: parserState.lineNum,
        string: parserState.string,
        columnOffset: parserState.columnOffset
      });
      currentParseTreeNode.addChild(childNode);

      this.stack.updateTop('currentState', parserState.nextState);

      return childNode;
    },

    /**
      * Adds node to CST, moves current dfa to next state, pushes current parser state on to the stack and goes to the first state of the new dfa 
      * Top of the stack will point to the new dfa at state 0 at the end of this method.
      * @private
      * @param {Object} parserState - Current state of parser
      * @param {prakalpa.parser.ParseTreeNode} currentParseTreeNode - The concrete syntax tree node which we are processing currently
      */
    _push: function (parserState, currentParseTreeNode) {
      var childNode;

      childNode = this._shift(parserState, currentParseTreeNode);

      this.stack.push({
        dfa: parserState.dfa,
        currentParseTreeNode: childNode,
        currentState: parserState.dfa.states[0]
      });
    },

    /**
      * Adds a token to the concrete syntax tree using a table driven (`followSet` + `stack`) top-down predictive parsing algorithm. The grammar must be LL(1) for this to work and Python's grammar is [by choice an LL(1) grammar](https://www.python.org/dev/peps/pep-3099/).
      * @private
      * @param {Object} parserState - Current state of parser
      * @param {prakalpa.parser.ParseTreeNode} currentParseTreeNode - The concrete syntax tree node which we are processing currently
      * @throws {prakalpa.Exceptions.ParseError} If the source does not belong to the language generated by the given grammar 
      */
    _addToken: function (token) {
      var stackEntry, dfa, currentState, currentParseTreeNode, transition, exception;

      for(;;) {
        stackEntry = this.stack.peek();
        dfa = stackEntry.dfa;
        currentParseTreeNode = stackEntry.currentParseTreeNode;
        currentState = stackEntry.currentState;

        if(token.type in currentState.followSet) {
          transition = currentState.followSet[token.type];

          if(transition.nonTerminal) {
            this._push({
              symbol: transition.nonTerminal,
              dfa: this.grammar[transition.nonTerminal],
              nextState: transition.arrow,
              lineNum: token.start.lineNum
            }, currentParseTreeNode);
            continue;
          } else {
            this._shift({
              symbol: token.type,
              nextState: transition.arrow,
              lineNum: token.start.lineNum,
              string: token.string,
              columnOffset: token.start.column
            }, currentParseTreeNode);
          }

          currentState = this.stack.peek('currentState');
          while(currentState &&
                currentState.isAccepting &&
                !currentState.arcs.length) {
            this.stack.pop();

            if(this.stack.isEmpty()) {
              return;
            }

            currentState = this.stack.peek('currentState');
          }
          return;
        } else if(currentState.isAccepting) {
          this.stack.pop();
          if(this.stack.isEmpty()) {
            throw new Exceptions.ParseError({ message: 'Stack was not expected to be empty' });
          }
          continue;
        } else {
          exception = {
            message: 'Neither was the token in the follow set of the current DFA state, nor was the current state an accepting state',
          };
          lang.mixin(exception, token);
          lang.mixin(exception, stackEntry);
          throw new Exceptions.ParseError(exception);
        }
      }
    }
  });
});
