/* */ 
'use strict';
var ReactDOM = require("./ReactDOM");
var ReactDOMServer = require("./ReactDOMServer");
var ReactIsomorphic = require("./ReactIsomorphic");
var assign = require("./Object.assign");
var deprecated = require("./deprecated");
var React = {};
assign(React, ReactIsomorphic);
assign(React, {
  findDOMNode: deprecated('findDOMNode', 'ReactDOM', 'react-dom', ReactDOM, ReactDOM.findDOMNode),
  render: deprecated('render', 'ReactDOM', 'react-dom', ReactDOM, ReactDOM.render),
  unmountComponentAtNode: deprecated('unmountComponentAtNode', 'ReactDOM', 'react-dom', ReactDOM, ReactDOM.unmountComponentAtNode),
  renderToString: deprecated('renderToString', 'ReactDOMServer', 'react-dom/server', ReactDOMServer, ReactDOMServer.renderToString),
  renderToStaticMarkup: deprecated('renderToStaticMarkup', 'ReactDOMServer', 'react-dom/server', ReactDOMServer, ReactDOMServer.renderToStaticMarkup)
});
React.__SECRET_DOM_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ReactDOM;
module.exports = React;
