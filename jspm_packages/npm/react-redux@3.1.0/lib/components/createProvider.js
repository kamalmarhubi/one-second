/* */ 
'use strict';
exports.__esModule = true;
exports['default'] = createProvider;
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {'default': obj};
}
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}
function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }});
  if (superClass)
    Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
var _utilsCreateStoreShape = require("../utils/createStoreShape");
var _utilsCreateStoreShape2 = _interopRequireDefault(_utilsCreateStoreShape);
function isUsingOwnerContext(React) {
  var version = React.version;
  if (typeof version !== 'string') {
    return true;
  }
  var sections = version.split('.');
  var major = parseInt(sections[0], 10);
  var minor = parseInt(sections[1], 10);
  return major === 0 && minor === 13;
}
function createProvider(React) {
  var Component = React.Component;
  var PropTypes = React.PropTypes;
  var Children = React.Children;
  var storeShape = _utilsCreateStoreShape2['default'](PropTypes);
  var requireFunctionChild = isUsingOwnerContext(React);
  var didWarnAboutChild = false;
  function warnAboutFunctionChild() {
    if (didWarnAboutChild || requireFunctionChild) {
      return;
    }
    didWarnAboutChild = true;
    console.error('With React 0.14 and later versions, you no longer need to ' + 'wrap <Provider> child into a function.');
  }
  function warnAboutElementChild() {
    if (didWarnAboutChild || !requireFunctionChild) {
      return;
    }
    didWarnAboutChild = true;
    console.error('With React 0.13, you need to ' + 'wrap <Provider> child into a function. ' + 'This restriction will be removed with React 0.14.');
  }
  var didWarnAboutReceivingStore = false;
  function warnAboutReceivingStore() {
    if (didWarnAboutReceivingStore) {
      return;
    }
    didWarnAboutReceivingStore = true;
    console.error('<Provider> does not support changing `store` on the fly. ' + 'It is most likely that you see this error because you updated to ' + 'Redux 2.x and React Redux 2.x which no longer hot reload reducers ' + 'automatically. See https://github.com/rackt/react-redux/releases/' + 'tag/v2.0.0 for the migration instructions.');
  }
  var Provider = (function(_Component) {
    _inherits(Provider, _Component);
    Provider.prototype.getChildContext = function getChildContext() {
      return {store: this.store};
    };
    function Provider(props, context) {
      _classCallCheck(this, Provider);
      _Component.call(this, props, context);
      this.store = props.store;
    }
    Provider.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
      var store = this.store;
      var nextStore = nextProps.store;
      if (store !== nextStore) {
        warnAboutReceivingStore();
      }
    };
    Provider.prototype.render = function render() {
      var children = this.props.children;
      if (typeof children === 'function') {
        warnAboutFunctionChild();
        children = children();
      } else {
        warnAboutElementChild();
      }
      return Children.only(children);
    };
    return Provider;
  })(Component);
  Provider.childContextTypes = {store: storeShape.isRequired};
  Provider.propTypes = {
    store: storeShape.isRequired,
    children: (requireFunctionChild ? PropTypes.func : PropTypes.element).isRequired
  };
  return Provider;
}
module.exports = exports['default'];
