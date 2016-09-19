define(['dojo/_base/lang'], function (lang) {
  return /** @class prakalpa.Exceptions*/{
    /**
      * @memberof prakalpa.Exceptions
      * @method LeftRecursion
      */
    LeftRecursion: function (message) { this.message = message; },
    /**
      * @memberof prakalpa.Exceptions
      * @method TokenizeError
      */
    TokenizeError: function (opts) { lang.mixin(this, opts); },
    /**
      * @memberof prakalpa.Exceptions
      * @method SyntaxError
      */
    SyntaxError: function (opts) { lang.mixin(this, opts); }
  };
});
