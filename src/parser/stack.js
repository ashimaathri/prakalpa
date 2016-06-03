define([
  'dojo/_base/declare'
], function (declare) {
  return declare([Array], {
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
