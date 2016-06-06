define([
  'dojo/_base/declare'
], function (declare) {
  return declare([Array], {
    /**
     * dfa: dfa for a non terminal
     * currentParseTreeNode: node that is going to be parent of the next child
     * currentState: active state in dfa
     */
    peek: function (propertyName) {
      var topEntry;

      topEntry = this[this.length - 1];

      if(propertyName) {
        return topEntry[propertyName];
      } else {
        return topEntry;
      }
    },

    isEmpty: function () {
      return !this.length;
    },

    updateTop: function (propertyName, newValue) {
      var topEntry;

      topEntry = this.peek();
      topEntry[propertyName] = newValue;
    }
  });
});
