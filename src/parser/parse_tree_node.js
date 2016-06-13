define([
  'dojo/_base/declare',
  'dojo/_base/lang'
], function (declare, lang) {
  return declare([], {
    /**
     * symbol: nonTerminal or terminal type
     * string: value of terminal 
     * lineNum: line number of terminal
     * columnOffset: column offset of terminal
     */
    constructor: function (opts) {
      lang.mixin(this, opts);
      this.children = [];
    },
    addChild: function (child) {
      this.children.push(child);
    }
  });
});
