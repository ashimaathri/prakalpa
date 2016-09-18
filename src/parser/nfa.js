define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'prakalpa/constants/tokens'
], function (declare, lang, Terminals) {
  return declare([], {
    constructor: function (opts) {
      lang.mixin(this, opts);
      this.states = [];
    },

    addNewState: function () {
      this.states.push([]);
      return this.states[this.states.length - 1];
    },

    addEmptyArc: function (state1, state2) {
      state1.push({
        label: Terminals.EMPTY,
        arrow: state2
      });
    },

    addArc: function (state1, state2, label) {
      state1.push({
        label: label,
        arrow: state2
      });
    }
  });
});
