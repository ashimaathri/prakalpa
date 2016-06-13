define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/array',
  './non_terminals',
  '../tokens',
  './nfa'
], function (declare, lang, array, NonTerminals, Terminals, NFA) {
  return declare([], {
    constructor: function (opts) {
      lang.mixin(this, opts);
      this.nfaGrammar = {};
      this.labels = [];
      this.metaCompile();
    },

    addLabel: function (newLabel) {
      var existingLabel;

      existingLabel = array.filter(this.labels, function (label) {
        return (label.type === newLabel.type && label.string === newLabel.string);
      });

      if(!existingLabel.length) {
        this.labels.push(newLabel);
      }
    },

    REQ: function (node, expectedSymbol) {
      if(!node.is(expectedSymbol)) {
        throw new Error('Expected ' + expectedSymbol + ', got ' + node.symbol);
      }
    },

    REQN: function (children, expectedNumChildren) {
      if(children.length < expectedNumChildren) {
        throw new Error('Expected at least' + expectedNumChildren + ' children, got ' + children.length);
      }
    },

    metaCompile: function () {
      var i, child;

      this.REQ(this.parseTreeRoot, NonTerminals.MSTART);
      // Process all children (RULES) other than the last child (ENDMARKER)
      for(i = 0; i < this.parseTreeRoot.children.length - 1; i++) {
        child = this.parseTreeRoot.children[i];
        if(!child.is(Terminals.NEWLINE)) {
          this.compileRule(child);
        }
      }
    },

    compileRule: function (parseTreeNode) {
      var child, i, nfa, states, string;

      i = 0;

      this.REQ(parseTreeNode, NonTerminals.RULE);
      this.REQN(parseTreeNode.children, 4);

      child = parseTreeNode.children[i++];
      this.REQ(child, Terminals.NAME);

      string = child.getString();
      this.addLabel({ type: Terminals.NAME, string: string });
      nfa = new NFA({ name: string });
      this.nfaGrammar[string] = nfa;

      child = parseTreeNode.children[i++];
      this.REQ(child, Terminals.COLON);

      child = parseTreeNode.children[i++];
      this.REQ(child, NonTerminals.RHS);
      states = this.compileRHS(nfa, child);
      nfa.start = states.start;
      nfa.end = states.end;

      child = parseTreeNode.children[i];
      this.REQ(child, Terminals.NEWLINE);
    },

    compileRHS: function (nfa, parseTreeNode) {
      var child, i, newStart, newEnd, states, start, end;

      i = 0;

      this.REQ(parseTreeNode, NonTerminals.RHS);
      this.REQN(parseTreeNode.children, 1);

      child = parseTreeNode.children[i++];
      this.REQ(child, NonTerminals.ALT);

      states = this.compileAlt(nfa, child);
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
        this.REQ(child, Terminals.VBAR);
        this.REQN(parseTreeNode.children - i, 1);
        i++;
        child = parseTreeNode.children[i];
        this.REQ(child, NonTerminals.ALT);
        states = this.compileAlt(nfa, child);
        nfa.addEmptyArc(start, states.start);
        nfa.addEmptyArc(states.end, end);
      }

      return { start: start, end: end };
    },

    compileAlt: function (nfa, parseTreeNode) {
      var child, i, states, start, end;

      i = 0;

      this.REQ(parseTreeNode, NonTerminals.ALT);
      this.REQN(parseTreeNode.children, 1);

      child = parseTreeNode.children[i++];
      this.REQ(child, NonTerminals.ITEM);
      states = this.compileItem(nfa, child);
      start = states.start;
      end = states.end;

      for(; i < parseTreeNode.children.length; i++) {
        child = parseTreeNode.children[i];
        this.REQ(child, NonTerminals.ITEM);
        states = this.compileItem(nfa, child);
        nfa.addEmptyArc(end, states.start);
        end = states.end;
      }

      return { start: start, end: end };
    },

    compileItem: function (nfa, parseTreeNode) {
      var child, i, states, start, end;

      i = 0;

      this.REQ(parseTreeNode, NonTerminals.ITEM);
      this.REQN(parseTreeNode.children, 1);

      child = parseTreeNode.children[i++];

      if(child.is(Terminals.LSQB)) {
        this.REQN(parseTreeNode.children, 3);

        child = parseTreeNode.children[i++];
        this.REQ(child, NonTerminals.RHS);

        start = nfa.addNewState();
        end = nfa.addNewState();
        nfa.addEmptyArc(start, end);

        states = this.compileRHS(nfa, child);
        nfa.addEmptyArc(start, states.start);
        nfa.addEmptyArc(states.end, end);

        child = parseTreeNode.children[i];
        this.REQ(child, Terminals.RSQB);
      } else {
        states = this.compileAtom(nfa, child);
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
          this.REQ(child, Terminals.PLUS);
        }
      }
      return { start: start, end: end };
    },

    compileAtom: function (nfa, parseTreeNode) {
      var child, i, states, start, end;

      i = 0;

      this.REQ(parseTreeNode, NonTerminals.ATOM);
      this.REQN(parseTreeNode.children, 1);

      child = parseTreeNode.children[i++];

      if(child.is(Terminals.LPAR)) {
        this.REQN(parseTreeNode.children, 3);

        child = parseTreeNode.children[i++];
        this.REQ(child, NonTerminals.RHS);
        states = this.compileRHS(nfa, child);
        start = states.start;
        end = states.end;

        child = parseTreeNode.children[i];
        this.REQ(child, Terminals.RPAR);
      } else if (child.is(Terminals.NAME) || child.is(Terminals.STRING)) {
        start = nfa.addNewState();
        end = nfa.addNewState();
        this.addLabel({ type: child.getSymbol(), string: child.getString() });
        nfa.addArc(start, end, child.getString());
      } else {
        this.REQ(child, Terminals.NAME);
      }

      return { start: start, end: end };
    }
  });
});
