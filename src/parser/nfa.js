define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'prakalpa/constants/tokens'
], function (declare, lang, Terminals) {
  /**
    * Represents an NFA (Non-Deterministic Finite Automaton)
    * @class prakalpa.parser.NFA
    * @param {Object} opts
    * @param {String} opts.name - Name of the NFA
    */
  return declare([], /** @lends prakalpa.parser.NFA.prototype */{
    constructor: function (opts) {
      lang.mixin(this, opts);
      this._states = [];
      /**
        * Start state of NFA
        * @name prakalpa.parser.NFA#start
        * @type {Array}
        */
      this.start = null;
      /**
        * End state of NFA
        * @name prakalpa.parser.NFA#end
        * @type {Array}
        */
      this.end = null;
    },

    /**
      * Set start state of NFA
      * @param {Array} start - start state of NFA
      */
    setStart: function (start) {
      this.start = start;
    },

    /**
      * Set end state of NFA
      * @param {Array} end - end state of NFA
      */
    setEnd: function (end) {
      this.end = end;
    },

    /**
      * Add a new state to the NFA
      * @returns {Array} Newly added state
      */
    addNewState: function () {
      this._states.push([]);
      return this._states[this._states.length - 1];
    },

    /**
      * Adds an arc to state1 with an empty label and an arrow pointing to state2
      * @param {Array} state1 - State that you want to add an arc to
      * @param {Array} state2 - State that the arc points to
      */
    addEmptyArc: function (state1, state2) {
      state1.push({
        label: Terminals.EMPTY,
        arrow: state2
      });
    },

    /**
      * Adds an arc to state1 with the given label and an arrow pointing to state2
      * @param {Array} state1 - State that you want to add an arc to
      * @param {Array} state2 - State that the arc points to
      * @param {String} label - Label on the arc
      */
    addArc: function (state1, state2, label) {
      state1.push({
        label: label,
        arrow: state2
      });
    }
  });
});
