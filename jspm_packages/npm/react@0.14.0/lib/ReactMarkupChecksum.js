/* */ 
'use strict';
var adler32 = require("./adler32");
var TAG_END = /\/?>/;
var ReactMarkupChecksum = {
  CHECKSUM_ATTR_NAME: 'data-react-checksum',
  addChecksumToMarkup: function(markup) {
    var checksum = adler32(markup);
    return markup.replace(TAG_END, ' ' + ReactMarkupChecksum.CHECKSUM_ATTR_NAME + '="' + checksum + '"$&');
  },
  canReuseMarkup: function(markup, element) {
    var existingChecksum = element.getAttribute(ReactMarkupChecksum.CHECKSUM_ATTR_NAME);
    existingChecksum = existingChecksum && parseInt(existingChecksum, 10);
    var markupChecksum = adler32(markup);
    return markupChecksum === existingChecksum;
  }
};
module.exports = ReactMarkupChecksum;
