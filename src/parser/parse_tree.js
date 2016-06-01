define([
  'dojo/_base/declare'
], function (declare) {
  return declare([], {
    constructor: function (opts) {
      lang.mixin(this, opts);
    },
    print: function () {
    }
  });
});
