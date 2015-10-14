/* */ 
'use strict';
var ReactDefaultInjection = require("./ReactDefaultInjection");
var ReactServerRendering = require("./ReactServerRendering");
var ReactVersion = require("./ReactVersion");
ReactDefaultInjection.inject();
var ReactDOMServer = {
  renderToString: ReactServerRendering.renderToString,
  renderToStaticMarkup: ReactServerRendering.renderToStaticMarkup,
  version: ReactVersion
};
module.exports = ReactDOMServer;
