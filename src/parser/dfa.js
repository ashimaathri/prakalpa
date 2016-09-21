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
    * @param [Array<prakalpa.parser.DFAState>] opts.states - The DFA states of this DFA. This only needs to be supplied at parser generation time. Every other time, it is constructed programmatically.
    * @param [Object.<String, Boolean>] opts.firstSet - A dict (used for fast membership checks) with all the labels of the firstSet as keys. The value doesn't matter. Only needs to be supplied at parser generation time. 
    */
  return declare([], /** @lends prakalpa.parser.DFA.prototype */{
    constructor: function (opts) {
      lang.mixin(this, opts);

      /**
        * States of the DFA. The first state at index 0 is always the start state.
        * @name prakalpa.parser.DFA#states
        * @type {Array<prakalpa.parser.DFAState>}
        */
      this.states = [];
      this._firstSet = null;

      if(opts.states && opts.firstSet) {
        this.states = opts.states;
        array.forEach(this.states, function(state) {
          state.fixReferences(this.states);
        }.bind(this));
        this._firstSet = opts.firstSet;
      } else {
        this._start = new DFAState();
        this._start.addClosure(this.nfa.start);
        if(this.nfa.start === this.nfa.end) {
          this._start.setAsEndState();
        }
        this.states.push(this._start);

        this._generateDFA(this._start);
      }
    },

    /**
      * Generates DFAs recursively, starting at the start state that has already been constructed in the constructor, and visiting the nfa nodes reachable from all the states in the start state
      * Based on 3.7.1 Conversion of an NFA to a DFA from the [Dragon Book 2nd Edition](http://www.informatik.uni-bremen.de/agbkb/lehre/ccfl/Material/ALSUdragonbook.pdf)
      * @private
      * @param {prakalpa.parser.DFAState} state - DFA state to start discovery from
      */
    _generateDFA: function (state) {
      var label, dfaState;

      array.forEach(state.nfaStates, function (nfaState) {
        array.forEach(nfaState, function (arc) {
          if(arc.label !== Terminals.EMPTY) {
            state.updateArcDFAState(arc.label, arc.arrow);
          }
        });
      });

      for(label in state.arcs) {
        dfaState = state.arcs[label];
        if(dfaState.containsNFAState(this.nfa.end )) {
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
      * Calculates the firstSet of this DFA. From the Dragon Book:
      * > We define `FIRST (a)` to be the set of terminals that appear as the first symbols of one or more strings of terminals generated from `a`
      * @param {Object.<String, prakalpa.parser.DFA>} dfaGrammar - A map containing all the DFAs for this grammar
      * @return {Object.<String, Boolean>} firstSet - A dict (used for fast membership checks) with all the labels of the firstSet as keys. The value doesn't matter. 
      * @throws {prakalpa.Exceptions.LeftRecursion} If the grammar is left recursive.
      */
    calcFirstSet: function (dfaGrammar) {
      var visited, result, label;

      visited = {};
      result = {};

      if(this._firstSet === START_MARKER) {
        throw new Exceptions.LeftRecursion(this.type);
      }
      if (this._firstSet) {
        return this._firstSet;
      }
      this._firstSet = START_MARKER;

      for(label in this._start.arcs) {
        if(!(label in visited)) {
          visited[label] = true;
          if(label in dfaGrammar) {
            lang.mixin(result, dfaGrammar[label].calcFirstSet(dfaGrammar)); // NonTerminal
          } else if(label in Terminals){
            result[label] = true; // Terminal 
          }
        }
      }

      this._firstSet = result;
      return this._firstSet;
    },

    /**
      * Constructs the transition table for each state in this DFA
      * @param {Object.<String, prakalpa.parser.DFA>} dfaGrammar - A map containing all the DFAs for this grammar
      */
    constructFollowSet: function (dfaGrammar) {
      array.forEach(this.states, function (state) {
        state.constructFollowSet(dfaGrammar);
      });
    }
  });
});
