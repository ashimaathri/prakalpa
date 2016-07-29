define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/array',
  'prakalpa/parser/dfa_state',
  'prakalpa/tokens'
], function (declare, lang, array, DFAState, Terminals) {
  return declare([], {
    constructor: function (opts) {
      var stateIndex, state, arc, arcIndex;

      lang.mixin(this, opts);

      this.states = [];

      start = new DFAState();
      start.addClosure(this.nfa.start);
      if(this.nfa.start === this.nfa.end) {
        start.setAsEndState()
      }
      this.states.push(start);

      this.generateDFA(start);
    },

    generateDFA: function (state) {
      var arcs, label;

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
    }
  });
});
