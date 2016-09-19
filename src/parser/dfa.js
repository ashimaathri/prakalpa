define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/array',
  'prakalpa/parser/dfa_state',
  'prakalpa/constants/tokens',
  'prakalpa/exceptions'
], function (declare, lang, array, DFAState, Terminals, Exceptions) {
  var START_MARKER;

  /**
    * Represents a DFA (deterministic finite automaton)
    * @class prakalpa.parser.DFA
    * @param {Object} opts
    * @param {String} opts.type - NonTerminal constant that represents this DFA 
    * @param {prakalpa.parser.NFA} opts.nfa - The NFA from which the DFA must be constructed
    */
  return declare([], /** @lends prakalpa.parser.DFA.prototype */{
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

      this._generateDFA(this.start);
    },

    /**
      * Generates DFAs recursively, starting at the start state that has already been constructed in the constructor, and visiting the nfa nodes reachable from all the states in the start state
      * @private
      * @param {prakalpa.parser.DFAState} state - DFA state to start discovery from
      */
    _generateDFA: function (state) {
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
        if(this._addState(dfaState)) {
          this._generateDFA(dfaState);
        }
      }
    },

    /**
      * Adds a DFA state to the list only if not already present.
      * @private
      * @param {prakalpa.parser.DFAState} dfaState - DFA state to add to list
      * @returns {Boolean} newState? - True if new state, false if state is already in the list
      */
    _addState: function (dfaState) {
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

    /**
      * Calculates the firstSet of this DFA
      * @param {Object.<String, prakalpa.parser.DFA>} dfaGrammar - A map containing all the DFAs for this grammar
      * @return {Object.<String, Boolean>} firstSet - A dict (used for fast membership checks) with all the labels of the firstSet as keys. The value doesn't matter. 
      */
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
