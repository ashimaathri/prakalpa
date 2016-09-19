define([
  'dojo/_base/declare',
  'dojo/_base/lang',
], function (declare, lang) {
  /**
    * Represents a token
    * @class prakalpa.token
    * @property {prakalpa.constants.tokens} type - Type of token
    * @property {Object} start - The position at which the token starts
    * @property {number} start.column - The column number in a line at which the token starts
    * @property {number} start.lineNum - The line number in the source at which the token starts
    * @property {Object} end - The position just before which the token ends
    * @property {number} end.column - The column number in a line before which the token ends 
    * @property {number} end.lineNum - The line number in the source before which the token ends
    * @property {string} string - String value of token
    */
  return declare([], {
    constructor: function (opts) {
      lang.mixin(this, opts);
    }
  });
});
