define([
  'dojo/_base/declare'
], function (declare) {
  /**
    * @class prakalpa.parser.Stack
    * @extends Array
    */
  return declare([Array], /** @lends prakalpa.parser.Stack.prototype */{
    /**
      * Get the value of the propertyName at the top of the stack if present, else return the top of the stack
      * @param [String] propertyName
      * @returns {Object} Value of property or object at the top of the stack
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

    /**
      * Checks if stack is empty
      * @returns {Boolean}
      */
    isEmpty: function () {
      return !this.length;
    },

    /**
      * Updates the the value of the property at the top of the stack
      * @param {String} propertyName - Name of property you want to update
      * @param {Object} newValue - New value of the property
      */
    updateTop: function (propertyName, newValue) {
      var topEntry;

      topEntry = this.peek();
      topEntry[propertyName] = newValue;
    }
  });
});
