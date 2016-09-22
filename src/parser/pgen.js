define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/array',
  'prakalpa/constants/non_terminals',
  'prakalpa/constants/tokens',
  'prakalpa/tokenizer',
  'prakalpa/parser/nfa',
  'prakalpa/parser/dfa',
  'prakalpa/exceptions',
  'prakalpa/utils'
], function (declare, lang, array, NonTerminals, Terminals, Tokenizer, NFA, DFA, Exceptions, Utils) {
  /**
    * Generates the Python Parser DFAs using the CST generated by parsing the Python Grammar using the MetaGrammar
    * @class prakalpa.parser.ParserGenerator
    * @param {Object} opts
    * @param {prakalpa.parser.ParseTreeNode} opts.parseTreeRoot - Root of CST generated by parsing the Python Grammar using the MetaGrammar
    */
  return declare([], /** @lends prakalpa.parser.ParserGenerator.prototype */{
    constructor: function (opts) {
      lang.mixin(this, opts);
      /**
        * The map containing all the Parser DFAs
        * @name prakalpa.parser.ParserGenerator#dfas
        * @type {Object.<String, prakalpa.parser.DFA>}
        */
      this.dfas = {};
      /**
        * Contains all the tokens (type and string value) of the Python Language 
        * @name prakalpa.parser.ParserGenerator#labels
        * @type {Array<Object>}
        */
      this.labels = [];
      this._nfas = {};

      this._metaCompile();
      this._makeDFAs();
      this._translateLabels();
      this._calcFirstSet();
    },

    /**
      * Adds a new label to the list if not already present
      * @private
      * @param {Object.<String, String>} newLabel - type and string of the new label to be added
      */
    _addLabel: function (newLabel) {
      var existingLabel;

      existingLabel = array.filter(this.labels, function (label) {
        return (label.type === newLabel.type && label.string === newLabel.string);
      });

      if(!existingLabel.length) {
        this.labels.push(newLabel);
      }
    },

    /**
      * Asserts if the current node under processing is the expected one
      * @private
      * @param {prakalpa.parser.ParseTreeNode} node - Node under processing
      * @param {String} symbol - Name of symbol
      * @throws {prakalpa.Exceptions.AssertionError} If the expectation is not met
      */
    _REQ: function (node, expectedSymbol) {
      if(!node.is(expectedSymbol)) {
        throw new Exceptions.AssertionError('Expected ' + expectedSymbol + ', got ' + node.symbol);
      }
    },

    /**
      * Asserts if the current node has the expected number of children
      * @private
      * @param {Array<prakalpa.parser.ParseTreeNode>} children - Children of a node
      * @param {Number} expectedNumChildren - Expected number of children
      * @throws {prakalpa.Exceptions.AssertionError} If the expectation is not met
      */
    _REQN: function (children, expectedNumChildren) {
      if(children.length < expectedNumChildren) {
        throw new Exceptions.AssertionError('Expected at least' + expectedNumChildren + ' children, got ' + children.length);
      }
    },

    /**
      * Create DFAs from the NFAs compiled from the CST
      * @private
      */
    _makeDFAs: function () {
      var nfa, type;

      for(type in this._nfas) {
        nfa = this._nfas[type];
        this.dfas[type] = new DFA({type: type, nfa: nfa});
      }
    },

    /**
      * @private
      * @throws {prakalpa.Exceptions.InvalidNameLabel} If the NAME label is neither a terminal nor a non-terminal
      * @throws {prakalpa.Exceptions.InvalidOneCharLabel} If the one char label is not a valid one char token
      * @throws {prakalpa.Exceptions.InvalidTwoCharLabel} If the two char label is not a valid two char token
      * @throws {prakalpa.Exceptions.InvalidThreeCharLabel} If the three char label is not a valid three char token
      */
    _translateLabels: function () {
      array.forEach(this.labels, function (label) {
        var keywordRegex, type;
        switch(label.type) {
          case Terminals.NAME:
            if(Utils.isNonTerminal(label.string, this.dfas) || Utils.isTerminal(label.string)) {
              label.type = label.string;
            } else {
              throw new Exceptions.InvalidNameLabel(label);
            }
            break;
          case Terminals.STRING:
            label.string = label.string.slice(1, -1);
            keywordRegex = /^[A-Za-z_]/;
            if(label.string.match(keywordRegex)) {
              label.type = Terminals.NAME;
            } else if(label.string.length === 1) {
              type = Utils.oneCharToken(label.string);
              if(type !== Terminals.OP) {
                label.type = type;
              } else {
                throw new Exceptions.InvalidOneCharLabel(label);
              }
            } else if(label.string.length === 2) {
              type = Utils.twoCharToken(label.string[0], label.string[1]);
              if(type !== Terminals.OP) {
                label.type = type;
              } else {
                throw new Exceptions.InvalidTwoCharLabel(label);
              }
            } else if(label.string.length === 3) {
              type = Utils.threeCharToken(label.string[0], label.string[1], label.string[2]);
              if(type !== Terminals.OP) {
                label.type = type;
              } else {
                throw new Exceptions.InvalidThreeCharLabel(label);
              }
            }
            break;
          default:
            // Don't do anything, the label is fine
        }
      }.bind(this));
    },

    /**
      * Calculates the first set of every dfa in the list
      * @private
      */
    _calcFirstSet: function () {
      var type, dfa;

      for(type in this.dfas) {
        dfa = this.dfas[type];
        dfa.calcFirstSet(this.dfas);
      }
    },

    /**
      * Starts the compilation of the CST into NFAs
      * Similar to the algorithm given in [3.7.4 Construction of an NFA from a Regular Expression](http://www.informatik.uni-bremen.de/agbkb/lehre/ccfl/Material/ALSUdragonbook.pdf) 
      * @private
      */
    _metaCompile: function () {
      var i, child;

      this._REQ(this.parseTreeRoot, NonTerminals.MSTART);
      // Process all children (RULES) other than the last child (ENDMARKER)
      for(i = 0; i < this.parseTreeRoot.children.length - 1; i++) {
        child = this.parseTreeRoot.children[i];
        if(!child.is(Terminals.NEWLINE)) {
          this._compileRule(child);
        }
      }
    },

    /**
      * Processes a grammar production rule
      * @private
      * @param {prakalpa.parser.ParseTreeNode} parseTreeNode - The node that represents the start of the production rule
      */
    _compileRule: function (parseTreeNode) {
      var child, i, nfa, states, string;

      i = 0;

      this._REQ(parseTreeNode, NonTerminals.RULE);
      this._REQN(parseTreeNode.children, 4);

      child = parseTreeNode.children[i++];
      this._REQ(child, Terminals.NAME);

      string = child.string;
      this._addLabel({ type: Terminals.NAME, string: string });
      nfa = new NFA({ name: string });
      this._nfas[string] = nfa;

      child = parseTreeNode.children[i++];
      this._REQ(child, Terminals.COLON);

      child = parseTreeNode.children[i++];
      this._REQ(child, NonTerminals.RHS);
      states = this._compileRHS(nfa, child);
      nfa.setStart(states.start);
      nfa.setEnd(states.end);

      child = parseTreeNode.children[i];
      this._REQ(child, Terminals.NEWLINE);
    },

    /**
      * Processes the right hand side of a grammar production rule
      * @private
      * @param {prakalpa.parser.NFA} nfa - The NFA representing the production rule
      * @param {prakalpa.parser.ParseTreeNode} parseTreeNode - The node that represents the start of the rhs 
      */
    _compileRHS: function (nfa, parseTreeNode) {
      var child, i, newStart, newEnd, states, start, end;

      i = 0;

      this._REQ(parseTreeNode, NonTerminals.RHS);
      this._REQN(parseTreeNode.children, 1);

      child = parseTreeNode.children[i++];
      this._REQ(child, NonTerminals.ALT);

      states = this._compileAlt(nfa, child);
      start = states.start;
      end = states.end;

      if(i >= parseTreeNode.children.length) {
        return { start: start, end: end };
      }

      newStart = nfa.addNewState();
      newEnd = nfa.addNewState();
      nfa.addEmptyArc(newStart, start);
      nfa.addEmptyArc(end, newEnd);
      start = newStart;
      end = newEnd;

      for(; i < parseTreeNode.children.length; i++) {
        child = parseTreeNode.children[i];
        this._REQ(child, Terminals.VBAR);
        this._REQN(parseTreeNode.children - i, 1);
        i++;
        child = parseTreeNode.children[i];
        this._REQ(child, NonTerminals.ALT);
        states = this._compileAlt(nfa, child);
        nfa.addEmptyArc(start, states.start);
        nfa.addEmptyArc(states.end, end);
      }

      return { start: start, end: end };
    },

    /**
      * Processes alternatives (options separated by a | character in the RHS of a production rule)
      * @private
      * @param {prakalpa.parser.NFA} nfa - The NFA representing the production rule
      * @param {prakalpa.parser.ParseTreeNode} parseTreeNode - The node that represents the start of the alternatives
      */
    _compileAlt: function (nfa, parseTreeNode) {
      var child, i, states, start, end;

      i = 0;

      this._REQ(parseTreeNode, NonTerminals.ALT);
      this._REQN(parseTreeNode.children, 1);

      child = parseTreeNode.children[i++];
      this._REQ(child, NonTerminals.ITEM);
      states = this._compileItem(nfa, child);
      start = states.start;
      end = states.end;

      for(; i < parseTreeNode.children.length; i++) {
        child = parseTreeNode.children[i];
        this._REQ(child, NonTerminals.ITEM);
        states = this._compileItem(nfa, child);
        nfa.addEmptyArc(end, states.start);
        end = states.end;
      }

      return { start: start, end: end };
    },

    /**
      * Processes each item on the RHS. An item maybe another non terminal or an expression with or without repeat directives
      * @private
      * @param {prakalpa.parser.NFA} nfa - The NFA representing the production rule
      * @param {prakalpa.parser.ParseTreeNode} parseTreeNode - The node that represents the start of the alternatives
      */
    _compileItem: function (nfa, parseTreeNode) {
      var child, i, states, start, end;

      i = 0;

      this._REQ(parseTreeNode, NonTerminals.ITEM);
      this._REQN(parseTreeNode.children, 1);

      child = parseTreeNode.children[i++];

      if(child.is(Terminals.LSQB)) {
        this._REQN(parseTreeNode.children, 3);

        child = parseTreeNode.children[i++];
        this._REQ(child, NonTerminals.RHS);

        start = nfa.addNewState();
        end = nfa.addNewState();
        nfa.addEmptyArc(start, end);

        states = this._compileRHS(nfa, child);
        nfa.addEmptyArc(start, states.start);
        nfa.addEmptyArc(states.end, end);

        child = parseTreeNode.children[i];
        this._REQ(child, Terminals.RSQB);
      } else {
        states = this._compileAtom(nfa, child);
        start = states.start;
        end = states.end;
        if(i >= parseTreeNode.children.length) {
          return { start: start, end: end };
        }

        child = parseTreeNode.children[i];
        nfa.addEmptyArc(end, start);

        if(child.is(Terminals.STAR)) {
          end = start;
        } else {
          this._REQ(child, Terminals.PLUS);
        }
      }
      return { start: start, end: end };
    },

    /**
      * Processes expressions in parenthesis and terminals
      * @private
      * @param {prakalpa.parser.NFA} nfa - The NFA representing the production rule
      * @param {prakalpa.parser.ParseTreeNode} parseTreeNode - The node that represents the start of the alternatives
      */
    _compileAtom: function (nfa, parseTreeNode) {
      var child, i, states, start, end;

      i = 0;

      this._REQ(parseTreeNode, NonTerminals.ATOM);
      this._REQN(parseTreeNode.children, 1);

      child = parseTreeNode.children[i++];

      if(child.is(Terminals.LPAR)) {
        this._REQN(parseTreeNode.children, 3);

        child = parseTreeNode.children[i++];
        this._REQ(child, NonTerminals.RHS);
        states = this._compileRHS(nfa, child);
        start = states.start;
        end = states.end;

        child = parseTreeNode.children[i];
        this._REQ(child, Terminals.RPAR);
      } else if (child.is(Terminals.NAME) || child.is(Terminals.STRING)) {
        start = nfa.addNewState();
        end = nfa.addNewState();
        this._addLabel({ type: child.symbol, string: child.string });
        nfa.addArc(start, end, child.string);
      } else {
        this._REQ(child, Terminals.NAME);
      }

      return { start: start, end: end };
    }
  });
});