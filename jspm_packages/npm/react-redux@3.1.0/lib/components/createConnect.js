/* */ 
(function(process) {
  'use strict';
  exports.__esModule = true;
  var _extends = Object.assign || function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  exports['default'] = createConnect;
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
  var _utilsShallowEqual = require("../utils/shallowEqual");
  var _utilsShallowEqual2 = _interopRequireDefault(_utilsShallowEqual);
  var _utilsIsPlainObject = require("../utils/isPlainObject");
  var _utilsIsPlainObject2 = _interopRequireDefault(_utilsIsPlainObject);
  var _utilsWrapActionCreators = require("../utils/wrapActionCreators");
  var _utilsWrapActionCreators2 = _interopRequireDefault(_utilsWrapActionCreators);
  var _hoistNonReactStatics = require("hoist-non-react-statics");
  var _hoistNonReactStatics2 = _interopRequireDefault(_hoistNonReactStatics);
  var _invariant = require("invariant");
  var _invariant2 = _interopRequireDefault(_invariant);
  var defaultMapStateToProps = function defaultMapStateToProps() {
    return {};
  };
  var defaultMapDispatchToProps = function defaultMapDispatchToProps(dispatch) {
    return {dispatch: dispatch};
  };
  var defaultMergeProps = function defaultMergeProps(stateProps, dispatchProps, parentProps) {
    return _extends({}, parentProps, stateProps, dispatchProps);
  };
  function getDisplayName(Component) {
    return Component.displayName || Component.name || 'Component';
  }
  var nextVersion = 0;
  function createConnect(React) {
    var Component = React.Component;
    var PropTypes = React.PropTypes;
    var storeShape = _utilsCreateStoreShape2['default'](PropTypes);
    return function connect(mapStateToProps, mapDispatchToProps, mergeProps) {
      var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
      var shouldSubscribe = Boolean(mapStateToProps);
      var finalMapStateToProps = mapStateToProps || defaultMapStateToProps;
      var finalMapDispatchToProps = _utilsIsPlainObject2['default'](mapDispatchToProps) ? _utilsWrapActionCreators2['default'](mapDispatchToProps) : mapDispatchToProps || defaultMapDispatchToProps;
      var finalMergeProps = mergeProps || defaultMergeProps;
      var shouldUpdateStateProps = finalMapStateToProps.length > 1;
      var shouldUpdateDispatchProps = finalMapDispatchToProps.length > 1;
      var _options$pure = options.pure;
      var pure = _options$pure === undefined ? true : _options$pure;
      var version = nextVersion++;
      function computeStateProps(store, props) {
        var state = store.getState();
        var stateProps = shouldUpdateStateProps ? finalMapStateToProps(state, props) : finalMapStateToProps(state);
        _invariant2['default'](_utilsIsPlainObject2['default'](stateProps), '`mapStateToProps` must return an object. Instead received %s.', stateProps);
        return stateProps;
      }
      function computeDispatchProps(store, props) {
        var dispatch = store.dispatch;
        var dispatchProps = shouldUpdateDispatchProps ? finalMapDispatchToProps(dispatch, props) : finalMapDispatchToProps(dispatch);
        _invariant2['default'](_utilsIsPlainObject2['default'](dispatchProps), '`mapDispatchToProps` must return an object. Instead received %s.', dispatchProps);
        return dispatchProps;
      }
      function _computeNextState(stateProps, dispatchProps, parentProps) {
        var mergedProps = finalMergeProps(stateProps, dispatchProps, parentProps);
        _invariant2['default'](_utilsIsPlainObject2['default'](mergedProps), '`mergeProps` must return an object. Instead received %s.', mergedProps);
        return mergedProps;
      }
      return function wrapWithConnect(WrappedComponent) {
        var Connect = (function(_Component) {
          _inherits(Connect, _Component);
          Connect.prototype.shouldComponentUpdate = function shouldComponentUpdate(nextProps, nextState) {
            if (!pure) {
              this.updateStateProps(nextProps);
              this.updateDispatchProps(nextProps);
              this.updateState(nextProps);
              return true;
            }
            var storeChanged = nextState.storeState !== this.state.storeState;
            var propsChanged = !_utilsShallowEqual2['default'](nextProps, this.props);
            var mapStateProducedChange = false;
            var dispatchPropsChanged = false;
            if (storeChanged || propsChanged && shouldUpdateStateProps) {
              mapStateProducedChange = this.updateStateProps(nextProps);
            }
            if (propsChanged && shouldUpdateDispatchProps) {
              dispatchPropsChanged = this.updateDispatchProps(nextProps);
            }
            if (propsChanged || mapStateProducedChange || dispatchPropsChanged) {
              this.updateState(nextProps);
              return true;
            }
            return false;
          };
          function Connect(props, context) {
            _classCallCheck(this, Connect);
            _Component.call(this, props, context);
            this.version = version;
            this.store = props.store || context.store;
            _invariant2['default'](this.store, 'Could not find "store" in either the context or ' + ('props of "' + this.constructor.displayName + '". ') + 'Either wrap the root component in a <Provider>, ' + ('or explicitly pass "store" as a prop to "' + this.constructor.displayName + '".'));
            this.stateProps = computeStateProps(this.store, props);
            this.dispatchProps = computeDispatchProps(this.store, props);
            this.state = {storeState: null};
            this.updateState();
          }
          Connect.prototype.computeNextState = function computeNextState() {
            var props = arguments.length <= 0 || arguments[0] === undefined ? this.props : arguments[0];
            return _computeNextState(this.stateProps, this.dispatchProps, props);
          };
          Connect.prototype.updateStateProps = function updateStateProps() {
            var props = arguments.length <= 0 || arguments[0] === undefined ? this.props : arguments[0];
            var nextStateProps = computeStateProps(this.store, props);
            if (_utilsShallowEqual2['default'](nextStateProps, this.stateProps)) {
              return false;
            }
            this.stateProps = nextStateProps;
            return true;
          };
          Connect.prototype.updateDispatchProps = function updateDispatchProps() {
            var props = arguments.length <= 0 || arguments[0] === undefined ? this.props : arguments[0];
            var nextDispatchProps = computeDispatchProps(this.store, props);
            if (_utilsShallowEqual2['default'](nextDispatchProps, this.dispatchProps)) {
              return false;
            }
            this.dispatchProps = nextDispatchProps;
            return true;
          };
          Connect.prototype.updateState = function updateState() {
            var props = arguments.length <= 0 || arguments[0] === undefined ? this.props : arguments[0];
            this.nextState = this.computeNextState(props);
          };
          Connect.prototype.isSubscribed = function isSubscribed() {
            return typeof this.unsubscribe === 'function';
          };
          Connect.prototype.trySubscribe = function trySubscribe() {
            if (shouldSubscribe && !this.unsubscribe) {
              this.unsubscribe = this.store.subscribe(this.handleChange.bind(this));
              this.handleChange();
            }
          };
          Connect.prototype.tryUnsubscribe = function tryUnsubscribe() {
            if (this.unsubscribe) {
              this.unsubscribe();
              this.unsubscribe = null;
            }
          };
          Connect.prototype.componentDidMount = function componentDidMount() {
            this.trySubscribe();
          };
          Connect.prototype.componentWillUnmount = function componentWillUnmount() {
            this.tryUnsubscribe();
          };
          Connect.prototype.handleChange = function handleChange() {
            if (!this.unsubscribe) {
              return;
            }
            this.setState({storeState: this.store.getState()});
          };
          Connect.prototype.getWrappedInstance = function getWrappedInstance() {
            return this.refs.wrappedInstance;
          };
          Connect.prototype.render = function render() {
            return React.createElement(WrappedComponent, _extends({ref: 'wrappedInstance'}, this.nextState));
          };
          return Connect;
        })(Component);
        Connect.displayName = 'Connect(' + getDisplayName(WrappedComponent) + ')';
        Connect.WrappedComponent = WrappedComponent;
        Connect.contextTypes = {store: storeShape};
        Connect.propTypes = {store: storeShape};
        if (process.env.NODE_ENV !== 'production') {
          Connect.prototype.componentWillUpdate = function componentWillUpdate() {
            if (this.version === version) {
              return;
            }
            this.version = version;
            this.trySubscribe();
            this.updateStateProps();
            this.updateDispatchProps();
            this.updateState();
          };
        }
        return _hoistNonReactStatics2['default'](Connect, WrappedComponent);
      };
    };
  }
  module.exports = exports['default'];
})(require("process"));
