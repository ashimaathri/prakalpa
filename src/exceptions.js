define(['dojo/_base/lang'], function (lang) {
  return {
    LeftRecursion: function (message) { this.message = message; },
    TokenizeError: function (opts) { lang.mixin(this, opts); }
  };
});
