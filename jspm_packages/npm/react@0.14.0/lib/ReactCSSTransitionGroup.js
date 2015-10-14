/* */ 
'use strict';
var React = require("./React");
var assign = require("./Object.assign");
var ReactTransitionGroup = require("./ReactTransitionGroup");
var ReactCSSTransitionGroupChild = require("./ReactCSSTransitionGroupChild");
function createTransitionTimeoutPropValidator(transitionType) {
  var timeoutPropName = 'transition' + transitionType + 'Timeout';
  var enabledPropName = 'transition' + transitionType;
  return function(props) {
    if (props[enabledPropName]) {
      if (!props[timeoutPropName]) {
        return new Error(timeoutPropName + ' wasn\'t supplied to ReactCSSTransitionGroup: ' + 'this can cause unreliable animations and won\'t be supported in ' + 'a future version of React. See ' + 'https://fb.me/react-animation-transition-group-timeout for more ' + 'information.');
      } else if (typeof props[timeoutPropName] !== 'number') {
        return new Error(timeoutPropName + ' must be a number (in milliseconds)');
      }
    }
  };
}
var ReactCSSTransitionGroup = React.createClass({
  displayName: 'ReactCSSTransitionGroup',
  propTypes: {
    transitionName: ReactCSSTransitionGroupChild.propTypes.name,
    transitionAppear: React.PropTypes.bool,
    transitionEnter: React.PropTypes.bool,
    transitionLeave: React.PropTypes.bool,
    transitionAppearTimeout: createTransitionTimeoutPropValidator('Appear'),
    transitionEnterTimeout: createTransitionTimeoutPropValidator('Enter'),
    transitionLeaveTimeout: createTransitionTimeoutPropValidator('Leave')
  },
  getDefaultProps: function() {
    return {
      transitionAppear: false,
      transitionEnter: true,
      transitionLeave: true
    };
  },
  _wrapChild: function(child) {
    return React.createElement(ReactCSSTransitionGroupChild, {
      name: this.props.transitionName,
      appear: this.props.transitionAppear,
      enter: this.props.transitionEnter,
      leave: this.props.transitionLeave,
      appearTimeout: this.props.transitionAppearTimeout,
      enterTimeout: this.props.transitionEnterTimeout,
      leaveTimeout: this.props.transitionLeaveTimeout
    }, child);
  },
  render: function() {
    return React.createElement(ReactTransitionGroup, assign({}, this.props, {childFactory: this._wrapChild}));
  }
});
module.exports = ReactCSSTransitionGroup;
