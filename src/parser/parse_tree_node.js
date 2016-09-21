define([
  'dojo/_base/declare',
  'dojo/_base/lang'
], function (declare, lang) {
  /**
    * @class prakalpa.parser.ParseTreeNode
    * @param {String} symbol - Type of NonTerminal or Terminal
    * @param {String} string - Value of terminal 
    * @param {Number} lineNum - Line number of terminal
    * @param {Number} columnOffset - Column offset of terminal
    */
  return declare([], /** @lends prakalpa.parser.ParseTreeNode.prototype */{
    constructor: function (opts) {
      lang.mixin(this, opts);
      /**
        * Children of this node 
        * @name prakalpa.parser.ParseTreeNode#children
        * @type {Array<prakalpa.parser.ParseTreeNode>}
        */
      this.children = [];
      /**
        * Value of terminal
        * @name prakalpa.parser.ParseTreeNode#string
        * @type {String}
        */
      /**
        * Type of NonTerminal or Terminal
        * @name prakalpa.parser.ParseTreeNode#symbol
        * @type {String}
        */
    },

    /**
      * Adds a child to this node
      * @param {prakalpa.parser.ParseTreeNode} child - The child you want to add
      */
    addChild: function (child) {
      this.children.push(child);
    },

    /**
      * Checks if the symbol for this node is the same as the given symbol
      * @param {String} symbol
      */
    is: function (symbol) {
      return (this.symbol === symbol);
    },
  });
});
