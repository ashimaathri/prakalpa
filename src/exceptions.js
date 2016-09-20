define(['dojo/_base/lang'], function (lang) {
  return /** @class prakalpa.Exceptions*/{
    /**
      * @class prakalpa.Exceptions.LeftRecursion
      * @params {String} message - Error message
      */
    LeftRecursion: function (message) { this.message = message; },
    /**
      * @class prakalpa.Exceptions.TokenizeError
      * @params {Object} opts
      */
    TokenizeError: function (opts) { lang.mixin(this, opts); },
    /**
      * @class prakalpa.Exceptions.SyntaxError
      * @params {Object} opts
      */
    SyntaxError: function (opts) { lang.mixin(this, opts); }
  };
});
