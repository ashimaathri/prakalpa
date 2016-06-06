/*
 * Port of cpython's parser, Parser/parser.c,
 * in particular the PyParser_AddToken function.
 */
define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/array',
  '../tokenizer',
  './stack',
  './parse_tree_node',
  './status_codes',
  '../tokens',
  './non_terminals',
], function (declare, lang, array, Tokenizer, Stack, ParseTreeNode,
             ParserStatus, Tokens, NonTerminals) {
  return declare([], {
    /**
      * grammar: Dictionary of nonTerminal(key), dfa(value)
      * start: nonTerminal for start symbol
      * sourceText: Source that needs to be parsed
      **/
    constructor: function (opts) {
      var start_symbol_dfa;

      lang.mixin(this, opts);

      this.tokenizer = new Tokenizer({ sourceText: this.sourceText });

      this.parseTreeRoot = new ParseTreeNode({
        symbol: this.start,
        string: null,
        lineNum: 0,
        columnOffset: 0
      });

      this.stack = new Stack();

      start_symbol_dfa = this.grammar[this.start];

      this.stack.push({
        dfa: start_symbol_dfa,
        currentParseTreeNode: this.parseTreeRoot,
        currentState: start_symbol_dfa.states[0]
      });

      this.constructNextTable();
    },

    constructNextTable: function () {
      var nonTerminal, dfa, grammar;

      grammar = this.grammar;

      for(nonTerminal in grammar) {
        dfa = grammar[nonTerminal];
        array.forEach(dfa.states, function (state) {
          array.forEach(state.arcs, function (arc) {
            var firstSet;

            if(arc.label in NonTerminals) {
              firstSet = grammar[arc.label].firstSet;
              array.forEach(firstSet, function (label) {
                state.next[label] = {
                  arrow: arc.arrow,
                  nonTerminal: arc.label,
                };
              });
            } else {
              state.next[arc.label] = {
                arrow: arc.arrow,
                nonTerminal: null
              };
            }
          });
        });
      }
    },

    shift: function (parserState, currentParseTreeNode) {
      var childNode;

      if(this.stack.isEmpty()) {
        throw new Error('Stack was not expected to be empty');
      }

      childNode = new ParseTreeNode({
        symbol: parserState.terminal || parserState.nonTerminal,
        lineNum: parserState.lineNum,
        string: parserState.string,
        columnOffset: parserState.columnOffset
      });
      currentParseTreeNode.addChild(childNode);

      this.stack.updateTop('currentState', parserState.endState);

      return childNode;
    },

    push: function (parserState, currentParseTreeNode) {
      var childNode;

      childNode = this.shift(parserState, currentParseTreeNode);

      this.stack.push({
        dfa: parserState.dfa,
        currentParseTreeNode: childNode,
        currentState: parserState.dfa.states[0]
      });
    },

    parse: function () {
      var tokenInfo, parseStatus;

      do {
        tokenInfo = this.tokenizer.getNext();
        if(tokenInfo.token === Tokens.ERRORTOKEN) {
          return tokenInfo.error;
        }
        parseStatus = this.addToken(tokenInfo);
        if(parseStatus !== ParserStatus.OK &&
           parseStatus !== ParserStatus.DONE) {
          return parseStatus; 
        }
      } while(tokenInfo.token !== Tokens.ENDMARKER);

      return this.parseTreeRoot;
    },

    addToken: function (tokenInfo) {
      var stackEntry, dfa, currentState, currentParseTreeNode, transition;

      for(;;) {
        stackEntry = this.stack.peek();
        dfa = stackEntry.dfa;
        currentParseTreeNode = stackEntry.currentParseTreeNode;
        currentState = stackEntry.currentState;

        if(tokenInfo.token in currentState.next) {
          transition = currentState.next[tokenInfo.token];

          if(transition.nonTerminal) {
            this.push({
              nonTerminal: transition.nonTerminal,
              dfa: this.grammar[transition.nonTerminal],
              endState: dfa.states[transition.arrow],
              lineNum: tokenInfo.lineNum || tokenInfo.start.lineNum
            }, currentParseTreeNode);
            continue;
          } else {
            this.shift({
              terminal: tokenInfo.token,
              endState: dfa.states[transition.arrow],
              lineNum: tokenInfo.lineNum || tokenInfo.start.lineNum,
              string: tokenInfo.string,
              columnOffset: tokenInfo.start && tokenInfo.start.column
            }, currentParseTreeNode);
          }

          currentState = this.stack.peek('currentState');
          while(currentState &&
                currentState.isAccepting &&
                !currentState.arcs.length) {
            this.stack.pop();

            if(this.stack.isEmpty()) {
              return ParserStatus.DONE;
            }

            currentState = this.stack.peek('currentState');
          }
          return ParserStatus.OK;
        }
        
        if(currentState.isAccepting) {
          this.stack.pop();
          if(this.stack.isEmpty()) {
            return ParserStatus.SYNTAX_ERROR;
          }
          continue;
        }
        return ParserStatus.SYNTAX_ERROR;
      }
    }
  });
});
