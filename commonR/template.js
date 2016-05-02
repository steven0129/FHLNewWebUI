/// <reference path="../libs/jquery-1.11.3.js" />
/// <reference path="../libs/react/react-0.13.1.min.js" />
/// <reference path="../libs/react/react-with-addons-0.13.1.min.js" />
/*
<script src="../libs/jquery-1.11.3.js"></script>
<script src="../libs/react/react-0.13.1.min.js"></script>
<script src="../libs/react/react-with-addons-0.13.1.min.js"></script>
*/
// template
var commonR = commonR || {};
commonR.R = commonR.R || {
  template: React.createClass({
    getDefaultProps: function () { return {}; },
    getInitialState: function () { return {}; },
    componentWillMount: function(){},
    componentDidMount: function () { },
    componentWillReceiveProps: function (nextProp) { },
    componentWillUpdate: function (nextProp, nextState) { },
    componentDidUpdate: function (preProp, preState) { }, // 可於此呼叫 this.componentWillUnmount(); this.componentDidMount();
    componentWillUnmount: function(){},//通常在DidMount建的 DOM 在這裡要移除. timer 也是
    render: function () { return React.createElement("div", {}, "template"); }
  })
};