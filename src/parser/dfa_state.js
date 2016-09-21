define([
  'dojo/_base/declare',
  'dojo/_base/array',
  'prakalpa/constants/tokens',
  'prakalpa/constants/non_terminals'
], function (declare, array, Terminals, NonTerminals) {
  var DFAState;

  /**
    * Represents a DFA State
    * @class prakalpa.parser.DFAState
    * @param [Object] opts
    * @param {Array} opts.arcs - Arcs of this DFA State. This is constructed programmatically in all cases except during parser generation where we use the hard-coded metagrammar arcs.
    * @param {Boolean} opts.isAccepting - Denotes if this state is a final/accepting state. This is usually set using the method `setEndState` but should be provided to the constructor during parser generation.
    */
  DFAState = declare([], /** @lends prakalpa.parser.DFAState.prototype */{
    constructor: function (opts) {
      /**
        * Array of NFA States
        * @name prakalpa.parser.DFAState#nfaStates
        * @type {Array<Object>}
        */
      this.nfaStates = [];
      /**
        * Map that has labels(can be Terminals or NonTerminals) as keys and DFA States as values.
        * @name prakalpa.parser.DFAState#arcs
        * @type {Object.<String, prakalpa.parser.DFAState>}
        */
      this.arcs = (opts && opts.arcs) || {};
      /**
        * Map that has Terminal labels as keys and DFA States as values. 
        * @name prakalpa.parser.DFAState#followSet
        * @type {Object.<String, prakalpa.parser.DFAState>}
        */
      this.followSet = [];
      /**
        * Indicates if this DFA state is an accepting state or not
        * @name prakalpa.parser.DFAState#isAccepting
        * @type {Boolean}
        */
      this.isAccepting = (opts && opts.isAccepting) || false;
    },

    /**
      * Checks if nfaState is absent from list
      * @private
      * @param {Object} nfaState
      * @returns {Boolean}
      */
    _nfaStateAbsent: function (nfaState) {
      return (this.nfaStates.indexOf(nfaState) === -1);
    },

    /**
      * Checks if nfaState is present in the list
      * @param {Object} nfaState
      * @returns {Boolean}
      */
    containsNFAState: function (nfaState) {
      return (this.nfaStates.indexOf(nfaState) !== -1);
    },

    /**
      * Adds nfaState to the list
      * @param {Object} nfaState
      */
		addNFAState: function (nfaState) {
      this.nfaStates.push(nfaState);
    },

    /**
      * Points numbered arrows in the metagrammar into corresponding DFAStates instead
      * @param {Array<prakalpa.parser.DFAState>} dfaStates - All states of the DFA this state belongs to
      */
    fixReferences: function (dfaStates) {
      array.forEach(this.arcs, function (arc) {
        arc.arrow = dfaStates[arc.arrow];
      });
    },

    /**
      * Mark this DFA state as an end/final/accepting state
      */
    setAsEndState: function () {
      this.isAccepting = true;
    },

    /**
      * Add the epsilon closure of the given NFA State to this DFA State
      * @param {Array} nfaState - An array of arcs
      */
    addClosure: function (nfaState) {
      if(this._nfaStateAbsent(nfaState)) {
				this.addNFAState(nfaState);
        array.forEach(nfaState, function (arc) {
          if(arc.label === Terminals.EMPTY) {
            this.addClosure(arc.arrow);
          }
        }.bind(this));
      }
    },

    /**
      * Update the DFA State pointed to by the label in the transition table with the epsilon closure of the given NFA State
      * @param {String} label - The label on the arc
      * @param {Array} nfaState - Array of arcs in the nfaState
      * @returns {prakalpa.parser.DFAState} dfaState - DFA State that the label in the transition table points to
      */
    updateArcDFAState: function (label, nfaState) {
      if(!(label in this.arcs)) {
        this.arcs[label] = new DFAState();
      }
      this.arcs[label].addClosure(nfaState);
    },

    /**
      * Checks if the other DFA State is equal to this one
      * @param {prakalpa.parser.DFAState} other - The DFA State to compare this one against
      * @returns {Boolean} `true` if equal, else `false`
      */
    equals: function (other) {
      var i;

      if(this.nfaStates.length !== other.nfaStates.length) {
        return false;
      }
  
			for(i = 0; i < this.nfaStates.length; i++) {
				if(this.nfaStates[i] !== other.nfaStates[i]) {
					return false;
        }
      }

      return true;
    },

    constructFollowSet: function (dfaGrammar) {
      array.forEach(this.arcs, function (arc) {
        var firstSet;

        if(arc.label in NonTerminals) {
          firstSet = dfaGrammar[arc.label].calcFirstSet(dfaGrammar);
          array.forEach(firstSet, function (label) {
            this.followSet[label] = {
              arrow: arc.arrow,
              nonTerminal: arc.label,
            };
          }.bind(this));
        } else {
          this.followSet[arc.label] = {
            arrow: arc.arrow,
            nonTerminal: null
          };
        }
      }.bind(this));
    }
  });

  return DFAState;
});
