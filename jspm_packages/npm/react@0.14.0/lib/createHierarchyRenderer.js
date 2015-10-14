/* */ 
'use strict';
var React = require("./React");
function createHierarchyRenderer() {
  for (var _len = arguments.length,
      renderMethods = Array(_len),
      _key = 0; _key < _len; _key++) {
    renderMethods[_key] = arguments[_key];
  }
  var instances;
  var Components = renderMethods.reduceRight(function(ComponentsAccumulator, renderMethod, depth) {
    var Component = React.createClass({
      displayName: renderMethod.name,
      render: function() {
        instances[depth].push(this);
        return renderMethod.apply(this, ComponentsAccumulator);
      }
    });
    return [Component].concat(ComponentsAccumulator);
  }, []);
  function renderHierarchy(renderComponent) {
    instances = renderMethods.map(function() {
      return [];
    });
    renderComponent.apply(null, Components);
    return instances;
  }
  return renderHierarchy;
}
module.exports = createHierarchyRenderer;
