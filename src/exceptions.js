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
    ParseError: function (opts) { lang.mixin(this, opts); },
    /**
      * @class prakalpa.Exceptions.AssertionError
      * @params {Object} opts
      */
    AssertionError: function (opts) { lang.mixin(this, opts); },
    /**
      * A NAME label should either be a Terminal or a NonTerminal
      * @class prakalpa.Exceptions.InvalidNameLabel
      * @params {Object} opts
      * @params {String} opts.type - Type of label
      * @params {String} opts.string - String value of label
      */
    InvalidNameLabel: function (opts) { lang.mixin(this, opts); },
    /**
      * @class prakalpa.Exceptions.InvalidOneCharLabel
      * @params {Object} opts
      * @params {String} opts.type - Type of label
      * @params {String} opts.string - String value of label
      */
    InvalidOneCharLabel: function (opts) { lang.mixin(this, opts); },
    /**
      * @class prakalpa.Exceptions.InvalidTwoCharLabel
      * @params {Object} opts
      * @params {String} opts.type - Type of label
      * @params {String} opts.string - String value of label
      */
    InvalidTwoCharLabel: function (opts) { lang.mixin(this, opts); },
    /**
      * @class prakalpa.Exceptions.InvalidThreeCharLabel
      * @params {Object} opts
      * @params {String} opts.type - Type of label
      * @params {String} opts.string - String value of label
      */
    InvalidThreeCharLabel: function (opts) { lang.mixin(this, opts); }
  };
});
