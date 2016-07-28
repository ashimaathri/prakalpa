define([
  'dojo/_base/declare',
  'dojo/_base/array',
  'prakalpa/tokens'
], function (declare, array, Terminals) {
  var DFAState;

  DFAState = declare([], {
    constructor: function () {
      this.nfaStates = [];
      this.arcs = {};
    },

    addNFAState: function (nfaState) {
      this.nfaStates.push(nfaState);
    },

    nfaStateAbsent: function (nfaState) {
      return (this.nfaStates.indexOf(nfaState) === -1);
    },

    containsNFAState: function (nfaState) {
      return (this.nfaStates.indexOf(nfaState) !== -1);
    },

    setAsEndState: function () {
      this.finish = true;
    },

    getNFAStates: function () {
      return this.nfaStates;
    },

    getArcs: function () {
      return this.arcs;
    },

    addClosure: function (nfaState) {
      if(this.nfaStateAbsent(nfaState)) {
        this.addNFAState(nfaState);
        array.forEach(nfaState, function (arc) {
          if(arc.label === Terminals.EMPTY) {
            this.addClosure(arc.arrow);
          }
        }.bind(this));
      }
    },

    updateArcDFAState: function (label, nfaState) {
      var dfaState;

      if(!(label in this.arcs)) {
        this.arcs[label] = new DFAState();
      }
      this.arcs[label].addClosure(nfaState);
    },

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
    }
  });

  return DFAState;
});
