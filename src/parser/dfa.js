define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/array',
  'prakalpa/parser/dfa_state',
  'prakalpa/constants/tokens',
  'prakalpa/exceptions'
], function (declare, lang, array, DFAState, Terminals, Exceptions) {
  var START_MARKER;

  return declare([], {
    constructor: function (opts) {
      lang.mixin(this, opts);

      this.states = [];
      this.firstSet = null;

      this.start = new DFAState();
      this.start.addClosure(this.nfa.start);
      if(this.nfa.start === this.nfa.end) {
        this.start.setAsEndState();
      }
      this.states.push(this.start);

      this.generateDFA(this.start);
    },

    generateDFA: function (state) {
      var arcs, label, dfaState;

      array.forEach(state.getNFAStates(), function (nfaState) {
        array.forEach(nfaState, function (arc) {
          if(arc.label !== Terminals.EMPTY) {
            state.updateArcDFAState(arc.label, arc.arrow);
          }
        });
      });

      arcs = state.getArcs();

      for(label in arcs) {
        dfaState = arcs[label];
        if(dfaState.containsNFAState(this.nfa.end)) {
          dfaState.setAsEndState();
        }
        if(this.addState(dfaState)) {
          this.generateDFA(dfaState);
        }
      }
    },

    addState: function (dfaState) {
      var contains, newState;

      contains = array.filter(this.states, function (state) {
        return state.equals(dfaState);
      });

      newState = !contains.length;

      if(newState) {
        this.states.push(dfaState);
      }

      return newState;
    },

    calcFirstSet: function (dfaGrammar) {
      var visited, result, label;

      visited = {};
      result = {};

      if(this.firstSet === START_MARKER) {
        throw new Exceptions.LeftRecursion(this.dfa.type);
      }
      if (this.firstSet) {
        return this.firstSet;
      }
      this.firstSet = START_MARKER;

      for(label in this.start.arcs) {
        if(!(label in visited)) {
          visited[label] = true;
          if(label in dfaGrammar) {
            lang.mixin(result, dfaGrammar[label].calcFirstSet(dfaGrammar)); // NonTerminal
          } else if(label in Terminals){
            result[label] = true; // Terminal 
          }
        }
      }

      this.firstSet = result;
      return this.firstSet;
    },
  });
});
