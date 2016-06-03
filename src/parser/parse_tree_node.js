define([
  'dojo/_base/declare',
  'dojo/_base/lang'
], function (declare, lang) {
  return declare([], {
    constructor: function (opts) {
      lang.mixin(this, opts);
      this.children = [];
    },
    addChild: function (child) {
      this.children.push(child);
    }
  });
});
