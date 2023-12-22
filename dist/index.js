'use strict';

var hooks = require('@bpmn-io/properties-panel/preact/hooks');
var minDash = require('min-dash');
var propertiesPanel = require('@bpmn-io/properties-panel');
var preact = require('@bpmn-io/properties-panel/preact');
var LabelUtil = require('bpmn-js/lib/features/label-editing/LabelUtil');
var ModelUtil = require('bpmn-js/lib/util/ModelUtil');
var DiUtil = require('bpmn-js/lib/util/DiUtil');
var React = require('@bpmn-io/properties-panel/preact/compat');
var jsxRuntime = require('@bpmn-io/properties-panel/preact/jsx-runtime');
var KeyboardUtil = require('diagram-js/lib/features/keyboard/KeyboardUtil');
var minDom = require('min-dom');
var ModelingUtil = require('bpmn-js/lib/features/modeling/util/ModelingUtil');
var Ids = require('ids');
var Collections = require('diagram-js/lib/util/Collections');
var zeebe = require('@bpmn-io/extract-process-variables/zeebe');
var arrayMove = require('array-move');
var extractProcessVariables = require('@bpmn-io/extract-process-variables');

const BpmnPropertiesPanelContext = preact.createContext({
  selectedElement: null,
  injector: null,
  getService() {
    return null;
  }
});

function useService(type, strict) {
  const {
    getService
  } = hooks.useContext(BpmnPropertiesPanelContext);
  return getService(type, strict);
}

function _extends$1o() { _extends$1o = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$1o.apply(this, arguments); }
var AssociationIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$1o({
  width: "32",
  height: "32",
  xmlns: "http://www.w3.org/2000/svg"
}, props), /*#__PURE__*/React.createElement("path", {
  stroke: "#000",
  strokeWidth: "2",
  fill: "none",
  strokeDasharray: "3.3,6",
  strokeLinecap: "square",
  d: "M1.5 30.5l29-29"
})));

function _extends$1n() { _extends$1n = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$1n.apply(this, arguments); }
var BusinessRuleTaskIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$1n({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M6.494 3C2.916 3 0 5.903 0 9.475v13.383c0 3.572 2.916 6.475 6.494 6.475h19.012c3.578 0 6.494-2.903 6.494-6.475V9.475C32 5.903 29.084 3 25.506 3H6.494zm0 2h19.012C28.015 5 30 6.98 30 9.475v13.383c0 2.495-1.985 4.475-4.494 4.475H6.494C3.985 27.333 2 25.353 2 22.858V9.475C2 6.98 3.985 5 6.494 5zM5.296 7.398v12.665h16.87V7.398H5.296zm.718 4.386h15.433v3.44H9.985v-3.432h-.719v3.431H6.014v-3.44zm0 4.158h3.252v3.403H6.014v-3.403zm3.97 0h11.463v3.403H9.985v-3.403z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M6.079 8.209v3.587H21.44V8.209z"
})));

function _extends$1m() { _extends$1m = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$1m.apply(this, arguments); }
var CallActivityIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$1m({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M24.978 3c3.761 0 6.89 2.979 7.018 6.695l.004.238V22.4c0 3.747-3.05 6.804-6.783 6.93l-.24.003H7.023c-3.761 0-6.89-2.978-7.018-6.695L0 22.4V9.933C0 6.187 3.05 3.13 6.783 3.004L7.023 3h17.955zm0 3.667H7.022c-1.842 0-3.255 1.344-3.35 3.079l-.005.187V22.4c0 1.761 1.35 3.167 3.16 3.262l.195.005L10 25.666V15h12v10.666h2.978c1.842 0 3.255-1.344 3.35-3.079l.005-.187V9.933c0-1.761-1.35-3.166-3.16-3.261l-.195-.005zm-3.732 9.087H10.754v9.912h10.491v-9.912zm-4.475 1.817v2.658h2.658v1.542H16.77v2.658H15.23V21.77H12.57V20.23h2.658V17.57h1.542z"
})));

function _extends$1l() { _extends$1l = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$1l.apply(this, arguments); }
var CollaborationIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$1l({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("g", {
  fillRule: "evenodd"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "nonzero",
  d: "M0 0v8.62h32V0H0zm1.655 7.054v-5.37h28.62v5.37H1.656zM0 23.38V32h32v-8.62H0zm1.655 7.054v-5.37h28.62v5.37H1.656z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M24 8l4 7h-8l4-7zm0 2l-2.28 4h4.56L24 10zM23.5 21h1v3h-1zM23.5 15h1v3h-1zM8 24l-4-7h8l-4 7zm0-2l2.28-4H5.72L8 22zM7.5 8h1v3h-1zM7.5 14h1v3h-1z"
}))));

function _extends$1k() { _extends$1k = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$1k.apply(this, arguments); }
var ConditionalFlowIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$1k({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M32 .041S20.42 5.95 14.537 8.713c1.26 1.15 2.432 2.392 3.648 3.588-5.703 5.78-3.15 3.303-8.087 8.316l-8.472 1.377L0 32l10.006-1.626.098-.598 1.279-7.873c4.975-5.052 2.403-2.555 8.118-8.346 1.218 1.214 2.43 2.435 3.648 3.648C26.29 11.018 32 .041 32 .041zM9.603 22.397L8.54 28.91 2.03 29.97l1.061-6.515 6.512-1.058z"
})));

function _extends$1j() { _extends$1j = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$1j.apply(this, arguments); }
var ConnectionIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$1j({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M32 .06S20.33 6.014 14.403 8.798c1.27 1.16 2.451 2.41 3.676 3.616L0 30.734 1.325 32l18.08-18.32c1.227 1.223 2.448 2.453 3.676 3.676C26.247 11.12 32 .06 32 .06z"
})));

function _extends$1i() { _extends$1i = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$1i.apply(this, arguments); }
var DataInputOutputAssociationIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$1i({
  width: "32",
  height: "32",
  xmlns: "http://www.w3.org/2000/svg"
}, props), /*#__PURE__*/React.createElement("path", {
  stroke: "#000",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeDasharray: "1.1,4.3",
  d: "M1.5 30.5L27 5"
}), /*#__PURE__*/React.createElement("path", {
  d: "M31.803.197L26.5 16.107l-1.52-1.52 3.783-11.35-11.35 3.783-1.52-1.52z"
})));

function _extends$1h() { _extends$1h = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$1h.apply(this, arguments); }
var DataInputIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$1h({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M20.833 0H3.488v32H28V7.36L20.833 0zm-2.105 1.818v7.507h7.454v20.857H5.306V1.818h13.422zm1.818.493l5.06 5.196h-5.06V2.311zm-9.182.86v3.744H7.081v3.222h4.283v3.743l5.7-5.354-5.7-5.354zm.808 1.868l3.711 3.487-3.71 3.487V9.329H7.888V7.723h4.283V5.039z"
})));

function _extends$1g() { _extends$1g = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$1g.apply(this, arguments); }
var DataObjectIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$1g({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M21.345 0H4v32h24.512V7.36L21.345 0zM19.24 1.818v7.507h7.454v20.857H5.818V1.818H19.24zm1.818.493l5.06 5.196h-5.06V2.311z"
})));

function _extends$1f() { _extends$1f = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$1f.apply(this, arguments); }
var DataOutputIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$1f({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M20.833 0H3.488v32H28V7.36L20.833 0zm-2.105 1.818v7.507h7.454v20.857H5.306V1.818h13.422zm1.818.493l5.06 5.196h-5.06V2.311zm-9.182.86v3.744H7.081v3.222h4.283v3.743l5.7-5.354-5.7-5.354z"
})));

function _extends$1e() { _extends$1e = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$1e.apply(this, arguments); }
var DataStoreIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$1e({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M16.008 1c-3.712 0-7.417.306-10.319.939-1.45.316-2.7.71-3.68 1.226C1.065 3.662.297 4.304.061 5.23a.823.823 0 00-.035.15L0 5.502l.017.084c-.012 7.41 0 14.46 0 22.08l.017.082c.203.985.995 1.656 1.975 2.172.98.517 2.23.91 3.68 1.226 2.902.633 6.607.94 10.319.94 3.711 0 7.416-.307 10.318-.94 1.451-.316 2.701-.71 3.68-1.226.98-.516 1.772-1.187 1.975-2.172l.017-.082V5.541a.825.825 0 000-.106v-.016l-.002-.013a.823.823 0 00-.046-.197c-.244-.916-1.007-1.55-1.943-2.044-.98-.516-2.23-.91-3.68-1.226C23.423 1.306 19.718 1 16.006 1zm0 1.646c3.62 0 7.245.308 9.968.901 1.36.297 2.497.67 3.263 1.074.612.323.932.643 1.063.882-.131.24-.451.56-1.063.882-.766.404-1.902.777-3.263 1.074-2.723.594-6.349.901-9.968.901-3.62 0-7.245-.307-9.968-.901-1.361-.297-2.497-.67-3.264-1.074-.611-.322-.931-.642-1.062-.882.13-.24.451-.56 1.062-.882.767-.403 1.903-.777 3.264-1.074 2.723-.593 6.348-.9 9.968-.9zM1.664 7.647c.112.067.227.132.345.194.98.517 2.23.91 3.68 1.226 2.902.633 6.607.94 10.319.94 3.711 0 7.416-.307 10.318-.94 1.451-.316 2.701-.71 3.68-1.226.119-.062.234-.127.346-.194v1.93c-.08.245-.398.619-1.113.995-.766.404-1.902.777-3.263 1.074-2.723.594-6.349.901-9.968.901-3.62 0-7.245-.307-9.968-.9-1.361-.298-2.497-.671-3.264-1.075-.714-.376-1.032-.75-1.112-.995v-1.93zm0 4.187c.112.067.227.132.345.195.98.516 2.23.91 3.68 1.226 2.902.632 6.607.938 10.319.938 3.711 0 7.416-.306 10.318-.938 1.451-.317 2.701-.71 3.68-1.226.119-.063.234-.128.346-.195v1.93c-.08.245-.398.619-1.113.995-.766.404-1.902.777-3.263 1.074-2.723.594-6.349.901-9.968.901-3.62 0-7.245-.307-9.968-.9-1.361-.298-2.497-.67-3.264-1.075-.714-.376-1.032-.75-1.112-.995v-1.93zm0 4.188c.112.067.227.131.345.194.98.516 2.23.91 3.68 1.226 2.902.633 6.607.939 10.319.939 3.711 0 7.416-.306 10.318-.94 1.451-.316 2.701-.709 3.68-1.225.119-.063.234-.127.346-.194V27.47c-.08.245-.398.618-1.113.995-.766.404-1.902.777-3.263 1.074-2.723.594-6.349.9-9.968.9-3.62 0-7.245-.306-9.968-.9-1.361-.297-2.497-.67-3.264-1.074-.714-.377-1.032-.75-1.112-.995V16.022z"
})));

function _extends$1d() { _extends$1d = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$1d.apply(this, arguments); }
var DefaultFlowIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$1d({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M32 .06S20.33 6.014 14.403 8.798c1.27 1.16 2.451 2.41 3.676 3.616L6.84 23.804H.046v1.755h5.063L0 30.735 1.325 32l6.357-6.441h7.145v-1.756H9.414l9.99-10.123c1.228 1.223 2.45 2.453 3.677 3.676C26.247 11.12 32 .06 32 .06z"
})));

function _extends$1c() { _extends$1c = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$1c.apply(this, arguments); }
var EndEventCancelIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$1c({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.676.051C7.943.058.834 6.501.104 14.21c-.783 6.565 2.912 13.427 8.942 16.216 5.6 2.737 12.789 1.87 17.434-2.344 4.725-4.09 6.79-11.06 4.714-17.006C29.22 5.009 23.394.364 16.978.083A18.532 18.532 0 0015.676.05zm.317 5.006c5.695-.165 10.916 4.858 10.983 10.555.246 5.212-3.67 10.33-8.864 11.204-5.026 1.007-10.6-1.898-12.36-6.777-1.894-4.826.039-10.928 4.649-13.46a11.082 11.082 0 015.592-1.522zm-3.955 3.918L8.94 12.072l3.985 3.985-3.913 3.913 3.048 3.047 3.913-3.913 3.987 3.987 3.096-3.096-3.987-3.987 3.913-3.913-3.047-3.048-3.913 3.913-3.985-3.985z"
})));

function _extends$1b() { _extends$1b = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$1b.apply(this, arguments); }
var EndEventCompensationIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$1b({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.676.051C7.943.058.834 6.501.104 14.21c-.783 6.565 2.912 13.427 8.942 16.216 5.6 2.737 12.789 1.87 17.434-2.344 4.725-4.09 6.79-11.06 4.714-17.006C29.22 5.009 23.394.364 16.978.083A18.532 18.532 0 0015.676.05zm.317 5.006c5.695-.165 10.916 4.858 10.983 10.555.246 5.212-3.67 10.33-8.864 11.204-5.026 1.007-10.6-1.898-12.36-6.777-1.894-4.826.039-10.928 4.649-13.46a11.082 11.082 0 015.592-1.522zm-.56 5.744l-7.407 5.23 7.408 5.234v-5.057c2.384 1.687 4.771 3.371 7.157 5.057V10.801l-7.157 5.054v-5.054z"
})));

function _extends$1a() { _extends$1a = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$1a.apply(this, arguments); }
var EndEventErrorIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$1a({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.676.051C7.943.058.834 6.501.104 14.21c-.783 6.565 2.912 13.427 8.942 16.216 5.6 2.737 12.789 1.87 17.434-2.344 4.725-4.09 6.79-11.06 4.714-17.006C29.22 5.009 23.394.364 16.978.083A18.532 18.532 0 0015.676.05zm.317 5.006c5.695-.165 10.916 4.858 10.983 10.555.246 5.212-3.67 10.33-8.864 11.204-5.026 1.007-10.6-1.898-12.36-6.777-1.894-4.826.039-10.928 4.649-13.46a11.082 11.082 0 015.592-1.522zm6.132 4.166l-3.633 7.363-4.516-5.874-4.102 12.131 4.599-5.91 4.743 5.427 2.909-13.137z"
})));

function _extends$19() { _extends$19 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$19.apply(this, arguments); }
var EndEventEscalationIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$19({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.676.051C7.943.058.834 6.501.104 14.21c-.783 6.565 2.912 13.427 8.942 16.216 5.6 2.737 12.789 1.87 17.434-2.344 4.725-4.09 6.79-11.06 4.714-17.006C29.22 5.009 23.394.364 16.978.083A18.532 18.532 0 0015.676.05zm.317 5.006c5.695-.165 10.916 4.858 10.983 10.555.246 5.212-3.67 10.33-8.864 11.204-5.026 1.007-10.6-1.898-12.36-6.777-1.894-4.826.039-10.928 4.649-13.46a11.082 11.082 0 015.592-1.522zm.006 3.9c-1.672 4.653-2.733 9.5-4.406 14.153 1.535-1.525 2.872-3.234 4.406-4.759l4.406 4.76c-1.497-4.71-2.91-9.445-4.406-14.155z"
})));

function _extends$18() { _extends$18 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$18.apply(this, arguments); }
var EndEventLinkIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$18({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.676 0C7.943.007.834 6.45.104 14.16c-.783 6.565 2.912 13.427 8.942 16.216 5.6 2.737 12.789 1.87 17.434-2.344 4.725-4.09 6.79-11.06 4.714-17.006C29.22 4.958 23.394.313 16.978.032A18.532 18.532 0 0015.676 0zm.317 5.006c5.695-.165 10.916 4.858 10.983 10.555.246 5.212-3.67 10.33-8.864 11.204-5.026 1.007-10.6-1.898-12.36-6.777-1.894-4.826.039-10.928 4.649-13.46a11.082 11.082 0 015.592-1.522zm1.78 4.065v3.555H9.779v6.713h7.994v3.554l5.828-6.91-5.828-6.912z"
})));

function _extends$17() { _extends$17 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$17.apply(this, arguments); }
var EndEventMessageIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$17({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.676 0C7.943.007.834 6.45.104 14.16c-.783 6.565 2.912 13.427 8.942 16.216 5.6 2.737 12.789 1.87 17.434-2.344 4.725-4.09 6.79-11.06 4.714-17.006C29.22 4.958 23.394.313 16.978.032A18.532 18.532 0 0015.676 0zm.317 5.006c5.695-.165 10.916 4.858 10.983 10.555.246 5.212-3.67 10.33-8.864 11.204-5.026 1.007-10.6-1.898-12.36-6.777-1.894-4.826.039-10.928 4.649-13.46a11.082 11.082 0 015.592-1.522zm-5.91 5.448l6.041 4.9 6.04-4.9H10.084zm-1.34 1.137v9.92h14.513v-9.718l-7.132 5.786-7.381-5.988z"
})));

function _extends$16() { _extends$16 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$16.apply(this, arguments); }
var EndEventMultipleIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$16({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.676 0C7.943.007.834 6.45.104 14.16c-.783 6.565 2.912 13.427 8.942 16.216 5.6 2.737 12.789 1.87 17.434-2.344 4.725-4.09 6.79-11.06 4.714-17.006C29.22 4.958 23.394.313 16.978.032A18.529 18.529 0 0015.676 0zm.317 5.006c5.695-.165 10.916 4.858 10.983 10.555.246 5.212-3.67 10.33-8.864 11.204-5.026 1.007-10.6-1.898-12.36-6.777-1.894-4.826.039-10.928 4.649-13.46a11.082 11.082 0 015.592-1.522zm.011 3.039l-7.619 5.53 2.91 8.95h9.418l2.91-8.95-7.619-5.53z"
})));

function _extends$15() { _extends$15 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$15.apply(this, arguments); }
var EndEventNoneIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$15({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.84.042C8.654-.01 1.913 5.437.4 12.454-1.057 18.62 1.554 25.495 6.784 29.09c5.076 3.636 12.31 3.92 17.59.544 5.309-3.251 8.435-9.744 7.445-15.921C30.91 7.307 25.795 1.738 19.442.422a16.064 16.064 0 00-3.602-.38zm.382 5.01c5.28-.017 10.13 4.353 10.669 9.61.687 5.025-2.552 10.281-7.423 11.792-4.754 1.617-10.486-.447-12.962-4.856-2.74-4.575-1.574-11.094 2.768-14.27a11.05 11.05 0 016.948-2.276z"
})));

function _extends$14() { _extends$14 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$14.apply(this, arguments); }
var EndEventSignalIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$14({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.676.051C7.943.058.834 6.501.104 14.21c-.783 6.565 2.912 13.427 8.942 16.216 5.6 2.737 12.789 1.87 17.434-2.344 4.725-4.09 6.79-11.06 4.714-17.006C29.22 5.009 23.394.364 16.978.083A18.532 18.532 0 0015.676.05zm.317 5.006c5.695-.165 10.916 4.858 10.983 10.555.246 5.212-3.67 10.33-8.864 11.204-5.026 1.007-10.6-1.898-12.36-6.777-1.894-4.826.039-10.928 4.649-13.46a11.082 11.082 0 015.592-1.522zm.006 3.492c-2.261 4.07-4.532 8.136-6.797 12.204h13.595L15.999 8.55z"
})));

function _extends$13() { _extends$13 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$13.apply(this, arguments); }
var EndEventTerminateIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$13({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.676.051C7.943.058.834 6.501.104 14.21c-.783 6.565 2.912 13.427 8.942 16.216 5.6 2.737 12.789 1.87 17.434-2.344 4.725-4.09 6.79-11.06 4.714-17.006C29.22 5.009 23.394.364 16.978.083A18.532 18.532 0 0015.676.05zm.317 5.006c5.695-.165 10.916 4.858 10.983 10.555.246 5.212-3.67 10.33-8.864 11.204-5.026 1.007-10.6-1.898-12.36-6.777-1.894-4.826.039-10.928 4.649-13.46a11.082 11.082 0 015.592-1.522zm.006 2.859c-5.264-.2-9.495 5.551-7.755 10.516 1.366 5.085 8.108 7.436 12.339 4.301 4.455-2.807 4.708-9.943.462-13.058A8.128 8.128 0 0016 7.915z"
})));

function _extends$12() { _extends$12 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$12.apply(this, arguments); }
var EventSubProcessExpandedIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$12({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M7.295 4.78h1.779V3.003h-1.78V4.78zm3.558 0h1.779V3.003h-1.78V4.78zm3.557 0h1.78V3.003h-1.78V4.78zm3.558 0h1.78V3.003h-1.78V4.78zm3.558 0h1.779V3.003h-1.779V4.78zm3.558 0c.55.014 1.106-.034 1.654.045l.245-1.762c-.629-.096-1.266-.05-1.9-.061V4.78zM5.732 3.004a5.933 5.933 0 00-.915.093c.111.582.226 1.164.315 1.75.358-.101.947.098.746-.483-.096-.382.164-1.208-.146-1.36zm22.372 2.281c.427.234.812.547 1.13.915.42-.4 1.002-.777 1.33-1.18a5.863 5.863 0 00-1.593-1.289l-.867 1.554zm-25.27-1.44c-.587.354-1.11.811-1.539 1.345.47.333.96.86 1.417 1.077.299-.362.66-.673 1.065-.913-.328-.493-.55-1.055-.944-1.509zM30.515 7.26c-.563.046-.557.342-.378.784.154.25-.097.862.25.85.525-.023 1.14.043 1.612-.032a5.891 5.891 0 00-.362-2.027l-1.122.425zM.268 7.114A6.042 6.042 0 000 9.052h1.78c-.013-.5.047-1.003.208-1.478L.296 7.027l-.026.079-.002.008zM30.22 12.45H32v-1.779h-1.779v1.779zm-30.22.16h1.78v-1.779H0v1.78zm30.22 3.398H32v-1.78h-1.779v1.78zm-30.22.16h1.78v-1.779H0v1.779zm30.22 3.398H32v-1.78h-1.779v1.78zm-30.22.16h1.78v-1.78H0v1.78zm30.22 3.397H32v-1.779h-1.779v1.78zm-30.22.16h1.78v-1.778H0v1.778zm30.137 1.47a4.059 4.059 0 01-.522 1.32c.506.283 1.046.715 1.53.908a5.836 5.836 0 00.744-1.918c-.576-.094-1.209-.264-1.752-.31zm-29.984.51c.157.676.435 1.325.82 1.904l1.486-.977a4.065 4.065 0 01-.577-1.347l-1.73.42zm28.427 1.943c-.371.277-.79.49-1.234.627l.548 1.693a5.84 5.84 0 001.835-.96l-1.082-1.412-.066.05-.001.002zm-26.164 1.47c.567.413 1.21.722 1.886.907.14-.569.343-1.175.444-1.722a4.062 4.062 0 01-1.283-.624l-1.047 1.438zm3.88 1.119h1.779v-1.78h-1.78v1.78zm3.55 0h1.787v-1.78H9.846v1.78zm3.565 0h1.78v-1.78h-1.78v1.78zm3.558 0h1.78v-1.78h-1.78v1.78zm3.451 0h1.743v-1.78h-1.743v1.78zm3.665 0h1.779v-1.78h-1.78v1.78zm-1.922-.545V16.776H9.846V29.25h12.318zM10.967 17.905h10.068V27.97H10.967V17.905zm1.336 3.998v1.711h7.396v-1.711h-7.396z",
  opacity: ".97"
})));

function _extends$11() { _extends$11 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$11.apply(this, arguments); }
var GatewayComplexIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$11({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M16.001 0a1.29 1.29 0 00-.917.373L.373 15.084a1.316 1.316 0 00.002 1.834l14.71 14.709a1.313 1.313 0 001.833 0l14.711-14.711a1.316 1.316 0 00-.002-1.834L16.917.372A1.294 1.294 0 0016.002 0zM16 2.181l13.821 13.821L16 29.823 2.179 16.003 16 2.18zm-.327 6.79v.007l-.145.027-.118.08-.083.123-.028.145v4.954L11.793 10.8l-.125-.08-.14-.029-.144.027-.122.082-.46.46-.085.125-.026.142.028.14.08.125 3.505 3.505H9.347l-.001-.002-.145.032-.118.08-.083.122-.028.146v.652l.029.147.082.119.12.08.144.032h4.956L10.8 20.207v-.001l-.084.124-.026.142.028.14.08.124.46.461.126.082.14.029.143-.027.124-.084L15.3 17.69v4.964-.001l.028.147.082.12.12.08.144.031h.652l.148-.03.118-.08.083-.12.028-.146v-4.962l3.505 3.505.126.082.14.027.142-.027.124-.084.461-.46.083-.123s.028-.144.027-.146l-.028-.14-.082-.126-3.496-3.496h4.948l.148-.03.119-.08.082-.12.028-.147v-.652l-.028-.145-.083-.122-.119-.08s-.147-.033-.147-.031h-4.964l3.512-3.512.082-.122.029-.144-.028-.14-.084-.124-.46-.461-.123-.082-.14-.027-.145.027-.122.082-3.507 3.507V9.348l-.028-.146-.082-.122-.12-.08-.147-.029h-.652z"
})));

function _extends$10() { _extends$10 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$10.apply(this, arguments); }
var GatewayEventBasedIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$10({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M16 0a1.29 1.29 0 00-.918.373L.371 15.084a1.316 1.316 0 00.002 1.834l14.71 14.709a1.313 1.313 0 001.833 0l14.711-14.711a1.316 1.316 0 00-.002-1.834L16.915.372A1.294 1.294 0 0016 0zm-.002 2.181l13.821 13.821-13.821 13.821-13.821-13.82L15.998 2.18zm0 5.876l-.254.185-7.377 5.355 2.915 8.964h9.433l2.915-8.964-7.631-5.54zm0 1.07l6.614 4.8-2.526 7.769h-8.175l-2.526-7.768 6.614-4.802z"
})));

function _extends$$() { _extends$$ = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$$.apply(this, arguments); }
var GatewayNoneIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$$({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M.373 15.084a1.316 1.316 0 00.002 1.834l14.71 14.709a1.313 1.313 0 001.833 0l14.711-14.711a1.316 1.316 0 00-.002-1.834L16.917.373a1.313 1.313 0 00-1.833 0L.373 15.084zm1.806.918L16 2.182l13.821 13.82L16 29.823 2.179 16.003z"
})));

function _extends$_() { _extends$_ = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$_.apply(this, arguments); }
var GatewayOrIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$_({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M16.001 0a1.29 1.29 0 00-.917.373L.373 15.084a1.316 1.316 0 00.002 1.834l14.71 14.709a1.313 1.313 0 001.833 0l14.711-14.711a1.316 1.316 0 00-.002-1.834L16.917.372A1.294 1.294 0 0016.002 0zM16 2.181l13.821 13.821L16 29.823 2.179 16.003 16 2.18zm0 6.379a7.447 7.447 0 00-7.44 7.441A7.447 7.447 0 0016 23.443 7.447 7.447 0 0023.443 16a7.447 7.447 0 00-7.441-7.441zm0 .825a6.61 6.61 0 016.617 6.616A6.61 6.61 0 0116 22.618 6.61 6.61 0 019.385 16 6.61 6.61 0 0116 9.385z"
})));

function _extends$Z() { _extends$Z = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$Z.apply(this, arguments); }
var GatewayParallelIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$Z({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M16.001 0a1.29 1.29 0 00-.917.373L.373 15.084a1.316 1.316 0 00.002 1.834l14.71 14.709a1.313 1.313 0 001.833 0l14.711-14.711a1.316 1.316 0 00-.002-1.834L16.917.372A1.294 1.294 0 0016.002 0zM16 2.181l13.821 13.821L16 29.823 2.179 16.003 16 2.18zm-.377 5.708l-.168.032-.136.092-.096.14-.032.168v6.868h-6.87l-.002-.002-.166.037-.137.092v-.002l-.095.141-.033.167v.753s.032.169.034.17l.094.138.138.092.167.036h6.87v6.867l-.001-.001.033.17.095.138.138.092s.166.035.167.037h.752l.17-.036.137-.092.095-.137.033-.17v-6.867h6.868l.17-.035.137-.092.095-.137.033-.17v-.753s-.033-.165-.032-.167l-.096-.14-.138-.093s-.17-.037-.17-.035H16.81V8.323l-.033-.168-.094-.14-.138-.092-.17-.034h-.752z"
})));

function _extends$Y() { _extends$Y = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$Y.apply(this, arguments); }
var GatewayXorIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$Y({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M16 0a1.29 1.29 0 00-.918.373L.371 15.084a1.316 1.316 0 00.002 1.834l14.71 14.709a1.313 1.313 0 001.833 0l14.711-14.711a1.316 1.316 0 00-.002-1.834L16.915.372A1.294 1.294 0 0016 0zm-.002 2.181l13.821 13.821-13.821 13.821-13.821-13.82L15.998 2.18zm-5.162 7.69l-.166.032-.141.096-.532.532s-.097.142-.097.144l-.03.164.032.162.093.144 4.857 4.858-4.855 4.855v-.001L9.9 21l-.03.164.032.162s.093.142.093.144l.531.532.146.095.162.032.164-.03.144-.097 4.855-4.856 4.857 4.857.145.095.162.032.164-.03.144-.097.531-.532.095-.14.033-.168-.033-.162-.095-.146L17.144 16 22 11.144l.095-.14.033-.166-.033-.163-.097-.144-.532-.532-.14-.095-.163-.032-.166.032-.141.095L16 14.855l-4.858-4.858v-.002l-.144-.092-.162-.032z"
})));

function _extends$X() { _extends$X = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$X.apply(this, arguments); }
var GroupIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$X({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M6.34.016c-2.333.025-4.684 1.77-5.29 4.17C.608 5.848.88 7.608.804 9.314v2.922h2.041c.038-2.332-.076-4.673.062-7C3.14 3.355 4.869 1.938 6.643 2.04h8.956V.009c-3.086 0-6.173-.02-9.258 0v.007zm13.094 2.023h1.92V.009h-1.92v2.03zm5.756 0c1.265-.069 2.66.045 3.602 1.055 1.036.983 1.201 2.523 1.122 3.91v6.313h2.078c-.03-2.677.062-5.36-.047-8.032-.17-2.743-2.62-5.111-5.215-5.236-.511-.064-1.027-.02-1.54-.033v2.023zM.803 18.319h2.041v-2.026H.804v2.026zm29.11 1.084h2.08v-2.03h-2.08v2.03zM.804 26.148c.004 2.218 1.393 4.366 3.313 5.28 1.728.853 3.681.448 5.521.544.43-.112 1.29.231 1.435-.183v-1.847c-1.788-.043-3.584.094-5.365-.082-1.67-.354-2.919-2.048-2.863-3.844v-3.644H.804v3.777zm29.11-.068c.04 1.961-1.508 3.787-3.381 3.842-1.954.06-3.914.02-5.87.026v2.03c2.118-.042 4.242.08 6.355-.063 2.524-.264 4.818-2.644 4.94-5.323.08-1.039.014-2.085.035-3.126h-2.078v2.613zm-15.006 5.898h1.92v-2.03h-1.92v2.03z"
})));

function _extends$W() { _extends$W = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$W.apply(this, arguments); }
var IntermediateEventCatchCancelIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$W({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.975.049C8.195-.111.935 6.286.125 14.03c-.855 6.55 2.741 13.46 8.74 16.314 5.666 2.847 13.012 1.99 17.71-2.33 4.745-4.162 6.727-11.243 4.532-17.206C29.09 4.93 23.445.454 17.201.095c-.408-.03-.817-.046-1.226-.046zm-.181 1.724c7.134-.269 13.84 5.68 14.399 12.804.686 6.283-3.267 12.792-9.283 14.862-5.847 2.162-13.025.06-16.557-5.141C.728 19.22.872 11.725 4.985 6.962c2.632-3.171 6.671-5.174 10.809-5.19zm.283 1.553c-6.6-.21-12.671 5.585-12.79 12.185-.292 5.964 4.129 11.817 10.034 12.953 5.47 1.198 11.584-1.613 14.025-6.702 2.525-4.97 1.396-11.585-2.912-15.215-2.282-2.022-5.3-3.217-8.357-3.22zM16 5.021c5.818-.154 11.117 5.082 11.024 10.905.103 5.384-4.23 10.5-9.636 11.043-5.075.667-10.426-2.587-11.885-7.552-1.53-4.73.48-10.428 4.888-12.864A11.082 11.082 0 0116 5.021zm-3.956 3.946l-3.096 3.097 3.985 3.985-3.913 3.913 3.047 3.048 3.913-3.913 3.988 3.987 3.097-3.096L19.076 16l3.914-3.913-3.048-3.048-3.913 3.913-3.986-3.985zm-.002 1.222l3.988 3.987 3.913-3.913 1.826 1.826-3.913 3.913 3.985 3.986-1.873 1.873-3.985-3.985-3.913 3.913-1.827-1.827 3.914-3.913-3.988-3.987 1.873-1.873z"
})));

function _extends$V() { _extends$V = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$V.apply(this, arguments); }
var IntermediateEventCatchCompensationIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$V({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.975.049C8.195-.11.935 6.286.125 14.03c-.855 6.55 2.741 13.46 8.74 16.314 5.666 2.847 13.012 1.99 17.71-2.33 4.745-4.162 6.727-11.243 4.532-17.206C29.09 4.93 23.445.453 17.201.095c-.408-.03-.817-.046-1.226-.046zm-.181 1.724c7.134-.269 13.84 5.68 14.399 12.804.686 6.283-3.267 12.792-9.283 14.862-5.847 2.162-13.025.06-16.557-5.141C.728 19.22.872 11.725 4.985 6.962c2.632-3.171 6.671-5.174 10.809-5.19zm.283 1.553c-6.6-.21-12.671 5.585-12.79 12.185-.292 5.964 4.129 11.817 10.034 12.953 5.47 1.198 11.584-1.613 14.025-6.702 2.525-4.97 1.396-11.585-2.912-15.216-2.282-2.021-5.3-3.216-8.357-3.22zM16 5.021c5.818-.154 11.117 5.082 11.024 10.905.103 5.384-4.23 10.5-9.636 11.043-5.075.667-10.426-2.587-11.885-7.552-1.53-4.73.48-10.428 4.888-12.864A11.083 11.083 0 0116 5.021zm-.56 5.772l-7.408 5.231 7.409 5.234v-5.057c2.385 1.687 4.771 3.371 7.157 5.057V10.793l-7.157 5.055v-5.055zm-.865 1.665v7.125l-5.048-3.562 5.048-3.563zm7.161 0v7.132l-5.048-3.566 5.048-3.566z"
})));

function _extends$U() { _extends$U = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$U.apply(this, arguments); }
var IntermediateEventCatchConditionIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$U({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.97.04h-.127C8.713-.018 2.003 5.334.437 12.286c-1.51 6.123.98 13.005 6.136 16.665 5.125 3.788 12.546 4.105 17.912.623 5.272-3.276 8.33-9.766 7.325-15.916-.904-6.241-5.79-11.7-11.95-13.143A16.082 16.082 0 0015.97.04zm-.181 1.724c.115 0 .23 0 .347.003 6.625-.066 12.823 5.149 13.89 11.69 1.13 5.91-1.908 12.349-7.262 15.138-5.473 3.013-12.866 1.884-17.116-2.726C1.291 21.372.444 13.914 3.802 8.602c2.493-4.112 7.169-6.819 11.987-6.838zm.283 1.554c-.117 0-.234.002-.351.005-6.1 0-11.691 5.049-12.346 11.114-.78 5.684 2.795 11.612 8.218 13.52 5.139 1.943 11.416.101 14.624-4.38 3.461-4.583 3.262-11.538-.596-15.831-2.36-2.747-5.924-4.423-9.549-4.428zm-.078 1.695c.078 0 .156 0 .234.003 5.4 0 10.321 4.556 10.734 9.942.563 5.13-2.958 10.364-7.971 11.678-4.832 1.41-10.457-.935-12.746-5.446-2.463-4.559-1.2-10.795 3.014-13.883a11.072 11.072 0 016.735-2.294zm-5.352 4.266V22.761h10.716V9.279H10.642zm.863.866h8.987v11.75h-8.987v-11.75zm.927 1.323v.862h7.133v-.862h-7.133zm0 2.602v.866h7.133v-.866h-7.133zm0 3.008v.862h7.133v-.862h-7.133zm0 2.717v.863h7.133v-.863h-7.133z"
})));

function _extends$T() { _extends$T = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$T.apply(this, arguments); }
var IntermediateEventCatchErrorIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$T({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.975.049C8.195-.11.935 6.286.125 14.03c-.855 6.55 2.741 13.46 8.74 16.314 5.666 2.847 13.012 1.99 17.71-2.33 4.745-4.162 6.727-11.243 4.532-17.206C29.09 4.93 23.445.453 17.201.095c-.408-.03-.817-.046-1.226-.046zm-.181 1.724c7.134-.269 13.84 5.68 14.399 12.804.686 6.283-3.267 12.792-9.283 14.862-5.847 2.162-13.025.06-16.557-5.141C.728 19.22.872 11.725 4.985 6.962c2.632-3.171 6.671-5.174 10.809-5.19zm.283 1.553c-6.6-.21-12.671 5.585-12.79 12.185-.292 5.964 4.129 11.817 10.034 12.953 5.47 1.198 11.584-1.613 14.025-6.702 2.525-4.97 1.396-11.585-2.912-15.216-2.282-2.021-5.3-3.216-8.357-3.22zM16 5.021c5.818-.154 11.117 5.082 11.024 10.905.103 5.384-4.23 10.5-9.636 11.043-5.075.667-10.426-2.587-11.885-7.552-1.53-4.73.48-10.428 4.888-12.864A11.083 11.083 0 0116 5.021zm6.132 4.194c-1.21 2.455-2.422 4.91-3.633 7.364l-4.516-5.875-4.103 12.133 4.6-5.912c1.58 1.81 3.162 3.619 4.744 5.429L22.13 9.215zM14.383 13.1l4.295 5.445 1.073-2.387-1.027 4.131-4.384-5.157-1.778 2.75 1.821-4.782z"
})));

function _extends$S() { _extends$S = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$S.apply(this, arguments); }
var IntermediateEventCatchEscalationIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$S({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.975.049C8.195-.11.935 6.286.125 14.03c-.855 6.55 2.741 13.46 8.74 16.314 5.666 2.847 13.012 1.99 17.71-2.33 4.745-4.162 6.727-11.243 4.532-17.206C29.09 4.93 23.445.453 17.201.095c-.408-.03-.817-.046-1.226-.046zm-.181 1.724c7.134-.269 13.84 5.68 14.399 12.804.686 6.283-3.267 12.792-9.283 14.862-5.847 2.162-13.025.06-16.557-5.141C.728 19.22.872 11.725 4.985 6.962c2.632-3.171 6.671-5.174 10.809-5.19zm.283 1.553c-6.6-.21-12.671 5.585-12.79 12.185-.292 5.964 4.129 11.817 10.034 12.953 5.47 1.198 11.584-1.613 14.025-6.702 2.525-4.97 1.396-11.585-2.912-15.216-2.282-2.021-5.3-3.216-8.357-3.22zM16 5.021c5.818-.154 11.117 5.082 11.024 10.905.103 5.384-4.23 10.5-9.636 11.043-5.075.667-10.426-2.587-11.885-7.552-1.53-4.73.48-10.428 4.888-12.864A11.083 11.083 0 0116 5.021zm.006 3.927c-1.672 4.654-2.734 9.502-4.406 14.155 1.534-1.525 2.872-3.234 4.406-4.759l4.406 4.76c-1.496-4.71-2.91-9.446-4.406-14.156zm.032 2.929c.822 2.586 1.598 5.186 2.42 7.771l-2.42-2.612c-.682.597-2.452 2.884-2.338 2.388.87-2.487 1.447-5.067 2.338-7.547z"
})));

function _extends$R() { _extends$R = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$R.apply(this, arguments); }
var IntermediateEventCatchLinkIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$R({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.975.049C8.195-.11.935 6.286.125 14.03c-.855 6.55 2.741 13.46 8.74 16.314 5.666 2.847 13.012 1.99 17.71-2.33 4.745-4.162 6.727-11.243 4.532-17.206C29.09 4.93 23.445.453 17.201.095c-.408-.03-.817-.046-1.226-.046zm-.181 1.724c7.134-.269 13.84 5.68 14.399 12.804.686 6.283-3.267 12.792-9.283 14.862-5.847 2.162-13.025.06-16.557-5.141C.728 19.22.872 11.725 4.985 6.962c2.632-3.171 6.671-5.174 10.809-5.19zm.283 1.553c-6.6-.21-12.671 5.585-12.79 12.185-.292 5.964 4.129 11.817 10.034 12.953 5.47 1.198 11.584-1.613 14.025-6.702 2.525-4.97 1.396-11.585-2.912-15.216-2.282-2.021-5.3-3.216-8.357-3.22zM16 5.021c5.818-.154 11.117 5.082 11.024 10.905.103 5.384-4.23 10.5-9.636 11.043-5.075.667-10.426-2.587-11.885-7.552-1.53-4.73.48-10.428 4.888-12.864A11.083 11.083 0 0116 5.021zm1.78 4.093v3.555H9.785v6.714h7.994v3.554l5.829-6.911-5.83-6.912zm.974 2.584l3.61 4.295-3.61 4.294v-1.933h-7.88v-4.688h7.88v-1.968z"
})));

function _extends$Q() { _extends$Q = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$Q.apply(this, arguments); }
var IntermediateEventCatchMessageIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$Q({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.975.049C8.195-.11.935 6.286.125 14.03c-.855 6.55 2.741 13.46 8.74 16.314 5.666 2.847 13.012 1.99 17.71-2.33 4.745-4.162 6.727-11.243 4.532-17.206C29.09 4.93 23.445.453 17.201.095c-.408-.03-.817-.046-1.226-.046zm-.181 1.724c7.134-.269 13.84 5.68 14.399 12.804.686 6.283-3.267 12.792-9.283 14.862-5.847 2.162-13.025.06-16.557-5.141C.728 19.22.872 11.725 4.985 6.962c2.632-3.171 6.671-5.174 10.809-5.19zm.283 1.553c-6.6-.21-12.671 5.585-12.79 12.185-.292 5.964 4.129 11.817 10.034 12.953 5.47 1.198 11.584-1.613 14.025-6.702 2.525-4.97 1.396-11.585-2.912-15.216-2.282-2.021-5.3-3.216-8.357-3.22zM16 5.021c5.818-.154 11.117 5.082 11.024 10.905.103 5.384-4.23 10.5-9.636 11.043-5.075.667-10.426-2.587-11.885-7.552-1.53-4.73.48-10.428 4.888-12.864A11.083 11.083 0 0116 5.021zm-7.245 5.475v11.06h14.502v-11.06H8.754zm3.222 1.728h8.057c-1.427.878-2.854 2.806-4.281 3.016l-3.776-3.016zm9.554 1.017v6.587H10.48V13.24l5.524 4.414 5.526-4.414z"
})));

function _extends$P() { _extends$P = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$P.apply(this, arguments); }
var IntermediateEventCatchMultipleIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$P({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.975.003C8.195-.156.935 6.24.125 13.985c-.855 6.55 2.741 13.46 8.74 16.314 5.666 2.847 13.012 1.99 17.71-2.33 4.745-4.162 6.727-11.243 4.532-17.206C29.09 4.884 23.445.407 17.201.049c-.408-.03-.817-.046-1.226-.046zm-.181 1.724c7.134-.269 13.84 5.68 14.399 12.804.686 6.283-3.267 12.792-9.283 14.862-5.847 2.162-13.025.06-16.557-5.141C.728 19.174.872 11.679 4.985 6.916c2.632-3.171 6.671-5.174 10.809-5.19zm.283 1.553c-6.6-.21-12.671 5.585-12.79 12.185-.292 5.964 4.129 11.817 10.034 12.953 5.47 1.198 11.584-1.613 14.025-6.702 2.525-4.97 1.396-11.585-2.912-15.216-2.282-2.021-5.3-3.216-8.357-3.22zM16 4.975c5.818-.154 11.117 5.082 11.024 10.905.103 5.384-4.23 10.5-9.636 11.043-5.075.667-10.426-2.587-11.885-7.552-1.53-4.73.48-10.428 4.888-12.864A11.083 11.083 0 0116 4.975zm.006 3.073l-7.62 5.531 2.91 8.95h9.42l2.91-8.95-7.62-5.53zm0 1.067l6.604 4.794-2.523 7.757h-8.162l-2.522-7.757 6.603-4.794z"
})));

function _extends$O() { _extends$O = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$O.apply(this, arguments); }
var IntermediateEventCatchNonInterruptingConditionIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$O({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M10.638 9.563V23.056h10.724V9.563H10.638zm.863.866h8.995v11.76H11.5V10.43zm.928 1.324v.862h7.139v-.862h-7.14zm0 2.605v.866h7.139v-.866h-7.14zm0 3.01v.863h7.139v-.863h-7.14zm0 2.72v.863h7.139v-.864h-7.14zM15.999.308h-.004l-.188.001h-.011l-.188.004h-.011L15.41.32h-.011l-.187.008h-.005L15.2.33l-.187.01h-.005l-.005.001-.187.013h-.011L14.62.37h-.01l-.186.018h-.011l-.185.02-.005.001h-.006l-.185.022-.005.001h-.005l-.185.025h-.005l-.005.001-.185.027h-.005l-.005.001-.184.029h-.005l-.005.001-.183.031-.006.001-.005.001-.182.033-.006.001-.005.001-.182.035-.005.001-.005.001-.182.038h-.005l-.005.002-.181.04h-.005l-.005.002-.18.042-.006.001-.005.001-.18.044-.005.002h-.005l-.17.045-.152.054-.139.082-.121.106-.1.127-.074.143-.046.155-.017.16.013.16.043.156.07.145.097.13.119.108.137.085.15.058.159.03.16-.001.133-.023.165-.043.168-.041.171-.04.171-.037.172-.036.17-.033.173-.03.17-.03.177-.027.171-.025.175-.022.175-.02.175-.02.176-.016.175-.014.177-.012.176-.01.177-.007.174-.006.177-.003.178-.001h.177l.178.004.174.006.177.007.176.01.177.012.175.014.176.017.175.018.175.02.175.023.171.025.176.027.17.03.174.03.17.033.171.036.154.033.16.02.161-.01.156-.04.146-.069.131-.094.111-.117.087-.135.061-.15.032-.158.002-.16-.027-.16-.057-.15L20 1.023l-.108-.12-.128-.097-.145-.073-.128-.038-.158-.035-.005-.001-.005-.001L19.14.62h-.005l-.005-.002-.182-.035h-.006L18.938.58l-.182-.033h-.006l-.005-.002-.183-.03-.005-.001-.006-.001-.183-.029h-.005l-.006-.001-.184-.027h-.005l-.005-.001-.185-.024h-.005L17.968.43 17.783.41l-.006-.001h-.005l-.185-.02h-.006l-.005-.001L17.39.37h-.005L17.38.368l-.187-.015h-.005l-.005-.001-.187-.013h-.011L16.8.328h-.011L16.6.32h-.011l-.187-.006h-.011L16.204.31h-.011L16.005.31H16zm9.016 2.935l-.16.004-.158.033-.15.062-.134.09-.116.111-.093.132-.067.147-.038.156-.01.161.022.16.05.153.078.141.103.124.102.087.045.034.142.106.137.105.14.11.136.11.135.112.134.115.134.117.13.115.132.122.128.12.127.122.126.125.124.126.124.128.121.13.118.128.118.132.117.133.113.134.113.136.11.136.109.137.109.142.104.14.103.14.101.142.1.144.099.146.095.145.094.147.093.15.092.15.087.149.087.15.084.152.084.155.08.152.08.155.04.081.084.138.11.119.128.096.145.072.155.043.16.013.16-.016.155-.046.144-.074.127-.099.106-.12.083-.14.055-.151.026-.16-.004-.16-.034-.158-.05-.124-.042-.085-.002-.004-.003-.005-.084-.165-.002-.004-.003-.005-.086-.164-.002-.004-.003-.005-.088-.162-.002-.005-.003-.005-.09-.161-.002-.005-.003-.004-.092-.16-.003-.005-.002-.005-.094-.16-.003-.004-.003-.004-.096-.159-.002-.004-.003-.005-.098-.157-.003-.004-.003-.005-.1-.156-.003-.004-.003-.005-.101-.154-.003-.005-.003-.004-.104-.154-.003-.004-.003-.005-.106-.152-.003-.005-.003-.004-.108-.151-.003-.004-.003-.005-.11-.15-.003-.004-.003-.004-.111-.15-.004-.003-.003-.005-.113-.147-.004-.004-.003-.005-.115-.146-.004-.004-.003-.004-.117-.145-.004-.004-.003-.004-.12-.144-.003-.004-.003-.004-.121-.142-.004-.004-.003-.004-.123-.141-.003-.004-.004-.004-.125-.14-.003-.004-.004-.004-.127-.138-.003-.004-.004-.004-.128-.136-.004-.004-.004-.004-.13-.135-.004-.004-.004-.004-.132-.134-.003-.004-.004-.003-.134-.133-.004-.003-.004-.004-.135-.13-.004-.004-.004-.004-.136-.128-.004-.004-.004-.004-.138-.126-.004-.004-.004-.003-.14-.125-.004-.004-.004-.003-.14-.123-.005-.004-.004-.003-.142-.121-.004-.004-.004-.003-.144-.12-.004-.003-.004-.003-.145-.117-.004-.004-.004-.003-.147-.115-.004-.004-.004-.003-.148-.113-.004-.003-.004-.004-.149-.111-.004-.003-.004-.004-.05-.036-.14-.083-.15-.055-.16-.027zm-18.381.344l-.161.008-.157.037-.147.066-.111.074-.04.032-.005.003-.004.004-.145.117-.004.003-.004.004-.144.119-.004.003-.004.004-.142.12-.004.004-.004.004-.141.123-.004.003-.004.004-.14.125-.004.003-.004.004-.138.126-.004.004-.004.004-.136.128-.004.004-.004.004-.135.13-.004.004-.004.003-.134.133-.004.003L4.682 5l-.132.134-.003.004-.004.004-.13.135-.004.004-.004.004-.128.136-.004.004-.004.004-.126.138-.004.004-.003.004-.125.14-.004.004-.003.004-.123.14-.004.005-.003.004-.121.142-.004.004-.003.004-.12.144-.003.004-.003.004-.117.145-.004.004-.003.004-.115.146-.004.005-.003.004-.113.147-.003.005-.004.004-.111.149-.003.004-.004.004-.11.15-.002.005-.003.004-.108.151-.003.004-.003.005-.106.152-.003.005-.003.004-.104.154-.003.004-.003.005-.102.154-.003.005-.002.004-.1.156-.003.005-.003.004-.098.157-.003.005-.003.004-.096.159-.002.004-.003.005-.094.16-.003.004-.002.004-.092.16-.003.005-.003.005-.09.161-.002.005-.003.005-.088.162-.002.005-.003.004-.086.164-.002.005-.002.004-.084.165-.003.005-.002.004-.082.166-.002.004-.003.005-.08.167-.002.004-.002.005-.078.168-.002.004-.002.005-.045.1-.053.153-.023.16.007.16.037.157.065.148.092.132.114.114.134.09.148.064.157.035.161.006.16-.025.152-.054.14-.08.121-.106.1-.126.065-.118.043-.095.074-.16.075-.155.077-.157.08-.155.08-.152.083-.155.085-.152.086-.15.088-.149.091-.15.094-.15.094-.147.095-.145.099-.146.1-.144.1-.142.104-.14.104-.14.11-.142.107-.137.11-.136.114-.136.113-.134.117-.133.118-.132.117-.129.122-.13.124-.127.123-.126.127-.125.127-.122.128-.12.132-.122.13-.115.133-.117.135-.115.135-.111.136-.11.037-.03.117-.11.094-.132.068-.146.04-.156.01-.161-.02-.16-.05-.154-.076-.141-.102-.125-.123-.104-.14-.08-.153-.051-.16-.023zM16 3.595h-.005l-.148.001h-.01l-.147.003h-.011l-.147.005h-.011l-.146.007h-.011l-.146.009h-.011l-.146.01h-.005l-.005.001-.146.012h-.011l-.145.014h-.006l-.005.001-.05.006-.158.031-.15.06-.135.088-.117.111-.094.13-.069.147-.04.156-.01.16.019.16.049.154.076.142.102.125.123.105.14.08.152.051.16.023.134-.003.045-.005.135-.013.133-.01.136-.01.135-.007.137-.006.136-.004.136-.003h.274l.136.003.136.004.136.006.136.007.136.01.133.01.135.013.135.014.135.016.134.018.132.018.134.021.133.023.133.024.133.025.13.027.132.03.132.03.129.031.13.034.129.035.129.036.13.04.126.038.128.042.126.042.128.045.127.047.126.047.12.048.127.051.123.052.006.002.147.048.16.021.16-.009.157-.038.147-.067.131-.093.112-.116.089-.135.062-.149.033-.158.004-.16-.027-.16-.055-.151-.083-.139-.107-.12-.127-.099-.118-.063-.004-.001-.005-.003-.005-.002-.133-.056-.005-.002-.005-.002-.134-.054-.004-.002-.005-.002-.135-.053-.005-.002-.005-.002-.135-.051-.005-.002-.005-.002-.135-.05-.005-.001-.005-.002-.137-.048-.005-.001-.005-.002-.137-.046-.005-.002-.005-.002-.137-.044-.005-.002-.005-.001-.138-.043-.006-.002-.005-.001-.138-.042-.005-.001-.005-.002-.14-.04H19.4l-.005-.002-.14-.038-.005-.001-.005-.002-.14-.036-.005-.001-.005-.001-.141-.035-.005-.001-.005-.001-.142-.033-.005-.001-.005-.001-.142-.031-.005-.002h-.005l-.142-.03-.005-.001-.005-.001-.143-.028h-.005l-.005-.002-.143-.025-.006-.001-.005-.001-.143-.024-.005-.001-.006-.001-.143-.022-.006-.001h-.005l-.144-.022h-.005l-.006-.001-.144-.019h-.005l-.006-.001-.144-.017h-.006l-.005-.001-.145-.016h-.011l-.145-.014H17.1l-.005-.001-.146-.012h-.01l-.146-.01-.006-.001h-.005l-.146-.009h-.011l-.147-.006h-.01L16.32 3.6h-.011l-.147-.003h-.011l-.147-.001H16zm-5.482 1.366l-.16.008-.157.037-.123.053-.06.032-.005.002-.004.003-.128.069-.004.002-.005.003-.126.07-.005.003-.004.002-.126.072-.005.003-.004.003-.125.073-.004.003-.005.003-.124.075-.004.003-.005.002-.123.077-.004.003-.005.003-.122.078-.004.003-.005.003-.121.08-.004.002-.005.003-.12.082-.005.003-.004.003-.12.083-.004.003-.004.003-.118.084-.005.003-.004.003-.118.086-.004.003-.004.003-.117.088-.004.003-.004.003-.116.089-.004.003-.004.004-.114.09-.005.003-.004.003-.113.092-.004.004-.004.003-.113.093-.004.004-.004.003-.111.095-.005.003-.004.004-.11.096-.004.004-.004.003-.11.098-.003.003-.004.004-.108.1-.004.003-.004.003-.107.101-.004.004-.004.003-.106.102-.004.004-.003.004-.105.103-.004.004-.004.004-.103.105-.004.004-.004.003-.102.106-.003.004-.004.004-.1.107-.004.004-.004.004-.099.108-.004.004-.003.004-.098.11-.003.003-.004.004-.096.11-.004.005-.003.004-.095.111-.003.004-.004.004-.093.113-.003.004-.004.004-.092.113-.003.004-.003.005-.09.114-.004.004-.003.004-.089.116-.003.004-.003.004-.088.117-.003.004-.003.004-.086.118-.003.004-.003.005-.084.118-.003.004-.003.005-.083.12-.003.003-.003.005-.082.12-.003.005-.002.004-.068.103-.076.142-.048.154-.018.16.011.161.041.156.07.146.095.13.117.11.136.086.15.06.158.03.162.002.158-.03.15-.057.138-.085.119-.109.082-.105.065-.099.075-.11.077-.113.077-.107.08-.11.08-.108.084-.108.083-.105.086-.106.086-.104.088-.104.089-.101.09-.102.093-.101.093-.099.094-.097.095-.096.098-.097.098-.095.099-.093.1-.092.103-.091.101-.089.104-.088.104-.086.106-.086.106-.083.106-.082.109-.082.108-.079.11-.078.11-.076.112-.076.112-.074.113-.072.113-.071.115-.07.115-.068.118-.067.117-.065.12-.065.054-.029.135-.088.116-.111.094-.132.068-.146.04-.156.009-.161-.02-.16-.05-.153-.078-.142-.102-.125-.123-.103-.141-.079-.153-.051-.16-.022zm13.91 2.116l-.162.008-.157.037-.147.066-.132.092-.113.116-.09.134-.063.148-.034.157-.005.162.025.159.055.152.082.138.086.103.09.09.094.098.092.099.093.1.091.103.089.101.088.104.086.104.086.106.083.105.083.108.08.108.081.11.077.107.077.112.075.111.075.114.072.113.071.113.07.114.068.118.067.115.065.118.064.117.062.117.061.121.059.119.059.122.056.121.054.12.055.125.051.123.051.125.048.123.048.127.047.126.044.125.043.128.042.129.039.126.038.13.022.076.058.15.085.137.11.119.129.096.145.07.155.043.16.013.161-.017.154-.046.144-.075.126-.1.106-.12.082-.14.055-.151.025-.16-.005-.16-.026-.132-.023-.082-.002-.005-.001-.005-.042-.139-.001-.005-.002-.005-.043-.138-.001-.005-.002-.005-.044-.137-.002-.005-.002-.005-.046-.137-.002-.005-.001-.005-.048-.137-.002-.005-.002-.005-.05-.135-.001-.005-.002-.005-.051-.135-.002-.005-.002-.005-.053-.135-.002-.005-.002-.005-.054-.133-.002-.005-.002-.005-.057-.133-.002-.005-.002-.005-.057-.132-.003-.005-.002-.005-.06-.132-.001-.005-.002-.004-.061-.132-.003-.004-.002-.005-.063-.13-.002-.005-.002-.005-.064-.13-.003-.004-.002-.005-.066-.129-.002-.004-.003-.005-.067-.128-.002-.005-.003-.004-.069-.128-.002-.004-.003-.005-.07-.126-.003-.005-.003-.004-.072-.126-.002-.005-.003-.004-.074-.125-.002-.004-.003-.005-.075-.124-.003-.004-.003-.005-.076-.123-.003-.004-.003-.005-.078-.122-.003-.004-.003-.005-.08-.121-.003-.004-.003-.005-.081-.12-.003-.005-.003-.004-.083-.12-.003-.004-.003-.004-.084-.118-.003-.005-.003-.004-.086-.118-.003-.004-.004-.004-.087-.117-.003-.004-.003-.004-.09-.116-.002-.004-.004-.004-.09-.114-.003-.005-.004-.004-.091-.113-.004-.004-.003-.004-.094-.113-.003-.004-.003-.004-.095-.111-.004-.004-.003-.004-.096-.11-.004-.005-.003-.004-.098-.11-.004-.003-.003-.004-.1-.108-.003-.004-.004-.004-.1-.107-.004-.004-.004-.004-.102-.106-.003-.003-.004-.004-.093-.095-.124-.103-.14-.08-.153-.05-.16-.023zM4.45 13.135l-.161.002-.158.032-.15.06-.135.088-.118.11-.094.131-.069.146-.035.129-.026.132v.005l-.002.005-.025.143-.001.005-.001.006-.024.143-.001.005-.001.006-.022.143-.001.006-.001.005-.02.144-.001.005-.001.005-.019.145v.005l-.001.006-.017.144v.006l-.001.005-.016.145v.011l-.014.145v.005l-.001.006-.012.146v.01l-.01.146-.001.006v.005l-.009.146v.011l-.007.146v.011l-.004.147v.011l-.003.147v.01l-.002.148v.01l.001.148v.01l.003.147v.011l.005.147v.01l.007.147v.011l.009.146v.011l.01.146v.01l.013.146v.011l.014.145v.005l.001.006.016.145v.011l.018.144v.006l.001.005.019.144v.006l.001.005.021.144v.005l.002.006.022.143v.006l.002.005.024.143v.005l.002.006.025.143.001.005.001.005.028.143.001.005.001.005.03.142v.005l.002.006.03.141.002.005.001.005.033.142v.005l.002.005.035.14v.006l.002.005.036.14.002.005.001.005.038.14.001.005.002.005.04.14v.005l.002.005.042.138.001.006.002.005.042.138.002.005.002.005.017.054.064.148.09.134.114.114.132.092.148.065.157.037.16.007.16-.023.153-.052.14-.08.123-.104.102-.125.076-.142.049-.153.02-.16-.011-.161-.031-.13-.017-.051-.039-.126-.038-.13-.037-.128-.035-.13-.033-.128-.033-.134-.03-.13-.029-.131-.026-.13-.026-.133-.024-.133-.023-.133-.02-.132-.02-.136-.017-.132-.016-.135-.014-.135-.012-.133-.012-.138-.009-.133-.007-.136-.006-.138-.004-.134-.003-.136v-.274l.003-.136.004-.134.006-.139.007-.136.01-.133.01-.138.013-.132.014-.135.016-.135.017-.132.02-.137.02-.13.023-.134.024-.133.024-.126.016-.16-.014-.161-.044-.155-.072-.145-.098-.128-.12-.108-.137-.084-.15-.057-.16-.029zm26.698 1.601l-.161.01-.157.04-.146.067-.131.093-.112.117-.088.135-.061.149-.033.157-.005.134.006.14.006.176.003.177.001.178-.001.177-.003.178-.006.177-.007.176-.01.177-.012.176-.015.176-.016.173-.018.175-.02.175-.024.174-.025.175-.026.17-.03.174-.03.173-.033.17-.036.172-.037.17-.04.17-.042.172-.043.168-.045.166-.048.169-.05.167-.052.168-.053.164-.056.166-.058.166-.06.16-.062.165-.062.158-.066.165-.068.16-.07.16-.07.158-.075.159-.074.155-.079.158-.08.158-.06.15-.03.158-.001.161.029.159.058.15.085.137.108.119.13.097.144.07.156.044.16.013.16-.017.155-.046.143-.074.127-.1.107-.12.07-.115.083-.164.003-.005.002-.004.082-.166.002-.005.003-.004.08-.167.002-.005.002-.004.078-.168.002-.005.002-.004.076-.169.002-.004.002-.005.074-.17.002-.004.002-.005.072-.17.002-.005.002-.005.07-.171.001-.005.002-.005.068-.172.002-.004.002-.005.065-.173.002-.005.002-.005.063-.173.002-.005.002-.005.06-.174.003-.005.001-.005.06-.175.001-.005.002-.005.057-.176.001-.005.002-.005.055-.177.001-.005.002-.005.052-.177.002-.005.001-.005.051-.178.001-.005.002-.005.048-.179.002-.005v-.005l.047-.179.001-.005.002-.005.044-.18v-.005l.002-.005.042-.18.001-.006.001-.005.04-.181.001-.005.001-.005.037-.182.002-.005v-.005l.036-.182v-.006l.002-.005.033-.182v-.006l.002-.005.03-.183.001-.005.001-.005.029-.184v-.005l.001-.006.027-.184v-.005l.001-.005.024-.185v-.005l.001-.005.022-.185v-.006l.001-.005.02-.185v-.006l.001-.005.017-.186v-.005l.001-.005.015-.187v-.005l.001-.005.013-.187v-.01l.01-.187.001-.006v-.005l.009-.187v-.011l.006-.187V16.7l.004-.188v-.011l.001-.188v-.01l-.001-.188v-.011l-.004-.188v-.011l-.006-.187v-.011l-.007-.145-.022-.16-.05-.152-.08-.141-.103-.124-.125-.102-.141-.077-.153-.05-.16-.02zm-30.21.572l-.161.001-.158.032-.15.06-.136.087-.117.11-.095.131-.068.146-.04.156-.012.133-.001.14v.01l.001.188v.011l.004.188v.011l.006.187v.011l.008.187v.011l.011.187v.005l.001.005.013.187v.01l.016.187v.01l.018.186v.011l.02.185.001.005v.006l.022.185.001.005v.005l.025.185v.005l.001.005.027.184v.006l.001.005.029.184v.005l.001.005.031.183.001.005.001.006.033.182.001.005.001.006.035.182.001.005.001.005.038.182v.005l.002.005.04.181v.005l.002.005.042.18.001.006.001.005.044.18.002.005v.005l.047.18.001.004.002.005.048.179.002.005.001.005.05.178.002.005.001.005.053.177.002.005.001.005.055.177.002.005.001.005.057.176.002.005.001.005.06.175.001.005.002.005.061.174.002.005.002.005.063.173.002.005.002.005.065.173.002.005.002.004.067.172.002.005.002.005.07.171.002.005.002.005.072.17.002.005.002.004.074.17.002.005.002.004.076.169.002.004.002.005.078.168.002.004.002.005.08.167.003.004.002.005.082.166.002.004.003.005.02.04.086.136.11.118.13.095.146.07.156.041.16.012.16-.019.155-.048.142-.075.126-.1.105-.123.08-.14.054-.152.024-.16-.006-.16-.036-.158-.051-.123-.018-.034-.078-.158-.074-.155-.074-.16-.071-.157-.07-.16-.068-.16-.067-.165-.062-.158-.062-.164-.059-.161-.058-.166-.056-.166-.053-.164-.052-.168-.05-.167-.048-.17-.045-.165-.043-.168-.043-.172-.039-.17-.037-.17-.036-.172-.033-.17-.03-.173-.03-.174-.027-.17-.025-.175-.022-.174-.021-.175-.018-.175-.017-.173-.014-.176-.012-.176-.01-.177-.007-.176-.006-.177-.003-.178-.001-.177v-.134l-.013-.16-.044-.156-.072-.144-.097-.129-.12-.108-.137-.085-.15-.057-.159-.028zm26.798 2.024l-.16.007-.157.038-.148.066-.132.092-.113.115-.09.134-.062.148-.03.127-.001.004-.023.134-.024.133-.026.133-.026.13-.03.132-.03.129-.032.134-.033.128-.035.13-.037.128-.038.13-.04.126-.04.128-.044.128-.044.126-.046.126-.048.126-.05.125-.05.125-.051.122-.054.123-.055.122-.056.12-.058.122-.06.12-.061.12-.063.119-.062.116-.067.119-.066.116-.069.115-.069.115-.07.113-.073.113-.074.112-.076.113-.077.112-.077.107-.08.11-.08.107-.085.11-.044.056-.088.135-.06.15-.033.158-.002.16.027.16.057.15.083.138.108.12.128.098.144.072.155.045.16.015.161-.016.155-.044.144-.073.128-.098.09-.099.05-.061.003-.004.003-.005.089-.115.003-.004.003-.005.088-.116.003-.004.003-.005.086-.117.003-.004.003-.005.084-.118.003-.004.003-.005.083-.12.003-.004.003-.004.081-.12.003-.005.003-.004.08-.121.003-.005.003-.004.078-.122.003-.005.003-.004.077-.123.002-.005.003-.004.075-.124.003-.005.003-.004.073-.125.003-.005.003-.004.072-.126.002-.004.003-.005.07-.126.003-.005.002-.005.07-.127.002-.004.002-.005.068-.128.002-.005.002-.004.066-.13.003-.004.002-.005.064-.13.002-.004.003-.005.062-.13.002-.005.003-.005.06-.13.003-.005.002-.005.06-.132.002-.005.002-.005.057-.132.003-.005.002-.005.056-.133.002-.005.002-.005.054-.134.002-.004.002-.005.053-.135.002-.005.002-.005.051-.135.002-.005.002-.005.05-.135.001-.005.002-.005.048-.137.001-.005.002-.005.046-.137.002-.005.002-.005.044-.137.002-.005.002-.005.042-.138.002-.005.001-.006.042-.138.001-.005.002-.005.04-.14v-.005l.002-.005.038-.14.001-.005.002-.005.036-.14.001-.005.001-.005.035-.141.001-.005.001-.005.033-.142.001-.005.001-.005.031-.141.001-.006.002-.005.029-.142v-.005l.002-.005.028-.143v-.005l.002-.005.025-.143.001-.006.001-.005.024-.143.001-.005.001-.006.001-.006.01-.161-.02-.16-.05-.154-.077-.141-.102-.125-.123-.104-.141-.079-.153-.051-.16-.022zM6.841 23.019l-.16.024-.152.053-.14.08-.122.105-.101.126-.076.142-.048.154-.018.16.011.161.041.156.07.146.077.109.04.048.003.004.003.004.095.111.003.004.004.004.096.11.004.005.003.004.098.109.003.004.004.004.1.108.003.004.003.004.101.107.004.004.003.004.102.105.004.004.004.004.103.105.004.004.004.003.105.104.003.004.004.003.106.102.004.004.004.004.107.1.004.004.004.004.108.099.004.003.004.004.11.098.003.003.004.004.11.096.004.003.005.004.11.095.005.003.004.004.113.093.004.003.004.004.113.091.004.004.005.003.114.09.004.004.004.003.116.089.004.003.004.003.117.088.004.003.004.003.118.086.004.003.005.003.118.084.004.003.005.003.119.083.004.003.005.003.12.081.005.003.004.003.121.08.005.003.004.003.122.078.005.003.004.003.123.076.005.003.004.003.124.075.005.003.004.003.125.073.004.003.005.002.126.073.004.002.005.003.126.07.005.003.004.002.128.07.004.002.005.002.128.067.005.003.004.002.13.066.004.002.005.003.13.064.004.002.005.003.13.062.005.002.004.003.132.06.004.003.005.002.132.06.005.002.005.002.132.057.005.002.005.002.133.057.005.002.005.002.133.054.005.002.005.002.13.05.154.045.16.016.16-.015.156-.045.144-.072.128-.098.108-.12.083-.138.057-.15.028-.16-.003-.16-.032-.159-.061-.149-.088-.135-.11-.117-.132-.094-.12-.058-.124-.049-.126-.051-.122-.051-.122-.054-.12-.054-.126-.058-.119-.057-.12-.06-.12-.06-.118-.063-.117-.064-.119-.066-.116-.066-.115-.068-.115-.07-.113-.07-.115-.074-.112-.074-.11-.075-.11-.076-.112-.08-.11-.08-.109-.081-.106-.082-.104-.082-.106-.086-.105-.087-.101-.086-.105-.091-.1-.09-.1-.091-.1-.094-.097-.094-.1-.098-.093-.095-.096-.1-.093-.098-.092-.101-.089-.1-.09-.102-.088-.104-.036-.043-.114-.114-.133-.091-.148-.065-.157-.036-.161-.006zm15.063 2.701l-.16.014-.156.044-.12.057-.06.034-.12.066-.117.064-.118.062-.12.061-.12.06-.118.057-.126.058-.12.054-.122.054-.122.05-.126.052-.125.05-.124.046-.127.047-.125.044-.129.043-.126.04-.13.042-.128.038-.127.035-.13.036-.131.034-.129.031-.132.03-.13.03-.135.027-.133.026-.13.023-.13.022-.137.021-.132.02-.134.017-.132.015-.138.015-.135.013-.133.01-.138.01-.136.007-.134.006-.136.004-.14.003-.16.018-.155.047-.142.076-.127.1-.105.122-.08.14-.054.151-.025.16.006.16.035.158.064.148.09.134.114.114.133.092.147.065.157.036.134.008.145-.002h.011l.147-.005h.01l.147-.007h.011l.146-.009h.011l.146-.01h.005l.005-.001.146-.012h.011l.145-.014h.005l.006-.001.145-.016h.011l.144-.018h.006l.005-.001.144-.02h.011l.144-.021.005-.001h.006l.143-.023.006-.001h.005l.143-.025h.005l.006-.002.143-.026h.005l.005-.002.143-.027.005-.001.005-.001.142-.03h.005l.005-.002.142-.03.005-.002.005-.001.142-.033.005-.001.005-.001.14-.035.006-.001.005-.001.14-.037h.005l.005-.002.14-.038.005-.002h.005l.14-.04.005-.002.005-.001.138-.042.005-.001.006-.002.138-.043.005-.001.005-.002.137-.044.005-.002.005-.002.137-.046.005-.002.005-.001.137-.048.005-.002.005-.002.135-.05.005-.001.005-.002.135-.051.005-.002.005-.002.135-.053.005-.002.004-.002.134-.054.005-.002.005-.002.133-.057.005-.002.005-.002.132-.057.005-.003.005-.002.132-.06.005-.001.004-.002.131-.061.005-.003.005-.002.13-.062.005-.003.005-.002.13-.064.004-.003.005-.002.128-.066.005-.002.005-.003.128-.067.005-.002.004-.003.127-.069.005-.002.005-.003.126-.07.005-.003.004-.003.065-.037.132-.093.112-.115.089-.135.062-.149.034-.157.003-.161-.026-.16-.055-.15-.082-.14-.107-.12-.127-.1-.144-.073-.154-.046-.16-.016zM6.33 27.127l-.16.023-.152.053-.14.08-.122.105-.101.126-.076.142-.048.154-.02.16.012.161.041.156.07.146.094.13.096.093.032.026.004.003.004.004.145.117.004.003.004.004.146.115.005.003.004.004.147.113.005.003.004.004.149.111.004.003.004.003.15.11.005.003.004.003.151.108.004.003.005.003.152.106.005.003.004.003.154.104.004.003.005.003.154.102.005.002.004.003.156.1.005.003.004.003.157.098.005.003.004.002.159.096.004.003.005.003.16.094.004.003.004.002.16.092.005.003.005.002.161.09.005.003.005.002.162.088.005.003.004.002.164.086.005.003.004.002.165.084.005.003.004.002.166.082.004.002.005.003.167.08.004.002.005.002.168.078.004.002.005.002.168.076.005.002.005.002.17.074.004.002.005.002.17.072.005.002.005.002.17.07.006.002.005.001.171.068.005.002.005.002.173.065.005.002.005.002.173.063.005.002.005.002.174.06.005.003.005.001.175.06.005.001.005.002.176.057.005.001.005.002.176.055.006.001.005.002.177.052.005.002.005.001.178.05.005.002.005.002.178.048.006.001.005.002.179.046.005.001.005.002.18.044h.005l.005.002.18.042.006.001.005.001.159.035.16.02.16-.01.157-.04.146-.069.13-.094.112-.117.087-.136.06-.149.033-.158.002-.161-.028-.159-.057-.15-.084-.138-.108-.12-.128-.098-.144-.072-.128-.039-.154-.033-.168-.04-.171-.041-.17-.044-.168-.046-.167-.047-.168-.05-.165-.051-.166-.054-.166-.056-.163-.057-.165-.06-.161-.062-.164-.064-.16-.065-.16-.068-.162-.07-.157-.07-.157-.074-.157-.075-.156-.077-.153-.079-.156-.082-.153-.082-.154-.086-.15-.086-.152-.09-.148-.09-.147-.092-.149-.095-.145-.095-.144-.098-.145-.1-.143-.102-.14-.103-.14-.104-.14-.108-.139-.11-.136-.11-.027-.022-.133-.091-.148-.065-.157-.036-.161-.006zm19.215.087l-.16.01-.157.039-.146.067-.11.076-.064.051-.139.11-.14.108-.14.104-.14.103-.143.101-.145.101-.144.098-.145.095-.149.095-.148.093-.147.089-.152.09-.15.086-.154.086-.153.082-.156.082-.153.079-.156.077-.157.075-.158.073-.157.071-.16.07-.16.068-.161.065-.164.064-.161.061-.165.06-.163.058-.166.056-.166.054-.166.051-.167.05-.167.047-.17.046-.168.044-.171.042-.168.039-.17.037-.11.023-.154.047-.143.075-.126.1-.106.122-.081.139-.054.152-.025.16.006.16.035.158.063.148.09.133.114.115.132.092.148.065.157.037.16.007.133-.016.115-.024.005-.001.005-.001.181-.04h.005l.005-.002.18-.042.006-.001.005-.001.18-.044.005-.002.005-.001.18-.046.004-.002h.005l.179-.05h.005l.005-.002.178-.05.005-.002.005-.002.177-.052.005-.002.005-.001.177-.055.005-.002.005-.001.176-.057.005-.002.005-.002.175-.059.005-.001.005-.002.174-.061.005-.002.005-.002.173-.063.005-.002.005-.002.173-.065.004-.002.005-.002.172-.068.005-.002.005-.002.171-.07.005-.001.005-.002.17-.072.005-.002.004-.002.17-.074.005-.002.004-.002.169-.076.004-.002.005-.002.168-.078.004-.002.005-.003.167-.08.004-.002.005-.002.166-.082.004-.002.005-.003.165-.084.004-.002.005-.003.163-.086.005-.002.005-.003.162-.088.005-.002.005-.003.161-.09.005-.002.004-.003.16-.092.005-.003.005-.002.16-.094.004-.003.004-.003.158-.096.005-.002.004-.003.158-.098.004-.003.005-.003.156-.1.004-.003.004-.003.155-.101.005-.003.004-.003.154-.104.004-.003.004-.003.153-.106.004-.003.005-.003.151-.108.004-.003.005-.003.15-.11.004-.003.004-.003.149-.112.004-.003.004-.003.148-.113.004-.004.004-.003.147-.115.004-.004.004-.003.068-.055.116-.113.092-.132.066-.147.038-.157.008-.16-.022-.16-.05-.153-.08-.14-.103-.125-.124-.102-.142-.077-.153-.05-.16-.02z"
})));

function _extends$N() { _extends$N = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$N.apply(this, arguments); }
var IntermediateEventCatchNonInterruptingEscalationIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$N({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M16.012 9.222c-1.673 4.657-2.735 9.508-4.409 14.164 1.536-1.526 2.874-3.236 4.41-4.762l4.408 4.762c-1.497-4.712-2.911-9.451-4.409-14.164zm.032 2.93c.823 2.588 1.599 5.19 2.421 7.777l-2.42-2.614c-.683.598-2.454 2.886-2.34 2.39.871-2.489 1.448-5.07 2.34-7.552zM16.012.312c-1.448.02-2.93.157-4.302.628-.852.447-.255 1.863.66 1.574 2.255-.608 4.648-.607 6.922-.108.934.075 1.228-1.376.338-1.67C18.451.44 17.227.317 16.012.311zm9.012 2.934c-.913-.104-1.272 1.258-.454 1.648 1.834 1.36 3.293 3.185 4.31 5.22.526.776 1.842.098 1.515-.78a15.522 15.522 0 00-5.06-6.006c-.1-.044-.203-.07-.31-.082zM6.65 3.59c-.762.089-1.24.809-1.805 1.267C3.38 6.295 2.163 8.007 1.37 9.905c-.266.898 1.094 1.484 1.564.675a14.825 14.825 0 014.327-5.56c.476-.515.09-1.419-.612-1.431zm9.362.007c-.698.066-1.689-.16-2.033.635-.282.733.535 1.358 1.217 1.125 1.806-.147 3.63.203 5.293.907.902.255 1.472-1.112.656-1.573-1.6-.735-3.374-1.089-5.133-1.094zm-5.479 1.365c-.835.15-1.517.76-2.21 1.226-1.203.94-2.318 2.061-3.057 3.402-.33.904 1.063 1.552 1.547.723 1.045-1.656 2.596-2.925 4.285-3.873.545-.499.171-1.463-.565-1.478zm13.903 2.115c-.875-.07-1.22 1.173-.501 1.627 1.325 1.34 2.188 3.062 2.748 4.84.468.84 1.869.21 1.557-.699-.604-2.118-1.751-4.097-3.351-5.615a.93.93 0 00-.453-.153zM4.467 13.132c-.822-.07-.996.826-1.046 1.455-.256 1.93-.094 3.933.562 5.769.406.844 1.807.365 1.612-.551a11.498 11.498 0 01-.334-5.808.874.874 0 00-.794-.865zm26.687 1.6c-.746-.037-1.014.785-.879 1.395.043 2.393-.57 4.771-1.66 6.894-.31.884 1.02 1.536 1.53.75a15.632 15.632 0 001.821-8.372.876.876 0 00-.812-.667zm-30.197.571c-.782-.073-1.044.775-.933 1.404.068 2.414.661 4.833 1.809 6.962.534.77 1.842.076 1.505-.798a14.833 14.833 0 01-1.603-6.861.876.876 0 00-.778-.707zm26.787 2.024c-.777-.048-.952.797-1.021 1.392-.354 1.692-1.202 3.231-2.216 4.608-.407.872.925 1.638 1.48.852 1.361-1.733 2.296-3.827 2.582-6.017a.874.874 0 00-.825-.835zM6.857 23.012c-.808.018-1.082 1.122-.47 1.59 1.393 1.607 3.187 2.886 5.194 3.599.91.222 1.43-1.165.598-1.596a11.495 11.495 0 01-4.723-3.396.899.899 0 00-.599-.197zm15.057 2.7c-.81.194-1.504.76-2.325.972-1.203.458-2.5.536-3.758.664-.869.307-.573 1.728.346 1.663 2.201-.034 4.412-.626 6.293-1.778.604-.495.227-1.532-.556-1.521zM6.346 27.118c-.833.008-1.11 1.218-.395 1.617 1.986 1.602 4.358 2.749 6.868 3.226.933.076 1.227-1.376.338-1.67a14.838 14.838 0 01-6.345-3.066.929.929 0 00-.466-.107zm19.208.087c-.766.09-1.241.841-1.922 1.158-1.516.991-3.251 1.58-4.996 2.005-.872.405-.346 1.849.584 1.604 2.543-.526 4.98-1.66 6.963-3.344.47-.52.072-1.42-.63-1.423z"
})));

function _extends$M() { _extends$M = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$M.apply(this, arguments); }
var IntermediateEventCatchNonInterruptingMessageIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$M({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M8.742 10.464v11.072h14.516V10.464H8.742zm3.224 1.73h8.066a69569 69569 0 00-4.034 3.22l-4.032-3.22zm9.565 1.018v6.594H10.469v-6.593L16 17.63l5.532-4.419zM16 0h-.005l-.188.001h-.011l-.188.004h-.011l-.187.006h-.011l-.187.008h-.005L15.2.02l-.187.01h-.005l-.005.001-.187.013h-.011L14.62.06h-.01l-.186.018h-.011l-.185.02-.005.001h-.006l-.185.022-.005.001h-.005l-.185.025h-.005l-.005.001-.185.027h-.005l-.005.001-.184.029h-.005l-.005.001-.183.031-.006.001-.005.001-.182.033-.006.001-.005.001-.182.035-.005.001-.005.001-.182.038h-.005l-.005.002-.181.04h-.005l-.005.002-.18.042-.006.001-.005.001-.18.044-.005.002h-.005l-.17.045-.152.054-.139.082-.121.106-.1.127-.074.143-.046.155-.017.16.013.16.043.156.07.145.097.13.119.108.137.085.15.058.159.03.16-.001.133-.023.165-.043.168-.041.171-.04.171-.037.172-.036.17-.033.173-.03.17-.03.177-.027.171-.025.175-.022.175-.02.175-.02.176-.016.175-.014.177-.012.176-.01.177-.007.174-.006.177-.003L16 1.73h.177l.178.004.174.006.177.007.176.01.177.012.175.014.176.017.175.018.175.02.175.023.171.025.176.027.17.03.174.03.17.033.171.036.154.033.16.02.161-.01.156-.04.146-.069.131-.094.111-.117.087-.135.061-.15.032-.158.002-.16-.027-.16-.057-.15L20 .714l-.108-.12-.128-.097-.145-.073-.128-.038-.158-.035-.005-.001-.005-.001L19.14.31h-.005l-.005-.002-.182-.035h-.006l-.005-.002-.182-.033h-.006l-.005-.002-.183-.03-.005-.001-.006-.001-.183-.029h-.005l-.006-.001-.184-.027h-.005l-.005-.001-.185-.024h-.005L17.968.12 17.783.1l-.006-.001h-.005l-.185-.02h-.006l-.005-.001L17.39.06h-.005L17.38.06l-.187-.015h-.005l-.005-.001-.187-.013h-.011L16.8.02h-.011L16.6.01h-.011l-.187-.006h-.011L16.204 0h-.011L16.005 0H16zm9.015 2.935l-.16.004-.158.033-.15.062-.134.09-.116.111-.093.132-.067.147-.038.156-.01.161.022.16.05.153.078.141.103.124.102.087.045.034.142.106.137.105.14.11.136.11.135.112.134.115.134.117.13.115.132.122.128.12.127.122.126.125.124.126.124.128.121.13.118.128.118.132.117.133.113.134.113.136.11.136.109.137.109.142.104.14.103.14.101.142.1.144.099.146.095.145.094.147.093.15.092.15.087.149.087.15.084.152.084.155.08.152.08.155.04.081.084.138.11.119.128.096.145.072.155.043.16.013.16-.016.155-.046.144-.074.127-.099.106-.12.083-.14.055-.151.026-.16-.004-.16-.034-.158-.05-.124-.042-.085-.002-.004-.003-.005-.084-.165-.002-.004-.003-.005-.086-.164-.002-.004-.003-.005-.088-.162-.002-.005-.003-.005-.09-.161-.002-.005-.003-.004-.092-.16-.003-.005-.002-.005-.094-.16-.003-.004-.003-.004-.096-.159-.002-.004-.003-.005-.098-.157-.003-.004-.003-.005-.1-.156-.003-.004-.003-.005-.101-.154-.003-.005-.003-.004-.104-.154-.003-.004-.003-.005-.106-.152-.003-.005-.003-.004-.108-.151-.003-.004-.003-.005-.11-.15-.003-.004-.003-.004-.111-.15-.004-.003-.003-.005-.113-.147-.004-.004-.003-.005-.115-.146-.004-.004-.003-.004-.117-.145-.004-.004-.003-.004-.12-.144-.003-.004-.003-.004-.121-.142-.004-.004-.003-.004-.123-.141-.003-.004-.004-.004-.125-.14-.003-.004-.004-.004-.127-.138-.003-.004-.004-.004-.128-.136-.004-.004-.004-.004-.13-.135-.004-.004-.004-.004-.132-.134-.003-.004-.004-.003-.134-.133-.004-.003-.004-.004-.135-.13-.004-.004-.004-.004-.136-.128-.004-.004-.004-.004-.138-.126-.004-.004-.004-.003-.14-.125-.004-.004-.004-.003-.14-.123-.005-.004-.004-.003-.142-.121-.004-.004-.004-.003-.144-.12-.004-.003-.004-.003-.145-.117-.004-.004-.004-.003-.147-.115-.004-.004-.004-.003-.148-.113-.004-.003-.004-.004-.149-.111-.004-.003-.004-.004-.05-.036-.14-.083-.15-.055-.16-.027zM6.634 3.28l-.161.008-.157.037-.147.066-.111.074-.04.032-.005.003-.004.004-.145.117-.004.003-.004.004-.144.119-.004.003-.004.004-.142.12-.004.004-.004.004-.141.123-.004.003-.004.004-.14.125-.004.003-.004.004-.138.126-.004.004-.004.004-.136.128-.004.004-.004.004-.135.13-.004.004-.004.003-.134.133-.004.003-.004.004-.132.134-.003.004-.004.004-.13.135-.004.004-.004.004-.128.136-.004.004-.004.004-.126.138-.004.004-.003.004-.125.14-.004.004-.003.004-.123.14-.004.005-.003.004-.121.142-.004.004-.003.004-.12.144-.003.004-.003.004-.117.145-.004.004-.003.004-.115.146-.004.005-.003.004-.113.147-.003.005-.004.004-.111.149-.003.004-.004.004-.11.15-.002.005-.003.004-.108.151-.003.004-.003.005-.106.152-.003.005-.003.004-.104.154-.003.004-.003.005-.102.154-.003.005-.002.004-.1.156-.003.005-.003.004-.098.157-.003.005-.003.004-.096.159-.002.004-.003.005-.094.16-.003.004-.002.004-.092.16-.003.005-.003.005-.09.161-.002.005-.003.005-.088.162-.002.005-.003.004-.086.164-.002.005-.002.004-.084.165-.003.005-.002.004-.082.166-.002.004-.003.005-.08.167-.002.004-.002.005-.078.168-.002.004-.002.005-.045.1-.053.153-.023.16.007.16.037.157.065.148.092.132.114.114.134.09.148.064.157.035.161.006.16-.025.152-.054.14-.08.121-.106.1-.126.065-.118.043-.095.074-.16.075-.155.077-.157.08-.155.08-.152.083-.155.085-.152.086-.15.088-.149.091-.15.094-.15.094-.147.095-.145.099-.146.1-.144.1-.142.104-.14.104-.14.11-.142.107-.137.11-.136.114-.136.113-.134.117-.133.118-.132.117-.129.122-.13.124-.127.123-.126.127-.125.127-.122.128-.12.132-.122.13-.115.133-.117.135-.115.135-.111.136-.11.037-.03.117-.11.094-.132.068-.146.04-.156.01-.161-.02-.16-.05-.154-.076-.141-.102-.125-.123-.104-.14-.08-.153-.051-.16-.023zM16 3.286h-.005l-.148.001h-.01l-.147.003h-.011l-.147.005h-.011l-.146.007h-.011l-.146.009h-.011l-.146.01h-.005l-.005.001-.146.012h-.011l-.145.014h-.006l-.005.001-.05.006-.158.031-.15.06-.135.088-.117.111-.094.13-.069.147-.04.156-.01.16.019.16.049.154.076.142.102.125.123.105.14.08.152.051.16.023.134-.003.045-.005.135-.013.133-.01.136-.01.135-.007.137-.006.136-.004.136-.003h.274l.136.003.136.004.136.006.136.007.136.01.133.01.135.013.135.014.135.016.134.018.132.018.134.021.133.023.133.024.133.025.13.027.132.03.132.03.129.031.13.034.129.035.129.036.13.04.126.038.128.042.126.042.128.045.127.047.126.047.12.048.127.051.123.052.006.002.147.048.16.021.16-.009.157-.038.147-.067.131-.093.112-.116.089-.135.062-.149.033-.158.004-.16-.027-.16-.055-.151-.083-.139-.107-.12-.127-.099-.118-.063-.004-.001-.005-.003-.005-.002-.133-.056-.005-.002-.005-.002-.134-.054-.004-.002-.005-.002-.135-.053-.005-.002-.005-.002-.135-.051-.005-.002-.005-.002-.135-.05-.005-.001-.005-.002-.137-.048-.005-.001-.005-.002-.137-.046-.005-.002-.005-.002-.137-.044-.005-.002-.005-.001-.138-.043-.006-.002-.005-.001-.138-.042-.005-.001-.005-.002-.14-.04H19.4l-.005-.002-.14-.038-.005-.001-.005-.002-.14-.036-.005-.001-.005-.001-.141-.035-.005-.001-.005-.001-.142-.033-.005-.001-.005-.001-.142-.031-.005-.002h-.005l-.142-.03-.005-.001-.005-.001-.143-.028h-.005l-.005-.002-.143-.025-.006-.001-.005-.001-.143-.024-.005-.001-.006-.001-.143-.022-.006-.001h-.005l-.144-.022h-.005l-.006-.001-.144-.019h-.005l-.006-.001-.144-.017h-.006l-.005-.001-.145-.016h-.011l-.145-.014H17.1l-.005-.001-.146-.012h-.01l-.146-.01-.006-.001h-.005l-.146-.009h-.011l-.147-.006h-.01l-.147-.005h-.011l-.147-.003h-.011l-.147-.001H16zm-5.482 1.366l-.16.008-.157.037-.123.053-.06.032-.005.002-.004.003-.128.069-.004.002-.005.003-.126.07-.005.003-.004.002-.126.072-.005.003-.004.003-.125.073-.004.003-.005.003-.124.075-.004.003-.005.002-.123.077-.004.003-.005.003-.122.078-.004.003-.005.003-.121.08-.004.002-.005.003-.12.082-.005.003-.004.003-.12.083-.004.003-.004.003-.118.084-.005.003-.004.003-.118.086-.004.003-.004.003-.117.088-.004.003-.004.003-.116.089-.004.003-.004.004-.114.09-.005.003-.004.003-.113.092-.004.004-.004.003-.113.093-.004.004-.004.003-.111.095-.005.003-.004.004-.11.096-.004.004-.004.003-.11.098-.003.003-.004.004-.108.1-.004.003-.004.003-.107.101-.004.004-.004.003-.106.102-.004.004-.003.004-.105.103-.004.004-.004.004-.103.105-.004.004-.004.003-.102.106-.003.004-.004.004-.1.107-.004.004-.004.004-.099.108-.004.004-.003.004-.098.11-.003.003-.004.004-.096.11-.004.005-.003.004-.095.111-.003.004-.004.004-.093.113-.003.004-.004.004-.092.113-.003.004-.003.005-.09.114-.004.004-.003.004-.089.116-.003.004-.003.004-.088.117-.003.004-.003.004-.086.118-.003.004-.003.005-.084.118-.003.004-.003.005-.083.12-.003.003-.003.005-.082.12-.003.005-.002.004-.068.103-.076.142-.048.154-.018.16.011.161.041.156.07.146.095.13.117.11.136.086.15.06.158.03.162.002.158-.03.15-.057.138-.085.119-.109.082-.105.065-.099.075-.11.077-.113.077-.107.08-.11.08-.108.084-.108.083-.105.086-.106.086-.104.088-.104.089-.101.09-.102.093-.101.093-.099.094-.097.095-.096.098-.097.098-.095.099-.093.1-.092.103-.091.101-.089.104-.088.104-.086.106-.086.106-.083.106-.082.109-.082.108-.079.11-.078.11-.076.112-.076.112-.074.113-.072.113-.071.115-.07.115-.068.118-.067.117-.065.12-.065.054-.029.135-.088.116-.111.094-.132.068-.146.04-.156.009-.161-.02-.16-.05-.153-.078-.142-.102-.125-.123-.103-.141-.079-.153-.051-.16-.022zm13.91 2.116l-.162.008-.157.037-.147.066-.132.092-.113.116-.09.134-.063.148-.034.157-.005.162.025.159.055.152.082.138.086.103.09.09.094.098.092.099.093.1.091.103.089.101.088.104.086.104.086.106.083.105.083.108.08.108.081.11.077.107.077.112.075.111.075.114.072.113.071.113.07.114.068.118.067.115.065.118.064.117.062.117.061.121.059.119.059.122.056.121.054.12.055.125.051.123.051.125.048.123.048.127.047.126.044.125.043.128.042.129.039.126.038.13.022.076.058.15.085.137.11.119.129.096.145.07.155.043.16.013.161-.017.154-.046.144-.075.126-.1.106-.12.082-.14.055-.151.025-.16-.005-.16-.026-.132-.023-.082-.002-.005-.001-.005-.042-.139-.001-.005-.002-.005-.043-.138-.001-.005-.002-.005-.044-.137-.002-.005-.002-.005-.046-.137-.002-.005-.001-.005-.048-.137-.002-.005-.002-.005-.05-.135-.001-.005-.002-.005-.051-.135-.002-.005-.002-.005-.053-.135-.002-.005-.002-.005-.054-.133-.002-.005-.002-.005-.057-.133-.002-.005-.002-.005-.057-.132-.003-.005-.002-.005-.06-.132-.001-.005-.002-.004-.061-.132-.003-.004-.002-.005-.063-.13-.002-.005-.002-.005-.064-.13-.003-.004-.002-.005-.066-.129-.002-.004-.003-.005-.067-.128-.002-.005-.003-.004-.069-.128-.002-.004-.003-.005-.07-.126-.003-.005-.003-.004-.072-.126-.002-.005-.003-.004-.074-.125-.002-.004-.003-.005-.075-.124-.003-.004-.003-.005-.076-.123-.003-.004-.003-.005-.078-.122-.003-.004-.003-.005-.08-.121-.003-.004-.003-.005-.081-.12-.003-.005-.003-.004-.083-.12-.003-.004-.003-.004-.084-.118-.003-.005-.003-.004-.086-.118-.003-.004-.004-.004-.087-.117-.003-.004-.003-.004-.09-.116-.002-.004-.004-.004-.09-.114-.003-.005-.004-.004-.091-.113-.004-.004-.003-.004-.094-.113-.003-.004-.003-.004-.095-.111-.004-.004-.003-.004-.096-.11-.004-.005-.003-.004-.098-.11-.004-.003-.003-.004-.1-.108-.003-.004-.004-.004-.1-.107-.004-.004-.004-.004-.102-.106-.003-.003-.004-.004-.093-.095-.124-.103-.14-.08-.153-.05-.16-.023zM4.45 12.826l-.161.002-.158.032-.15.06-.135.088-.118.11-.094.131-.069.146-.035.129-.026.132v.005l-.002.005-.025.143-.001.005-.001.006-.024.143-.001.005-.001.006-.022.143-.001.006-.001.005-.02.144-.001.005-.001.005-.019.145v.005l-.001.006-.017.144v.006l-.001.005-.016.145v.011l-.014.145v.005l-.001.006-.012.146v.01l-.01.146-.001.006v.005l-.009.146v.011l-.007.146v.011l-.004.147v.011l-.003.147v.01l-.002.148v.01l.001.148v.01l.003.147v.011l.005.147v.01l.007.147v.011l.009.146v.011l.01.146v.01l.013.146v.011l.014.145v.005l.001.006.016.145v.011l.018.144v.006l.001.005.019.144v.006l.001.005.021.144v.005l.002.006.022.143v.006l.002.005.024.143v.005l.002.006.025.143.001.005.001.005.028.143.001.005.001.005.03.142v.005l.002.006.03.141.002.005.001.005.033.142v.005l.002.005.035.14v.006l.002.005.036.14.002.005.001.005.038.14.001.005.002.005.04.14v.005l.002.005.042.138.001.006.002.005.042.138.002.005.002.005.017.054.064.148.09.134.114.114.132.092.148.065.157.037.16.007.16-.023.153-.052.14-.08.123-.104.102-.125.076-.142.049-.153.02-.16-.011-.161-.031-.13-.017-.051-.039-.126-.038-.13-.037-.128-.035-.13-.033-.128-.033-.134-.03-.13-.029-.131-.026-.13-.026-.133-.024-.133-.023-.133-.02-.132-.02-.136-.017-.132-.016-.135-.014-.135-.012-.133-.012-.138-.009-.133-.007-.136-.006-.138-.004-.134-.003-.136v-.274l.003-.136.004-.134.006-.139.007-.136.01-.133.01-.138.013-.132.014-.135.016-.135.017-.132.02-.137.02-.13.023-.134.024-.133.024-.126.016-.16-.014-.161-.044-.155-.072-.145-.098-.128-.12-.108-.137-.084-.15-.057-.16-.029zm26.698 1.601l-.161.01-.157.04-.146.067-.131.093-.112.117-.088.135-.061.149-.033.157-.005.134.006.14.006.176.003.177.001.178-.001.177-.003.178-.006.177-.007.176-.01.177-.012.176-.015.176-.016.173-.018.175-.02.175-.024.174-.025.175-.026.17-.03.174-.03.173-.033.17-.036.172-.037.17-.04.17-.042.172-.043.168-.045.166-.048.169-.05.167-.052.168-.053.164-.056.166-.058.166-.06.16-.062.165-.062.158-.066.165-.068.16-.07.16-.07.158-.075.159-.074.155-.079.158-.08.158-.06.15-.03.158-.001.161.029.159.058.15.085.137.108.119.13.097.144.07.156.044.16.013.16-.017.155-.046.143-.074.127-.1.107-.12.07-.115.083-.164.003-.005.002-.004.082-.166.002-.005.003-.004.08-.167.002-.005.002-.004.078-.168.002-.005.002-.004.076-.169.002-.004.002-.005.074-.17.002-.004.002-.005.072-.17.002-.005.002-.005.07-.171.001-.005.002-.005.068-.172.002-.004.002-.005.065-.173.002-.005.002-.005.063-.173.002-.005.002-.005.06-.174.003-.005.001-.005.06-.175.001-.005.002-.005.057-.176.001-.005.002-.005.055-.177.001-.005.002-.005.052-.177.002-.005.001-.005.051-.178.001-.005.002-.005.048-.179.002-.005v-.005l.047-.179.001-.005.002-.005.044-.18v-.005l.002-.005.042-.18.001-.006.001-.005.04-.181.001-.005.001-.005.037-.182.002-.005v-.005l.036-.182v-.006l.002-.005.033-.182v-.006l.002-.005.03-.183.001-.005.001-.005.029-.184v-.005l.001-.006.027-.184v-.005l.001-.005.024-.185v-.005l.001-.005.022-.185v-.006l.001-.005.02-.185v-.006l.001-.005.017-.186v-.005l.001-.005.015-.187v-.005l.001-.005.013-.187v-.01l.01-.187.001-.006v-.005l.009-.187v-.011l.006-.187v-.011l.004-.188v-.011l.001-.188v-.01l-.001-.188v-.011l-.004-.188v-.011l-.006-.187v-.011l-.007-.145-.022-.16-.05-.152-.08-.141-.103-.124-.125-.102-.141-.077-.153-.05-.16-.02zM.938 15L.777 15l-.158.032-.15.06-.136.087-.117.11-.095.131-.068.146-.04.156-.012.133-.001.14v.01l.001.188v.011l.004.188v.011l.006.187v.011l.008.187v.011l.011.187v.005l.001.005.013.187v.01l.016.187v.01l.018.186v.011l.02.185.001.005v.006l.022.185.001.005v.005l.025.185v.005l.001.005.027.184v.006l.001.005.029.184v.005l.001.005.031.183.001.005.001.006.033.182.001.005.001.006.035.182.001.005.001.005.038.182v.005l.002.005.04.181v.005l.002.005.042.18.001.006.001.005.044.18.002.005v.005l.047.18.001.004.002.005.048.179.002.005.001.005.05.178.002.005.001.005.053.177.002.005.001.005.055.177.002.005.001.005.057.176.002.005.001.005.06.175.001.005.002.005.061.174.002.005.002.005.063.173.002.005.002.005.065.173.002.005.002.004.067.172.002.005.002.005.07.171.002.005.002.005.072.17.002.005.002.004.074.17.002.005.002.004.076.169.002.004.002.005.078.168.002.004.002.005.08.167.003.004.002.005.082.166.002.004.003.005.02.04.086.136.11.118.13.095.146.07.156.041.16.012.16-.019.155-.048.142-.075.126-.1.105-.123.08-.14.054-.152.024-.16-.006-.16-.036-.158-.051-.123-.018-.034-.078-.158L3.1 22.1l-.074-.16-.071-.157-.07-.16-.068-.16-.067-.165-.062-.158-.062-.164-.059-.161-.058-.166-.056-.166-.053-.164-.052-.168-.05-.167-.048-.17-.045-.165-.043-.168-.043-.172-.039-.17-.037-.17-.036-.172-.033-.17-.03-.173-.03-.174-.027-.17-.025-.175-.022-.174-.021-.175-.018-.175-.017-.173-.014-.176-.012-.176-.01-.177-.007-.176-.006-.177-.003-.178L1.73 16v-.134l-.013-.16-.044-.156-.072-.144-.097-.129-.12-.108-.137-.085-.15-.057L.938 15zm26.798 2.024l-.16.007-.157.038-.148.066-.132.092-.113.115-.09.134-.062.148-.03.127-.001.004-.023.134-.024.133-.026.133-.026.13-.03.132-.03.129-.032.134-.033.128-.035.13-.037.128-.038.13-.04.126-.04.128-.044.128-.044.126-.046.126-.048.126-.05.125-.05.125-.051.122-.054.123-.055.122-.056.12-.058.122-.06.12-.061.12-.063.119-.062.116-.067.119-.066.116-.069.115-.069.115-.07.113-.073.113-.074.112-.076.113-.077.112-.077.107-.08.11-.08.107-.085.11-.044.056-.088.135-.06.15-.033.158-.002.16.027.16.057.15.083.138.108.12.128.098.144.072.155.045.16.015.161-.016.155-.044.144-.073.128-.098.09-.099.05-.061.003-.004.003-.005.089-.115.003-.004.003-.005.088-.116.003-.004.003-.005.086-.117.003-.004.003-.005.084-.118.003-.004.003-.005.083-.12.003-.004.003-.004.081-.12.003-.005.003-.004.08-.121.003-.005.003-.004.078-.122.003-.005.003-.004.077-.123.002-.005.003-.004.075-.124.003-.005.003-.004.073-.125.003-.005.003-.004.072-.126.002-.004.003-.005.07-.126.003-.005.002-.005.07-.127.002-.004.002-.005.068-.128.002-.005.002-.004.066-.13.003-.004.002-.005.064-.13.002-.004.003-.005.062-.13.002-.005.003-.005.06-.13.003-.005.002-.005.06-.132.002-.005.002-.005.057-.132.003-.005.002-.005.056-.133.002-.005.002-.005.054-.134.002-.004.002-.005.053-.135.002-.005.002-.005.051-.135.002-.005.002-.005.05-.135.001-.005.002-.005.048-.137.001-.005.002-.005.046-.137.002-.005.002-.005.044-.137.002-.005.002-.005.042-.138.002-.005.001-.006.042-.138.001-.005.002-.005.04-.14V19.4l.002-.005.038-.14.001-.005.002-.005.036-.14.001-.005.001-.005.035-.141.001-.005.001-.005.033-.142.001-.005.001-.005.031-.141.001-.006.002-.005.029-.142v-.005l.002-.005.028-.143v-.005l.002-.005.025-.143.001-.006.001-.005.024-.143.001-.005.001-.006.001-.006.01-.161-.02-.16-.05-.154-.077-.141-.102-.125-.123-.104-.141-.079-.153-.051-.16-.022zM6.841 22.71l-.16.024-.152.053-.14.08-.122.105-.101.126-.076.142-.048.154-.018.16.011.161.041.156.07.146.077.109.04.048.003.004.003.004.095.111.003.004.004.004.096.11.004.005.003.004.098.109.003.004.004.004.1.108.003.004.003.004.101.107.004.004.003.004.102.105.004.004.004.004.103.105.004.004.004.003.105.104.003.004.004.003.106.102.004.004.004.004.107.1.004.004.004.004.108.099.004.003.004.004.11.098.003.003.004.004.11.096.004.003.005.004.11.095.005.003.004.004.113.093.004.003.004.004.113.091.004.004.005.003.114.09.004.004.004.003.116.089.004.003.004.003.117.088.004.003.004.003.118.086.004.003.005.003.118.084.004.003.005.003.119.083.004.003.005.003.12.081.005.003.004.003.121.08.005.003.004.003.122.078.005.003.004.003.123.076.005.003.004.003.124.075.005.003.004.003.125.073.004.003.005.002.126.073.004.002.005.003.126.07.005.003.004.002.128.07.004.002.005.002.128.067.005.003.004.002.13.066.004.002.005.003.13.064.004.002.005.003.13.062.005.002.004.003.132.06.004.003.005.002.132.06.005.002.005.002.132.057.005.002.005.002.133.057.005.002.005.002.133.054.005.002.005.002.13.05.154.045.16.016.16-.015.156-.045.144-.072.128-.098.108-.12.083-.138.057-.15.028-.16-.003-.16-.032-.159-.061-.149-.088-.135-.11-.117-.132-.094-.12-.058-.124-.049-.126-.051-.122-.051-.122-.054-.12-.054-.126-.058-.119-.057-.12-.06-.12-.06-.118-.063-.117-.064-.119-.066-.116-.066-.115-.068-.115-.07-.113-.07-.115-.074-.112-.074-.11-.075-.11-.076-.112-.08-.11-.08-.109-.081-.106-.082-.104-.082-.106-.086-.105-.087-.101-.086-.105-.091-.1-.09-.1-.091-.1-.094-.097-.094-.1-.098-.093-.095-.096-.1-.093-.098-.092-.101-.089-.1-.09-.102-.088-.104-.036-.043-.114-.114-.133-.091-.148-.065-.157-.036-.161-.006zm15.063 2.701l-.16.014-.156.044-.12.057-.06.034-.12.066-.117.064-.118.062-.12.061-.12.06-.118.057-.126.058-.12.054-.122.054-.122.05-.126.052-.125.05-.124.046-.127.047-.125.044-.129.043-.126.04-.13.042-.128.038-.127.035-.13.036-.131.034-.129.031-.132.03-.13.03-.135.027-.133.026-.13.023-.13.022-.137.021-.132.02-.134.017-.132.015-.138.015-.135.013-.133.01-.138.01-.136.007-.134.006-.136.004-.14.003-.16.018-.155.047-.142.076-.127.1-.105.122-.08.14-.054.151-.025.16.006.16.035.158.064.148.09.134.114.114.133.092.147.065.157.036.134.008.145-.002h.011l.147-.005h.01l.147-.007h.011l.146-.009h.011l.146-.01h.005l.005-.001.146-.012h.011l.145-.014h.005l.006-.001.145-.016h.011l.144-.018h.006l.005-.001.144-.02h.011l.144-.021.005-.001h.006l.143-.023.006-.001h.005l.143-.025h.005l.006-.002.143-.026h.005l.005-.002.143-.027.005-.001.005-.001.142-.03h.005l.005-.002.142-.03.005-.002.005-.001.142-.033.005-.001.005-.001.14-.035.006-.001.005-.001.14-.037h.005l.005-.002.14-.038.005-.002h.005l.14-.04.005-.002.005-.001.138-.042.005-.001.006-.002.138-.043.005-.001.005-.002.137-.044.005-.002.005-.002.137-.046.005-.002.005-.001.137-.048.005-.002.005-.002.135-.05.005-.001.005-.002.135-.051.005-.002.005-.002.135-.053.005-.002.004-.002.134-.054.005-.002.005-.002.133-.057.005-.002.005-.002.132-.057.005-.003.005-.002.132-.06.005-.001.004-.002.131-.061.005-.003.005-.002.13-.062.005-.003.005-.002.13-.064.004-.003.005-.002.128-.066.005-.002.005-.003.128-.067.005-.002.004-.003.127-.069.005-.002.005-.003.126-.07.005-.003.004-.003.065-.037.132-.093.112-.115.089-.135.062-.149.034-.157.003-.161-.026-.16-.055-.15-.082-.14-.107-.12-.127-.1-.144-.073-.154-.046-.16-.016zM6.33 26.818l-.16.023-.152.053-.14.08-.122.105-.101.126-.076.142-.048.154-.02.16.012.161.041.156.07.146.094.13.096.093.032.026.004.003.004.004.145.117.004.003.004.004.146.115.005.003.004.004.147.113.005.003.004.004.149.111.004.003.004.003.15.11.005.003.004.003.151.108.004.003.005.003.152.106.005.003.004.003.154.104.004.003.005.003.154.102.005.002.004.003.156.1.005.003.004.003.157.098.005.003.004.002.159.096.004.003.005.003.16.094.004.003.004.002.16.092.005.003.005.002.161.09.005.003.005.002.162.088.005.003.004.002.164.086.005.003.004.002.165.084.005.003.004.002.166.082.004.002.005.003.167.08.004.002.005.002.168.078.004.002.005.002.168.076.005.002.005.002.17.074.004.002.005.002.17.072.005.002.005.002.17.07.006.002.005.001.171.068.005.002.005.002.173.065.005.002.005.002.173.063.005.002.005.002.174.06.005.003.005.001.175.06.005.001.005.002.176.057.005.001.005.002.176.055.006.001.005.002.177.052.005.002.005.001.178.05.005.002.005.002.178.048.006.001.005.002.179.046.005.001.005.002.18.044h.005l.005.002.18.042.006.001.005.001.159.035.16.02.16-.01.157-.04.146-.069.13-.094.112-.117.087-.136.06-.149.033-.158.002-.161-.028-.159-.057-.15-.084-.138-.108-.12-.128-.098-.144-.072-.128-.039-.154-.033-.168-.04-.171-.041-.17-.044-.168-.046-.167-.047-.168-.05-.165-.051-.166-.054-.166-.056-.163-.057-.165-.06-.161-.062-.164-.064-.16-.065-.16-.068-.162-.07-.157-.07-.157-.074-.157-.075-.156-.077-.153-.079-.156-.082-.153-.082-.154-.086-.15-.086-.152-.09-.148-.09-.147-.092-.149-.095-.145-.095-.144-.098-.145-.1-.143-.102-.14-.103-.14-.104-.14-.108-.139-.11-.136-.11-.027-.022-.133-.091-.148-.065-.157-.036-.161-.006zm19.215.087l-.16.01-.157.039-.146.067-.11.076-.064.051-.139.11-.14.108-.14.104-.14.103-.143.101-.145.101-.144.098-.145.095-.149.095-.148.093-.147.089-.152.09-.15.086-.154.086-.153.082-.156.082-.153.079-.156.077-.157.075-.158.073-.157.071-.16.07-.16.068-.161.065-.164.064-.161.061-.165.06-.163.058-.166.056-.166.054-.166.051-.167.05-.167.047-.17.046-.168.044-.171.042-.168.039-.17.037-.11.023-.154.047-.143.075-.126.1-.106.122-.081.139-.054.152-.025.16.006.16.035.158.063.148.09.133.114.115.132.092.148.065.157.037.16.007.133-.016.115-.024.005-.001.005-.001.181-.04h.005l.005-.002.18-.042.006-.001.005-.001.18-.044.005-.002.005-.001.18-.046.004-.002h.005l.179-.05h.005l.005-.002.178-.05.005-.002.005-.002.177-.052.005-.002.005-.001.177-.055.005-.002.005-.001.176-.057.005-.002.005-.002.175-.059.005-.001.005-.002.174-.061.005-.002.005-.002.173-.063.005-.002.005-.002.173-.065.004-.002.005-.002.172-.068.005-.002.005-.002.171-.07.005-.001.005-.002.17-.072.005-.002.004-.002.17-.074.005-.002.004-.002.169-.076.004-.002.005-.002.168-.078.004-.002.005-.003.167-.08.004-.002.005-.002.166-.082.004-.002.005-.003.165-.084.004-.002.005-.003.163-.086.005-.002.005-.003.162-.088.005-.002.005-.003.161-.09.005-.002.004-.003.16-.092.005-.003.005-.002.16-.094.004-.003.004-.003.158-.096.005-.002.004-.003.158-.098.004-.003.005-.003.156-.1.004-.003.004-.003.155-.101.005-.003.004-.003.154-.104.004-.003.004-.003.153-.106.004-.003.005-.003.151-.108.004-.003.005-.003.15-.11.004-.003.004-.003.149-.112.004-.003.004-.003.148-.113.004-.004.004-.003.147-.115.004-.004.004-.003.068-.055.116-.113.092-.132.066-.147.038-.157.008-.16-.022-.16-.05-.153-.08-.14-.103-.125-.124-.102-.142-.077-.153-.05-.16-.02z"
})));

function _extends$L() { _extends$L = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$L.apply(this, arguments); }
var IntermediateEventCatchNonInterruptingMultipleIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$L({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M23.637 13.902l-7.625-5.535-7.624 5.535 2.912 8.956h9.425l2.912-8.956zm-1.017.33l-2.524 7.762H11.93l-2.524-7.762 6.607-4.796 6.608 4.796zM16.012.311c-1.448.02-2.93.157-4.302.628-.852.447-.255 1.863.66 1.574 2.255-.608 4.648-.607 6.922-.108.934.075 1.228-1.376.338-1.67C18.451.44 17.227.317 16.012.311zm9.012 2.934c-.913-.104-1.272 1.258-.454 1.648 1.834 1.36 3.293 3.185 4.31 5.22.526.776 1.842.098 1.515-.78a15.522 15.522 0 00-5.06-6.006c-.1-.044-.203-.07-.31-.082zM6.65 3.59c-.762.089-1.24.809-1.805 1.267C3.38 6.295 2.163 8.007 1.37 9.905c-.266.898 1.094 1.484 1.564.675a14.825 14.825 0 014.327-5.56c.476-.515.09-1.419-.612-1.431zm9.362.007c-.698.066-1.689-.16-2.033.635-.282.733.535 1.358 1.217 1.125 1.806-.147 3.63.203 5.293.907.902.255 1.472-1.112.656-1.573-1.6-.735-3.374-1.089-5.133-1.094zm-5.479 1.365c-.835.15-1.517.76-2.21 1.226-1.203.94-2.318 2.061-3.057 3.402-.33.904 1.063 1.552 1.547.723 1.045-1.656 2.596-2.925 4.285-3.873.545-.499.171-1.463-.565-1.478zm13.903 2.115c-.875-.07-1.22 1.173-.501 1.627 1.325 1.34 2.188 3.062 2.748 4.84.468.84 1.869.21 1.557-.699-.604-2.118-1.751-4.097-3.351-5.615a.93.93 0 00-.453-.153zM4.467 13.132c-.822-.07-.996.826-1.046 1.455-.256 1.93-.094 3.933.562 5.769.406.844 1.807.365 1.612-.551a11.498 11.498 0 01-.334-5.808.874.874 0 00-.794-.865zm26.687 1.6c-.746-.037-1.014.785-.879 1.395.043 2.393-.57 4.771-1.66 6.894-.31.884 1.02 1.536 1.53.75a15.632 15.632 0 001.821-8.372.876.876 0 00-.812-.667zm-30.197.571c-.782-.073-1.044.775-.933 1.404.068 2.414.661 4.833 1.809 6.962.534.77 1.842.076 1.505-.798a14.833 14.833 0 01-1.603-6.861.876.876 0 00-.778-.707zm26.787 2.024c-.777-.048-.952.797-1.021 1.392-.354 1.692-1.202 3.231-2.216 4.608-.407.872.925 1.638 1.48.852 1.361-1.733 2.296-3.827 2.582-6.017a.874.874 0 00-.825-.835zM6.857 23.012c-.808.018-1.082 1.122-.47 1.59 1.393 1.607 3.187 2.886 5.194 3.599.91.222 1.43-1.165.598-1.596a11.495 11.495 0 01-4.723-3.396.899.899 0 00-.599-.197zm15.057 2.7c-.81.194-1.504.76-2.325.972-1.203.458-2.5.536-3.758.664-.869.307-.573 1.728.346 1.663 2.201-.034 4.412-.626 6.293-1.778.604-.495.227-1.532-.556-1.521zM6.346 27.118c-.833.008-1.11 1.218-.395 1.617 1.986 1.602 4.358 2.749 6.868 3.226.933.076 1.227-1.376.338-1.67a14.838 14.838 0 01-6.345-3.066.929.929 0 00-.466-.107zm19.208.087c-.766.09-1.241.841-1.922 1.158-1.516.991-3.251 1.58-4.996 2.005-.872.405-.346 1.849.584 1.604 2.543-.526 4.98-1.66 6.963-3.344.47-.52.072-1.42-.63-1.423z"
})));

function _extends$K() { _extends$K = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$K.apply(this, arguments); }
var IntermediateEventCatchNonInterruptingParallelIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$K({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M13.51 9.081v4.428H9.08v4.982h4.428v4.428h4.982V18.49h4.428v-4.982H18.49V9.081h-4.982zm.83.83h3.32v4.428h4.429v3.322H17.66v4.428h-3.32v-4.454H9.91v-3.296h4.428V9.911zM16 0h-.005l-.188.001h-.011l-.188.004h-.011l-.187.006h-.011l-.187.008h-.005L15.2.02l-.187.01h-.005l-.005.001-.187.013h-.011L14.62.06h-.01l-.186.018h-.011l-.185.02-.005.001h-.006l-.185.022-.005.001h-.005l-.185.025h-.005l-.005.001-.185.027h-.005l-.005.001-.184.029h-.005l-.005.001-.183.031-.006.001-.005.001-.182.033-.006.001-.005.001-.182.035-.005.001-.005.001-.182.038h-.005l-.005.002-.181.04h-.005l-.005.002-.18.042-.006.001-.005.001-.18.044-.005.002h-.005l-.17.045-.152.054-.139.082-.121.106-.1.127-.074.143-.046.155-.017.16.013.16.043.156.07.145.097.13.119.108.137.085.15.058.159.03.16-.001.133-.023.165-.043.168-.041.171-.04.171-.037.172-.036.17-.033.173-.03.17-.03.177-.027.171-.025.175-.022.175-.02.175-.02.176-.016.175-.014.177-.012.176-.01.177-.007.174-.006.177-.003L16 1.73h.177l.178.004.174.006.177.007.176.01.177.012.175.014.176.017.175.018.175.02.175.023.171.025.176.027.17.03.174.03.17.033.171.036.154.033.16.02.161-.01.156-.04.146-.069.131-.094.111-.117.087-.135.061-.15.032-.158.002-.16-.027-.16-.057-.15L20 .714l-.108-.12-.128-.097-.145-.073-.128-.038-.158-.035-.005-.001-.005-.001L19.14.31h-.005l-.005-.002-.182-.035h-.006l-.005-.002-.182-.033h-.006l-.005-.002-.183-.03-.005-.001-.006-.001-.183-.029h-.005l-.006-.001-.184-.027h-.005l-.005-.001-.185-.024h-.005L17.968.12 17.783.1l-.006-.001h-.005l-.185-.02h-.006l-.005-.001L17.39.06h-.005L17.38.06l-.187-.015h-.005l-.005-.001-.187-.013h-.011L16.8.02h-.011L16.6.01h-.011l-.187-.006h-.011L16.204 0h-.011L16.005 0H16zm9.015 2.935l-.16.004-.158.033-.15.062-.134.09-.116.111-.093.132-.067.147-.038.156-.01.161.022.16.05.153.078.141.103.124.102.087.045.034.142.106.137.105.14.11.136.11.135.112.134.115.134.117.13.115.132.122.128.12.127.122.126.125.124.126.124.128.121.13.118.128.118.132.117.133.113.134.113.136.11.136.109.137.109.142.104.14.103.14.101.142.1.144.099.146.095.145.094.147.093.15.092.15.087.149.087.15.084.152.084.155.08.152.08.155.04.081.084.138.11.119.128.096.145.072.155.043.16.013.16-.016.155-.046.144-.074.127-.099.106-.12.083-.14.055-.151.026-.16-.004-.16-.034-.158-.05-.124-.042-.085-.002-.004-.003-.005-.084-.165-.002-.004-.003-.005-.086-.164-.002-.004-.003-.005-.088-.162-.002-.005-.003-.005-.09-.161-.002-.005-.003-.004-.092-.16-.003-.005-.002-.005-.094-.16-.003-.004-.003-.004-.096-.159-.002-.004-.003-.005-.098-.157-.003-.004-.003-.005-.1-.156-.003-.004-.003-.005-.101-.154-.003-.005-.003-.004-.104-.154-.003-.004-.003-.005-.106-.152-.003-.005-.003-.004-.108-.151-.003-.004-.003-.005-.11-.15-.003-.004-.003-.004-.111-.15-.004-.003-.003-.005-.113-.147-.004-.004-.003-.005-.115-.146-.004-.004-.003-.004-.117-.145-.004-.004-.003-.004-.12-.144-.003-.004-.003-.004-.121-.142-.004-.004-.003-.004-.123-.141-.003-.004-.004-.004-.125-.14-.003-.004-.004-.004-.127-.138-.003-.004-.004-.004-.128-.136-.004-.004-.004-.004-.13-.135-.004-.004-.004-.004-.132-.134-.003-.004-.004-.003-.134-.133-.004-.003-.004-.004-.135-.13-.004-.004-.004-.004-.136-.128-.004-.004-.004-.004-.138-.126-.004-.004-.004-.003-.14-.125-.004-.004-.004-.003-.14-.123-.005-.004-.004-.003-.142-.121-.004-.004-.004-.003-.144-.12-.004-.003-.004-.003-.145-.117-.004-.004-.004-.003-.147-.115-.004-.004-.004-.003-.148-.113-.004-.003-.004-.004-.149-.111-.004-.003-.004-.004-.05-.036-.14-.083-.15-.055-.16-.027zM6.634 3.28l-.161.008-.157.037-.147.066-.111.074-.04.032-.005.003-.004.004-.145.117-.004.003-.004.004-.144.119-.004.003-.004.004-.142.12-.004.004-.004.004-.141.123-.004.003-.004.004-.14.125-.004.003-.004.004-.138.126-.004.004-.004.004-.136.128-.004.004-.004.004-.135.13-.004.004-.004.003-.134.133-.004.003-.004.004-.132.134-.003.004-.004.004-.13.135-.004.004-.004.004-.128.136-.004.004-.004.004-.126.138-.004.004-.003.004-.125.14-.004.004-.003.004-.123.14-.004.005-.003.004-.121.142-.004.004-.003.004-.12.144-.003.004-.003.004-.117.145-.004.004-.003.004-.115.146-.004.005-.003.004-.113.147-.003.005-.004.004-.111.149-.003.004-.004.004-.11.15-.002.005-.003.004-.108.151-.003.004-.003.005-.106.152-.003.005-.003.004-.104.154-.003.004-.003.005-.102.154-.003.005-.002.004-.1.156-.003.005-.003.004-.098.157-.003.005-.003.004-.096.159-.002.004-.003.005-.094.16-.003.004-.002.004-.092.16-.003.005-.003.005-.09.161-.002.005-.003.005-.088.162-.002.005-.003.004-.086.164-.002.005-.002.004-.084.165-.003.005-.002.004-.082.166-.002.004-.003.005-.08.167-.002.004-.002.005-.078.168-.002.004-.002.005-.045.1-.053.153-.023.16.007.16.037.157.065.148.092.132.114.114.134.09.148.064.157.035.161.006.16-.025.152-.054.14-.08.121-.106.1-.126.065-.118.043-.095.074-.16.075-.155.077-.157.08-.155.08-.152.083-.155.085-.152.086-.15.088-.149.091-.15.094-.15.094-.147.095-.145.099-.146.1-.144.1-.142.104-.14.104-.14.11-.142.107-.137.11-.136.114-.136.113-.134.117-.133.118-.132.117-.129.122-.13.124-.127.123-.126.127-.125.127-.122.128-.12.132-.122.13-.115.133-.117.135-.115.135-.111.136-.11.037-.03.117-.11.094-.132.068-.146.04-.156.01-.161-.02-.16-.05-.154-.076-.141-.102-.125-.123-.104-.14-.08-.153-.051-.16-.023zM16 3.286h-.005l-.148.001h-.01l-.147.003h-.011l-.147.005h-.011l-.146.007h-.011l-.146.009h-.011l-.146.01h-.005l-.005.001-.146.012h-.011l-.145.014h-.006l-.005.001-.05.006-.158.031-.15.06-.135.088-.117.111-.094.13-.069.147-.04.156-.01.16.019.16.049.154.076.142.102.125.123.105.14.08.152.051.16.023.134-.003.045-.005.135-.013.133-.01.136-.01.135-.007.137-.006.136-.004.136-.003h.274l.136.003.136.004.136.006.136.007.136.01.133.01.135.013.135.014.135.016.134.018.132.018.134.021.133.023.133.024.133.025.13.027.132.03.132.03.129.031.13.034.129.035.129.036.13.04.126.038.128.042.126.042.128.045.127.047.126.047.12.048.127.051.123.052.006.002.147.048.16.021.16-.009.157-.038.147-.067.131-.093.112-.116.089-.135.062-.149.033-.158.004-.16-.027-.16-.055-.151-.083-.139-.107-.12-.127-.099-.118-.063-.004-.001-.005-.003-.005-.002-.133-.056-.005-.002-.005-.002-.134-.054-.004-.002-.005-.002-.135-.053-.005-.002-.005-.002-.135-.051-.005-.002-.005-.002-.135-.05-.005-.001-.005-.002-.137-.048-.005-.001-.005-.002-.137-.046-.005-.002-.005-.002-.137-.044-.005-.002-.005-.001-.138-.043-.006-.002-.005-.001-.138-.042-.005-.001-.005-.002-.14-.04H19.4l-.005-.002-.14-.038-.005-.001-.005-.002-.14-.036-.005-.001-.005-.001-.141-.035-.005-.001-.005-.001-.142-.033-.005-.001-.005-.001-.142-.031-.005-.002h-.005l-.142-.03-.005-.001-.005-.001-.143-.028h-.005l-.005-.002-.143-.025-.006-.001-.005-.001-.143-.024-.005-.001-.006-.001-.143-.022-.006-.001h-.005l-.144-.022h-.005l-.006-.001-.144-.019h-.005l-.006-.001-.144-.017h-.006l-.005-.001-.145-.016h-.011l-.145-.014H17.1l-.005-.001-.146-.012h-.01l-.146-.01-.006-.001h-.005l-.146-.009h-.011l-.147-.006h-.01l-.147-.005h-.011l-.147-.003h-.011l-.147-.001H16zm-5.482 1.366l-.16.008-.157.037-.123.053-.06.032-.005.002-.004.003-.128.069-.004.002-.005.003-.126.07-.005.003-.004.002-.126.072-.005.003-.004.003-.125.073-.004.003-.005.003-.124.075-.004.003-.005.002-.123.077-.004.003-.005.003-.122.078-.004.003-.005.003-.121.08-.004.002-.005.003-.12.082-.005.003-.004.003-.12.083-.004.003-.004.003-.118.084-.005.003-.004.003-.118.086-.004.003-.004.003-.117.088-.004.003-.004.003-.116.089-.004.003-.004.004-.114.09-.005.003-.004.003-.113.092-.004.004-.004.003-.113.093-.004.004-.004.003-.111.095-.005.003-.004.004-.11.096-.004.004-.004.003-.11.098-.003.003-.004.004-.108.1-.004.003-.004.003-.107.101-.004.004-.004.003-.106.102-.004.004-.003.004-.105.103-.004.004-.004.004-.103.105-.004.004-.004.003-.102.106-.003.004-.004.004-.1.107-.004.004-.004.004-.099.108-.004.004-.003.004-.098.11-.003.003-.004.004-.096.11-.004.005-.003.004-.095.111-.003.004-.004.004-.093.113-.003.004-.004.004-.092.113-.003.004-.003.005-.09.114-.004.004-.003.004-.089.116-.003.004-.003.004-.088.117-.003.004-.003.004-.086.118-.003.004-.003.005-.084.118-.003.004-.003.005-.083.12-.003.003-.003.005-.082.12-.003.005-.002.004-.068.103-.076.142-.048.154-.018.16.011.161.041.156.07.146.095.13.117.11.136.086.15.06.158.03.162.002.158-.03.15-.057.138-.085.119-.109.082-.105.065-.099.075-.11.077-.113.077-.107.08-.11.08-.108.084-.108.083-.105.086-.106.086-.104.088-.104.089-.101.09-.102.093-.101.093-.099.094-.097.095-.096.098-.097.098-.095.099-.093.1-.092.103-.091.101-.089.104-.088.104-.086.106-.086.106-.083.106-.082.109-.082.108-.079.11-.078.11-.076.112-.076.112-.074.113-.072.113-.071.115-.07.115-.068.118-.067.117-.065.12-.065.054-.029.135-.088.116-.111.094-.132.068-.146.04-.156.009-.161-.02-.16-.05-.153-.078-.142-.102-.125-.123-.103-.141-.079-.153-.051-.16-.022zm13.91 2.116l-.162.008-.157.037-.147.066-.132.092-.113.116-.09.134-.063.148-.034.157-.005.162.025.159.055.152.082.138.086.103.09.09.094.098.092.099.093.1.091.103.089.101.088.104.086.104.086.106.083.105.083.108.08.108.081.11.077.107.077.112.075.111.075.114.072.113.071.113.07.114.068.118.067.115.065.118.064.117.062.117.061.121.059.119.059.122.056.121.054.12.055.125.051.123.051.125.048.123.048.127.047.126.044.125.043.128.042.129.039.126.038.13.022.076.058.15.085.137.11.119.129.096.145.07.155.043.16.013.161-.017.154-.046.144-.075.126-.1.106-.12.082-.14.055-.151.025-.16-.005-.16-.026-.132-.023-.082-.002-.005-.001-.005-.042-.139-.001-.005-.002-.005-.043-.138-.001-.005-.002-.005-.044-.137-.002-.005-.002-.005-.046-.137-.002-.005-.001-.005-.048-.137-.002-.005-.002-.005-.05-.135-.001-.005-.002-.005-.051-.135-.002-.005-.002-.005-.053-.135-.002-.005-.002-.005-.054-.133-.002-.005-.002-.005-.057-.133-.002-.005-.002-.005-.057-.132-.003-.005-.002-.005-.06-.132-.001-.005-.002-.004-.061-.132-.003-.004-.002-.005-.063-.13-.002-.005-.002-.005-.064-.13-.003-.004-.002-.005-.066-.129-.002-.004-.003-.005-.067-.128-.002-.005-.003-.004-.069-.128-.002-.004-.003-.005-.07-.126-.003-.005-.003-.004-.072-.126-.002-.005-.003-.004-.074-.125-.002-.004-.003-.005-.075-.124-.003-.004-.003-.005-.076-.123-.003-.004-.003-.005-.078-.122-.003-.004-.003-.005-.08-.121-.003-.004-.003-.005-.081-.12-.003-.005-.003-.004-.083-.12-.003-.004-.003-.004-.084-.118-.003-.005-.003-.004-.086-.118-.003-.004-.004-.004-.087-.117-.003-.004-.003-.004-.09-.116-.002-.004-.004-.004-.09-.114-.003-.005-.004-.004-.091-.113-.004-.004-.003-.004-.094-.113-.003-.004-.003-.004-.095-.111-.004-.004-.003-.004-.096-.11-.004-.005-.003-.004-.098-.11-.004-.003-.003-.004-.1-.108-.003-.004-.004-.004-.1-.107-.004-.004-.004-.004-.102-.106-.003-.003-.004-.004-.093-.095-.124-.103-.14-.08-.153-.05-.16-.023zM4.45 12.826l-.161.002-.158.032-.15.06-.135.088-.118.11-.094.131-.069.146-.035.129-.026.132v.005l-.002.005-.025.143-.001.005-.001.006-.024.143-.001.005-.001.006-.022.143-.001.006-.001.005-.02.144-.001.005-.001.005-.019.145v.005l-.001.006-.017.144v.006l-.001.005-.016.145v.011l-.014.145v.005l-.001.006-.012.146v.01l-.01.146-.001.006v.005l-.009.146v.011l-.007.146v.011l-.004.147v.011l-.003.147v.01l-.002.148v.01l.001.148v.01l.003.147v.011l.005.147v.01l.007.147v.011l.009.146v.011l.01.146v.01l.013.146v.011l.014.145v.005l.001.006.016.145v.011l.018.144v.006l.001.005.019.144v.006l.001.005.021.144v.005l.002.006.022.143v.006l.002.005.024.143v.005l.002.006.025.143.001.005.001.005.028.143.001.005.001.005.03.142v.005l.002.006.03.141.002.005.001.005.033.142v.005l.002.005.035.14v.006l.002.005.036.14.002.005.001.005.038.14.001.005.002.005.04.14v.005l.002.005.042.138.001.006.002.005.042.138.002.005.002.005.017.054.064.148.09.134.114.114.132.092.148.065.157.037.16.007.16-.023.153-.052.14-.08.123-.104.102-.125.076-.142.049-.153.02-.16-.011-.161-.031-.13-.017-.051-.039-.126-.038-.13-.037-.128-.035-.13-.033-.128-.033-.134-.03-.13-.029-.131-.026-.13-.026-.133-.024-.133-.023-.133-.02-.132-.02-.136-.017-.132-.016-.135-.014-.135-.012-.133-.012-.138-.009-.133-.007-.136-.006-.138-.004-.134-.003-.136v-.274l.003-.136.004-.134.006-.139.007-.136.01-.133.01-.138.013-.132.014-.135.016-.135.017-.132.02-.137.02-.13.023-.134.024-.133.024-.126.016-.16-.014-.161-.044-.155-.072-.145-.098-.128-.12-.108-.137-.084-.15-.057-.16-.029zm26.698 1.601l-.161.01-.157.04-.146.067-.131.093-.112.117-.088.135-.061.149-.033.157-.005.134.006.14.006.176.003.177.001.178-.001.177-.003.178-.006.177-.007.176-.01.177-.012.176-.015.176-.016.173-.018.175-.02.175-.024.174-.025.175-.026.17-.03.174-.03.173-.033.17-.036.172-.037.17-.04.17-.042.172-.043.168-.045.166-.048.169-.05.167-.052.168-.053.164-.056.166-.058.166-.06.16-.062.165-.062.158-.066.165-.068.16-.07.16-.07.158-.075.159-.074.155-.079.158-.08.158-.06.15-.03.158-.001.161.029.159.058.15.085.137.108.119.13.097.144.07.156.044.16.013.16-.017.155-.046.143-.074.127-.1.107-.12.07-.115.083-.164.003-.005.002-.004.082-.166.002-.005.003-.004.08-.167.002-.005.002-.004.078-.168.002-.005.002-.004.076-.169.002-.004.002-.005.074-.17.002-.004.002-.005.072-.17.002-.005.002-.005.07-.171.001-.005.002-.005.068-.172.002-.004.002-.005.065-.173.002-.005.002-.005.063-.173.002-.005.002-.005.06-.174.003-.005.001-.005.06-.175.001-.005.002-.005.057-.176.001-.005.002-.005.055-.177.001-.005.002-.005.052-.177.002-.005.001-.005.051-.178.001-.005.002-.005.048-.179.002-.005v-.005l.047-.179.001-.005.002-.005.044-.18v-.005l.002-.005.042-.18.001-.006.001-.005.04-.181.001-.005.001-.005.037-.182.002-.005v-.005l.036-.182v-.006l.002-.005.033-.182v-.006l.002-.005.03-.183.001-.005.001-.005.029-.184v-.005l.001-.006.027-.184v-.005l.001-.005.024-.185v-.005l.001-.005.022-.185v-.006l.001-.005.02-.185v-.006l.001-.005.017-.186v-.005l.001-.005.015-.187v-.005l.001-.005.013-.187v-.01l.01-.187.001-.006v-.005l.009-.187v-.011l.006-.187v-.011l.004-.188v-.011l.001-.188v-.01l-.001-.188v-.011l-.004-.188v-.011l-.006-.187v-.011l-.007-.145-.022-.16-.05-.152-.08-.141-.103-.124-.125-.102-.141-.077-.153-.05-.16-.02zM.938 15L.777 15l-.158.032-.15.06-.136.087-.117.11-.095.131-.068.146-.04.156-.012.133-.001.14v.01l.001.188v.011l.004.188v.011l.006.187v.011l.008.187v.011l.011.187v.005l.001.005.013.187v.01l.016.187v.01l.018.186v.011l.02.185.001.005v.006l.022.185.001.005v.005l.025.185v.005l.001.005.027.184v.006l.001.005.029.184v.005l.001.005.031.183.001.005.001.006.033.182.001.005.001.006.035.182.001.005.001.005.038.182v.005l.002.005.04.181v.005l.002.005.042.18.001.006.001.005.044.18.002.005v.005l.047.18.001.004.002.005.048.179.002.005.001.005.05.178.002.005.001.005.053.177.002.005.001.005.055.177.002.005.001.005.057.176.002.005.001.005.06.175.001.005.002.005.061.174.002.005.002.005.063.173.002.005.002.005.065.173.002.005.002.004.067.172.002.005.002.005.07.171.002.005.002.005.072.17.002.005.002.004.074.17.002.005.002.004.076.169.002.004.002.005.078.168.002.004.002.005.08.167.003.004.002.005.082.166.002.004.003.005.02.04.086.136.11.118.13.095.146.07.156.041.16.012.16-.019.155-.048.142-.075.126-.1.105-.123.08-.14.054-.152.024-.16-.006-.16-.036-.158-.051-.123-.018-.034-.078-.158L3.1 22.1l-.074-.16-.071-.157-.07-.16-.068-.16-.067-.165-.062-.158-.062-.164-.059-.161-.058-.166-.056-.166-.053-.164-.052-.168-.05-.167-.048-.17-.045-.165-.043-.168-.043-.172-.039-.17-.037-.17-.036-.172-.033-.17-.03-.173-.03-.174-.027-.17-.025-.175-.022-.174-.021-.175-.018-.175-.017-.173-.014-.176-.012-.176-.01-.177-.007-.176-.006-.177-.003-.178L1.73 16v-.134l-.013-.16-.044-.156-.072-.144-.097-.129-.12-.108-.137-.085-.15-.057L.938 15zm26.798 2.024l-.16.007-.157.038-.148.066-.132.092-.113.115-.09.134-.062.148-.03.127-.001.004-.023.134-.024.133-.026.133-.026.13-.03.132-.03.129-.032.134-.033.128-.035.13-.037.128-.038.13-.04.126-.04.128-.044.128-.044.126-.046.126-.048.126-.05.125-.05.125-.051.122-.054.123-.055.122-.056.12-.058.122-.06.12-.061.12-.063.119-.062.116-.067.119-.066.116-.069.115-.069.115-.07.113-.073.113-.074.112-.076.113-.077.112-.077.107-.08.11-.08.107-.085.11-.044.056-.088.135-.06.15-.033.158-.002.16.027.16.057.15.083.138.108.12.128.098.144.072.155.045.16.015.161-.016.155-.044.144-.073.128-.098.09-.099.05-.061.003-.004.003-.005.089-.115.003-.004.003-.005.088-.116.003-.004.003-.005.086-.117.003-.004.003-.005.084-.118.003-.004.003-.005.083-.12.003-.004.003-.004.081-.12.003-.005.003-.004.08-.121.003-.005.003-.004.078-.122.003-.005.003-.004.077-.123.002-.005.003-.004.075-.124.003-.005.003-.004.073-.125.003-.005.003-.004.072-.126.002-.004.003-.005.07-.126.003-.005.002-.005.07-.127.002-.004.002-.005.068-.128.002-.005.002-.004.066-.13.003-.004.002-.005.064-.13.002-.004.003-.005.062-.13.002-.005.003-.005.06-.13.003-.005.002-.005.06-.132.002-.005.002-.005.057-.132.003-.005.002-.005.056-.133.002-.005.002-.005.054-.134.002-.004.002-.005.053-.135.002-.005.002-.005.051-.135.002-.005.002-.005.05-.135.001-.005.002-.005.048-.137.001-.005.002-.005.046-.137.002-.005.002-.005.044-.137.002-.005.002-.005.042-.138.002-.005.001-.006.042-.138.001-.005.002-.005.04-.14V19.4l.002-.005.038-.14.001-.005.002-.005.036-.14.001-.005.001-.005.035-.141.001-.005.001-.005.033-.142.001-.005.001-.005.031-.141.001-.006.002-.005.029-.142v-.005l.002-.005.028-.143v-.005l.002-.005.025-.143.001-.006.001-.005.024-.143.001-.005.001-.006.001-.006.01-.161-.02-.16-.05-.154-.077-.141-.102-.125-.123-.104-.141-.079-.153-.051-.16-.022zM6.841 22.71l-.16.024-.152.053-.14.08-.122.105-.101.126-.076.142-.048.154-.018.16.011.161.041.156.07.146.077.109.04.048.003.004.003.004.095.111.003.004.004.004.096.11.004.005.003.004.098.109.003.004.004.004.1.108.003.004.003.004.101.107.004.004.003.004.102.105.004.004.004.004.103.105.004.004.004.003.105.104.003.004.004.003.106.102.004.004.004.004.107.1.004.004.004.004.108.099.004.003.004.004.11.098.003.003.004.004.11.096.004.003.005.004.11.095.005.003.004.004.113.093.004.003.004.004.113.091.004.004.005.003.114.09.004.004.004.003.116.089.004.003.004.003.117.088.004.003.004.003.118.086.004.003.005.003.118.084.004.003.005.003.119.083.004.003.005.003.12.081.005.003.004.003.121.08.005.003.004.003.122.078.005.003.004.003.123.076.005.003.004.003.124.075.005.003.004.003.125.073.004.003.005.002.126.073.004.002.005.003.126.07.005.003.004.002.128.07.004.002.005.002.128.067.005.003.004.002.13.066.004.002.005.003.13.064.004.002.005.003.13.062.005.002.004.003.132.06.004.003.005.002.132.06.005.002.005.002.132.057.005.002.005.002.133.057.005.002.005.002.133.054.005.002.005.002.13.05.154.045.16.016.16-.015.156-.045.144-.072.128-.098.108-.12.083-.138.057-.15.028-.16-.003-.16-.032-.159-.061-.149-.088-.135-.11-.117-.132-.094-.12-.058-.124-.049-.126-.051-.122-.051-.122-.054-.12-.054-.126-.058-.119-.057-.12-.06-.12-.06-.118-.063-.117-.064-.119-.066-.116-.066-.115-.068-.115-.07-.113-.07-.115-.074-.112-.074-.11-.075-.11-.076-.112-.08-.11-.08-.109-.081-.106-.082-.104-.082-.106-.086-.105-.087-.101-.086-.105-.091-.1-.09-.1-.091-.1-.094-.097-.094-.1-.098-.093-.095-.096-.1-.093-.098-.092-.101-.089-.1-.09-.102-.088-.104-.036-.043-.114-.114-.133-.091-.148-.065-.157-.036-.161-.006zm15.063 2.701l-.16.014-.156.044-.12.057-.06.034-.12.066-.117.064-.118.062-.12.061-.12.06-.118.057-.126.058-.12.054-.122.054-.122.05-.126.052-.125.05-.124.046-.127.047-.125.044-.129.043-.126.04-.13.042-.128.038-.127.035-.13.036-.131.034-.129.031-.132.03-.13.03-.135.027-.133.026-.13.023-.13.022-.137.021-.132.02-.134.017-.132.015-.138.015-.135.013-.133.01-.138.01-.136.007-.134.006-.136.004-.14.003-.16.018-.155.047-.142.076-.127.1-.105.122-.08.14-.054.151-.025.16.006.16.035.158.064.148.09.134.114.114.133.092.147.065.157.036.134.008.145-.002h.011l.147-.005h.01l.147-.007h.011l.146-.009h.011l.146-.01h.005l.005-.001.146-.012h.011l.145-.014h.005l.006-.001.145-.016h.011l.144-.018h.006l.005-.001.144-.02h.011l.144-.021.005-.001h.006l.143-.023.006-.001h.005l.143-.025h.005l.006-.002.143-.026h.005l.005-.002.143-.027.005-.001.005-.001.142-.03h.005l.005-.002.142-.03.005-.002.005-.001.142-.033.005-.001.005-.001.14-.035.006-.001.005-.001.14-.037h.005l.005-.002.14-.038.005-.002h.005l.14-.04.005-.002.005-.001.138-.042.005-.001.006-.002.138-.043.005-.001.005-.002.137-.044.005-.002.005-.002.137-.046.005-.002.005-.001.137-.048.005-.002.005-.002.135-.05.005-.001.005-.002.135-.051.005-.002.005-.002.135-.053.005-.002.004-.002.134-.054.005-.002.005-.002.133-.057.005-.002.005-.002.132-.057.005-.003.005-.002.132-.06.005-.001.004-.002.131-.061.005-.003.005-.002.13-.062.005-.003.005-.002.13-.064.004-.003.005-.002.128-.066.005-.002.005-.003.128-.067.005-.002.004-.003.127-.069.005-.002.005-.003.126-.07.005-.003.004-.003.065-.037.132-.093.112-.115.089-.135.062-.149.034-.157.003-.161-.026-.16-.055-.15-.082-.14-.107-.12-.127-.1-.144-.073-.154-.046-.16-.016zM6.33 26.818l-.16.023-.152.053-.14.08-.122.105-.101.126-.076.142-.048.154-.02.16.012.161.041.156.07.146.094.13.096.093.032.026.004.003.004.004.145.117.004.003.004.004.146.115.005.003.004.004.147.113.005.003.004.004.149.111.004.003.004.003.15.11.005.003.004.003.151.108.004.003.005.003.152.106.005.003.004.003.154.104.004.003.005.003.154.102.005.002.004.003.156.1.005.003.004.003.157.098.005.003.004.002.159.096.004.003.005.003.16.094.004.003.004.002.16.092.005.003.005.002.161.09.005.003.005.002.162.088.005.003.004.002.164.086.005.003.004.002.165.084.005.003.004.002.166.082.004.002.005.003.167.08.004.002.005.002.168.078.004.002.005.002.168.076.005.002.005.002.17.074.004.002.005.002.17.072.005.002.005.002.17.07.006.002.005.001.171.068.005.002.005.002.173.065.005.002.005.002.173.063.005.002.005.002.174.06.005.003.005.001.175.06.005.001.005.002.176.057.005.001.005.002.176.055.006.001.005.002.177.052.005.002.005.001.178.05.005.002.005.002.178.048.006.001.005.002.179.046.005.001.005.002.18.044h.005l.005.002.18.042.006.001.005.001.159.035.16.02.16-.01.157-.04.146-.069.13-.094.112-.117.087-.136.06-.149.033-.158.002-.161-.028-.159-.057-.15-.084-.138-.108-.12-.128-.098-.144-.072-.128-.039-.154-.033-.168-.04-.171-.041-.17-.044-.168-.046-.167-.047-.168-.05-.165-.051-.166-.054-.166-.056-.163-.057-.165-.06-.161-.062-.164-.064-.16-.065-.16-.068-.162-.07-.157-.07-.157-.074-.157-.075-.156-.077-.153-.079-.156-.082-.153-.082-.154-.086-.15-.086-.152-.09-.148-.09-.147-.092-.149-.095-.145-.095-.144-.098-.145-.1-.143-.102-.14-.103-.14-.104-.14-.108-.139-.11-.136-.11-.027-.022-.133-.091-.148-.065-.157-.036-.161-.006zm19.215.087l-.16.01-.157.039-.146.067-.11.076-.064.051-.139.11-.14.108-.14.104-.14.103-.143.101-.145.101-.144.098-.145.095-.149.095-.148.093-.147.089-.152.09-.15.086-.154.086-.153.082-.156.082-.153.079-.156.077-.157.075-.158.073-.157.071-.16.07-.16.068-.161.065-.164.064-.161.061-.165.06-.163.058-.166.056-.166.054-.166.051-.167.05-.167.047-.17.046-.168.044-.171.042-.168.039-.17.037-.11.023-.154.047-.143.075-.126.1-.106.122-.081.139-.054.152-.025.16.006.16.035.158.063.148.09.133.114.115.132.092.148.065.157.037.16.007.133-.016.115-.024.005-.001.005-.001.181-.04h.005l.005-.002.18-.042.006-.001.005-.001.18-.044.005-.002.005-.001.18-.046.004-.002h.005l.179-.05h.005l.005-.002.178-.05.005-.002.005-.002.177-.052.005-.002.005-.001.177-.055.005-.002.005-.001.176-.057.005-.002.005-.002.175-.059.005-.001.005-.002.174-.061.005-.002.005-.002.173-.063.005-.002.005-.002.173-.065.004-.002.005-.002.172-.068.005-.002.005-.002.171-.07.005-.001.005-.002.17-.072.005-.002.004-.002.17-.074.005-.002.004-.002.169-.076.004-.002.005-.002.168-.078.004-.002.005-.003.167-.08.004-.002.005-.002.166-.082.004-.002.005-.003.165-.084.004-.002.005-.003.163-.086.005-.002.005-.003.162-.088.005-.002.005-.003.161-.09.005-.002.004-.003.16-.092.005-.003.005-.002.16-.094.004-.003.004-.003.158-.096.005-.002.004-.003.158-.098.004-.003.005-.003.156-.1.004-.003.004-.003.155-.101.005-.003.004-.003.154-.104.004-.003.004-.003.153-.106.004-.003.005-.003.151-.108.004-.003.005-.003.15-.11.004-.003.004-.003.149-.112.004-.003.004-.003.148-.113.004-.004.004-.003.147-.115.004-.004.004-.003.068-.055.116-.113.092-.132.066-.147.038-.157.008-.16-.022-.16-.05-.153-.08-.14-.103-.125-.124-.102-.142-.077-.153-.05-.16-.02z",
  opacity: ".98"
})));

function _extends$J() { _extends$J = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$J.apply(this, arguments); }
var IntermediateEventCatchNonInterruptingSignalIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$J({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M16.012 8.816L9.21 21.026h13.606l-6.803-12.21zm0 1.776l5.332 9.57H10.681l5.331-9.57zm0-10.281c-1.448.02-2.93.157-4.302.628-.852.447-.255 1.863.66 1.574 2.255-.608 4.648-.607 6.922-.108.934.075 1.228-1.376.338-1.67C18.451.44 17.227.317 16.012.311zm9.012 2.934c-.913-.104-1.272 1.258-.454 1.648 1.834 1.36 3.293 3.185 4.31 5.22.526.776 1.842.098 1.515-.78a15.522 15.522 0 00-5.06-6.006c-.1-.044-.203-.07-.31-.082zM6.65 3.59c-.762.089-1.24.809-1.805 1.267C3.38 6.295 2.163 8.007 1.37 9.905c-.266.898 1.094 1.484 1.564.675a14.825 14.825 0 014.327-5.56c.476-.515.09-1.419-.612-1.431zm9.362.007c-.698.066-1.689-.16-2.033.635-.282.733.535 1.358 1.217 1.125 1.806-.147 3.63.203 5.293.907.902.255 1.472-1.112.656-1.573-1.6-.735-3.374-1.089-5.133-1.094zm-5.479 1.365c-.835.15-1.517.76-2.21 1.226-1.203.94-2.318 2.061-3.057 3.402-.33.904 1.063 1.552 1.547.723 1.045-1.656 2.596-2.925 4.285-3.873.545-.499.171-1.463-.565-1.478zm13.903 2.115c-.875-.07-1.22 1.173-.501 1.627 1.325 1.34 2.188 3.062 2.748 4.84.468.84 1.869.21 1.557-.699-.604-2.118-1.751-4.097-3.351-5.615a.93.93 0 00-.453-.153zM4.467 13.132c-.822-.07-.996.826-1.046 1.455-.256 1.93-.094 3.933.562 5.769.406.844 1.807.365 1.612-.551a11.498 11.498 0 01-.334-5.808.874.874 0 00-.794-.865zm26.687 1.6c-.746-.037-1.014.785-.879 1.395.043 2.393-.57 4.771-1.66 6.894-.31.884 1.02 1.536 1.53.75a15.632 15.632 0 001.821-8.372.876.876 0 00-.812-.667zm-30.197.571c-.782-.073-1.044.775-.933 1.404.068 2.414.661 4.833 1.809 6.962.534.77 1.842.076 1.505-.798a14.833 14.833 0 01-1.603-6.861.876.876 0 00-.778-.707zm26.787 2.024c-.777-.048-.952.797-1.021 1.392-.354 1.692-1.202 3.231-2.216 4.608-.407.872.925 1.638 1.48.852 1.361-1.733 2.296-3.827 2.582-6.017a.874.874 0 00-.825-.835zM6.857 23.012c-.808.018-1.082 1.122-.47 1.59 1.393 1.607 3.187 2.886 5.194 3.599.91.222 1.43-1.165.598-1.596a11.495 11.495 0 01-4.723-3.396.899.899 0 00-.599-.197zm15.057 2.7c-.81.194-1.504.76-2.325.972-1.203.458-2.5.536-3.758.664-.869.307-.573 1.728.346 1.663 2.201-.034 4.412-.626 6.293-1.778.604-.495.227-1.532-.556-1.521zM6.346 27.118c-.833.008-1.11 1.218-.395 1.617 1.986 1.602 4.358 2.749 6.868 3.226.933.076 1.227-1.376.338-1.67a14.838 14.838 0 01-6.345-3.066.929.929 0 00-.466-.107zm19.208.087c-.766.09-1.241.841-1.922 1.158-1.516.991-3.251 1.58-4.996 2.005-.872.405-.346 1.849.584 1.604 2.543-.526 4.98-1.66 6.963-3.344.47-.52.072-1.42-.63-1.423z"
})));

function _extends$I() { _extends$I = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$I.apply(this, arguments); }
var IntermediateEventCatchNonInterruptingTimerIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$I({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.998 8.406c-3.018-.041-5.92 1.926-7.031 4.727-1.138 2.695-.51 6.012 1.537 8.103 1.99 2.141 5.268 2.93 8.014 1.927 2.878-.98 4.992-3.827 5.068-6.87.153-2.957-1.624-5.88-4.3-7.137a7.552 7.552 0 00-3.288-.75zm0 1.384c2.759-.052 5.373 1.973 6.015 4.655.704 2.578-.482 5.517-2.791 6.867-2.358 1.48-5.682 1.086-7.618-.918-2.043-1.971-2.407-5.381-.84-7.745 1.11-1.763 3.15-2.88 5.234-2.86zm1.962 1.765l-2.074 3.762c-.64.068-.793 1.04-.202 1.3.39.27.696-.18 1.052-.165h3.17v-.865h-3.182l1.993-3.615c-.252-.14-.505-.278-.757-.417zm-1.965-8.268h-.158l-.147.003h-.011l-.147.005h-.011l-.146.007h-.011l-.146.009h-.011l-.146.01h-.005l-.005.001-.146.012h-.011l-.145.014h-.006l-.005.001-.05.006-.158.031-.15.06-.135.088-.117.111-.094.13-.069.147-.04.156-.01.16.019.16.049.154.076.142.102.125.123.105.14.08.152.051.16.023.134-.003.045-.005.135-.013.133-.01.136-.01.135-.007.137-.006.136-.004.136-.003h.274l.136.003.136.004.136.006.136.007.136.01.133.01.135.013.135.014.135.016.134.018.132.018.134.021.133.023.133.024.133.025.13.027.132.03.132.03.129.031.13.034.129.035.129.036.13.04.126.038.128.042.126.042.128.045.127.047.126.048.12.047.127.051.123.052.006.002.147.048.16.021.16-.009.157-.038.147-.067.131-.093.112-.116.089-.135.062-.149.033-.158.004-.16-.027-.16-.055-.151-.083-.138-.107-.121-.127-.099-.118-.063-.004-.001-.005-.003-.005-.002-.133-.056-.005-.002-.005-.002-.134-.054-.004-.002-.005-.002-.135-.053-.005-.002-.005-.002-.135-.051-.005-.002-.005-.002-.135-.05-.005-.001-.005-.002-.137-.048-.005-.001-.005-.002-.137-.046-.005-.002-.005-.002-.137-.044-.005-.002-.005-.001-.138-.043-.005-.002-.006-.001-.138-.042-.005-.001-.005-.002-.14-.04H19.4l-.005-.002-.14-.038-.005-.001-.005-.002-.14-.036-.005-.001-.005-.001-.141-.035-.005-.001-.005-.001-.142-.033-.005-.001-.005-.001-.141-.031-.006-.002h-.005l-.142-.03-.005-.001-.005-.001-.143-.028h-.005l-.005-.001-.143-.026-.006-.001-.005-.001-.143-.024-.005-.001-.006-.001-.143-.022-.006-.001h-.005l-.144-.022h-.005l-.006-.001-.144-.019h-.005l-.006-.001-.144-.017h-.006l-.005-.001-.145-.016h-.011l-.145-.014H17.1l-.005-.001-.146-.012h-.01l-.146-.01-.006-.001h-.005l-.146-.009h-.011l-.147-.006h-.01l-.147-.005h-.011l-.147-.003h-.01l-.148-.001h-.01zM10.357 4.66l-.156.037-.123.053-.06.032-.005.002-.004.003-.128.069-.004.002-.005.003-.126.07-.005.003-.004.002-.126.072-.005.003-.004.003-.125.073-.004.003-.005.003-.124.075-.004.003-.005.002-.123.077-.004.003-.005.003-.122.078-.004.003-.005.003-.121.08-.004.002-.005.003-.12.082-.005.003-.004.003-.12.083-.004.003-.004.003-.118.084-.005.003-.004.003-.118.086-.004.003-.004.003-.117.088-.004.003-.004.003-.116.089-.004.003-.004.004-.114.09-.005.003-.004.003-.113.092-.004.004-.004.003-.113.093-.004.004-.004.003-.111.095-.004.003-.005.004-.11.096-.004.004-.004.003-.109.098-.004.003-.004.004-.108.1-.004.003-.004.003-.107.101-.004.004-.004.003-.106.102-.003.004-.004.004-.105.103-.004.004-.004.004-.103.105-.004.004-.004.003-.102.106-.003.004-.004.004-.1.107-.004.004-.004.004-.099.108-.004.004-.003.004-.098.11-.003.003-.004.004-.096.11-.004.005-.003.004-.095.111-.003.004-.004.004-.093.113-.003.004-.004.004-.092.113-.003.004-.003.005-.09.114-.004.004-.003.004-.089.116-.003.004-.003.004-.088.117-.003.004-.003.005-.086.117-.003.004-.003.005-.084.118-.003.004-.003.005-.083.12-.003.003-.003.005-.082.12-.003.005-.002.004-.068.103-.076.142-.048.154-.018.16.011.161.041.156.07.146.095.13.117.11.136.086.15.06.158.03.162.002.158-.029.15-.058.138-.085.119-.108.082-.106.065-.099.075-.11.077-.113.077-.107.08-.11.08-.108.084-.108.083-.105.086-.106.086-.104.088-.104.089-.101.09-.102.093-.101.093-.099.094-.097.095-.096.098-.097.098-.095.099-.093.1-.092.103-.091.101-.089.104-.088.104-.086.106-.086.106-.083.106-.082.109-.082.108-.079.11-.078.11-.076.112-.076.112-.074.113-.072.113-.071.115-.07.115-.068.118-.067.117-.065.12-.065.054-.029.135-.088.116-.111.094-.132.068-.146.04-.156.009-.161-.02-.16-.05-.153-.078-.142-.102-.125-.123-.103-.141-.079-.153-.051-.16-.022-.16.008zm13.91 2.116l-.158.037-.147.066-.132.092-.113.116-.09.134-.063.148-.034.157-.005.162.026.159.054.152.082.139.086.102.09.09.094.098.093.099.092.1.091.103.089.101.088.104.086.104.086.106.083.105.083.108.08.108.081.11.077.107.077.112.075.111.075.114.072.113.071.113.07.115.068.117.067.115.065.118.064.117.062.118.061.12.059.119.059.122.056.121.054.12.055.125.051.123.051.125.048.123.049.127.046.126.044.125.043.128.042.129.039.126.038.13.022.076.058.15.086.137.109.119.129.096.145.07.155.043.16.013.161-.017.155-.046.143-.074.126-.1.106-.122.082-.138.055-.152.025-.16-.005-.16-.026-.132-.023-.082-.002-.005-.001-.005-.042-.139-.001-.005-.002-.005-.043-.138-.001-.005-.002-.005-.044-.137-.002-.005-.002-.005-.046-.137-.002-.005-.001-.005-.048-.137-.002-.005-.002-.005-.05-.135-.001-.005-.002-.005-.051-.135-.002-.005-.002-.005-.053-.135-.002-.005-.002-.005-.054-.133-.002-.005-.002-.005-.057-.133-.002-.005-.002-.005-.057-.132-.003-.005-.002-.005-.059-.132-.002-.005-.002-.004-.061-.132-.003-.004-.002-.005-.062-.13-.003-.005-.002-.005-.064-.13-.003-.004-.002-.005-.066-.129-.002-.004-.003-.005-.067-.128-.002-.005-.003-.004-.069-.128-.002-.004-.003-.005-.07-.126-.003-.005-.003-.004-.072-.126-.002-.005-.003-.004-.073-.125-.003-.004-.003-.005-.075-.124-.003-.004-.003-.005-.076-.123-.003-.004-.003-.005-.078-.122-.003-.004-.003-.005-.08-.121-.003-.004-.003-.005-.08-.12-.004-.005-.003-.004-.083-.12-.003-.004-.003-.004-.084-.118-.003-.005-.003-.004-.086-.117-.003-.005-.003-.004-.088-.117-.003-.004-.003-.004-.09-.116-.002-.004-.004-.004-.09-.114-.003-.005-.004-.004-.091-.113-.004-.004-.003-.004-.093-.113-.004-.004-.003-.004-.095-.111-.004-.004-.003-.004-.096-.11-.004-.005-.003-.004-.098-.109-.004-.004-.003-.004-.1-.108-.003-.004-.004-.004-.1-.107-.004-.004-.004-.004-.102-.106-.003-.003-.004-.004-.093-.095-.124-.103-.14-.08-.153-.05-.16-.023-.16.008zM4.288 12.828l-.158.032-.15.06-.135.088-.117.11-.095.131-.069.146-.035.129-.026.132v.005l-.002.005-.025.143-.001.005-.001.006-.024.143-.001.005-.001.006-.022.143-.001.006-.001.005-.02.144-.001.005-.001.006-.019.144v.005l-.001.006-.017.144v.006l-.001.005-.016.145v.011l-.014.145v.006l-.001.005-.012.146v.01l-.01.146-.001.006v.005l-.009.146v.011l-.007.146v.011l-.004.147v.011l-.003.147v.01l-.002.148v.01l.001.148v.01l.003.147v.011l.005.147v.01l.007.147v.011l.009.146v.011l.01.146v.01l.013.146v.011l.014.145v.005l.001.006.016.145v.011l.018.144v.006l.001.005.019.144v.006l.001.005.021.144v.005l.002.006.022.143v.006l.002.005.024.143v.005l.002.006.025.143.001.005.001.005.028.143.001.005.001.005.03.142v.005l.002.006.03.141.002.005.001.006.033.14v.006l.002.005.035.14v.006l.002.005.036.14.002.005.001.005.038.14.001.005.002.005.04.14v.005l.002.005.042.138.001.006.002.005.042.138.002.005.002.005.017.054.064.148.09.134.114.114.132.092.148.065.157.037.16.007.16-.023.153-.052.14-.08.123-.103.102-.126.076-.142.049-.153.02-.16-.01-.161-.032-.13-.017-.051-.039-.126-.038-.13-.037-.128-.035-.13-.033-.128-.033-.134-.03-.13-.029-.131-.026-.13-.026-.132-.024-.134-.023-.133-.02-.132-.02-.136-.017-.132-.016-.135-.014-.135-.012-.133-.012-.138-.009-.133-.007-.136-.006-.138-.004-.134-.003-.136v-.274l.003-.136.004-.134.006-.139.007-.136.01-.132.01-.139.013-.132.014-.135.016-.135.017-.132.02-.137.02-.13.023-.134.024-.133.024-.126.016-.16-.014-.161-.044-.155-.072-.145-.098-.128-.12-.108-.137-.084-.15-.057-.16-.029-.16.002zm23.286 4.202l-.156.038-.148.066-.132.092-.113.115-.09.134-.062.148-.03.127-.001.004-.023.134-.024.134-.026.132-.026.13-.03.132-.03.129-.032.134-.033.128-.035.13-.037.128-.038.13-.04.126-.04.128-.044.128-.044.126-.046.126-.048.126-.05.125-.05.125-.051.122-.054.123-.055.122-.056.12-.058.122-.06.12-.061.12-.062.119-.063.116-.067.119-.066.116-.068.115-.07.115-.07.113-.073.113-.074.112-.076.113-.077.112-.077.107-.08.11-.08.108-.085.109-.044.056-.088.135-.06.15-.033.158-.002.16.027.16.057.15.083.138.108.12.128.098.144.072.155.045.16.015.161-.016.155-.044.144-.073.128-.098.09-.099.05-.061.003-.004.003-.005.089-.115.003-.004.003-.005.088-.116.003-.004.003-.005.086-.117.003-.004.003-.005.084-.118.003-.004.003-.005.083-.12.003-.004.003-.004.082-.12.003-.005.002-.004.08-.121.003-.005.003-.004.078-.122.003-.005.003-.004.077-.123.002-.005.003-.004.075-.124.003-.005.003-.004.073-.125.003-.004.003-.005.072-.126.002-.004.003-.005.07-.126.003-.005.002-.005.07-.127.002-.004.002-.005.068-.128.002-.005.002-.004.066-.13.003-.004.002-.005.064-.13.002-.004.003-.005.062-.13.003-.005.002-.005.06-.13.003-.005.002-.005.06-.132.002-.005.002-.005.057-.132.003-.005.002-.005.056-.133.002-.005.002-.005.054-.134.002-.004.002-.005.053-.135.002-.005.002-.005.051-.135.002-.005.002-.005.05-.135.001-.005.002-.005.048-.137.001-.005.002-.005.046-.137.002-.005.002-.005.044-.137.002-.005.002-.005.042-.138.002-.005.002-.006.04-.138.002-.005.002-.005.04-.14V19.4l.002-.005.038-.14.001-.005.002-.005.036-.14.001-.005.001-.005.035-.141.001-.005.001-.005.033-.141.001-.006.001-.005.031-.141.002-.006v-.005l.03-.142.001-.005.001-.005.028-.143v-.005l.002-.005.025-.143.001-.006.001-.005.024-.143.001-.005.001-.006.001-.006.01-.161-.02-.16-.05-.154-.077-.141-.102-.125-.123-.104-.141-.079-.153-.051-.16-.022-.16.007zM6.681 22.734l-.152.053-.14.08-.122.105-.101.126-.076.142-.048.154-.018.16.011.161.041.156.07.146.077.11.04.047.003.004.003.004.095.111.003.004.004.004.096.11.004.005.003.004.098.109.003.004.004.004.1.108.003.004.003.004.101.107.004.004.003.004.102.106.004.003.004.004.103.105.004.004.004.004.105.103.004.004.003.003.106.102.004.004.004.004.107.1.004.004.004.004.108.099.004.003.004.004.11.098.003.003.004.004.11.096.005.004.004.003.11.095.005.003.004.004.113.093.004.003.004.004.113.091.004.004.005.003.114.09.004.004.004.003.116.089.004.003.004.003.117.088.004.003.004.003.118.086.004.003.005.003.118.084.004.003.005.003.119.083.004.003.005.003.12.081.005.003.004.003.121.08.005.003.004.003.122.078.005.003.004.003.123.076.005.003.004.003.124.075.005.003.004.003.125.073.004.003.005.003.126.072.004.002.005.003.126.07.005.003.004.002.128.07.004.002.005.002.128.068.005.002.004.002.13.066.004.003.005.002.13.064.004.002.005.003.13.062.005.002.004.003.132.06.004.003.005.002.132.06.005.002.005.002.132.057.005.002.005.003.133.056.005.002.005.002.133.054.005.002.005.002.13.05.154.045.16.016.161-.015.155-.045.144-.072.128-.098.108-.12.083-.138.057-.15.028-.16-.003-.16-.032-.158-.061-.15-.088-.135-.11-.117-.132-.094-.12-.058-.124-.049-.126-.051-.122-.051-.122-.054-.12-.054-.126-.058-.119-.057-.12-.06-.12-.06-.118-.063-.117-.064-.119-.066-.116-.066-.115-.068-.115-.07-.113-.07-.115-.074-.112-.074-.11-.075-.11-.076-.112-.079-.11-.08-.109-.082-.106-.082-.104-.082-.106-.086-.105-.087-.101-.086-.105-.091-.1-.09-.1-.091-.1-.094-.097-.094-.1-.098-.093-.095-.096-.1-.093-.098-.092-.101-.089-.1-.09-.102-.088-.104-.036-.043-.114-.114-.133-.091-.148-.065-.157-.036-.161-.006-.16.024zm15.063 2.691l-.156.044-.12.057-.06.034-.12.066-.116.064-.119.062-.12.061-.12.06-.118.057-.126.058-.12.054-.122.054-.122.05-.126.052-.125.05-.124.046-.127.047-.125.044-.129.043-.126.04-.13.042-.128.038-.127.036-.13.035-.131.034-.129.031-.132.03-.13.03-.135.027-.133.026-.13.023-.13.022-.137.021-.132.02-.134.017-.132.015-.138.015-.135.013-.133.01-.138.01-.136.007-.134.006-.136.004-.14.003-.16.018-.155.047-.142.076-.127.1-.105.122-.08.14-.054.151-.025.16.006.16.035.158.064.148.09.134.114.114.133.092.147.065.157.036.134.008.145-.002h.011l.147-.005h.01l.147-.007h.011l.146-.009h.011l.146-.01h.005l.005-.001.146-.012h.011l.145-.014h.005l.006-.001.145-.016h.011l.144-.018h.006l.005-.001.144-.02h.011l.144-.021h.005l.006-.002.143-.022h.006l.005-.002.143-.024h.005l.006-.002.143-.026h.005l.005-.002.143-.027.005-.001.005-.001.142-.03h.005l.005-.002.142-.03.005-.002.005-.001.142-.033.005-.001.005-.001.14-.035.006-.001.005-.001.14-.036.005-.002.005-.001.14-.038.005-.001.005-.002.14-.04h.005l.005-.002.138-.042.005-.001.006-.002.138-.043.005-.001.005-.002.137-.044.005-.002.005-.002.137-.046.005-.002.005-.001.137-.048.005-.002.005-.002.135-.05.005-.001.005-.002.135-.051.005-.002.005-.002.135-.053.005-.002.004-.002.134-.054.005-.002.005-.002.133-.056.005-.003.005-.002.132-.057.005-.002.005-.003.132-.059.005-.002.004-.002.131-.061.005-.003.005-.002.13-.062.005-.003.005-.002.13-.064.004-.002.005-.003.129-.066.004-.002.005-.003.128-.067.005-.002.004-.003.127-.069.005-.002.005-.003.126-.07.005-.003.004-.002.065-.038.132-.093.112-.115.089-.135.062-.149.034-.157.004-.161-.027-.16-.055-.15-.082-.14-.107-.12-.127-.1-.144-.073-.154-.045-.16-.017-.161.014zM15.994 0l-.187.001h-.011l-.188.004h-.011l-.187.006h-.011l-.187.008h-.005L15.2.02l-.187.01h-.005l-.005.001-.187.013h-.01L14.62.06h-.01l-.186.018h-.011l-.185.02-.005.001h-.006l-.185.022-.005.001h-.005l-.185.025h-.005l-.005.001-.184.027h-.006l-.005.001-.184.029h-.005l-.005.001-.183.031-.005.001-.006.001-.182.033-.006.001-.005.001-.182.035-.005.001-.005.001-.182.038h-.005l-.005.002-.181.04h-.005l-.005.002-.18.042-.006.001-.005.001-.18.044-.005.002h-.005l-.17.045-.152.054-.139.082-.121.106-.1.127-.074.143-.046.155-.017.16.013.16.043.156.07.145.097.13.119.108.137.085.15.058.159.03.16-.001.133-.023.165-.043.168-.041.171-.04.171-.037.172-.036.17-.033.173-.03.17-.03.177-.027.171-.025.175-.022.175-.02.175-.02.176-.016.175-.014.177-.012.176-.01.177-.007.174-.006.177-.003L16 1.73h.177l.178.004.174.006.177.007.176.01.177.012.175.014.176.017.175.018.175.02.175.023.171.025.177.027.17.03.173.03.17.033.171.036.154.033.16.02.161-.01.156-.04.146-.069.131-.094.111-.117.088-.135.06-.15.032-.158.002-.16-.027-.16-.057-.15L20 .714l-.108-.12-.128-.097-.144-.073-.129-.038-.158-.035-.005-.001-.005-.001L19.14.31h-.005l-.005-.002-.182-.035h-.006l-.005-.002-.182-.033h-.006l-.005-.002-.183-.03-.005-.001-.005-.001-.184-.029h-.005l-.006-.001-.184-.027h-.005l-.005-.001-.185-.024h-.005L17.968.12 17.783.1l-.006-.001h-.005l-.185-.02h-.006l-.005-.001L17.39.06 17.385.06h-.005l-.187-.015h-.005l-.005-.001-.187-.013h-.01L16.799.02h-.011L16.6.01h-.011l-.187-.006h-.011L16.204 0h-.011L16.005 0h-.01zm8.86 2.939l-.157.033-.15.062-.134.09-.116.111-.093.132-.067.147-.038.156-.01.161.022.16.05.153.078.141.103.124.102.087.045.034.142.106.137.105.14.11.136.11.135.112.134.115.134.117.13.115.132.122.128.12.127.122.127.125.123.126.124.128.121.13.118.128.118.132.117.133.113.134.113.136.11.136.109.137.109.142.104.14.103.14.101.142.1.144.099.146.095.145.094.147.093.15.092.15.087.149.087.15.085.152.083.155.08.152.08.155.04.081.084.138.11.119.128.096.145.072.155.043.16.013.161-.016.155-.046.143-.074.127-.099.106-.12.083-.14.055-.151.026-.16-.004-.16-.034-.158-.05-.124-.042-.085-.002-.004-.003-.005-.084-.165-.002-.004-.003-.005-.086-.164-.002-.004-.003-.005-.088-.162-.002-.005-.003-.005-.09-.161-.002-.005-.003-.004-.092-.16-.002-.005-.003-.005-.094-.16-.003-.004-.003-.004-.096-.159-.002-.004-.003-.005-.098-.157-.003-.004-.003-.005-.1-.156-.003-.004-.002-.005-.102-.154-.003-.005-.003-.004-.104-.154-.003-.004-.003-.005-.106-.152-.003-.004-.003-.005-.108-.151-.003-.004-.003-.005-.11-.15-.003-.004-.003-.004-.111-.15-.004-.003-.003-.005-.113-.147-.004-.004-.003-.005-.115-.146-.004-.004-.003-.004-.117-.145-.004-.004-.003-.004-.12-.144-.003-.004-.003-.004-.121-.142-.003-.004-.004-.004-.123-.141-.003-.004-.004-.004-.125-.14-.003-.004-.004-.004-.127-.138-.003-.004-.004-.004-.128-.136-.004-.004-.004-.004-.13-.135-.004-.004-.003-.004-.133-.134-.003-.004-.004-.003-.134-.133-.004-.003-.004-.004-.135-.13-.004-.004-.004-.004-.136-.128-.004-.004-.004-.004-.138-.126-.004-.004-.004-.003-.14-.125-.004-.004-.004-.003-.14-.123-.005-.004-.004-.003-.142-.121-.004-.004-.004-.003-.144-.12-.004-.003-.004-.003-.145-.117-.004-.004-.004-.003-.147-.115-.004-.004-.004-.003-.148-.113-.004-.003-.004-.004-.149-.111-.004-.003-.004-.004-.05-.036-.14-.083-.15-.055-.16-.027-.16.004zm-18.381.348l-.157.037-.147.066-.111.074-.04.032-.005.003-.004.004-.145.117-.004.003-.004.004-.144.119-.004.003-.004.004-.142.12-.004.004-.004.004-.141.123-.004.003-.004.004-.14.125-.004.003-.004.004-.138.126-.004.004-.004.004-.136.128-.004.004-.004.004-.135.13-.004.004-.004.003-.134.133-.004.003-.004.004-.132.134-.003.004-.004.004-.13.135-.004.004-.004.004-.128.136-.004.004-.004.004-.126.138-.004.004-.003.004-.125.14-.004.004-.003.004-.123.14-.004.005-.003.004-.121.142-.004.004-.003.004-.12.144-.003.004-.003.004-.117.145-.004.004-.003.004-.115.146-.004.005-.003.004-.113.147-.003.005-.004.004-.111.149-.003.004-.004.004-.11.15-.002.005-.003.004-.108.151-.003.005-.003.004-.106.152-.003.005-.003.004-.104.154-.003.004-.003.005-.102.154-.003.005-.002.004-.1.156-.003.005-.003.004-.098.157-.003.005-.003.004-.096.159-.002.004-.003.005-.094.16-.003.004-.002.004-.092.16-.003.005-.003.005-.09.161-.002.005-.003.005-.088.162-.002.005-.003.004-.086.164-.002.005-.002.004-.084.165-.003.005-.002.004-.082.166-.002.005-.003.004-.08.167-.002.004-.002.005-.078.168-.002.004-.002.005-.045.1-.053.153-.023.16.007.16.037.157.065.148.092.132.114.114.134.09.148.064.157.035.161.006.16-.025.152-.054.14-.08.121-.106.1-.126.065-.118.043-.095.074-.16.075-.155.077-.157.08-.155.08-.152.083-.155.085-.152.086-.15.088-.149.091-.15.094-.15.094-.147.095-.145.099-.146.1-.144.1-.142.104-.14.104-.14.11-.142.107-.137.11-.136.114-.136.113-.134.117-.133.118-.132.117-.129.122-.13.124-.127.123-.126.127-.125.127-.122.128-.12.132-.122.13-.115.133-.117.135-.115.135-.111.136-.11.037-.03.117-.11.094-.132.068-.146.04-.156.01-.161-.02-.16-.05-.154-.076-.141-.102-.125-.123-.104-.14-.08-.153-.051-.16-.023-.161.008zm24.514 11.15l-.157.04-.146.067-.131.093-.112.117-.088.135-.061.149-.033.157-.005.134.006.14.006.176.003.177.001.178-.001.177-.003.178-.006.177-.007.176-.01.177-.012.176-.015.176-.016.173-.018.175-.02.175-.024.174-.024.175-.027.17-.03.174-.03.173-.033.17-.036.172-.037.17-.04.17-.042.172-.043.168-.045.166-.048.169-.05.167-.052.168-.053.164-.056.166-.058.166-.06.161-.061.164-.063.158-.066.165-.068.16-.07.16-.07.158-.075.159-.074.155-.078.158-.081.158-.06.15-.03.158-.001.161.029.159.058.15.085.137.108.12.13.096.144.07.156.044.16.013.16-.017.155-.046.143-.074.127-.1.107-.12.07-.115.083-.164.003-.005.002-.004.082-.166.002-.005.003-.004.08-.167.002-.005.002-.004.078-.168.002-.004.002-.005.076-.169.002-.004.002-.005.074-.17.002-.004.002-.005.072-.17.002-.005.002-.005.07-.17.002-.006.001-.005.068-.172.002-.004.002-.005.065-.173.002-.005.002-.005.063-.173.002-.005.002-.005.06-.174.003-.005.001-.005.06-.175.001-.005.002-.005.057-.176.001-.005.002-.005.055-.177.001-.005.002-.005.052-.177.002-.005.001-.005.051-.178.001-.005.002-.005.048-.179.002-.005v-.005l.047-.179.001-.005.002-.005.044-.18v-.005l.002-.005.042-.18.001-.006.001-.005.04-.18.001-.006.001-.005.038-.182v-.005l.002-.005.035-.182v-.006l.002-.005.033-.182v-.006l.002-.005.03-.183.001-.005.001-.005.029-.184v-.005l.001-.006.027-.184v-.005l.001-.005.024-.185v-.005l.001-.005.022-.185v-.006l.001-.005.02-.185v-.006l.001-.005.017-.186v-.005l.001-.005.015-.187v-.005l.001-.005.013-.187v-.01l.01-.187.001-.006v-.005l.009-.187v-.011l.006-.187v-.011l.004-.188v-.011l.001-.188v-.01l-.001-.188v-.011l-.004-.188v-.011l-.006-.187v-.011l-.007-.145-.022-.16-.05-.152-.08-.141-.103-.124-.125-.102-.141-.077-.153-.05-.16-.02-.161.009zM.777 15l-.158.032-.15.06-.136.087-.117.11-.095.131-.068.146-.04.156-.012.133-.001.14v.01l.001.188v.011l.004.188v.011l.006.187v.011l.008.187v.011l.011.187v.005l.001.005.013.187v.01l.016.187v.01l.018.186v.011l.02.185.001.005v.006l.022.185.001.005v.005l.025.185v.005l.001.005.027.184v.006l.001.005.029.184v.005l.001.005.031.183.001.005.001.006.033.182.001.005.001.006.035.182.001.005.001.005.038.182v.005l.002.005.04.181v.005l.002.005.042.18.001.006.001.005.044.18.002.005v.005l.047.18.001.004.002.005.048.179.002.005.001.005.05.178.002.005.001.005.053.177.002.005.001.005.055.177.002.005.001.005.057.176.002.005.001.005.06.175.001.005.002.005.061.174.002.005.002.005.063.173.002.005.002.005.065.173.002.005.002.004.067.172.002.005.002.005.07.171.002.005.002.005.072.17.002.005.002.005.074.169.002.005.002.004.076.169.002.005.002.004.078.168.002.004.002.005.08.167.003.004.002.005.082.166.002.004.003.005.02.04.086.136.11.118.13.095.146.07.156.041.16.012.16-.019.155-.048.142-.075.126-.1.105-.123.08-.14.054-.152.024-.16-.006-.16-.036-.158-.051-.123-.018-.034-.078-.158L3.1 22.1l-.074-.16-.071-.156-.07-.162-.068-.16-.067-.164-.062-.158-.062-.164-.059-.161-.058-.166-.056-.166-.053-.164-.052-.168-.05-.167-.048-.17-.045-.165-.043-.168-.043-.172-.039-.17-.037-.17-.036-.172-.033-.17-.03-.173-.03-.174-.027-.17-.025-.175-.022-.174-.021-.175-.018-.175-.017-.173-.014-.176-.012-.176-.01-.177-.007-.176-.006-.177-.003-.178L1.73 16v-.134l-.013-.16-.044-.156-.072-.144-.097-.129-.12-.108-.137-.085-.15-.057L.938 15 .777 15zM6.17 26.842l-.152.052-.14.08-.122.105-.101.126-.076.142-.048.154-.02.16.012.161.041.156.07.146.094.13.096.093.032.026.004.003.004.004.145.117.004.003.004.004.146.115.005.003.004.004.147.113.005.003.004.004.149.111.004.003.004.003.15.11.005.003.004.003.151.108.005.003.004.003.152.106.005.003.004.003.154.104.004.003.005.003.154.102.005.002.004.003.156.1.005.003.004.003.157.098.005.003.004.002.159.096.004.003.005.003.16.094.004.003.004.002.16.092.005.003.005.002.161.09.005.003.005.003.162.088.005.002.004.002.164.087.005.002.004.002.165.084.005.003.004.002.166.082.004.002.005.003.167.08.004.002.005.002.168.078.004.002.005.002.169.076.004.002.005.002.17.074.004.002.005.002.17.072.005.002.005.002.17.07.006.002.005.001.171.068.005.002.005.002.173.065.005.002.005.002.173.063.005.002.005.002.174.061.005.002.005.001.175.06.005.001.005.002.176.057.005.001.005.002.177.055.005.001.005.002.177.052.005.002.005.001.178.051.005.001.005.002.178.048.006.002h.005l.179.047.005.001.005.002.18.044h.005l.005.002.18.042.006.001.005.001.159.035.16.02.16-.01.157-.04.146-.069.13-.094.112-.117.087-.136.06-.149.033-.158.002-.161-.028-.159-.057-.15-.084-.138-.108-.12-.128-.098-.144-.072-.128-.039-.154-.033-.168-.04-.171-.041-.169-.044-.17-.045-.166-.048-.168-.05-.165-.051-.166-.054-.166-.056-.163-.057-.165-.06-.161-.062-.164-.064-.16-.065-.16-.068-.162-.07-.157-.07-.157-.074-.157-.075-.156-.077-.153-.079-.156-.082-.153-.082-.154-.086-.15-.086-.152-.09-.148-.09-.147-.092-.149-.095-.145-.095-.144-.098-.145-.1-.143-.102-.14-.103-.14-.104-.14-.108-.139-.11-.136-.11-.027-.022-.133-.091-.148-.065-.157-.036-.161-.006-.16.024zm19.214.073l-.156.039-.146.067-.11.076-.064.051-.139.11-.14.108-.14.104-.14.103-.143.101-.145.101-.144.098-.145.095-.149.095-.148.093-.147.089-.152.09-.15.086-.154.086-.153.082-.156.082-.153.079-.156.077-.157.075-.157.073-.158.071-.16.07-.16.068-.161.065-.164.064-.161.061-.165.06-.163.058-.166.056-.166.054-.166.051-.167.05-.167.048-.17.045-.168.044-.171.042-.168.039-.17.037-.11.023-.154.047-.143.075-.126.1-.106.122-.081.139-.054.152-.025.16.006.16.035.158.063.148.09.133.114.115.132.092.148.065.157.037.16.008.133-.017.115-.024h.005l.005-.002.181-.04h.005l.005-.002.18-.042.006-.001.005-.001.18-.044.005-.002h.005l.18-.047.004-.001.005-.002.179-.048.005-.002.005-.001.178-.05.005-.002.005-.002.177-.052.005-.002.005-.001.177-.055.005-.002.005-.001.176-.057.005-.002.005-.002.175-.059.005-.001.005-.002.174-.061.005-.002.005-.002.173-.063.005-.002.005-.002.173-.065.005-.002.004-.002.172-.068.005-.001.005-.002.171-.07.005-.002.005-.002.17-.072.005-.002.005-.002.169-.074.005-.002.004-.002.169-.076.004-.002.005-.002.168-.078.004-.002.005-.002.167-.08.004-.003.005-.002.166-.082.004-.002.005-.003.165-.084.004-.002.005-.002.163-.087.005-.002.005-.002.162-.088.005-.003.005-.003.161-.09.005-.002.004-.003.16-.092.005-.002.005-.003.16-.094.004-.003.004-.003.158-.096.005-.002.004-.003.158-.098.004-.003.005-.003.156-.1.004-.003.004-.002.155-.102.005-.003.004-.003.154-.104.004-.003.005-.003.152-.106.004-.003.005-.003.151-.108.004-.003.005-.003.15-.11.004-.003.004-.003.149-.111.004-.004.004-.003.148-.113.004-.004.004-.003.147-.115.004-.004.004-.003.068-.055.116-.113.092-.132.066-.147.038-.157.008-.16-.022-.16-.05-.153-.08-.14-.103-.125-.124-.102-.142-.077-.153-.05-.16-.02-.16.009z"
})));

function _extends$H() { _extends$H = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$H.apply(this, arguments); }
var IntermediateEventCatchParallelMultipleIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$H({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.975.003C8.195-.157.935 6.24.125 13.985c-.855 6.55 2.741 13.46 8.74 16.314 5.666 2.847 13.012 1.99 17.71-2.33 4.745-4.162 6.727-11.243 4.532-17.206C29.09 4.884 23.445.408 17.201.049c-.408-.03-.817-.046-1.226-.046zm-.181 1.724c7.134-.269 13.84 5.68 14.399 12.804.686 6.283-3.267 12.792-9.283 14.862-5.847 2.162-13.025.06-16.557-5.141C.728 19.174.872 11.679 4.985 6.916c2.632-3.171 6.671-5.174 10.809-5.19zm.283 1.553c-6.6-.21-12.671 5.585-12.79 12.185-.292 5.964 4.129 11.817 10.034 12.953 5.47 1.198 11.584-1.613 14.025-6.702 2.525-4.97 1.396-11.585-2.912-15.215-2.282-2.022-5.3-3.217-8.357-3.22zM16 4.975c5.818-.154 11.117 5.082 11.024 10.905.103 5.384-4.23 10.5-9.636 11.043-5.075.667-10.426-2.587-11.885-7.552-1.53-4.73.48-10.428 4.888-12.864A11.082 11.082 0 0116 4.975zm-2.15 3.281v5.534H8.213v4.38h5.636v5.534h4.31V18.17h5.639v-4.38h-5.64V8.256h-4.31zm.865.865h2.583v5.534h5.635v2.65h-5.635v5.533h-2.583v-5.534h-5.64v-2.649h5.64V9.121z"
})));

function _extends$G() { _extends$G = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$G.apply(this, arguments); }
var IntermediateEventCatchSignalIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$G({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.975.049C8.195-.11.935 6.286.125 14.03c-.855 6.55 2.741 13.46 8.74 16.314 5.666 2.847 13.012 1.99 17.71-2.33 4.745-4.162 6.727-11.243 4.532-17.206C29.09 4.93 23.445.453 17.201.095c-.408-.03-.817-.046-1.226-.046zm-.181 1.724c7.134-.269 13.84 5.68 14.399 12.804.686 6.283-3.267 12.792-9.283 14.862-5.847 2.162-13.025.06-16.557-5.141C.728 19.22.872 11.725 4.985 6.962c2.632-3.171 6.671-5.174 10.809-5.19zm.283 1.553c-6.6-.21-12.671 5.585-12.79 12.185-.292 5.964 4.129 11.817 10.034 12.953 5.47 1.198 11.584-1.613 14.025-6.702 2.525-4.97 1.396-11.585-2.912-15.216-2.282-2.021-5.3-3.216-8.357-3.22zM16 5.021c5.818-.154 11.117 5.082 11.024 10.905.103 5.384-4.23 10.5-9.636 11.043-5.075.667-10.426-2.587-11.885-7.552-1.53-4.73.48-10.428 4.888-12.864A11.083 11.083 0 0116 5.021zm.006 3.521L9.206 20.745h13.598L16.005 8.542zm0 1.775l5.329 9.564H10.677l5.328-9.564z"
})));

function _extends$F() { _extends$F = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$F.apply(this, arguments); }
var IntermediateEventCatchTimerIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$F({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.97.04h-.127C8.713-.018 2.003 5.334.437 12.286c-1.51 6.123.98 13.005 6.136 16.665 5.125 3.788 12.546 4.105 17.912.623 5.272-3.276 8.33-9.766 7.325-15.916-.904-6.241-5.79-11.7-11.95-13.143A16.082 16.082 0 0015.97.04zm-.181 1.724c.115 0 .23 0 .347.003 6.625-.066 12.823 5.149 13.89 11.69 1.13 5.91-1.908 12.349-7.262 15.138-5.473 3.013-12.866 1.884-17.116-2.726C1.291 21.372.444 13.914 3.802 8.602c2.493-4.112 7.169-6.819 11.987-6.838zm.283 1.554c-.117 0-.234.002-.351.005-6.1 0-11.691 5.049-12.346 11.114-.78 5.684 2.795 11.612 8.218 13.52 5.139 1.943 11.416.101 14.624-4.38 3.461-4.583 3.262-11.538-.596-15.831-2.36-2.747-5.924-4.423-9.549-4.428zm-.078 1.695c.078 0 .156 0 .234.003 5.4 0 10.321 4.556 10.734 9.942.563 5.13-2.958 10.364-7.971 11.678-4.832 1.41-10.457-.935-12.746-5.446-2.463-4.559-1.2-10.795 3.014-13.883a11.072 11.072 0 016.735-2.294zm-.137 3.42c-2.965.02-5.792 1.968-6.884 4.722-1.137 2.693-.509 6.007 1.536 8.096 1.988 2.14 5.263 2.929 8.007 1.926 2.875-.98 4.987-3.824 5.063-6.865.154-2.954-1.622-5.875-4.295-7.13a7.545 7.545 0 00-3.427-.75zm.27 1.381c2.708.013 5.249 2.014 5.88 4.652.704 2.576-.481 5.512-2.788 6.862-2.356 1.478-5.677 1.084-7.611-.918-2.042-1.97-2.405-5.376-.839-7.738 1.11-1.762 3.146-2.877 5.229-2.857h.13zm1.831 1.764l-2.072 3.76c-.64.068-.792 1.039-.202 1.298.39.27.696-.18 1.051-.164h3.168v-.864h-3.18l1.992-3.612-.757-.418z"
})));

function _extends$E() { _extends$E = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$E.apply(this, arguments); }
var IntermediateEventNoneIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$E({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.848.001C8.113-.093.931 6.281.125 13.983c-.855 6.55 2.741 13.46 8.74 16.314 5.666 2.847 13.012 1.99 17.71-2.33 4.745-4.162 6.727-11.243 4.532-17.207C29.105 4.938 23.55.48 17.367.06A16.448 16.448 0 0015.848 0v.001zm.293 1.727c7.113-.099 13.662 5.97 14.077 13.08.56 6.299-3.516 12.735-9.582 14.679-5.798 2.004-12.806-.12-16.283-5.237C.717 19.159.874 11.638 5.016 6.876 7.722 3.638 11.902 1.63 16.14 1.728zm-.415 1.555C9.157 3.258 3.256 9.156 3.278 15.729c-.16 5.965 4.365 11.725 10.293 12.737 5.409 1.065 11.37-1.744 13.775-6.753 2.534-4.986 1.386-11.627-2.953-15.251-2.364-2.077-5.512-3.27-8.667-3.18zm.507 1.692c5.82-.026 11.013 5.318 10.79 11.143-.024 5.3-4.313 10.267-9.636 10.803-5.075.667-10.426-2.588-11.885-7.553-1.535-4.744.494-10.46 4.925-12.885a11.072 11.072 0 015.806-1.508z"
})));

function _extends$D() { _extends$D = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$D.apply(this, arguments); }
var IntermediateEventThrowCompensationIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$D({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.975.003C8.195-.156.935 6.24.125 13.985c-.855 6.55 2.741 13.46 8.74 16.314 5.666 2.847 13.012 1.99 17.71-2.33 4.745-4.162 6.727-11.243 4.532-17.206C29.09 4.884 23.445.407 17.201.049c-.408-.03-.817-.046-1.226-.046zm-.181 1.724c7.134-.269 13.84 5.68 14.399 12.804.686 6.283-3.267 12.792-9.283 14.862-5.847 2.162-13.025.06-16.557-5.141C.728 19.174.872 11.679 4.985 6.916c2.632-3.171 6.671-5.174 10.809-5.19zm.283 1.553c-6.6-.21-12.671 5.585-12.79 12.185-.292 5.964 4.129 11.817 10.034 12.953 5.47 1.198 11.584-1.613 14.025-6.702 2.525-4.97 1.396-11.585-2.912-15.216-2.282-2.021-5.3-3.216-8.357-3.22zM16 4.975c5.818-.154 11.117 5.082 11.024 10.905.103 5.384-4.23 10.5-9.636 11.043-5.075.667-10.426-2.587-11.885-7.552-1.53-4.73.48-10.428 4.888-12.864A11.083 11.083 0 0116 4.975zm-.56 5.772l-7.408 5.231 7.409 5.234v-5.057c2.385 1.687 4.771 3.371 7.157 5.057V10.747l-7.157 5.055v-5.055z"
})));

function _extends$C() { _extends$C = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$C.apply(this, arguments); }
var IntermediateEventThrowEscalationIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$C({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.975.049C8.195-.11.935 6.286.125 14.03c-.855 6.55 2.741 13.46 8.74 16.314 5.666 2.847 13.012 1.99 17.71-2.33 4.745-4.162 6.727-11.243 4.532-17.206C29.09 4.93 23.445.453 17.201.095c-.408-.03-.817-.046-1.226-.046zm-.181 1.724c7.134-.269 13.84 5.68 14.399 12.804.686 6.283-3.267 12.792-9.283 14.862-5.847 2.162-13.025.06-16.557-5.141C.728 19.22.872 11.725 4.985 6.962c2.632-3.171 6.671-5.174 10.809-5.19zm.283 1.553c-6.6-.21-12.671 5.585-12.79 12.185-.292 5.964 4.129 11.817 10.034 12.953 5.47 1.198 11.584-1.613 14.025-6.702 2.525-4.97 1.396-11.585-2.912-15.216-2.282-2.021-5.3-3.216-8.357-3.22zM16 5.021c5.818-.154 11.117 5.082 11.024 10.905.103 5.384-4.23 10.5-9.636 11.043-5.075.667-10.426-2.587-11.885-7.552-1.53-4.73.48-10.428 4.888-12.864A11.083 11.083 0 0116 5.021zm.006 3.927c-1.672 4.654-2.734 9.502-4.406 14.155 1.534-1.525 2.872-3.234 4.406-4.759l4.406 4.76c-1.496-4.71-2.91-9.446-4.406-14.156z"
})));

function _extends$B() { _extends$B = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$B.apply(this, arguments); }
var IntermediateEventThrowLinkIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$B({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.975.049C8.195-.11.935 6.286.125 14.03c-.855 6.55 2.741 13.46 8.74 16.314 5.666 2.847 13.012 1.99 17.71-2.33 4.745-4.162 6.727-11.243 4.532-17.206C29.09 4.93 23.445.453 17.201.095c-.408-.03-.817-.046-1.226-.046zm-.181 1.724c7.134-.269 13.84 5.68 14.399 12.804.686 6.283-3.267 12.792-9.283 14.862-5.847 2.162-13.025.06-16.557-5.141C.728 19.22.872 11.725 4.985 6.962c2.632-3.171 6.671-5.174 10.809-5.19zm.283 1.553c-6.6-.21-12.671 5.585-12.79 12.185-.292 5.964 4.129 11.817 10.034 12.953 5.47 1.198 11.584-1.613 14.025-6.702 2.525-4.97 1.396-11.585-2.912-15.216-2.282-2.021-5.3-3.216-8.357-3.22zM16 5.021c5.818-.154 11.117 5.082 11.024 10.905.103 5.384-4.23 10.5-9.636 11.043-5.075.667-10.426-2.587-11.885-7.552-1.53-4.73.48-10.428 4.888-12.864A11.083 11.083 0 0116 5.021zm1.78 4.093v3.555H9.785v6.714h7.994v3.554l5.829-6.911-5.83-6.912z"
})));

function _extends$A() { _extends$A = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$A.apply(this, arguments); }
var IntermediateEventThrowMessageIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$A({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.975.003C8.195-.156.935 6.24.125 13.985c-.855 6.55 2.741 13.46 8.74 16.314 5.666 2.847 13.012 1.99 17.71-2.33 4.745-4.162 6.727-11.243 4.532-17.206C29.09 4.884 23.445.407 17.201.049c-.408-.03-.817-.046-1.226-.046zm-.181 1.724c7.134-.269 13.84 5.68 14.399 12.804.686 6.283-3.267 12.792-9.283 14.862-5.847 2.162-13.025.06-16.557-5.141C.728 19.174.872 11.679 4.985 6.916c2.632-3.171 6.671-5.174 10.809-5.19zm.283 1.553c-6.6-.21-12.671 5.585-12.79 12.185-.292 5.964 4.129 11.817 10.034 12.953 5.47 1.198 11.584-1.613 14.025-6.702 2.525-4.97 1.396-11.585-2.912-15.216-2.282-2.021-5.3-3.216-8.357-3.22zM16 4.975c5.818-.154 11.117 5.082 11.024 10.905.103 5.384-4.23 10.5-9.636 11.043-5.075.667-10.426-2.587-11.885-7.552-1.53-4.73.48-10.428 4.888-12.864A11.083 11.083 0 0116 4.975zm-5.91 5.475l6.04 4.901 6.042-4.9H10.088zm-1.341 1.138v9.921h14.514V11.79l-7.132 5.787-7.382-5.99z"
})));

function _extends$z() { _extends$z = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$z.apply(this, arguments); }
var IntermediateEventThrowMultipleIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$z({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.975.003C8.195-.156.935 6.24.125 13.985c-.855 6.55 2.741 13.46 8.74 16.314 5.666 2.847 13.012 1.99 17.71-2.33 4.745-4.162 6.727-11.243 4.532-17.206C29.09 4.884 23.445.407 17.201.049c-.408-.03-.817-.046-1.226-.046zm-.181 1.724c7.134-.269 13.84 5.68 14.399 12.804.686 6.283-3.267 12.792-9.283 14.862-5.847 2.162-13.025.06-16.557-5.141C.728 19.174.872 11.679 4.985 6.916c2.632-3.171 6.671-5.174 10.809-5.19zm.283 1.553c-6.6-.21-12.671 5.585-12.79 12.185-.292 5.964 4.129 11.817 10.034 12.953 5.47 1.198 11.584-1.613 14.025-6.702 2.525-4.97 1.396-11.585-2.912-15.216-2.282-2.021-5.3-3.216-8.357-3.22zM16 4.975c5.818-.154 11.117 5.082 11.024 10.905.103 5.384-4.23 10.5-9.636 11.043-5.075.667-10.426-2.587-11.885-7.552-1.53-4.73.48-10.428 4.888-12.864A11.083 11.083 0 0116 4.975zm.006 3.073l-7.62 5.532 2.91 8.95h9.42l2.91-8.95-7.62-5.532z"
})));

function _extends$y() { _extends$y = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$y.apply(this, arguments); }
var IntermediateEventThrowSignalIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$y({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.975.003C8.195-.156.935 6.24.125 13.985c-.855 6.55 2.741 13.46 8.74 16.314 5.666 2.847 13.012 1.99 17.71-2.33 4.745-4.162 6.727-11.243 4.532-17.206C29.09 4.884 23.445.407 17.201.049c-.408-.03-.817-.046-1.226-.046zm-.181 1.724c7.134-.269 13.84 5.68 14.399 12.804.686 6.283-3.267 12.792-9.283 14.862-5.847 2.162-13.025.06-16.557-5.141C.728 19.174.872 11.679 4.985 6.916c2.632-3.171 6.671-5.174 10.809-5.19zm.283 1.553c-6.6-.21-12.671 5.585-12.79 12.185-.292 5.964 4.129 11.817 10.034 12.953 5.47 1.198 11.584-1.613 14.025-6.702 2.525-4.97 1.396-11.585-2.912-15.216-2.282-2.021-5.3-3.216-8.357-3.22zM16 4.975c5.818-.154 11.117 5.082 11.024 10.905.103 5.384-4.23 10.5-9.636 11.043-5.075.667-10.426-2.587-11.885-7.552-1.53-4.73.48-10.428 4.888-12.864A11.083 11.083 0 0116 4.975zm.006 3.52c-2.261 4.07-4.533 8.136-6.798 12.205h13.596L16.005 8.495z"
})));

function _extends$x() { _extends$x = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$x.apply(this, arguments); }
var LaneIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$x({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M0 7v18.62h32V7H0zm1.655 17.056V8.684h28.62v15.372H1.656z"
})));

function _extends$w() { _extends$w = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$w.apply(this, arguments); }
var ManualTaskIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$w({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M6.494 3C2.916 3 0 5.903 0 9.475v13.383c0 3.572 2.916 6.475 6.494 6.475h19.012c3.578 0 6.494-2.903 6.494-6.475V9.475C32 5.903 29.084 3 25.506 3H6.494zm0 2h19.012C28.015 5 30 6.98 30 9.475v13.383c0 2.495-1.985 4.475-4.494 4.475H6.494C3.985 27.333 2 25.353 2 22.858V9.475C2 6.98 3.985 5 6.494 5zm4.43 1.328c-.222.005-.43.09-.606.203-.985.638-4.356 2.977-5.096 3.486-.67.46-1.12 1.153-1.38 1.974-.27.858-.235 1.793-.232 2.576.002.59.016 1.104.17 1.727.22.908.634 1.63 1.23 2.118.597.49 1.363.732 2.23.734 3.038.012 6.078.016 9.119 0 .327-.002.645-.127.848-.37.204-.241.287-.56.291-.914a1.732 1.732 0 00-.097-.625h.327c.335 0 .641-.11.852-.316.21-.206.317-.475.374-.754a1.783 1.783 0 00-.126-1.143 1.18 1.18 0 00.877-.521c.196-.306.257-.666.258-1.025.001-.375-.088-.738-.293-1.033a1.179 1.179 0 00-.958-.512h-.478c.108-.237.156-.505.155-.782-.003-.373-.098-.721-.316-.99a1.21 1.21 0 00-.943-.43c-2.273-.004-4.236.018-6.412.012l-.19-.001c.102-.104.202-.205.312-.314.337-.336.662-.652.83-.869.4-.516.46-1.215.123-1.729-.178-.272-.439-.456-.72-.494a.93.93 0 00-.148-.008zm.029.728l.022.001c.055.008.115.027.209.172.132.201.126.606-.09.884-.079.102-.431.465-.767.8-.337.334-.657.643-.815.836-.153.186-.096.338-.056.435.04.096.085.212.298.263.063.014.066.01.086.012l.066.003c2.429.027 4.986-.004 7.223-.003.194 0 .293.056.379.162.086.105.151.286.153.533 0 .257-.065.467-.155.59-.09.124-.183.182-.37.183-1.706-.001-3.411-.005-5.117-.009v.731c2.23.004 4.461.01 6.692.012.17 0 .265.06.361.2.096.138.164.364.163.615 0 .268-.058.501-.143.634-.085.132-.162.193-.385.195-2.32-.001-4.554-.006-6.688-.003v.73c1.905 0 3.809.003 5.713.001.194.005.316.09.416.26.102.173.151.442.093.728-.04.193-.102.313-.17.38-.067.065-.148.108-.343.108h-5.71l.002.734c1.445 0 2.89-.01 4.334-.001.162 0 .232.041.297.123.064.081.123.238.12.488-.003.244-.061.385-.12.455-.06.07-.127.11-.296.11-3.037.016-6.076.012-9.113 0-.735-.002-1.316-.196-1.77-.568-.454-.372-.793-.935-.986-1.728-.134-.546-.146-.978-.148-1.558-.003-.796-.018-1.664.199-2.354.222-.705.582-1.24 1.096-1.593.75-.515 4.14-2.866 5.079-3.474a.504.504 0 01.241-.087z"
})));

function _extends$v() { _extends$v = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$v.apply(this, arguments); }
var MessageFlowIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$v({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M4.073 26.607l1.295 1.296L1.325 32l-.662-.633L0 30.735l4.073-4.128zm6.953-7.046l1.296 1.296L1.325 32l7.555-7.656-1.295-1.296 1.455-1.474 1.986-2.013zM32 .06s-2.699 5.189-5.417 10.462l-.326.633c-1.14 2.214-2.265 4.407-3.176 6.2-1.228-1.222-2.449-2.452-3.676-3.675l-3.57 3.618-1.297-1.296 3.541-3.588c-.98-.964-1.932-1.958-2.923-2.91l-.753-.706c2.68-1.258 6.533-3.165 9.95-4.876l.617-.309C28.838 1.673 32 .06 32 .06zm-4.126 4.06l-.015.007-.115.057-.048.024-.115.057L17.7 9.172l5.017 4.948 5.157-10z"
})));

function _extends$u() { _extends$u = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$u.apply(this, arguments); }
var ParticipantIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$u({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M0 5v22.069h32V5H0zm30.276 1.684v18.82H6.62V6.684h23.655zm-28.62 0h3.31v18.82h-3.31V6.684z"
})));

function _extends$t() { _extends$t = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$t.apply(this, arguments); }
var ProcessIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$t({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M16.177 0l.137.002c.452.009.9.037 1.342.082.346.036.62.303.68.646l.437 2.536c.055.319.296.57.608.655.986.269 1.923.653 2.796 1.14.28.155.624.145.885-.039l2.083-1.47a.775.775 0 01.937.022c.86.699 1.645 1.484 2.343 2.343.22.27.223.653.023.937l-1.439 2.038a.833.833 0 00-.031.896c.512.889.92 1.846 1.204 2.855a.833.833 0 00.653.601l2.435.42c.342.059.61.333.645.679a15.928 15.928 0 01.08 2.064l-.003.114c-.012.382-.038.76-.077 1.134a.775.775 0 01-.645.68l-2.396.412a.835.835 0 00-.656.61 12.511 12.511 0 01-1.2 2.917.832.832 0 00.034.892l1.396 1.978c.2.284.196.667-.023.936a16.104 16.104 0 01-2.343 2.343.775.775 0 01-.937.023l-1.99-1.404a.833.833 0 00-.88-.026c-.907.516-1.886.922-2.916 1.2a.833.833 0 00-.61.656l-.414 2.396a.775.775 0 01-.679.646 16.096 16.096 0 01-3.312 0 .775.775 0 01-.679-.646l-.423-2.452a.834.834 0 00-.598-.636 12.474 12.474 0 01-1.468-.514 12.49 12.49 0 01-1.417-.68.833.833 0 00-.878.03l-2.026 1.43a.775.775 0 01-.937-.023 16.069 16.069 0 01-2.342-2.342.774.774 0 01-.024-.936l1.402-1.986a.833.833 0 00.032-.896 12.507 12.507 0 01-1.214-2.911.833.833 0 00-.655-.606l-2.386-.412a.775.775 0 01-.646-.678 16.097 16.097 0 010-3.314.775.775 0 01.646-.678l2.386-.412a.833.833 0 00.655-.606 12.507 12.507 0 011.214-2.911.833.833 0 00-.032-.896L3.552 6.853a.774.774 0 01.023-.936 16.091 16.091 0 012.343-2.343.775.775 0 01.937-.023l2.03 1.433c.26.177.6.182.874.028.915-.512 1.88-.9 2.87-1.167a.833.833 0 00.612-.656l.424-2.46a.775.775 0 01.679-.645C14.845.032 15.348.004 15.85 0h.326zM16 6.4c-5.302 0-9.6 4.297-9.6 9.599 0 5.302 4.298 9.6 9.6 9.6s9.6-4.298 9.6-9.6-4.298-9.6-9.6-9.6zm-3 4.283c0-1.425 1.637-2.203 2.715-1.29l5.69 4.815c.794.672.794 1.91 0 2.583l-5.69 4.815c-1.078.913-2.715.134-2.715-1.29z"
})));

function _extends$s() { _extends$s = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$s.apply(this, arguments); }
var ReceiveTaskIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$s({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M6.494 3C2.916 3 0 5.903 0 9.475v13.383c0 3.572 2.916 6.475 6.494 6.475h19.012c3.578 0 6.494-2.903 6.494-6.475V9.475C32 5.903 29.084 3 25.506 3H6.494zm0 2h19.012C28.015 5 30 6.98 30 9.475v13.383c0 2.495-1.985 4.475-4.494 4.475H6.494C3.985 27.333 2 25.353 2 22.858V9.475C2 6.98 3.985 5 6.494 5zM5.23 7.764v11.577h17.55V7.764H5.23zm1.816.758h13.917l-6.959 4.577-6.958-4.577zm-1.06.21l8.018 5.274 8.018-5.275v9.853H5.987V8.73z"
})));

function _extends$r() { _extends$r = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$r.apply(this, arguments); }
var ScriptTaskIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$r({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M6.494 3C2.916 3 0 5.903 0 9.475v13.383c0 3.572 2.916 6.475 6.494 6.475h19.012c3.578 0 6.494-2.903 6.494-6.475V9.475C32 5.903 29.084 3 25.506 3H6.494zm0 2h19.012C28.015 5 30 6.98 30 9.475v13.383c0 2.495-1.985 4.475-4.494 4.475H6.494C3.985 27.333 2 25.353 2 22.858V9.475C2 6.98 3.985 5 6.494 5zm2.99 3.077l-.077.045-.026.015c-1.09.646-1.84 1.239-2.336 1.818-.496.579-.735 1.162-.742 1.725-.014 1.119.812 1.958 1.544 2.708.732.75 1.385 1.456 1.446 2.041.032.298-.039.598-.364 1.008-.324.408-.911.897-1.85 1.445l-1.388.808h8.56l.101-.059c.996-.58 1.667-1.116 2.094-1.655.429-.54.603-1.107.547-1.638-.11-1.052-.967-1.818-1.688-2.556-.721-.739-1.306-1.436-1.298-2.092.004-.331.132-.7.535-1.171.402-.47 1.08-1.02 2.119-1.636l1.362-.806h-8.54zm.241.867h5.271a6.83 6.83 0 00-1.113 1.01c-.496.58-.736 1.163-.743 1.726-.014 1.119.812 1.958 1.544 2.708.732.75 1.385 1.456 1.446 2.041.032.298-.039.598-.364 1.008-.312.393-.872.862-1.753 1.386H8.728c.367-.286.658-.566.88-.847.43-.54.604-1.107.548-1.638-.11-1.052-.968-1.818-1.688-2.556-.721-.739-1.306-1.435-1.298-2.092.004-.331.132-.7.534-1.171.389-.454 1.04-.984 2.021-1.575zm-1.233 1.48v.4h4.12v-.4h-4.12zm-.154 2.158v.4H12.6v-.4H8.34zm1.931 2.158v.4h4.126v-.4H10.27zm.59 2.158v.4h4.276v-.4h-4.276z"
})));

function _extends$q() { _extends$q = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$q.apply(this, arguments); }
var SendTaskIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$q({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M6.494 3C2.916 3 0 5.903 0 9.475v13.383c0 3.572 2.916 6.475 6.494 6.475h19.012c3.578 0 6.494-2.903 6.494-6.475V9.475C32 5.903 29.084 3 25.506 3H6.494zm0 2h19.012C28.015 5 30 6.98 30 9.475v13.383c0 2.495-1.985 4.475-4.494 4.475H6.494C3.985 27.333 2 25.353 2 22.858V9.475C2 6.98 3.985 5 6.494 5zm-1.38 3.16l8.332 4.717L21.78 8.16H5.114zm.021 1.745v9.309H21.8V9.905l-8.353 4.655-8.31-4.655z"
})));

function _extends$p() { _extends$p = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$p.apply(this, arguments); }
var ServiceTaskIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$p({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M6.494 3C2.916 3 0 5.903 0 9.475v13.383c0 3.572 2.916 6.475 6.494 6.475h19.012c3.578 0 6.494-2.903 6.494-6.475V9.475C32 5.903 29.084 3 25.506 3H6.494zm0 2h19.012C28.015 5 30 6.98 30 9.475v13.383c0 2.495-1.985 4.475-4.494 4.475H6.494C3.985 27.333 2 25.353 2 22.858V9.475C2 6.98 3.985 5 6.494 5zm1.22 1.681V7.84c-.329.093-.63.223-.914.382l-.83-.82-1.554 1.561.83.82c-.16.288-.285.594-.372.911l-1.177.002v2.2l1.189-.004c.109.431.345.819.58 1.165v-1.898l-1.038.004v-.737l1.034-.002.058-.294c.084-.429.252-.838.493-1.203l.165-.25-.727-.718.523-.526.728.719.247-.165c.379-.25.793-.417 1.206-.505l.291-.06-.002-1.01h.75L9.19 8.417H11.16c-.185-.221-.951-.508-1.237-.588L9.93 6.68H7.713zm2.078 2.105l.003 1.158a4.19 4.19 0 00-.915.383l-.83-.821-1.553 1.562.83.82c-.16.288-.286.593-.373.91l-1.176.003v2.2l1.188-.004c.094.326.224.624.383.905l-.85.847 1.57 1.543.847-.843c.29.161.599.286.919.373v1.198c.756.006 1.56.003 2.206.003V17.81a4.19 4.19 0 00.915-.383l.847.835 1.554-1.56-.848-.836c.16-.288.286-.594.373-.912l1.152-.007V12.75l-1.165.007a4.09 4.09 0 00-.382-.905l.805-.807-1.57-1.546-.804.806a4.16 4.16 0 00-.915-.372l.007-1.147H9.792zm.732.73h.751l-.006 1.005.297.058c.43.085.844.252 1.21.492l.25.162.701-.704.528.52-.702.704.169.25c.248.374.412.779.505 1.196l.061.292 1.016-.006v.737l-1.01.006-.058.292c-.085.43-.252.838-.494 1.205l-.165.25.744.733-.523.525-.743-.734-.248.165c-.378.247-.789.418-1.203.503l-.294.058v1.067h-.745v-1.059l-.295-.057a3.395 3.395 0 01-1.21-.492l-.248-.162-.747.743-.528-.52.747-.744-.17-.25a3.546 3.546 0 01-.506-1.196l-.06-.291-1.04.004v-.738l1.034-.002.058-.294c.085-.428.252-.837.493-1.203l.165-.25-.726-.718.522-.526.728.72.248-.166a3.546 3.546 0 011.205-.504l.292-.06-.003-1.01zm.388 2.685a1.65 1.65 0 00-1.645 1.645c0 .904.74 1.645 1.645 1.645a1.65 1.65 0 001.645-1.645 1.65 1.65 0 00-1.645-1.645zm0 .73a.91.91 0 01.915.915.91.91 0 01-.915.914.91.91 0 01-.915-.914.91.91 0 01.915-.915z"
})));

function _extends$o() { _extends$o = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$o.apply(this, arguments); }
var StartEventCompensationIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$o({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.995.001C9.705-.084 3.643 3.964 1.257 9.775-1.235 15.485.06 22.577 4.42 27.03c4.193 4.513 11.102 6.17 16.887 4.058 5.996-2.042 10.423-7.93 10.664-14.269.403-6.227-3.26-12.44-8.87-15.153A15.924 15.924 0 0015.994 0zm0 1.73c6.213-.108 12.122 4.355 13.726 10.357 1.678 5.653-.592 12.198-5.463 15.547-5.06 3.719-12.564 3.45-17.343-.626C2.101 23.171.377 16.07 2.848 10.44c2.14-5.205 7.515-8.774 13.147-8.708zm-.566 9.03l-7.415 5.235 7.415 5.238v-5.062c2.386 1.689 4.775 3.375 7.163 5.062V10.761l-7.163 5.058v-5.058zm-.866 1.666v7.13L9.51 15.993l5.052-3.565zm7.166 0v7.137l-5.052-3.568 5.052-3.569z"
})));

function _extends$n() { _extends$n = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$n.apply(this, arguments); }
var StartEventConditionIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$n({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M16 0C7.174 0 0 7.174 0 16s7.174 16 16 16 16-7.174 16-16S24.826 0 16 0zm0 1.73c7.892 0 14.27 6.378 14.27 14.27 0 7.891-6.379 14.27-14.27 14.27S1.73 23.891 1.73 16C1.73 8.108 8.108 1.73 16 1.73zm-5.362 7.523v13.493h10.724V9.253H10.638zm.863.866h8.995V21.88H11.501V10.12zm.928 1.324v.863h7.139v-.863h-7.139zm0 2.605v.867h7.139v-.867h-7.139zm0 3.01v.864h7.139v-.863h-7.139zm0 2.72v.863h7.139v-.863h-7.139z"
})));

function _extends$m() { _extends$m = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$m.apply(this, arguments); }
var StartEventErrorIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$m({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.995.005C9.705-.08 3.643 3.968 1.257 9.78-1.235 15.49.06 22.581 4.42 27.034c4.193 4.513 11.102 6.17 16.887 4.058 5.996-2.042 10.423-7.93 10.664-14.269.403-6.227-3.26-12.44-8.87-15.153A15.924 15.924 0 0015.994.005zm0 1.73c6.213-.108 12.122 4.355 13.726 10.357 1.678 5.653-.592 12.198-5.463 15.547-5.06 3.719-12.564 3.45-17.343-.626-4.814-3.838-6.538-10.939-4.067-16.57 2.14-5.205 7.515-8.774 13.147-8.708zm6.13 7.45l-3.635 7.37-4.52-5.88c-1.37 4.048-2.738 8.095-4.106 12.143l4.603-5.917 4.748 5.433 2.91-13.149zm-7.754 3.889l4.299 5.449 1.073-2.39-1.028 4.135-4.387-5.16-1.78 2.75 1.823-4.784z"
})));

function _extends$l() { _extends$l = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$l.apply(this, arguments); }
var StartEventEscalationIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$l({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.995.001C9.705-.084 3.643 3.964 1.257 9.775-1.235 15.485.06 22.577 4.42 27.03c4.193 4.513 11.102 6.17 16.887 4.058 5.996-2.042 10.423-7.93 10.664-14.269.403-6.227-3.26-12.44-8.87-15.153A15.924 15.924 0 0015.994 0zm0 1.73c6.213-.108 12.122 4.355 13.726 10.357 1.678 5.653-.592 12.198-5.463 15.547-5.06 3.719-12.564 3.45-17.343-.626C2.101 23.171.377 16.07 2.848 10.44c2.14-5.205 7.515-8.774 13.147-8.708zm0 7.183c-1.674 4.658-2.736 9.509-4.41 14.166 1.535-1.526 2.874-3.236 4.41-4.763l4.41 4.763c-1.499-4.713-2.913-9.453-4.41-14.166zm.032 2.931c.822 2.588 1.598 5.19 2.42 7.778l-2.42-2.615c-.683.598-2.455 2.887-2.34 2.39.871-2.489 1.448-5.07 2.34-7.553z"
})));

function _extends$k() { _extends$k = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$k.apply(this, arguments); }
var StartEventMessageIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$k({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.995.001C9.705-.084 3.643 3.964 1.257 9.775-1.235 15.485.06 22.577 4.42 27.03c4.193 4.513 11.102 6.17 16.887 4.058 5.996-2.042 10.423-7.93 10.664-14.269.403-6.227-3.26-12.44-8.87-15.153A15.924 15.924 0 0015.994 0zm0 1.73c6.213-.108 12.122 4.355 13.726 10.357 1.678 5.653-.592 12.198-5.463 15.547-5.06 3.719-12.564 3.45-17.343-.626C2.101 23.171.377 16.07 2.848 10.44c2.14-5.205 7.515-8.774 13.147-8.708zm-7.257 8.732v11.069h14.513v-11.07H8.738zm3.224 1.73h8.064c-1.428.878-2.857 2.807-4.285 3.018l-3.779-3.019zm9.562 1.017v6.593H10.465V13.21l5.528 4.417 5.53-4.418z"
})));

function _extends$j() { _extends$j = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$j.apply(this, arguments); }
var StartEventMultipleIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$j({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.995.001C9.705-.084 3.643 3.964 1.257 9.775-1.235 15.485.06 22.577 4.42 27.03c4.193 4.513 11.102 6.17 16.887 4.058 5.996-2.042 10.423-7.93 10.664-14.269.403-6.227-3.26-12.44-8.87-15.153A15.924 15.924 0 0015.994 0zm0 1.73c6.213-.108 12.122 4.355 13.726 10.357 1.678 5.653-.592 12.198-5.463 15.547-5.06 3.719-12.564 3.45-17.343-.626C2.101 23.171.377 16.07 2.848 10.44c2.14-5.205 7.515-8.774 13.147-8.708zm0 6.328l-7.626 5.536c.97 2.986 1.942 5.971 2.913 8.957h9.426l2.912-8.957-7.625-5.536zm0 1.068l6.609 4.798-2.525 7.763H11.91l-2.524-7.763 6.609-4.798z"
})));

function _extends$i() { _extends$i = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$i.apply(this, arguments); }
var StartEventNonInterruptingConditionIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$i({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M10.632 9.189V22.68h10.723V9.189H10.632zm.862.865h8.994v11.76H11.494v-11.76zm.928 1.324v.863h7.138v-.863h-7.138zm0 2.605v.866h7.138v-.866h-7.138zm0 3.01v.863h7.138v-.863h-7.138zm0 2.72v.862h7.138v-.863h-7.138zM16.12 0h-.232l-.22.004h-.012l-.221.006h-.012l-.22.01h-.012l-.22.013h-.012l-.22.016h-.012l-.22.019h-.005l-.006.001-.22.021h-.006l-.005.001-.22.025h-.011l-.22.028h-.005l-.006.002-.219.03h-.005l-.006.001-.218.033-.006.001-.006.001-.217.036-.006.001-.006.001-.217.039-.006.001-.006.001-.216.042-.006.001-.006.001-.215.045-.006.001-.006.002-.215.047-.006.002-.006.001-.214.05-.006.002-.006.002-.115.029-.152.053-.14.081-.122.106-.1.126-.075.143-.047.154-.018.16.012.16.042.156.07.145.095.13.118.11.137.086.15.059.158.03h.161l.132-.022.11-.028.202-.047.203-.046.208-.043.202-.039.206-.037.206-.034.205-.03.208-.03.205-.025.209-.023.208-.02.21-.017.209-.015.207-.011.21-.009.21-.006.207-.003h.21l.21.002.207.005.207.008.212.011.207.014.208.017.209.019.208.022.205.025.206.028.207.03.208.035.205.036.202.039.052.01.16.018.16-.012.156-.042.146-.07.13-.096.109-.119.085-.136.06-.15.03-.159v-.16l-.03-.16-.059-.15-.086-.136-.109-.118-.13-.096-.145-.07-.128-.038-.057-.011-.006-.002h-.006l-.216-.042-.006-.001-.006-.001-.217-.039H18.9l-.006-.002-.217-.035-.006-.001-.006-.001-.218-.032-.006-.001-.006-.001-.218-.03h-.006l-.006-.001-.219-.027h-.011l-.22-.024-.005-.001h-.006l-.22-.021h-.006l-.006-.001-.22-.017-.005-.001h-.006L17.06.03h-.012l-.22-.012h-.012l-.22-.01h-.012l-.22-.005h-.012L16.132 0h-.012zm8.715 2.783l-.157.034-.149.063-.134.089-.116.112-.092.132-.067.147-.038.157-.008.16.021.16.051.153.079.141.103.124.102.087.052.038h.001l.087.064v.001l.082.061.002.001.076.059h.001l.084.065.082.066.002.001.079.063.002.002.077.063.081.067.002.002.077.065.076.065.001.002.08.07.078.07h.002l.075.068.077.072.002.001.073.069.077.073.072.07.002.001.077.076.07.07v.001l.075.076.07.073.002.001.074.079.002.002.069.074.069.075.074.082.07.08.002.001.068.079h.001l.067.079.068.082.065.078.001.002.068.083.067.084.063.081.001.002.067.087.002.002.063.084.001.001.064.087.008.01.008.01.095.12.093.121.09.119.087.119.088.122.086.123.084.12.081.122.001.002.084.126.08.126.08.127.077.126.079.131.074.127.075.131.073.131.07.13.07.133.069.133.045.09.086.137.109.119.13.096.144.07.156.042.16.013.16-.017.155-.047.143-.075.126-.1.106-.121.082-.14.054-.151.025-.16-.005-.16-.035-.158-.05-.124-.048-.095-.002-.004-.002-.004-.073-.14-.002-.005-.002-.004-.074-.14-.002-.004-.002-.004-.076-.14-.002-.003-.002-.004-.077-.139-.003-.004-.002-.004-.078-.138-.003-.004-.002-.003-.08-.137-.002-.004-.003-.004-.081-.136-.002-.004-.003-.004-.083-.136-.002-.003-.002-.004-.085-.135-.002-.004-.003-.003-.085-.134-.003-.004-.002-.004-.087-.132-.003-.004-.003-.004-.088-.132-.003-.003-.002-.004-.09-.13-.003-.005-.003-.003-.091-.13-.003-.004-.002-.004-.093-.129-.003-.003-.003-.004-.094-.128-.003-.004-.003-.003-.095-.127-.003-.004-.003-.004-.097-.125-.003-.004-.003-.004-.09-.114-.06-.082-.003-.003-.002-.003-.069-.091-.002-.004-.002-.003-.07-.09-.003-.003-.002-.003-.07-.09-.003-.003-.002-.003-.071-.09-.002-.003-.003-.002-.072-.089-.002-.003-.002-.003-.073-.088-.002-.003-.002-.002-.074-.087-.002-.003-.002-.003-.074-.086-.003-.003-.002-.003-.074-.086-.003-.002-.002-.003-.075-.085-.003-.003-.002-.002-.076-.084-.002-.003-.003-.003-.076-.083-.002-.003-.003-.003-.077-.082-.002-.003-.003-.002-.077-.082-.003-.003-.003-.002-.078-.081-.002-.003-.003-.003-.078-.08-.003-.002-.003-.003-.079-.08-.002-.002-.003-.002-.08-.08-.002-.002-.003-.002-.08-.078-.003-.003-.003-.002-.08-.077-.003-.003-.003-.002-.082-.077-.002-.002-.003-.002-.082-.076-.003-.002-.002-.003-.083-.075-.003-.002-.002-.003-.084-.074-.002-.002-.003-.002-.084-.074-.003-.002-.002-.002-.085-.073-.002-.002-.003-.003-.085-.071-.003-.003-.002-.002-.086-.07-.003-.003-.002-.002-.086-.07-.003-.003-.003-.002-.086-.07-.003-.002-.003-.002-.087-.069-.002-.002-.003-.002-.088-.068-.002-.002-.003-.002-.088-.067-.003-.003-.003-.002-.088-.066-.003-.002-.003-.002-.089-.066-.003-.002-.003-.002-.057-.042-.14-.082-.15-.055-.16-.026-.16.004zM6.377 3.21l-.157.037-.148.066-.111.074-.007.006-.003.002-.003.002-.086.069-.003.002-.002.002-.086.07-.003.002-.002.002-.086.07-.002.003-.003.002-.085.071-.002.002-.003.003-.084.071-.003.003-.002.002-.084.072-.003.003-.002.002-.083.073-.003.003-.002.002-.083.074-.002.002-.003.003-.082.074-.003.003-.002.002-.081.076-.003.002-.003.002-.08.077-.003.002-.003.003-.08.076-.002.003-.003.002-.08.078-.002.002-.003.003-.079.078-.002.003-.003.002-.078.08-.003.002-.002.002-.078.08-.002.003-.003.002-.077.08-.003.004-.002.002-.077.081-.002.003-.003.003-.076.082-.002.002-.003.003-.075.082-.002.003-.003.003-.074.083-.003.003-.002.003-.074.084-.003.003-.002.002-.074.085-.002.003-.002.003-.073.085-.003.003-.002.003-.072.086-.002.003-.003.003-.071.087-.003.003-.002.002-.07.088-.003.003-.002.003-.07.088-.003.003-.002.003-.07.09-.002.002-.002.003-.069.09-.002.003-.003.003-.068.09-.002.003-.002.003-.067.092-.003.003-.002.003-.067.092-.002.003-.002.003-.066.092-.002.003-.002.004-.066.093-.002.003-.002.003-.065.094-.002.003-.002.004-.064.094-.002.003-.002.004-.063.095-.002.003-.002.003-.063.097-.002.003-.002.003-.046.073-.05.07-.003.002-.002.003-.067.093-.003.003-.002.003-.066.094-.002.003-.002.003-.066.094-.002.003-.002.003-.064.094-.002.004-.002.003-.064.094-.002.004-.002.003-.062.095-.002.003-.002.003-.062.096-.002.003-.002.003-.06.096-.003.003-.002.003-.06.096-.001.004-.002.003-.059.096-.002.004-.002.003-.058.097-.002.003-.001.003-.057.098-.002.003-.002.003-.056.098-.002.003-.002.003-.055.098-.002.004-.001.003-.055.098-.001.004-.002.003-.054.099-.001.003-.002.003-.052.1-.002.002-.002.004-.051.1-.002.002-.002.004-.05.1-.002.003-.002.003-.05.1v.003l-.002.004-.05.1v.003l-.002.004-.048.1-.002.004-.001.003-.047.101-.002.003-.001.004-.013.027-.052.152-.024.16.006.16.037.157.064.148.091.133.114.114.134.09.147.065.157.036.162.006.159-.024.152-.053.14-.08.122-.105.1-.126.066-.117.01-.023.044-.095.045-.095.002-.003.042-.087.048-.097.048-.095v-.001l.048-.092.001-.001.047-.09.05-.093.002-.002.049-.09.052-.092.001-.002.051-.089.001-.002.051-.087.053-.088.001-.002.055-.091.057-.091.057-.09.001-.002.057-.089.055-.083.001-.002.06-.09.06-.088.062-.089.001-.001.06-.084.063-.088.065-.089.017-.023.016-.025.06-.094.059-.09v-.002l.058-.086.057-.086.001-.001.062-.09.062-.088.001-.002.06-.085.002-.002.06-.082.063-.087.064-.084.002-.002.061-.08.065-.084.064-.08v-.001l.067-.083.067-.082.07-.083.069-.08.063-.074.074-.083.068-.077.002-.002.07-.076.07-.075.072-.077.001-.001.067-.07.076-.078.002-.002.07-.07.075-.075.002-.002.072-.07.075-.072.002-.002.073-.069.074-.068.001-.001.08-.073.076-.068.002-.002.072-.063v-.001l.078-.067.079-.068.002-.001.08-.068.002-.002.077-.063.082-.066.001-.001.075-.06.002-.002.006-.004.117-.111.094-.131.068-.146.04-.156.01-.161-.019-.16-.049-.154-.076-.141-.102-.125-.123-.105-.14-.079-.153-.052-.16-.023-.16.007zm24.596 11.088l-.156.04-.146.067-.131.094-.112.117-.087.135-.061.15-.033.157-.004.134.007.142.005.152.004.15.002.149v.153l.001.011v.015l.004.11.002.11v.002l.002.106v.321l-.003.102-.002.106-.004.107-.005.105-.006.106-.006.106-.008.106v.002l-.008.103v.002l-.01.1-.01.105-.01.105-.013.105-.012.099v.002l-.014.108-.014.1-.016.105-.016.103v.002l-.017.099-.018.104-.019.103v.002l-.019.097-.02.104-.022.103v.001l-.022.098-.023.103v.002l-.024.096-.025.103v.002l-.024.096-.027.102v.003l-.026.093v.001l-.029.103v.002l-.03.099-.028.097v.002l-.03.095-.03.096v.001l-.033.1-.031.095v.002l-.035.1v.003l-.034.094v.003l-.035.096v.001l-.034.09v.002l-.038.098-.036.093v.002l-.038.095-.079.194-.08.188-.085.189-.087.19-.09.184-.092.183-.095.184-.05.093-.064.148-.034.158-.005.16.026.16.054.151.082.14.106.12.127.1.143.075.154.046.16.017.161-.013.156-.042.144-.071.13-.096.109-.119.072-.112.053-.099.003-.005.003-.006.102-.195.003-.006.003-.006.098-.196.003-.006.003-.006.096-.197.002-.006.003-.006.093-.2.002-.006.003-.006.09-.2.002-.006.003-.007.086-.202.003-.006.002-.006.084-.203.002-.005.001-.005.04-.102.002-.003.001-.003.04-.103.001-.003.001-.003.04-.103v-.004l.001-.003.039-.103v-.003l.002-.003.037-.104.001-.003.001-.003.037-.104v-.004l.002-.003.035-.104.002-.003v-.004l.035-.104.002-.004v-.003l.034-.105.002-.003v-.003l.034-.105v-.004l.002-.003.032-.106.001-.003.001-.003.031-.106.001-.003.001-.004.031-.106.001-.003.001-.004.03-.106v-.003l.002-.004.028-.107.001-.003.001-.003.028-.107.001-.004.001-.003.027-.107.001-.004v-.003l.027-.108.001-.003v-.004l.026-.108.001-.003v-.004l.025-.108.001-.003v-.004l.025-.108v-.004l.001-.003.023-.109v-.003l.001-.004.022-.109v-.003l.002-.004.02-.109.001-.004v-.003l.02-.11.002-.003v-.004l.02-.11v-.007l.019-.11v-.003l.001-.004.017-.11v-.004l.001-.003.017-.11v-.008l.016-.11v-.004l.001-.004.015-.11v-.008l.015-.111v-.008l.013-.111v-.007l.013-.112v-.007l.011-.112v-.004l.001-.004.01-.112v-.007l.01-.112v-.008l.008-.112v-.008l.007-.113v-.007l.007-.113v-.008l.005-.113v-.007l.005-.114v-.007l.003-.114v-.007l.003-.114v-.129l.001-.114v-.13l-.003-.114v-.008l-.003-.115v-.007l-.003-.102v-.155l-.003-.158v-.01l-.004-.158v-.01l-.006-.158v-.01l-.007-.148-.023-.16-.051-.152-.08-.14-.103-.124-.125-.102-.142-.077-.153-.05-.16-.02-.161.01zm-30.213.66l-.157.034-.149.063-.134.09-.115.113-.092.132-.067.147-.037.156-.009.134.001.11V15.95l.006.22v.012l.01.22v.012l.012.22v.006l.001.006.015.22v.005l.001.006.018.22.001.006v.006l.022.219v.006l.001.006.024.219.001.006v.006l.028.218.001.006v.006l.031.218.001.006.001.006.033.218.001.006.001.005.037.218v.006l.002.005.04.217v.006l.001.006.043.216.001.006.001.006.046.216v.005l.002.006.048.215.002.006.001.006.051.214.002.006v.006l.055.214.002.005.001.006.057.213.002.006.001.005.06.213.002.005.001.006.063.212.002.005.001.006.066.21.002.006.002.006.068.21.002.005.002.005.07.21.003.005.002.005.074.208.002.006.002.005.077.207.002.006.002.005.08.206.002.005.002.006.082.204.002.006.002.005.086.204.002.005.002.006.088.202.002.005.003.006.09.2.003.006.002.005.094.2.002.006.003.005.096.199.002.005.003.005.03.062.086.137.11.118.128.097.145.07.156.043.16.013.16-.017.155-.047.143-.074.127-.1.106-.121.081-.14.055-.15.025-.16-.005-.161-.034-.158-.05-.124-.028-.055-.092-.19-.087-.188-.087-.192-.083-.19-.08-.193-.078-.194-.076-.196-.073-.195-.07-.197-.067-.198-.065-.199-.063-.2-.059-.2-.056-.2-.055-.204-.05-.201-.049-.202-.046-.205-.043-.206-.04-.203-.038-.207-.034-.204-.032-.207-.028-.205-.026-.207-.023-.208-.02-.207-.018-.207-.014-.208-.011-.207-.009-.208-.005-.207-.002-.104-.017-.16-.046-.155-.074-.143-.1-.126-.121-.107-.139-.081-.152-.055-.159-.025-.161.004zm24.585 11.83l-.156.039-.146.068-.11.076-.015.012-.163.129-.166.127-.168.125-.17.124-.17.12-.172.118-.173.115-.176.114-.177.111-.18.11-.178.105-.182.104-.182.101-.184.1-.184.095-.189.095-.186.09-.188.089-.19.086-.19.082-.193.081-.195.078-.191.074-.197.073-.195.07-.196.065-.198.064-.198.061-.2.058-.2.055-.2.052-.2.049-.151.035-.153.05-.141.078-.125.103-.103.124-.078.14-.05.154-.022.16.009.16.038.157.067.147.093.132.116.112.134.089.149.062.158.034.16.003.133-.02.158-.035.006-.002.006-.001.213-.052.006-.002.007-.001.212-.056.006-.001.006-.002.212-.058.006-.002.006-.002.211-.061.006-.002.006-.002.21-.064.006-.002.006-.002.21-.067.005-.002.006-.002.208-.07.006-.002.006-.003.207-.073.006-.002.006-.002.206-.077.006-.002.005-.002.206-.08.005-.001.006-.003.204-.082.006-.002.005-.002.203-.085.006-.003.005-.002.202-.088.006-.002.005-.003.2-.09.006-.003.006-.003.2-.093.005-.003.005-.002.198-.096.006-.003.005-.003.197-.099.005-.002.005-.003.196-.102.005-.002.005-.003.195-.105.005-.002.005-.003.193-.107.005-.003.005-.003.191-.11.005-.003.005-.003.19-.112.005-.003.005-.003.189-.115.005-.003.005-.003.187-.117.005-.003.004-.004.186-.12.005-.003.004-.003.184-.122.005-.003.005-.004.182-.125.004-.003.005-.003.18-.128.005-.003.005-.003.179-.13.004-.003.005-.004.177-.132.004-.004.005-.003.175-.135.005-.003.004-.004.173-.137.005-.003.004-.004.019-.015.115-.113.092-.132.066-.147.038-.157.008-.16-.022-.16-.052-.153-.079-.14-.103-.124-.125-.102-.142-.078-.153-.05-.16-.02-.16.01zm-19.17.054l-.153.051-.14.079-.124.103-.103.125-.077.141-.05.153-.02.16.009.161.04.156.067.147.093.131.095.094.047.04.005.004.005.004.17.14.005.004.005.004.172.137.004.004.005.003.086.067.003.002.003.002.087.067.003.002.003.002.088.066.002.003.003.002.089.065.002.002.003.002.09.065.002.002.003.002.09.064.002.002.003.002.09.063.003.002.003.002.09.063.003.002.003.002.092.062.002.002.003.002.092.061.003.002.003.002.092.06.003.003.003.001.093.06.003.002.003.002.093.06.003.001.003.002.094.058.003.002.003.002.095.058.003.001.003.002.095.057.003.002.003.002.095.056.003.002.003.002.096.055.004.002.003.001.096.055.003.002.003.002.098.053.003.002.003.002.097.053.004.002.003.001.098.053.003.001.003.002.099.052.003.001.003.002.1.05.003.002.003.002.1.05.003.002.003.001.1.05h.003l.004.003.1.048.004.001.003.002.101.048.003.001.004.002.101.046.004.002.003.001.102.046.004.002.003.001.103.045.003.002.003.001.103.045.004.001.003.002.104.043.003.001.004.002.104.042.003.002.004.001.104.042.004.001.003.002.105.04.004.002.003.001.106.04.003.002h.004l.106.04.004.001.003.002.107.038.003.001.004.001.107.038.003.001.004.001.107.037.004.001.004.001.108.036.003.001.004.001.108.035.004.001.003.001.11.034.003.001.004.001.109.033.004.002h.003l.11.033h.004l.003.002.11.031.004.001.004.001.084.023.081.028.004.001.003.001.109.037.003.001.004.001.109.036.003.001.004.001.109.035h.003l.004.002.11.033.003.001.003.001.11.033.003.001.004.001.109.031.004.002h.003l.11.031.003.001.004.001.11.03h.003l.003.001.11.029h.004l.003.002.11.027.003.001.004.001.11.027h.003l.004.001.004.001.16.022.16-.008.157-.038.147-.067.132-.092.112-.116.09-.134.062-.149.034-.157.004-.161-.025-.16-.055-.151-.082-.139-.107-.12-.127-.1-.143-.074-.124-.04h-.003l-.104-.025-.103-.026h-.002l-.095-.026h-.001l-.101-.027h-.002l-.1-.028h-.002l-.103-.03-.104-.032-.097-.03h-.002l-.103-.033-.102-.033-.101-.034-.106-.036-.027-.01-.027-.007-.107-.03-.104-.029-.104-.03h-.002l-.097-.03-.102-.032-.102-.032-.102-.034-.103-.035-.096-.034-.1-.036-.101-.037h-.002l-.094-.036-.096-.037-.097-.04h-.002l-.099-.04-.098-.042h-.002l-.092-.04-.097-.043-.095-.043-.097-.044h-.002l-.09-.043-.094-.045-.094-.046-.093-.047-.09-.046-.096-.05-.088-.047-.002-.001-.09-.049-.094-.052-.002-.002-.087-.049-.087-.05h-.002l-.088-.053h-.001l-.09-.055-.086-.052-.002-.001-.089-.055-.084-.054h-.002l-.09-.059h-.001l-.085-.056-.001-.001-.084-.056-.082-.056h-.001l-.086-.06-.082-.058H7.79l-.086-.062-.002-.002-.08-.058-.081-.06h-.001l-.085-.064-.002-.002-.076-.058-.002-.002-.082-.064-.161-.128-.162-.133-.04-.034-.132-.092-.147-.066-.157-.038-.16-.008-.16.022z"
})));

function _extends$h() { _extends$h = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$h.apply(this, arguments); }
var StartEventNonInterruptingEscalationIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$h({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M16 9.209c-1.674 4.655-2.735 9.504-4.408 14.16 1.534-1.526 2.873-3.235 4.407-4.761l4.408 4.76c-1.497-4.71-2.91-9.448-4.408-14.16zm.031 2.93c.822 2.586 1.598 5.187 2.42 7.774l-2.42-2.614c-.682.598-2.453 2.886-2.34 2.389.873-2.488 1.45-5.068 2.34-7.55zM16.132.364c-1.51.016-3.055.139-4.492.614-.854.442-.266 1.861.651 1.578 2.266-.58 4.656-.596 6.944-.144.935.063 1.21-1.391.318-1.674-1.118-.26-2.274-.361-3.42-.374zm8.865 2.777c-.931-.1-1.262 1.29-.425 1.666 1.863 1.364 3.222 3.298 4.322 5.296.617.737 1.875-.145 1.398-.979-1.184-2.275-2.808-4.384-4.923-5.866a.863.863 0 00-.372-.117zM6.55 3.564c-.734.078-1.196.762-1.735 1.206C3.552 6.02 2.55 7.511 1.681 9.053c-.31.533-.71 1.33-.03 1.767.615.432 1.282-.132 1.446-.742.796-1.475 1.746-2.89 2.934-4.08.43-.548 1.292-.822 1.34-1.595a.874.874 0 00-.822-.839zm24.582 11.078c-.771-.033-1.004.82-.873 1.437.13 2.395-.471 4.797-1.615 6.897-.33.876.984 1.559 1.512.785a14.276 14.276 0 001.761-8.54.865.865 0 00-.785-.579zm-30.195.666c-.774-.06-1.032.785-.905 1.407.117 2.41.732 4.81 1.858 6.945.528.774 1.84.09 1.51-.786A15.932 15.932 0 011.728 16a.876.876 0 00-.79-.692zm24.57 11.817c-.762.099-1.243.835-1.919 1.16-1.514 1.002-3.237 1.632-4.978 2.092-.864.423-.307 1.855.616 1.591 2.528-.578 4.93-1.75 6.913-3.421.469-.522.07-1.42-.631-1.422zm-19.16.042c-.845.001-1.12 1.228-.395 1.628 1.665 1.401 3.667 2.348 5.76 2.912.618.178 1.482.565 1.893-.177.355-.628-.226-1.297-.87-1.326-1.972-.515-3.912-1.285-5.5-2.594-.26-.213-.522-.472-.888-.443z"
})));

function _extends$g() { _extends$g = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$g.apply(this, arguments); }
var StartEventNonInterruptingMessageIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$g({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M8.746 10.393v11.064h14.506V10.393H8.746zm3.223 1.728h8.06c-1.428.879-2.856 2.807-4.283 3.018l-3.777-3.018zm9.557 1.018v6.59H10.473v-6.59l5.525 4.416 5.528-4.416zM16.132 0c-1.51.016-3.055.139-4.492.614-.854.442-.266 1.861.651 1.578 2.266-.58 4.656-.596 6.944-.144.935.063 1.21-1.391.318-1.674-1.118-.26-2.274-.361-3.42-.374zm8.865 2.777c-.931-.1-1.262 1.29-.425 1.666 1.863 1.364 3.222 3.298 4.322 5.296.617.737 1.875-.145 1.398-.979-1.184-2.275-2.808-4.384-4.923-5.866a.863.863 0 00-.372-.117zM6.55 3.2c-.734.078-1.196.762-1.735 1.206C3.552 5.656 2.55 7.147 1.681 8.69c-.31.533-.71 1.33-.03 1.767.615.432 1.282-.132 1.446-.742.796-1.475 1.746-2.89 2.934-4.08.43-.548 1.292-.822 1.34-1.595a.874.874 0 00-.822-.839zm24.582 11.078c-.771-.033-1.004.82-.873 1.437.13 2.395-.471 4.797-1.615 6.897-.33.876.984 1.559 1.512.785a14.276 14.276 0 001.761-8.54.865.865 0 00-.785-.579zm-30.195.666c-.774-.06-1.032.785-.905 1.407.117 2.41.732 4.81 1.858 6.945.528.774 1.84.09 1.51-.786a15.932 15.932 0 01-1.672-6.874.876.876 0 00-.79-.692zm24.57 11.817c-.762.099-1.243.835-1.919 1.16-1.514 1.002-3.237 1.632-4.978 2.092-.864.423-.307 1.855.616 1.591 2.528-.578 4.93-1.75 6.913-3.421.469-.522.07-1.42-.631-1.422zm-19.16.042c-.845.001-1.12 1.228-.395 1.628 1.665 1.401 3.667 2.348 5.76 2.912.618.178 1.482.565 1.893-.177.355-.628-.226-1.297-.87-1.326-1.972-.515-3.912-1.285-5.5-2.594-.26-.213-.522-.472-.888-.443z"
})));

function _extends$f() { _extends$f = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$f.apply(this, arguments); }
var StartEventNonInterruptingMultipleIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$f({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M23.621 13.524L16 7.99l-7.622 5.534 2.911 8.952h9.422l2.911-8.952zm-1.016.33l-2.523 7.759h-8.165l-2.524-7.76L16 9.059l6.606 4.796zM16.132 0c-1.51.016-3.055.139-4.492.614-.854.442-.266 1.861.651 1.578 2.266-.58 4.656-.596 6.944-.144.935.063 1.21-1.391.318-1.674-1.118-.26-2.274-.361-3.42-.374zm8.865 2.777c-.931-.1-1.262 1.29-.425 1.666 1.863 1.364 3.222 3.298 4.322 5.296.617.737 1.875-.145 1.398-.979-1.184-2.275-2.808-4.384-4.923-5.866a.863.863 0 00-.372-.117zM6.55 3.2c-.734.078-1.196.762-1.735 1.206C3.552 5.656 2.55 7.147 1.681 8.69c-.31.533-.71 1.33-.03 1.767.615.432 1.282-.132 1.446-.742.796-1.475 1.746-2.89 2.934-4.08.43-.548 1.292-.822 1.34-1.595a.874.874 0 00-.822-.839zm24.582 11.078c-.771-.033-1.004.82-.873 1.437.13 2.395-.471 4.797-1.615 6.897-.33.876.984 1.559 1.512.785a14.276 14.276 0 001.761-8.54.865.865 0 00-.785-.579zm-30.195.666c-.774-.06-1.032.785-.905 1.407.117 2.41.732 4.81 1.858 6.945.528.774 1.84.09 1.51-.786a15.932 15.932 0 01-1.672-6.874.876.876 0 00-.79-.692zm24.57 11.817c-.762.099-1.243.835-1.919 1.16-1.514 1.002-3.237 1.632-4.978 2.092-.864.423-.307 1.855.616 1.591 2.528-.578 4.93-1.75 6.913-3.421.469-.522.07-1.42-.631-1.422zm-19.16.042c-.845.001-1.12 1.228-.395 1.628 1.665 1.401 3.667 2.348 5.76 2.912.618.178 1.482.565 1.893-.177.355-.628-.226-1.297-.87-1.326-1.972-.515-3.912-1.285-5.5-2.594-.26-.213-.522-.472-.888-.443z"
})));

function _extends$e() { _extends$e = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$e.apply(this, arguments); }
var StartEventNonInterruptingParallelMultipleIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$e({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M13.503 9.016v4.428H9.075v4.98h4.428v4.428h4.98v-4.427h4.428v-4.981h-4.427V9.016h-4.981zm.83.83h3.32v4.428h4.428v3.32h-4.428v4.428h-3.32v-4.454H9.905v-3.294h4.428V9.846zM16.12 0h-.232l-.22.004h-.012l-.221.006h-.012l-.22.01h-.012l-.22.013h-.012l-.22.016h-.012l-.22.019h-.005l-.006.001-.22.021h-.006l-.005.001-.22.025h-.011l-.22.028h-.005l-.006.002-.219.03h-.005l-.006.001-.218.033-.006.001-.006.001-.217.036-.006.001-.006.001-.217.039-.006.001-.006.001-.216.042-.006.001-.006.001-.215.045-.006.001-.006.002-.215.047-.006.002-.006.001-.214.05-.006.002-.006.002-.115.029-.152.053-.14.081-.122.106-.1.126-.075.143-.047.154-.018.16.012.16.042.156.07.145.095.13.118.11.137.086.15.059.158.03h.161l.132-.022.11-.028.202-.047.203-.046.208-.043.202-.039.206-.037.206-.034.205-.03.208-.03.205-.025.209-.023.208-.02.21-.017.209-.015.207-.011.21-.009.21-.006.207-.003h.21l.21.002.207.005.207.008.212.011.207.014.208.017.209.019.208.022.205.025.206.028.207.03.208.035.205.036.202.039.052.01.16.018.16-.012.156-.042.146-.07.13-.096.109-.119.085-.136.06-.15.03-.159v-.16l-.03-.16-.059-.15-.086-.136-.109-.118-.13-.096-.145-.07-.128-.038-.057-.011-.006-.002h-.006l-.216-.042-.006-.001-.006-.001-.217-.039H18.9l-.006-.002-.217-.035-.006-.001-.006-.001-.218-.032-.006-.001-.006-.001-.218-.03h-.006l-.006-.001-.219-.027h-.011l-.22-.024-.005-.001h-.006l-.22-.021h-.006l-.006-.001-.22-.017-.005-.001h-.006L17.06.03h-.012l-.22-.012h-.012l-.22-.01h-.012l-.22-.005h-.012L16.132 0h-.012zm8.715 2.783l-.157.034-.149.063-.134.089-.116.112-.092.132-.067.147-.038.157-.008.16.021.16.051.153.079.141.103.124.102.087.052.038h.001l.087.064v.001l.082.061.002.001.076.059h.001l.084.065.082.066.002.001.079.063.002.002.077.063.081.067.002.002.077.065.076.065.001.002.08.07.078.07h.002l.075.068.077.072.002.001.073.069.077.073.072.07.002.001.077.076.07.07v.001l.075.076.07.073.002.001.074.079.002.002.069.074.069.075.074.082.07.08.002.001.068.079h.001l.067.079.068.082.065.078.001.002.068.083.067.084.063.081.001.002.067.087.002.002.063.084.001.001.064.087.008.01.008.01.095.12.093.121.09.119.087.119.088.122.086.123.084.12.081.122.001.002.084.126.08.126.08.127.077.126.079.131.074.127.075.131.073.131.07.13.07.133.069.133.045.09.086.137.109.119.13.096.144.07.156.042.16.013.16-.017.155-.047.143-.075.126-.1.106-.121.082-.14.054-.151.025-.16-.005-.16-.035-.158-.05-.124-.048-.095-.002-.004-.002-.004-.073-.14-.002-.005-.002-.004-.074-.14-.002-.004-.002-.004-.076-.14-.002-.003-.002-.004-.077-.139-.003-.004-.002-.004-.078-.138-.003-.004-.002-.003-.08-.137-.002-.004-.003-.004-.081-.136-.002-.004-.003-.004-.083-.136-.002-.003-.002-.004-.085-.135-.002-.004-.003-.003-.085-.134-.003-.004-.002-.004-.087-.132-.003-.004-.003-.004-.088-.132-.003-.003-.002-.004-.09-.13-.003-.005-.003-.003-.091-.13-.003-.004-.002-.004-.093-.129-.003-.003-.003-.004-.094-.128-.003-.004-.003-.003-.095-.127-.003-.004-.003-.004-.097-.125-.003-.004-.003-.004-.09-.114-.06-.082-.003-.003-.002-.003-.069-.091-.002-.004-.002-.003-.07-.09-.003-.003-.002-.003-.07-.09-.003-.003-.002-.003-.071-.09-.002-.003-.003-.002-.072-.089-.002-.003-.002-.003-.073-.088-.002-.003-.002-.002-.074-.087-.002-.003-.002-.003-.074-.086-.003-.003-.002-.003-.074-.086-.003-.002-.002-.003-.075-.085-.003-.003-.002-.002-.076-.084-.002-.003-.003-.003-.076-.083-.002-.003-.003-.003-.077-.082-.002-.003-.003-.002-.077-.082-.003-.003-.003-.002-.078-.081-.002-.003-.003-.003-.078-.08-.003-.002-.003-.003-.079-.08-.002-.002-.003-.002-.08-.08-.002-.002-.003-.002-.08-.078-.003-.003-.003-.002-.08-.077-.003-.003-.003-.002-.082-.077-.002-.002-.003-.002-.082-.076-.003-.002-.002-.003-.083-.075-.003-.002-.002-.003-.084-.074-.002-.002-.003-.002-.084-.074-.003-.002-.002-.002-.085-.073-.002-.002-.003-.003-.085-.071-.003-.003-.002-.002-.086-.07-.003-.003-.002-.002-.086-.07-.003-.003-.003-.002-.086-.07-.003-.002-.003-.002-.087-.069-.002-.002-.003-.002-.088-.068-.002-.002-.003-.002-.088-.067-.003-.003-.003-.002-.088-.066-.003-.002-.003-.002-.089-.066-.003-.002-.003-.002-.057-.042-.14-.082-.15-.055-.16-.026-.16.004zM6.377 3.21l-.157.037-.148.066-.111.074-.007.006-.003.002-.003.002-.086.069-.003.002-.002.002-.086.07-.003.002-.002.002-.086.07-.002.003-.003.002-.085.071-.002.002-.003.003-.084.071-.003.003-.002.002-.084.072-.003.003-.002.002-.083.073-.003.003-.002.002-.083.074-.002.002-.003.003-.082.074-.003.003-.002.002-.081.076-.003.002-.003.002-.08.077-.003.002-.003.003-.08.076-.002.003-.003.002-.08.078-.002.002-.003.003-.079.078-.002.003-.003.002-.078.08-.003.002-.002.002-.078.08-.002.003-.003.002-.077.08-.003.004-.002.002-.077.081-.002.003-.003.003-.076.082-.002.002-.003.003-.075.082-.002.003-.003.003-.074.083-.003.003-.002.003-.074.084-.003.003-.002.002-.074.085-.002.003-.002.003-.073.085-.003.003-.002.003-.072.086-.002.003-.003.003-.071.087-.003.003-.002.002-.07.088-.003.003-.002.003-.07.088-.003.003-.002.003-.07.09-.002.002-.002.003-.069.09-.002.003-.003.003-.068.09-.002.003-.002.003-.067.092-.003.003-.002.003-.067.092-.002.003-.002.003-.066.092-.002.003-.002.004-.066.093-.002.003-.002.003-.065.094-.002.003-.002.004-.064.094-.002.003-.002.004-.063.095-.002.003-.002.003-.063.097-.002.003-.002.003-.046.073-.05.07-.003.002-.002.003-.067.093-.003.003-.002.003-.066.094-.002.003-.002.003-.066.094-.002.003-.002.003-.064.094-.002.004-.002.003-.064.094-.002.004-.002.003-.062.095-.002.003-.002.003-.062.096-.002.003-.002.003-.06.096-.003.003-.002.003-.06.096-.001.004-.002.003-.059.096-.002.004-.002.003-.058.097-.002.003-.001.003-.057.098-.002.003-.002.003-.056.098-.002.003-.002.003-.055.098-.002.004-.001.003-.055.098-.001.004-.002.003-.054.099-.001.003-.002.003-.052.1-.002.002-.002.004-.051.1-.002.002-.002.004-.05.1-.002.003-.002.003-.05.1v.003l-.002.004-.05.1v.003l-.002.004-.048.1-.002.004-.001.003-.047.101-.002.003-.001.004-.013.027-.052.152-.024.16.006.16.037.157.064.148.091.133.114.114.134.09.147.065.157.036.162.006.159-.024.152-.053.14-.08.122-.105.1-.126.066-.117.01-.023.044-.095.045-.095.002-.003.042-.087.048-.097.048-.095v-.001l.048-.092.001-.001.047-.09.05-.093.002-.002.049-.09.052-.092.001-.002.051-.089.001-.002.051-.087.053-.088.001-.002.055-.091.057-.091.057-.09.001-.002.057-.089.055-.083.001-.002.06-.09.06-.088.062-.089.001-.001.06-.084.063-.088.065-.089.017-.023.016-.025.06-.094.059-.09v-.002l.058-.086.057-.086.001-.001.062-.09.062-.088.001-.002.06-.085.002-.002.06-.082.063-.087.064-.084.002-.002.061-.08.065-.084.064-.08v-.001l.067-.083.067-.082.07-.083.069-.08.063-.074.074-.083.068-.077.002-.002.07-.076.07-.075.072-.077.001-.001.067-.07.076-.078.002-.002.07-.07.075-.075.002-.002.072-.07.075-.072.002-.002.073-.069.074-.068.001-.001.08-.073.076-.068.002-.002.072-.063v-.001l.078-.067.079-.068.002-.001.08-.068.002-.002.077-.063.082-.066.001-.001.075-.06.002-.002.006-.004.117-.111.094-.131.068-.146.04-.156.01-.161-.019-.16-.049-.154-.076-.141-.102-.125-.123-.105-.14-.079-.153-.052-.16-.023-.16.007zm24.596 11.088l-.156.04-.146.067-.131.094-.112.117-.087.135-.061.15-.033.157-.004.134.007.142.005.152.004.15.002.149v.153l.001.011v.015l.004.11.002.11v.002l.002.106v.321l-.003.102-.002.106-.004.107-.005.105-.006.106-.006.106-.008.106v.002l-.008.103v.002l-.01.1-.01.105-.01.105-.013.105-.012.099v.002l-.014.108-.014.1-.016.105-.016.103v.002l-.017.099-.018.104-.019.103v.002l-.019.097-.02.104-.022.103v.001l-.022.098-.023.103v.002l-.024.096-.025.103v.002l-.024.096-.027.102v.003l-.026.093v.001l-.029.103v.002l-.03.099-.028.097v.002l-.03.095-.03.096v.001l-.033.1-.031.095v.002l-.035.1v.003l-.034.094v.003l-.035.096v.001l-.034.09v.002l-.038.098-.036.093v.002l-.038.095-.079.194-.08.188-.085.189-.087.19-.09.184-.092.183-.095.184-.05.093-.064.148-.034.158-.005.16.026.16.054.151.082.14.106.12.127.1.143.075.154.046.16.017.161-.013.156-.042.144-.071.13-.096.109-.119.072-.112.053-.099.003-.005.003-.006.102-.195.003-.006.003-.006.098-.196.003-.006.003-.006.096-.197.002-.006.003-.006.093-.2.002-.006.003-.006.09-.2.002-.006.003-.007.086-.202.003-.006.002-.006.084-.203.002-.005.001-.005.04-.102.002-.003.001-.003.04-.103.001-.003.001-.003.04-.103v-.004l.001-.003.039-.103v-.003l.002-.003.037-.104.001-.003.001-.003.037-.104v-.004l.002-.003.035-.104.002-.003v-.004l.035-.104.002-.004v-.003l.034-.105.002-.003v-.003l.034-.105v-.004l.002-.003.032-.106.001-.003.001-.003.031-.106.001-.003.001-.004.031-.106.001-.003.001-.004.03-.106v-.003l.002-.004.028-.107.001-.003.001-.003.028-.107.001-.004.001-.003.027-.107.001-.004v-.003l.027-.108.001-.003v-.004l.026-.108.001-.003v-.004l.025-.108.001-.003v-.004l.025-.108v-.004l.001-.003.023-.109v-.003l.001-.004.022-.109v-.003l.002-.004.02-.109.001-.004v-.003l.02-.11.002-.003v-.004l.02-.11v-.007l.019-.11v-.003l.001-.004.017-.11v-.004l.001-.003.017-.11v-.008l.016-.11v-.004l.001-.004.015-.11v-.008l.015-.111v-.008l.013-.111v-.007l.013-.112v-.007l.011-.112v-.004l.001-.004.01-.112v-.007l.01-.112v-.008l.008-.112v-.008l.007-.113v-.007l.007-.113v-.008l.005-.113v-.007l.005-.114v-.007l.003-.114v-.007l.003-.114v-.129l.001-.114v-.13l-.003-.114v-.008l-.003-.115v-.007l-.003-.102v-.155l-.003-.158v-.01l-.004-.158v-.01l-.006-.158v-.01l-.007-.148-.023-.16-.051-.152-.08-.14-.103-.124-.125-.102-.142-.077-.153-.05-.16-.02-.161.01zm-30.213.66l-.157.034-.149.063-.134.09-.115.113-.092.132-.067.147-.037.156-.009.134.001.11V15.95l.006.22v.012l.01.22v.012l.012.22v.006l.001.006.015.22v.005l.001.006.018.22.001.006v.006l.022.219v.006l.001.006.024.219.001.006v.006l.028.218.001.006v.006l.031.218.001.006.001.006.033.218.001.006.001.005.037.218v.006l.002.005.04.217v.006l.001.006.043.216.001.006.001.006.046.216v.005l.002.006.048.215.002.006.001.006.051.214.002.006v.006l.055.214.002.005.001.006.057.213.002.006.001.005.06.213.002.005.001.006.063.212.002.005.001.006.066.21.002.006.002.006.068.21.002.005.002.005.07.21.003.005.002.005.074.208.002.006.002.005.077.207.002.006.002.005.08.206.002.005.002.006.082.204.002.006.002.005.086.204.002.005.002.006.088.202.002.005.003.006.09.2.003.006.002.005.094.2.002.006.003.005.096.199.002.005.003.005.03.062.086.137.11.118.128.097.145.07.156.043.16.013.16-.017.155-.047.143-.074.127-.1.106-.121.081-.14.055-.15.025-.16-.005-.161-.034-.158-.05-.124-.028-.055-.092-.19-.087-.188-.087-.192-.083-.19-.08-.193-.078-.194-.076-.196-.073-.195-.07-.197-.067-.198-.065-.199-.063-.2-.059-.2-.056-.2-.055-.204-.05-.201-.049-.202-.046-.205-.043-.206-.04-.203-.038-.207-.034-.204-.032-.207-.028-.205-.026-.207-.023-.208-.02-.207-.018-.207-.014-.208-.011-.207-.009-.208-.005-.207-.002-.104-.017-.16-.046-.155-.074-.143-.1-.126-.121-.107-.139-.081-.152-.055-.159-.025-.161.004zm24.585 11.83l-.156.039-.146.068-.11.076-.015.012-.163.129-.166.127-.168.125-.17.124-.17.12-.172.118-.173.115-.176.114-.177.111-.18.11-.178.105-.182.104-.182.101-.184.1-.184.095-.189.095-.186.09-.188.089-.19.086-.19.082-.193.081-.195.078-.191.074-.197.073-.195.07-.196.065-.198.064-.198.061-.2.058-.2.055-.2.052-.2.049-.151.035-.153.05-.141.078-.125.103-.103.124-.078.14-.05.154-.022.16.009.16.038.157.067.147.093.132.116.112.134.089.149.062.158.034.16.003.133-.02.158-.035.006-.002.006-.001.213-.052.006-.002.007-.001.212-.056.006-.001.006-.002.212-.058.006-.002.006-.002.211-.061.006-.002.006-.002.21-.064.006-.002.006-.002.21-.067.005-.002.006-.002.208-.07.006-.002.006-.003.207-.073.006-.002.006-.002.206-.077.006-.002.005-.002.206-.08.005-.001.006-.003.204-.082.006-.002.005-.002.203-.085.006-.003.005-.002.202-.088.006-.002.005-.003.2-.09.006-.003.006-.003.2-.093.005-.003.005-.002.198-.096.006-.003.005-.003.197-.099.005-.002.005-.003.196-.102.005-.002.005-.003.195-.105.005-.002.005-.003.193-.107.005-.003.005-.003.191-.11.005-.003.005-.003.19-.112.005-.003.005-.003.189-.115.005-.003.005-.003.187-.117.005-.003.004-.004.186-.12.005-.003.004-.003.184-.122.005-.003.005-.004.182-.125.004-.003.005-.003.18-.128.005-.003.005-.003.179-.13.004-.003.005-.004.177-.132.004-.004.005-.003.175-.135.005-.003.004-.004.173-.137.005-.003.004-.004.019-.015.115-.113.092-.132.066-.147.038-.157.008-.16-.022-.16-.052-.153-.079-.14-.103-.124-.125-.102-.142-.078-.153-.05-.16-.02-.16.01zm-19.17.054l-.153.051-.14.079-.124.103-.103.125-.077.141-.05.153-.02.16.009.161.04.156.067.147.093.131.095.094.047.04.005.004.005.004.17.14.005.004.005.004.172.137.004.004.005.003.086.067.003.002.003.002.087.067.003.002.003.002.088.066.002.003.003.002.089.065.002.002.003.002.09.065.002.002.003.002.09.064.002.002.003.002.09.063.003.002.003.002.09.063.003.002.003.002.092.062.002.002.003.002.092.061.003.002.003.002.092.06.003.003.003.001.093.06.003.002.003.002.093.06.003.001.003.002.094.058.003.002.003.002.095.058.003.001.003.002.095.057.003.002.003.002.095.056.003.002.003.002.096.055.004.002.003.001.096.055.003.002.003.002.098.053.003.002.003.002.097.053.004.002.003.001.098.053.003.001.003.002.099.052.003.001.003.002.1.05.003.002.003.002.1.05.003.002.003.001.1.05h.003l.004.003.1.048.004.001.003.002.101.048.003.001.004.002.101.046.004.002.003.001.102.046.004.002.003.001.103.045.003.002.003.001.103.045.004.001.003.002.104.043.003.001.004.002.104.042.003.002.004.001.104.042.004.001.003.002.105.04.004.002.003.001.106.04.003.002h.004l.106.04.004.001.003.002.107.038.003.001.004.001.107.038.003.001.004.001.107.037.004.001.004.001.108.036.003.001.004.001.108.035.004.001.003.001.11.034.003.001.004.001.109.033.004.002h.003l.11.033h.004l.003.002.11.031.004.001.004.001.084.023.081.028.004.001.003.001.109.037.003.001.004.001.109.036.003.001.004.001.109.035h.003l.004.002.11.033.003.001.003.001.11.033.003.001.004.001.109.031.004.002h.003l.11.031.003.001.004.001.11.03h.003l.003.001.11.029h.004l.003.002.11.027.003.001.004.001.11.027h.003l.004.001.004.001.16.022.16-.008.157-.038.147-.067.132-.092.112-.116.09-.134.062-.149.034-.157.004-.161-.025-.16-.055-.151-.082-.139-.107-.12-.127-.1-.143-.074-.124-.04h-.003l-.104-.025-.103-.026h-.002l-.095-.026h-.001l-.101-.027h-.002l-.1-.028h-.002l-.103-.03-.104-.032-.097-.03h-.002l-.103-.033-.102-.033-.101-.034-.106-.036-.027-.01-.027-.007-.107-.03-.104-.029-.104-.03h-.002l-.097-.03-.102-.032-.102-.032-.102-.034-.103-.035-.096-.034-.1-.036-.101-.037h-.002l-.094-.036-.096-.037-.097-.04h-.002l-.099-.04-.098-.042h-.002l-.092-.04-.097-.043-.095-.043-.097-.044h-.002l-.09-.043-.094-.045-.094-.046-.093-.047-.09-.046-.096-.05-.088-.047-.002-.001-.09-.049-.094-.052-.002-.002-.087-.049-.087-.05h-.002l-.088-.053h-.001l-.09-.055-.086-.052-.002-.001-.089-.055-.084-.054h-.002l-.09-.059h-.001l-.085-.056-.001-.001-.084-.056-.082-.056h-.001l-.086-.06-.082-.058H7.79l-.086-.062-.002-.002-.08-.058-.081-.06h-.001l-.085-.064-.002-.002-.076-.058-.002-.002-.082-.064-.161-.128-.162-.133-.04-.034-.132-.092-.147-.066-.157-.038-.16-.008-.16.022z",
  opacity: ".98"
})));

function _extends$d() { _extends$d = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$d.apply(this, arguments); }
var StartEventNonInterruptingSignalIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$d({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M16.007 8.82L9.21 21.022h13.596L16.007 8.82zm0 1.775l5.328 9.563H10.68l5.327-9.563zM16.14.386c-1.571.236-4.195-.284-4.9 1.381.619 1.703 2.745.069 4.085.365 1.421-.13 2.84.2 4.235.259C21.27.784 18.19.344 17 .413a20.456 20.456 0 00-.86-.027zM25 3.162c-2.19.694.401 2.26 1.181 3.094 1.083 1.152 1.954 2.484 2.715 3.864 1.48 1.005 1.845-1.26.81-2.03-1.158-1.897-2.613-3.704-4.513-4.89l-.192-.038zm-18.438.423c-1.793.712-2.909 2.548-4.01 4.061-.773.814-2.211 3.653.005 3.211 1.123-1.469 1.87-3.306 3.267-4.614.664-.7 2.73-2.013.738-2.658zm24.57 11.072c-1.659.435-.468 2.667-.99 3.895a13.427 13.427 0 01-1.497 4.435c-.23 1.659 1.991 1.165 2.018-.199a14.277 14.277 0 001.254-7.552.865.865 0 00-.785-.579zm-30.18.666c-1.677.386-.633 2.667-.608 3.876.371 1.623.792 3.35 1.79 4.696 2.382.321.571-2.338.292-3.492a15.92 15.92 0 01-.684-4.39.877.877 0 00-.79-.69zm24.558 11.81c-1.755.865-3.303 2.266-5.274 2.765-1.162-.016-3.074 1.271-1.331 2.102 2.66-.447 5.163-1.733 7.236-3.445.472-.506.06-1.432-.631-1.421zm-19.151.043c-2.004.786.416 2.405 1.43 2.913 1.608.904 3.379 1.636 5.208 1.877 1.77-.804-.228-2.094-1.357-2.073-1.75-.537-3.403-1.396-4.798-2.586l-.227-.104-.256-.027z"
})));

function _extends$c() { _extends$c = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$c.apply(this, arguments); }
var StartEventNonInterruptingTimerIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$c({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.991 8.7c-3.018-.042-5.92 1.925-7.03 4.725-1.138 2.695-.509 6.011 1.537 8.102 1.99 2.142 5.267 2.93 8.013 1.927 2.877-.98 4.99-3.826 5.067-6.87.153-2.956-1.624-5.88-4.299-7.135a7.551 7.551 0 00-3.288-.75zm0 1.383c2.758-.052 5.372 1.972 6.014 4.654.704 2.578-.482 5.516-2.79 6.867-2.358 1.48-5.682 1.085-7.617-.919-2.043-1.97-2.407-5.38-.84-7.743 1.11-1.764 3.149-2.88 5.233-2.86zm1.962 1.764l-2.074 3.762c-.64.068-.793 1.04-.202 1.3.39.27.696-.18 1.052-.165h3.17v-.865h-3.182l1.993-3.614-.757-.418zM16.12.358h-.232l-.22.004h-.012l-.221.006h-.012l-.22.01h-.012l-.22.013h-.012l-.22.016h-.012l-.22.019h-.005l-.006.001-.22.021h-.006l-.005.001-.22.025h-.011l-.22.028h-.005l-.006.002-.219.03h-.005l-.006.001-.218.033-.006.001-.006.001-.217.036-.006.001-.006.001-.217.039-.006.001-.006.001-.216.042-.006.001-.006.001-.215.045-.006.001-.006.002-.215.047-.006.002-.006.001-.214.05-.006.002-.006.002-.115.029-.152.053-.14.081-.122.106-.1.126-.075.143-.047.154-.018.16.012.16.042.156.07.145.095.13.118.11.137.086.15.059.158.03h.161l.132-.022.11-.028.202-.047.203-.046.208-.043.202-.039.206-.037.206-.034.205-.03.208-.03.205-.025.209-.023.208-.02.21-.017.209-.015.207-.011.21-.009.21-.006.207-.003h.21l.21.002.207.005.207.008.212.011.207.014.208.017.209.019.208.022.205.025.206.028.207.03.208.035.205.036.202.039.052.01.16.018.16-.012.156-.042.146-.07.13-.096.109-.119.085-.136.06-.15.03-.159v-.16l-.03-.16-.059-.15-.086-.136L19.823.9l-.13-.096-.145-.07-.128-.038-.057-.011-.006-.002h-.006L19.135.64l-.006-.001-.006-.001-.217-.039H18.9l-.006-.002-.217-.035-.006-.001-.006-.001-.218-.032-.006-.001-.006-.001-.218-.03h-.006l-.006-.001-.219-.027h-.011l-.22-.024-.005-.001h-.006l-.22-.021h-.006L17.512.42l-.22-.017-.005-.001h-.006l-.22-.015h-.012l-.22-.012h-.012l-.22-.01h-.012l-.22-.005h-.012l-.221-.003h-.012zm8.715 2.783l-.157.034-.149.063-.134.089-.116.112-.092.132-.067.147-.038.157-.008.16.021.16.051.153.079.141.103.124.102.087.052.038h.001l.087.064v.001l.082.061.002.001.076.059h.001l.084.065.082.066.002.001.079.063.002.002.077.063.081.067.002.002.077.065.076.065.001.002.08.07.078.07h.002l.075.068.077.072.002.001.073.069.077.073.072.07.002.001.077.076.07.07v.001l.075.076.07.073.002.001.074.079.002.002.069.074.069.075.074.082.07.08.002.001.068.079h.001l.067.079.068.082.065.078.001.002.068.083.067.084.063.081.001.002.067.087.002.002.063.084.001.001.064.087.008.01.008.01.095.12.093.121.09.119.087.119.088.122.086.123.084.12.081.122.001.002.084.126.08.126.08.127.077.126.079.131.074.127.075.131.073.131.07.13.07.133.069.133.045.09.086.137.109.119.13.096.144.07.156.042.16.013.16-.017.155-.047.143-.075.126-.1.106-.121.082-.14.054-.151.025-.16-.005-.16-.035-.158-.05-.124-.048-.095-.002-.004-.002-.004-.073-.14-.002-.005-.002-.004-.074-.14-.002-.004-.002-.004-.076-.14-.002-.003-.002-.004-.077-.139-.003-.004-.002-.004-.078-.138-.003-.004-.002-.003-.08-.137-.002-.004-.003-.004-.081-.136-.002-.004-.003-.004-.083-.136-.002-.003-.002-.004-.085-.135-.002-.004-.003-.003-.085-.134-.003-.004-.002-.004-.087-.132-.003-.004-.003-.004-.088-.132-.003-.003-.002-.004-.09-.13-.003-.005-.003-.003-.091-.13-.003-.004-.002-.004-.093-.129-.003-.003-.003-.004-.094-.128-.003-.004-.003-.003-.095-.127-.003-.004-.003-.004-.097-.125-.003-.004-.003-.004-.09-.114-.06-.082-.003-.003-.002-.003-.069-.091-.002-.004-.002-.003-.07-.09-.003-.003-.002-.003-.07-.09-.003-.003-.002-.003-.071-.09-.002-.003-.003-.002-.072-.089-.002-.003-.002-.003-.073-.088-.002-.003-.002-.002-.074-.087-.002-.003-.002-.003-.074-.086-.003-.003-.002-.003-.074-.086-.003-.002-.002-.003-.075-.085-.003-.003-.002-.002-.076-.084-.002-.003-.003-.003-.076-.083-.002-.003-.003-.003-.077-.082-.002-.003-.003-.002-.077-.082-.003-.003-.003-.002-.078-.081-.002-.003-.003-.003-.078-.08-.003-.002-.003-.003-.079-.08-.002-.002-.003-.002-.08-.08-.002-.002-.003-.002-.08-.078-.003-.003-.003-.002-.08-.077-.003-.003-.003-.002-.082-.077-.002-.002-.003-.002-.082-.076-.003-.002-.002-.003-.083-.075-.003-.002-.002-.003-.084-.074-.002-.002-.003-.002-.084-.074-.003-.002-.002-.002-.085-.073-.002-.002-.003-.003-.085-.071-.003-.003-.002-.002-.086-.07-.003-.003-.002-.002-.086-.07-.003-.003-.003-.002-.086-.07-.003-.002-.003-.002-.087-.069-.002-.002-.003-.002-.088-.068-.002-.002-.003-.002-.088-.067-.003-.003-.003-.002-.088-.066-.003-.002-.003-.002-.089-.066-.003-.002-.003-.002-.057-.042-.14-.082-.15-.055-.16-.026-.16.004zm-18.458.426l-.157.037-.148.066-.111.074-.007.006-.003.002-.003.002-.086.069-.003.002-.002.002-.086.07-.003.002-.002.002-.086.07-.002.003-.003.002-.085.071-.002.002-.003.003-.084.071-.003.003-.002.002-.084.072-.003.003-.002.002-.083.073-.003.003-.002.002-.083.074-.002.002-.003.003-.082.074-.003.003-.002.002-.081.076-.003.002-.003.002-.08.077-.003.002-.003.003-.08.076-.002.003-.003.002-.08.078-.002.002-.003.003-.079.078-.002.003-.003.002-.078.08-.003.002-.002.002-.078.08-.002.003-.003.002-.077.08-.003.004-.002.002-.077.081-.002.003-.003.003-.076.082-.002.002-.003.003-.075.082-.002.003-.003.003-.074.083-.003.003-.002.003-.074.084-.003.003-.002.002-.074.085-.002.003-.002.003-.073.085-.003.003-.002.003-.072.086-.002.003-.003.003-.071.087-.003.003-.002.002-.07.088-.003.003-.002.003-.07.088-.003.003-.002.003-.07.09-.002.002-.002.003-.069.09-.002.003-.003.003-.068.09-.002.003-.002.003-.067.092-.003.003-.002.003-.067.092-.002.003-.002.003-.066.092-.002.003-.002.004-.066.093-.002.003-.002.003-.065.094-.002.003-.002.004-.064.094-.002.003-.002.004-.063.095-.002.003-.002.003-.063.097-.002.003-.002.003-.046.073-.05.07-.003.002-.002.003-.067.093-.003.003-.002.003-.066.094-.002.003-.002.003-.066.094-.002.003-.002.003-.064.094-.002.004-.002.003-.064.094-.002.004-.002.003-.062.095-.002.003-.002.003-.062.096-.002.003-.002.003-.06.096-.003.003-.002.003-.06.096-.001.004-.002.003-.059.096-.002.004-.002.003-.058.097-.002.003-.001.003-.057.098-.002.003-.002.003-.056.098-.002.003-.002.003-.055.098-.002.004-.001.003-.055.098-.001.004-.002.003-.054.099-.001.003-.002.003-.052.1-.002.002-.002.004-.051.1-.002.002-.002.004-.05.1-.002.003-.002.003-.05.1v.003l-.002.004-.05.1V9.5l-.002.004-.048.1-.002.004-.001.003-.047.101-.002.003-.001.004-.013.027-.052.152-.024.16.006.16.037.157.064.148.091.133.114.114.134.09.147.065.157.036.162.006.159-.024.152-.053.14-.08.122-.105.1-.126.066-.117.01-.023.044-.095.045-.095.002-.003.042-.087.048-.097.048-.095v-.001l.048-.092.001-.001.047-.09.05-.093.002-.002.049-.09.052-.092.001-.002.051-.089.001-.002.051-.087.053-.088.001-.002.055-.091.057-.091.057-.09.001-.002.057-.089.055-.083.001-.002.06-.09.06-.088.062-.089.001-.001.06-.084.063-.088.065-.089.017-.023.016-.025.06-.094.059-.09v-.002l.058-.086.057-.086.001-.001.062-.09.062-.088.001-.002.06-.085.002-.002.06-.082.063-.087.064-.084.002-.002.061-.08.065-.084.064-.08v-.001l.067-.083.067-.082.07-.083.069-.08.063-.074.074-.083.068-.077.002-.002.07-.076.07-.075.072-.077.001-.001.067-.07.076-.078.002-.002.07-.07.075-.075.002-.002.072-.07.075-.072.002-.002.073-.069.074-.068.001-.001.08-.073.076-.068.002-.002.072-.063v-.001l.078-.067.079-.068.002-.001.08-.068.002-.002.077-.063.082-.066.001-.001.075-.06.002-.002.006-.004.117-.111.094-.131.068-.146.04-.156.01-.161-.019-.16-.049-.154-.076-.141-.102-.125-.123-.105-.14-.079-.153-.052-.16-.023-.16.007zm24.596 11.088l-.156.04-.146.067-.131.094-.112.117-.087.135-.061.15-.033.157-.004.134.007.142.005.152.004.15.002.149v.153l.001.011v.015l.004.11.002.11v.002l.002.106v.321l-.003.102-.002.106-.004.107-.005.105-.006.106-.006.106-.008.106v.002l-.008.103v.002l-.01.1-.01.105-.01.105-.013.105-.012.099v.002l-.014.108-.014.1-.016.105-.016.103v.002l-.017.099-.018.104-.019.103v.002l-.019.097-.02.104-.022.103v.001l-.022.098-.023.103v.002l-.024.096-.025.103v.002l-.024.096-.027.102v.003l-.026.093v.001l-.029.103v.002l-.03.099-.028.097v.002l-.03.095-.03.096v.001l-.033.1-.031.095v.002l-.035.1v.003l-.034.094v.003l-.035.096v.001l-.034.09v.002l-.038.098-.036.093v.002l-.038.095-.079.194-.08.188-.085.189-.087.19-.09.184-.092.183-.095.184-.05.093-.064.148-.034.158-.005.16.026.16.054.151.082.14.106.12.127.1.143.075.154.046.16.017.161-.013.156-.042.144-.071.13-.096.109-.119.072-.112.053-.099.003-.005.003-.006.102-.195.003-.006.003-.006.098-.196.003-.006.003-.006.096-.197.002-.006.003-.006.093-.2.002-.006.003-.006.09-.2.002-.006.003-.007.086-.202.003-.006.002-.006.084-.203.002-.005.001-.005.04-.102.002-.003.001-.003.04-.103.001-.003.001-.003.04-.103v-.004l.001-.003.039-.103v-.003l.002-.003.037-.104.001-.003.001-.003.037-.104v-.004l.002-.003.035-.104.002-.003v-.004l.035-.104.002-.004v-.003l.034-.105.002-.003v-.003l.034-.105v-.004l.002-.003.032-.106.001-.003.001-.003.031-.106.001-.003.001-.004.031-.106.001-.003.001-.004.03-.106v-.003l.002-.004.028-.107.001-.003.001-.003.028-.107.001-.004.001-.003.027-.107.001-.004v-.003l.027-.108.001-.003v-.004l.026-.108.001-.003v-.004l.025-.108.001-.003v-.004l.025-.108v-.004l.001-.003.023-.109v-.003l.001-.004.022-.109v-.003l.002-.004.02-.109.001-.004v-.003l.02-.11.002-.003v-.004l.02-.11v-.007l.019-.11v-.003l.001-.004.017-.11v-.004l.001-.003.017-.11v-.008l.016-.11v-.004l.001-.004.015-.11v-.008l.015-.111v-.008l.013-.111v-.007l.013-.112v-.007l.011-.112v-.004l.001-.004.01-.112v-.007l.01-.112v-.008l.008-.112v-.008l.007-.113v-.007l.007-.113v-.008l.005-.113v-.007l.005-.114v-.007l.003-.114v-.007l.003-.114v-.129l.001-.114v-.13l-.003-.114V16.5l-.003-.115v-.007l-.003-.102v-.155l-.003-.158v-.01l-.004-.158v-.01l-.006-.158v-.01l-.007-.148-.023-.16-.051-.152-.08-.14-.103-.124-.125-.102-.142-.077-.153-.05-.16-.02-.161.01zm-30.213.66l-.157.034-.149.063-.134.09-.115.113-.092.132-.067.147-.037.156-.009.134.001.11V16.308l.006.22v.012l.01.22v.012l.012.22v.006l.001.006.015.22v.005l.001.006.018.22.001.006v.006l.022.219v.006l.001.006.024.219.001.006v.006l.028.218.001.006v.006l.031.218.001.006.001.006.033.218.001.006.001.005.037.218v.006l.002.005.04.217v.006l.001.006.043.216.001.006.001.006.046.216v.005l.002.006.048.215.002.006.001.006.051.214.002.006v.006l.055.214.002.005.001.006.057.213.002.006.001.005.06.213.002.005.001.006.063.212.002.005.001.006.066.21.002.006.002.006.068.21.002.005.002.005.07.21.003.005.002.005.074.208.002.006.002.005.077.207.002.006.002.005.08.206.002.005.002.006.082.204.002.006.002.005.086.204.002.005.002.006.088.202.002.005.003.006.09.2.003.006.002.005.094.2.002.006.003.005.096.199.002.005.003.005.03.062.086.137.11.118.128.097.145.07.156.043.16.013.16-.017.155-.047.143-.074.127-.1.106-.121.081-.14.055-.15.025-.16-.005-.161-.034-.158-.05-.124-.028-.055-.092-.19-.087-.188-.087-.192-.083-.19-.08-.193-.078-.194-.076-.196-.073-.195-.07-.197-.067-.198-.065-.199-.063-.2-.059-.2-.056-.2-.055-.204-.05-.201-.049-.202-.046-.205-.043-.206-.04-.203-.038-.207-.034-.204-.032-.207-.028-.205-.026-.207-.023-.208-.02-.207-.018-.207-.014-.208-.011-.207-.009-.208-.005-.207-.002-.104-.017-.16-.046-.155-.074-.143-.1-.126-.121-.107-.139-.081-.152-.055-.159-.025-.161.004zm24.585 11.83l-.156.039-.146.068-.11.076-.015.012-.163.129-.166.127-.168.125-.17.124-.17.12-.172.118-.173.115-.176.114-.177.111-.18.11-.178.105-.182.104-.182.101-.184.1-.184.095-.189.095-.186.09-.188.089-.19.086-.19.082-.193.081-.195.078-.191.074-.197.073-.195.07-.196.065-.198.064-.198.061-.2.058-.2.055-.2.052-.2.049-.151.035-.153.05-.141.078-.125.103-.103.124-.078.14-.05.154-.022.16.009.16.038.157.067.147.093.132.116.112.134.089.149.062.158.034.16.003.133-.02.158-.035.006-.002.006-.001.213-.052.006-.002.007-.001.212-.056.006-.001.006-.002.212-.058.006-.002.006-.002.211-.061.006-.002.006-.002.21-.064.006-.002.006-.002.21-.067.005-.002.006-.002.208-.07.006-.002.006-.003.207-.073.006-.002.006-.002.206-.077.006-.002.005-.002.206-.08.005-.001.006-.003.204-.082.006-.002.005-.002.203-.085.006-.003.005-.002.202-.088.006-.002.005-.003.2-.09.006-.003.006-.003.2-.093.005-.003.005-.002.198-.096.006-.003.005-.003.197-.099.005-.002.005-.003.196-.102.005-.002.005-.003.195-.105.005-.002.005-.003.193-.107.005-.003.005-.003.191-.11.005-.003.005-.003.19-.112.005-.003.005-.003.189-.115.005-.003.005-.003.187-.117.005-.003.004-.004.186-.12.005-.003.004-.003.184-.122.005-.003.005-.004.182-.125.004-.003.005-.003.18-.128.005-.003.005-.003.179-.13.004-.003.005-.004.177-.132.004-.004.005-.003.175-.135.005-.003.004-.004.173-.137.005-.003.004-.004.019-.015.115-.113.092-.132.066-.147.038-.157.008-.16-.022-.16-.052-.153-.079-.14-.103-.124-.125-.102-.142-.078-.153-.05-.16-.02-.16.01zm-19.17.054l-.153.051-.14.079-.124.103-.103.125-.077.141-.05.153-.02.16.009.161.04.156.067.147.093.131.095.094.047.04.005.004.005.004.17.14.005.004.005.004.172.137.004.004.005.003.086.067.003.002.003.002.087.067.003.002.003.002.088.066.002.003.003.002.089.065.002.002.003.002.09.065.002.002.003.002.09.064.002.002.003.002.09.063.003.002.003.002.09.063.003.002.003.002.092.062.002.002.003.002.092.061.003.002.003.002.092.06.003.003.003.001.093.06.003.002.003.002.093.06.003.001.003.002.094.058.003.002.003.002.095.058.003.001.003.002.095.057.003.002.003.002.095.056.003.002.003.002.096.055.004.002.003.001.096.055.003.002.003.002.098.053.003.002.003.002.097.053.004.002.003.001.098.053.003.001.003.002.099.052.003.001.003.002.1.05.003.002.003.002.1.05.003.002.003.001.1.05h.003l.004.003.1.048.004.001.003.002.101.048.003.001.004.002.101.046.004.002.003.001.102.046.004.002.003.001.103.045.003.002.003.001.103.045.004.001.003.002.104.043.003.001.004.002.104.042.003.002.004.001.104.042.004.001.003.002.105.04.004.002.003.001.106.04.003.002h.004l.106.04.004.001.003.002.107.038.003.001.004.001.107.038.003.001.004.001.107.037.004.001.004.001.108.036.003.001.004.001.108.035.004.001.003.001.11.034.003.001.004.001.109.033.004.002h.003l.11.033h.004l.003.002.11.031.004.001.004.001.084.023.081.028.004.001.003.001.109.037.003.001.004.001.109.036.003.001.004.001.109.035h.003l.004.002.11.033.003.001.003.001.11.033.003.001.004.001.109.031.004.002h.003l.11.031.003.001.004.001.11.03h.003l.003.001.11.029h.004l.003.002.11.027.003.001.004.001.11.027h.003l.004.001.004.001.16.022.16-.008.157-.038.147-.067.132-.092.112-.116.09-.134.062-.149.034-.157.004-.161-.025-.16-.055-.151-.082-.139-.107-.12-.127-.1-.143-.074-.124-.04h-.003l-.104-.025-.103-.026h-.002l-.095-.026h-.001l-.101-.027h-.002l-.1-.028h-.002l-.103-.03-.104-.032-.097-.03h-.002l-.103-.033-.102-.033-.101-.034-.106-.036-.027-.01-.027-.007-.107-.03-.104-.029-.104-.03h-.002l-.097-.03-.102-.032-.102-.032-.102-.034-.103-.035-.096-.034-.1-.036-.101-.037h-.002l-.094-.036-.096-.037-.097-.04h-.002l-.099-.04-.098-.042h-.002l-.092-.04-.097-.043-.095-.043-.097-.044h-.002l-.09-.043-.094-.045-.094-.046-.093-.047-.09-.046-.096-.05-.088-.047-.002-.001-.09-.049-.094-.052-.002-.002-.087-.049-.087-.05h-.002l-.088-.053h-.001l-.09-.055-.086-.052-.002-.001-.089-.055-.084-.054h-.002l-.09-.059h-.001l-.085-.056-.001-.001-.084-.056-.082-.056h-.001l-.086-.06-.082-.058H7.79l-.086-.062-.002-.002-.08-.058-.081-.06h-.001l-.085-.064-.002-.002-.076-.058-.002-.002-.082-.064-.161-.128-.162-.133-.04-.034-.132-.092-.147-.066-.157-.038-.16-.008-.16.022z"
})));

function _extends$b() { _extends$b = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$b.apply(this, arguments); }
var StartEventNoneIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$b({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.847.004C9.61-.016 3.624 4.014 1.257 9.78-1.235 15.49.06 22.581 4.42 27.034c4.193 4.513 11.101 6.17 16.887 4.058 5.996-2.042 10.423-7.93 10.664-14.268.403-6.228-3.26-12.441-8.87-15.154A15.924 15.924 0 0015.846.004zm.439 1.729c6.105.033 11.856 4.45 13.435 10.359 1.678 5.653-.592 12.198-5.463 15.547-5.06 3.719-12.564 3.45-17.343-.625-4.814-3.84-6.538-10.94-4.067-16.57 2.14-5.206 7.515-8.775 13.147-8.71.097-.001.194-.002.29-.001z"
})));

function _extends$a() { _extends$a = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$a.apply(this, arguments); }
var StartEventParallelMultipleIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$a({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.847 0C9.61-.02 3.624 4.01 1.257 9.775-1.235 15.485.06 22.577 4.42 27.03c4.193 4.513 11.101 6.17 16.887 4.058 5.996-2.042 10.423-7.93 10.664-14.268.403-6.228-3.26-12.441-8.87-15.154A15.924 15.924 0 0015.846 0zm.439 1.729c6.105.033 11.856 4.45 13.435 10.359 1.678 5.653-.592 12.198-5.463 15.547-5.06 3.719-12.564 3.45-17.343-.625C2.101 23.17.377 16.07 2.848 10.44c2.134-5.2 7.522-8.78 13.147-8.71.097-.001.194-.002.29-.001zM13.504 9.08v4.427H9.077v4.98h4.427v4.427h4.98v-4.427h4.428v-4.98h-4.427V9.08h-4.98zm.83.83h3.32v4.427h4.428v3.32h-4.427v4.427h-3.32v-4.453H9.906v-3.294h4.427V9.91z"
})));

function _extends$9() { _extends$9 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$9.apply(this, arguments); }
var StartEventSignalIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$9({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M15.995.005C9.705-.08 3.643 3.968 1.257 9.78-1.235 15.49.06 22.581 4.42 27.034c4.193 4.513 11.102 6.17 16.887 4.058 5.996-2.042 10.423-7.93 10.664-14.269.403-6.227-3.26-12.44-8.87-15.153A15.924 15.924 0 0015.994.005zm0 1.73c6.213-.108 12.122 4.355 13.726 10.357 1.678 5.653-.592 12.198-5.463 15.547-5.06 3.719-12.564 3.45-17.343-.626-4.814-3.838-6.538-10.939-4.067-16.57 2.14-5.205 7.515-8.774 13.147-8.708zm0 6.776L9.19 20.724H22.8L15.995 8.511zm0 1.777l5.332 9.572H10.662l5.333-9.572z"
})));

function _extends$8() { _extends$8 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$8.apply(this, arguments); }
var StartEventTimerIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$8({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M16 0C7.174 0 0 7.174 0 16s7.174 16 16 16 16-7.174 16-16S24.826 0 16 0zm0 1.73c7.892 0 14.27 6.378 14.27 14.27 0 7.891-6.379 14.27-14.27 14.27S1.73 23.891 1.73 16C1.73 8.108 8.108 1.73 16 1.73zm-.143 6.676c-2.967.02-5.797 1.97-6.89 4.727-1.138 2.695-.51 6.012 1.537 8.102 1.99 2.142 5.268 2.932 8.014 1.928 2.878-.98 4.992-3.827 5.068-6.87.153-2.957-1.624-5.881-4.3-7.137a7.552 7.552 0 00-3.43-.75zm.27 1.383c2.71.012 5.254 2.015 5.886 4.656.704 2.577-.482 5.517-2.791 6.867-2.358 1.48-5.682 1.085-7.618-.918-2.043-1.971-2.407-5.381-.84-7.745 1.11-1.763 3.15-2.88 5.234-2.86h.13zm1.833 1.765l-2.074 3.763c-.64.068-.793 1.04-.202 1.3.39.27.696-.18 1.052-.165h3.17v-.865h-3.181l1.992-3.615-.757-.418z"
})));

function _extends$7() { _extends$7 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$7.apply(this, arguments); }
var SubprocessCollapsedIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$7({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M5.637 3A5.644 5.644 0 000 8.637v15.417a5.644 5.644 0 005.637 5.637h20.726A5.644 5.644 0 0032 24.054V8.637A5.644 5.644 0 0026.363 3H5.637zm0 1.778h20.726a3.83 3.83 0 013.859 3.859v15.417a3.83 3.83 0 01-3.859 3.858h-4.201V16.695H9.838v11.217H5.637a3.83 3.83 0 01-3.859-3.858V8.637a3.83 3.83 0 013.859-3.859zm5.33 13.046h10.066v10.065H10.967V17.824zm4.189 1.431V22.06H12.35v1.689h2.804V26.554h1.69V23.749h2.804V22.06h-2.804V19.255h-1.69z"
})));

function _extends$6() { _extends$6 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$6.apply(this, arguments); }
var SubprocessExpandedIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$6({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M5.636 3A5.642 5.642 0 000 8.636v15.418a5.643 5.643 0 005.636 5.636h20.728A5.643 5.643 0 0032 24.054V8.636A5.642 5.642 0 0026.364 3H5.636zm0 1.778h20.728a3.83 3.83 0 013.858 3.858v15.418a3.83 3.83 0 01-3.858 3.858h-4.203V16.723H9.84v11.189H5.636a3.83 3.83 0 01-3.858-3.858V8.636a3.83 3.83 0 013.858-3.858zm5.331 13.074h10.066v10.06H10.967v-10.06zm1.336 3.996v1.711h7.394v-1.71h-7.394z"
})));

function _extends$5() { _extends$5 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$5.apply(this, arguments); }
var TaskNoneIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$5({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M6.494 2.667C2.916 2.667 0 5.57 0 9.142v13.383C0 26.097 2.916 29 6.494 29h19.012C29.084 29 32 26.097 32 22.525V9.142c0-3.572-2.916-6.475-6.494-6.475H6.494zm0 2h19.012c2.509 0 4.494 1.98 4.494 4.475v13.383C30 25.02 28.015 27 25.506 27H6.494C3.985 27 2 25.02 2 22.525V9.142c0-2.495 1.985-4.475 4.494-4.475z"
})));

function _extends$4() { _extends$4 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$4.apply(this, arguments); }
var TextAnnotationicon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$4({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M22.087 0v31.647H32v-1.788h-8.125V1.788H32V0h-9.913zm-2.924 13.999l-2.737 2.167 2.167 2.738 2.738-2.167-2.168-2.738zm-5.475 4.335L10.95 20.5l2.168 2.738 2.737-2.168-2.167-2.737zm-5.475 4.335l-2.738 2.167 2.168 2.738 2.737-2.168-2.167-2.737zm-5.476 4.335L0 29.17l2.167 2.738 2.738-2.168-2.168-2.737z"
})));

function _extends$3() { _extends$3 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$3.apply(this, arguments); }
var TransactionIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$3({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M5.422 3A5.424 5.424 0 000 8.422v15.822a5.424 5.424 0 005.422 5.423h21.156A5.424 5.424 0 0032 24.244V8.422A5.424 5.424 0 0026.578 3H5.422zm0 1.244h21.156a4.155 4.155 0 014.178 4.178v15.822a4.155 4.155 0 01-4.178 4.178H5.422a4.155 4.155 0 01-4.178-4.178V8.422a4.155 4.155 0 014.178-4.178zm1.056 1.778a3.373 3.373 0 00-3.367 3.366v13.89a3.373 3.373 0 003.367 3.366h19.044a3.373 3.373 0 003.367-3.366V9.388a3.373 3.373 0 00-3.367-3.366H6.478zm0 1.245h19.044c1.187 0 2.122.935 2.122 2.121v13.89a2.104 2.104 0 01-2.122 2.122H6.478a2.104 2.104 0 01-2.122-2.122V9.388c0-1.186.935-2.121 2.122-2.121z"
})));

function _extends$2() { _extends$2 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$2.apply(this, arguments); }
var UserTaskIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$2({
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
}, props), /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M10.263 7.468c-1.698 0-2.912 1.305-2.915 2.791v.001c0 .45.121.924.311 1.352.138.309.308.593.516.82-1.235.423-2.683 1.119-3.414 2.49l-.04.075v4.44h11.083v-4.44l-.04-.074c-.72-1.352-2.136-2.047-3.36-2.471.597-.608.774-1.392.774-2.192-.004-1.487-1.218-2.792-2.915-2.792zm-1.16 1.583c.08 0 .165.003.26.008.757.045 1.012.181 1.207.31.196.13.334.252.851.268.404-.016.598-.087.737-.169.056-.033.103-.067.152-.1.128.275.197.578.198.893 0 .894-.154 1.52-.975 2.034l.08.604c.171.052.348.11.527.171.025.105.054.242.073.387.02.153.029.311.016.43a.422.422 0 01-.056.19c-.417.417-1.157.66-1.908.66-.75 0-1.49-.243-1.908-.66a.422.422 0 01-.056-.19 1.949 1.949 0 01.016-.43c.02-.146.049-.284.074-.388.177-.062.352-.118.521-.17l.048-.648a.616.616 0 00-.126-.118c-.183-.138-.405-.44-.562-.793-.157-.353-.254-.757-.254-1.08 0-.387.105-.758.297-1.079l.11-.04c.143-.046.339-.09.679-.09zm-1.448 4.304l-.002.014c-.025.185-.04.387-.018.589.021.202.074.42.248.593.595.594 1.494.857 2.382.857.889 0 1.788-.263 2.382-.857.174-.174.227-.391.249-.593a2.496 2.496 0 00-.018-.59l-.002-.01c.903.396 1.776.963 2.258 1.81v3.599H13.53v-2.538h-.67v2.538H7.651v-2.538h-.67v2.538H5.39v-3.599c.483-.849 1.359-1.416 2.264-1.813zM6.495 3C2.914 3 0 5.903 0 9.475v13.383c0 3.572 2.916 6.475 6.494 6.475h19.012c3.578 0 6.494-2.903 6.494-6.475V9.475C32 5.903 29.084 3 25.506 3H6.494zm0 2h19.01C28.016 5 30 6.98 30 9.475v13.383c0 2.495-1.985 4.475-4.494 4.475H6.494C3.985 27.333 2 25.353 2 22.858V9.475C2 6.98 3.985 5 6.494 5z"
})));

var iconsByType = {
  'Association': AssociationIcon,
  'BusinessRuleTask': BusinessRuleTaskIcon,
  'CallActivity': CallActivityIcon,
  'Collaboration': CollaborationIcon,
  'ConditionalFlow': ConditionalFlowIcon,
  'SequenceFlow': ConnectionIcon,
  'DataInput': DataInputIcon,
  'DataInputAssociation': DataInputOutputAssociationIcon,
  'DataOutput': DataOutputIcon,
  'DataOutputAssociation': DataInputOutputAssociationIcon,
  'DataObjectReference': DataObjectIcon,
  'DataStoreReference': DataStoreIcon,
  'DefaultFlow': DefaultFlowIcon,
  'CancelEndEvent': EndEventCancelIcon,
  'CompensateEndEvent': EndEventCompensationIcon,
  'ErrorEndEvent': EndEventErrorIcon,
  'EscalationEndEvent': EndEventEscalationIcon,
  'LinkEndEvent': EndEventLinkIcon,
  'MessageEndEvent': EndEventMessageIcon,
  'MultipleEndEvent': EndEventMultipleIcon,
  'EndEvent': EndEventNoneIcon,
  'SignalEndEvent': EndEventSignalIcon,
  'TerminateEndEvent': EndEventTerminateIcon,
  'EventSubProcess': EventSubProcessExpandedIcon,
  'ComplexGateway': GatewayComplexIcon,
  'EventBasedGateway': GatewayEventBasedIcon,
  'ExclusiveGateway': GatewayXorIcon,
  'Gateway': GatewayNoneIcon,
  'InclusiveGateway': GatewayOrIcon,
  'ParallelGateway': GatewayParallelIcon,
  'Group': GroupIcon,
  'CancelIntermediateCatchEvent': IntermediateEventCatchCancelIcon,
  'CompensateIntermediateCatchEvent': IntermediateEventCatchCompensationIcon,
  'ConditionalIntermediateCatchEvent': IntermediateEventCatchConditionIcon,
  'ErrorIntermediateCatchEvent': IntermediateEventCatchErrorIcon,
  'EscalationIntermediateCatchEvent': IntermediateEventCatchEscalationIcon,
  'LinkIntermediateCatchEvent': IntermediateEventCatchLinkIcon,
  'MessageIntermediateCatchEvent': IntermediateEventCatchMessageIcon,
  'MultipleIntermediateCatchEvent': IntermediateEventCatchMultipleIcon,
  'ConditionalIntermediateCatchEventNonInterrupting': IntermediateEventCatchNonInterruptingConditionIcon,
  'EscalationIntermediateCatchEventNonInterrupting': IntermediateEventCatchNonInterruptingEscalationIcon,
  'MessageIntermediateCatchEventNonInterrupting': IntermediateEventCatchNonInterruptingMessageIcon,
  'MultipleIntermediateCatchEventNonInterrupting': IntermediateEventCatchNonInterruptingMultipleIcon,
  'ParallelIntermediateCatchEventNonInterrupting': IntermediateEventCatchNonInterruptingParallelIcon,
  'SignalIntermediateCatchEventNonInterrupting': IntermediateEventCatchNonInterruptingSignalIcon,
  'TimerIntermediateCatchEventNonInterrupting': IntermediateEventCatchNonInterruptingTimerIcon,
  'ParallelMultipleIntermediateCatchEvent': IntermediateEventCatchParallelMultipleIcon,
  'SignalIntermediateCatchEvent': IntermediateEventCatchSignalIcon,
  'TimerIntermediateCatchEvent': IntermediateEventCatchTimerIcon,
  'IntermediateThrowEvent': IntermediateEventNoneIcon,
  'CompensateIntermediateThrowEvent': IntermediateEventThrowCompensationIcon,
  'EscalationIntermediateThrowEvent': IntermediateEventThrowEscalationIcon,
  'LinkIntermediateThrowEvent': IntermediateEventThrowLinkIcon,
  'MessageIntermediateThrowEvent': IntermediateEventThrowMessageIcon,
  'MultipleIntermediateThrowEvent': IntermediateEventThrowMultipleIcon,
  'SignalIntermediateThrowEvent': IntermediateEventThrowSignalIcon,
  'Lane': LaneIcon,
  'ManualTask': ManualTaskIcon,
  'MessageFlow': MessageFlowIcon,
  'Participant': ParticipantIcon,
  'Process': ProcessIcon,
  'ReceiveTask': ReceiveTaskIcon,
  'ScriptTask': ScriptTaskIcon,
  'SendTask': SendTaskIcon,
  'ServiceTask': ServiceTaskIcon,
  'CompensateStartEvent': StartEventCompensationIcon,
  'ConditionalStartEvent': StartEventConditionIcon,
  'ErrorStartEvent': StartEventErrorIcon,
  'EscalationStartEvent': StartEventEscalationIcon,
  'MessageStartEvent': StartEventMessageIcon,
  'MultipleStartEvent': StartEventMultipleIcon,
  'ConditionalStartEventNonInterrupting': StartEventNonInterruptingConditionIcon,
  'EscalationStartEventNonInterrupting': StartEventNonInterruptingEscalationIcon,
  'MessageStartEventNonInterrupting': StartEventNonInterruptingMessageIcon,
  'MultipleStartEventNonInterrupting': StartEventNonInterruptingMultipleIcon,
  'ParallelMultipleStartEventNonInterrupting': StartEventNonInterruptingParallelMultipleIcon,
  'SignalStartEventNonInterrupting': StartEventNonInterruptingSignalIcon,
  'TimerStartEventNonInterrupting': StartEventNonInterruptingTimerIcon,
  'CancelBoundaryEvent': IntermediateEventCatchCancelIcon,
  'CompensateBoundaryEvent': IntermediateEventCatchCompensationIcon,
  'ConditionalBoundaryEvent': IntermediateEventCatchConditionIcon,
  'ErrorBoundaryEvent': IntermediateEventCatchErrorIcon,
  'EscalationBoundaryEvent': IntermediateEventCatchEscalationIcon,
  'LinkBoundaryEvent': IntermediateEventCatchLinkIcon,
  'MessageBoundaryEvent': IntermediateEventCatchMessageIcon,
  'MultipleBoundaryEvent': IntermediateEventCatchMultipleIcon,
  'BoundaryEvent': IntermediateEventNoneIcon,
  'ConditionalBoundaryEventNonInterrupting': IntermediateEventCatchNonInterruptingConditionIcon,
  'EscalationBoundaryEventNonInterrupting': IntermediateEventCatchNonInterruptingEscalationIcon,
  'MessageBoundaryEventNonInterrupting': IntermediateEventCatchNonInterruptingMessageIcon,
  'MultipleBoundaryEventNonInterrupting': IntermediateEventCatchNonInterruptingMultipleIcon,
  'ParallelBoundaryEventNonInterrupting': IntermediateEventCatchNonInterruptingParallelIcon,
  'SignalBoundaryEventNonInterrupting': IntermediateEventCatchNonInterruptingSignalIcon,
  'TimerBoundaryEventNonInterrupting': IntermediateEventCatchNonInterruptingTimerIcon,
  'ParallelMultipleBoundaryEvent': IntermediateEventCatchParallelMultipleIcon,
  'SignalBoundaryEvent': IntermediateEventCatchSignalIcon,
  'TimerBoundaryEvent': IntermediateEventCatchTimerIcon,
  'StartEvent': StartEventNoneIcon,
  'ParallelMultipleStartEvent': StartEventParallelMultipleIcon,
  'SignalStartEvent': StartEventSignalIcon,
  'TimerStartEvent': StartEventTimerIcon,
  'CollapsedSubProcess': SubprocessCollapsedIcon,
  'CollapsedAdHocSubProcess': SubprocessCollapsedIcon,
  'ExpandedSubProcess': SubprocessExpandedIcon,
  'ExpandedAdHocSubProcess': SubprocessExpandedIcon,
  'Task': TaskNoneIcon,
  'TextAnnotation': TextAnnotationicon,
  'Transaction': TransactionIcon,
  'UserTask': UserTaskIcon
};

function getConcreteType(element) {
  const {
    type: elementType
  } = element;
  let type = getRawType(elementType);

  // (1) event definition types
  const eventDefinition = getEventDefinition$2(element);
  if (eventDefinition) {
    type = `${getEventDefinitionPrefix(eventDefinition)}${type}`;

    // (1.1) interrupting / non interrupting
    if (ModelUtil.is(element, 'bpmn:StartEvent') && !DiUtil.isInterrupting(element) || ModelUtil.is(element, 'bpmn:BoundaryEvent') && !isCancelActivity(element)) {
      type = `${type}NonInterrupting`;
    }
    return type;
  }

  // (2) sub process types
  if (ModelUtil.is(element, 'bpmn:SubProcess') && !ModelUtil.is(element, 'bpmn:Transaction')) {
    if (DiUtil.isEventSubProcess(element)) {
      type = `Event${type}`;
    } else {
      const expanded = DiUtil.isExpanded(element) && !isPlane(element);
      type = `${expanded ? 'Expanded' : 'Collapsed'}${type}`;
    }
  }

  // (3) conditional + default flows
  if (isDefaultFlow(element)) {
    type = 'DefaultFlow';
  }
  if (isConditionalFlow(element)) {
    type = 'ConditionalFlow';
  }
  return type;
}
const PanelHeaderProvider = {
  getDocumentationRef: element => {
    const elementTemplates = getTemplatesService();
    if (elementTemplates) {
      return getTemplateDocumentation(element, elementTemplates);
    }
  },
  getElementLabel: element => {
    if (ModelUtil.is(element, 'bpmn:Process')) {
      return ModelUtil.getBusinessObject(element).name;
    }
    return LabelUtil.getLabel(element);
  },
  getElementIcon: element => {
    const concreteType = getConcreteType(element);
    const elementTemplates = getTemplatesService();
    if (elementTemplates) {
      const template = getTemplate(element, elementTemplates);
      if (template && template.icon) {
        return () => jsxRuntime.jsx("img", {
          class: "bio-properties-panel-header-template-icon",
          width: "32",
          height: "32",
          src: template.icon.contents
        });
      }
    }
    return iconsByType[concreteType];
  },
  getTypeLabel: element => {
    const elementTemplates = getTemplatesService();
    if (elementTemplates) {
      const template = getTemplate(element, elementTemplates);
      if (template && template.name) {
        return template.name;
      }
    }
    const concreteType = getConcreteType(element);
    return concreteType.replace(/(\B[A-Z])/g, ' $1').replace(/(\bNon Interrupting)/g, '($1)');
  }
};

// helpers ///////////////////////

function isCancelActivity(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  return businessObject && businessObject.cancelActivity !== false;
}
function getEventDefinition$2(element) {
  const businessObject = ModelUtil.getBusinessObject(element),
    eventDefinitions = businessObject.eventDefinitions;
  return eventDefinitions && eventDefinitions[0];
}
function getRawType(type) {
  return type.split(':')[1];
}
function getEventDefinitionPrefix(eventDefinition) {
  const rawType = getRawType(eventDefinition.$type);
  return rawType.replace('EventDefinition', '');
}
function isDefaultFlow(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  const sourceBusinessObject = ModelUtil.getBusinessObject(element.source);
  if (!ModelUtil.is(element, 'bpmn:SequenceFlow') || !sourceBusinessObject) {
    return false;
  }
  return sourceBusinessObject.default && sourceBusinessObject.default === businessObject && (ModelUtil.is(sourceBusinessObject, 'bpmn:Gateway') || ModelUtil.is(sourceBusinessObject, 'bpmn:Activity'));
}
function isConditionalFlow(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  const sourceBusinessObject = ModelUtil.getBusinessObject(element.source);
  if (!ModelUtil.is(element, 'bpmn:SequenceFlow') || !sourceBusinessObject) {
    return false;
  }
  return businessObject.conditionExpression && ModelUtil.is(sourceBusinessObject, 'bpmn:Activity');
}
function isPlane(element) {
  // Backwards compatibility for bpmn-js<8
  const di = element && (element.di || ModelUtil.getBusinessObject(element).di);
  return ModelUtil.is(di, 'bpmndi:BPMNPlane');
}
function getTemplatesService() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useService('elementTemplates', false);
}
function getTemplate(element, elementTemplates) {
  return elementTemplates.get(element);
}
function getTemplateDocumentation(element, elementTemplates) {
  const template = getTemplate(element, elementTemplates);
  return template && template.documentationRef;
}

function _extends$1() { _extends$1 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$1.apply(this, arguments); }
var EmptyIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends$1({
  xmlns: "http://www.w3.org/2000/svg",
  xmlnsXlink: "http://www.w3.org/1999/xlink",
  width: "64",
  height: "64"
}, props), /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("rect", {
  id: "a",
  width: "57",
  height: "47",
  x: "3",
  y: "8",
  rx: "7"
}), /*#__PURE__*/React.createElement("mask", {
  id: "b",
  width: "57",
  height: "47",
  x: "0",
  y: "0",
  fill: "#fff",
  maskContentUnits: "userSpaceOnUse",
  maskUnits: "objectBoundingBox"
}, /*#__PURE__*/React.createElement("use", {
  xlinkHref: "#a"
}))), /*#__PURE__*/React.createElement("g", {
  fill: "none",
  fillRule: "evenodd"
}, /*#__PURE__*/React.createElement("path", {
  fill: "#818798",
  d: "M52 11a5 5 0 015 5v31a5 5 0 01-5 5H11a5 5 0 01-5-5V16a5 5 0 015-5h41zm0 2H11a3 3 0 00-2.995 2.824L8 16v31a3 3 0 002.824 2.995L11 50h41a3 3 0 002.995-2.824L55 47V16a3 3 0 00-2.824-2.995L52 13z"
}), /*#__PURE__*/React.createElement("path", {
  fill: "#D5D7DD",
  d: "M16 24h31v6H16zM21 33h21v6H21z"
}), /*#__PURE__*/React.createElement("use", {
  stroke: "#B9BCC6",
  strokeDasharray: "5 2",
  strokeWidth: "2",
  mask: "url(#b)",
  xlinkHref: "#a"
}))));

function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
var MultipleIcon = (({
  styles = {},
  ...props
}) => /*#__PURE__*/React.createElement("svg", _extends({
  xmlns: "http://www.w3.org/2000/svg",
  xmlnsXlink: "http://www.w3.org/1999/xlink",
  width: "128",
  height: "64"
}, props), /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("path", {
  id: "a",
  d: "M9 9h110v47H9z"
}), /*#__PURE__*/React.createElement("mask", {
  id: "b",
  width: "110",
  height: "47",
  x: "0",
  y: "0",
  fill: "#fff",
  maskContentUnits: "userSpaceOnUse",
  maskUnits: "objectBoundingBox"
}, /*#__PURE__*/React.createElement("use", {
  xlinkHref: "#a"
}))), /*#__PURE__*/React.createElement("g", {
  fill: "none",
  fillRule: "evenodd"
}, /*#__PURE__*/React.createElement("path", {
  fill: "#818798",
  d: "M25 20.272L37.728 33 25 45.728 12.272 33 25 20.272zm0 2.829L15.1 33l9.9 9.9 9.9-9.9-9.9-9.9z"
}), /*#__PURE__*/React.createElement("path", {
  fill: "#D5D7DD",
  d: "M17 47h16v6H17z"
}), /*#__PURE__*/React.createElement("path", {
  fill: "#818798",
  d: "M35 32h27v2H35z"
}), /*#__PURE__*/React.createElement("path", {
  fill: "#818798",
  d: "M60 30v6l6-3z"
}), /*#__PURE__*/React.createElement("path", {
  fill: "#D5D7DD",
  d: "M80 34h21v6H80z"
}), /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
  fill: "#818798",
  d: "M111 12a5 5 0 015 5v31a5 5 0 01-5 5H70a5 5 0 01-5-5V17a5 5 0 015-5h41zm0 2H70a3 3 0 00-3 3v31a3 3 0 003 3h41a3 3 0 003-3V17a3 3 0 00-3-3z"
}), /*#__PURE__*/React.createElement("path", {
  fill: "#D5D7DD",
  d: "M75 25h31v6H75z"
})), /*#__PURE__*/React.createElement("use", {
  stroke: "#B9BCC6",
  strokeDasharray: "5 2",
  strokeWidth: "2",
  mask: "url(#b)",
  xlinkHref: "#a"
}))));

const PanelPlaceholderProvider = translate => {
  if (!translate) translate = text => text;
  return {
    getEmpty: () => {
      return {
        text: translate('Select an element to edit its properties.'),
        icon: EmptyIcon
      };
    },
    getMultiple: () => {
      return {
        text: translate('Multiple elements are selected. Select a single element to edit its properties.'),
        icon: MultipleIcon
      };
    }
  };
};

function BpmnPropertiesPanel(props) {
  const {
    element,
    injector,
    getProviders,
    layoutConfig: initialLayoutConfig,
    descriptionConfig,
    tooltipConfig,
    feelPopupContainer,
    feelEditorExtensions
  } = props;
  const canvas = injector.get('canvas');
  const elementRegistry = injector.get('elementRegistry');
  const eventBus = injector.get('eventBus');
  const translate = injector.get('translate');
  const [state, setState] = hooks.useState({
    selectedElement: element
  });
  const selectedElement = state.selectedElement;

  /**
   * @param {djs.model.Base | Array<djs.model.Base>} element
   */
  const _update = element => {
    if (!element) {
      return;
    }
    let newSelectedElement = element;

    // handle labels
    if (newSelectedElement && newSelectedElement.type === 'label') {
      newSelectedElement = newSelectedElement.labelTarget;
    }
    setState({
      ...state,
      selectedElement: newSelectedElement
    });

    // notify interested parties on property panel updates
    eventBus.fire('propertiesPanel.updated', {
      element: newSelectedElement
    });
  };

  // (2) react on element changes

  // (2a) selection changed
  hooks.useEffect(() => {
    const onSelectionChanged = e => {
      const {
        newSelection = []
      } = e;
      if (newSelection.length > 1) {
        return _update(newSelection);
      }
      const newElement = newSelection[0];
      const rootElement = canvas.getRootElement();
      if (isImplicitRoot$1(rootElement)) {
        return;
      }
      _update(newElement || rootElement);
    };
    eventBus.on('selection.changed', onSelectionChanged);
    return () => {
      eventBus.off('selection.changed', onSelectionChanged);
    };
  }, []);

  // (2b) selected element changed
  hooks.useEffect(() => {
    const onElementsChanged = e => {
      const elements = e.elements;
      const updatedElement = findElement(elements, selectedElement);
      if (updatedElement && elementExists(updatedElement, elementRegistry)) {
        _update(updatedElement);
      }
    };
    eventBus.on('elements.changed', onElementsChanged);
    return () => {
      eventBus.off('elements.changed', onElementsChanged);
    };
  }, [selectedElement]);

  // (2c) root element changed
  hooks.useEffect(() => {
    const onRootAdded = e => {
      const element = e.element;
      _update(element);
    };
    eventBus.on('root.added', onRootAdded);
    return () => {
      eventBus.off('root.added', onRootAdded);
    };
  }, [selectedElement]);

  // (2d) provided entries changed
  hooks.useEffect(() => {
    const onProvidersChanged = () => {
      _update(selectedElement);
    };
    eventBus.on('propertiesPanel.providersChanged', onProvidersChanged);
    return () => {
      eventBus.off('propertiesPanel.providersChanged', onProvidersChanged);
    };
  }, [selectedElement]);

  // (2e) element templates changed
  hooks.useEffect(() => {
    const onTemplatesChanged = () => {
      _update(selectedElement);
    };
    eventBus.on('elementTemplates.changed', onTemplatesChanged);
    return () => {
      eventBus.off('elementTemplates.changed', onTemplatesChanged);
    };
  }, [selectedElement]);

  // (3) create properties panel context
  const bpmnPropertiesPanelContext = {
    selectedElement,
    injector,
    getService(type, strict) {
      return injector.get(type, strict);
    }
  };

  // (4) retrieve groups for selected element
  const providers = getProviders(selectedElement);
  const groups = hooks.useMemo(() => {
    return minDash.reduce(providers, function (groups, provider) {
      // do not collect groups for multi element state
      if (minDash.isArray(selectedElement)) {
        return [];
      }
      const updater = provider.getGroups(selectedElement);
      return updater(groups);
    }, []);
  }, [providers, selectedElement]);

  // (5) notify layout changes
  const [layoutConfig, setLayoutConfig] = hooks.useState(initialLayoutConfig || {});
  const onLayoutChanged = hooks.useCallback(newLayout => {
    eventBus.fire('propertiesPanel.layoutChanged', {
      layout: newLayout
    });
  }, [eventBus]);

  // React to external layout changes
  hooks.useEffect(() => {
    const cb = e => {
      const {
        layout
      } = e;
      setLayoutConfig(layout);
    };
    eventBus.on('propertiesPanel.setLayout', cb);
    return () => eventBus.off('propertiesPanel.setLayout', cb);
  }, [eventBus, setLayoutConfig]);

  // (6) notify description changes
  const onDescriptionLoaded = description => {
    eventBus.fire('propertiesPanel.descriptionLoaded', {
      description
    });
  };

  // (7) notify tooltip changes
  const onTooltipLoaded = tooltip => {
    eventBus.fire('propertiesPanel.tooltipLoaded', {
      tooltip
    });
  };
  return jsxRuntime.jsx(BpmnPropertiesPanelContext.Provider, {
    value: bpmnPropertiesPanelContext,
    children: jsxRuntime.jsx(propertiesPanel.PropertiesPanel, {
      element: selectedElement,
      headerProvider: PanelHeaderProvider,
      placeholderProvider: PanelPlaceholderProvider(translate),
      groups: groups,
      layoutConfig: layoutConfig,
      layoutChanged: onLayoutChanged,
      descriptionConfig: descriptionConfig,
      descriptionLoaded: onDescriptionLoaded,
      tooltipConfig: tooltipConfig,
      tooltipLoaded: onTooltipLoaded,
      feelPopupContainer: feelPopupContainer,
      feelEditorExtensions: feelEditorExtensions,
      eventBus: eventBus
    })
  });
}

// helpers //////////////////////////

function isImplicitRoot$1(element) {
  // Backwards compatibility for diagram-js<7.4.0, see https://github.com/bpmn-io/bpmn-properties-panel/pull/102
  return element && (element.isImplicit || element.id === '__implicitroot');
}
function findElement(elements, element) {
  return minDash.find(elements, e => e === element);
}
function elementExists(element, elementRegistry) {
  return element && elementRegistry.get(element.id);
}

const DEFAULT_PRIORITY = 1000;

/**
 * @typedef { import('@bpmn-io/properties-panel').GroupDefinition } GroupDefinition
 * @typedef { import('@bpmn-io/properties-panel').ListGroupDefinition } ListGroupDefinition
 * @typedef { { getGroups: (ModdleElement) => (Array{GroupDefinition|ListGroupDefinition}) => Array{GroupDefinition|ListGroupDefinition}) } PropertiesProvider
 */

class BpmnPropertiesPanelRenderer {
  constructor(config, injector, eventBus) {
    const {
      parent,
      layout: layoutConfig,
      description: descriptionConfig,
      tooltip: tooltipConfig,
      feelPopupContainer,
      feelEditorExtensions
    } = config || {};
    this._eventBus = eventBus;
    this._injector = injector;
    this._layoutConfig = layoutConfig;
    this._descriptionConfig = descriptionConfig;
    this._tooltipConfig = tooltipConfig;
    this._feelPopupContainer = feelPopupContainer;
    this._feelEditorExtensions = feelEditorExtensions;
    this._container = minDom.domify('<div style="height: 100%" class="bio-properties-panel-container"></div>');
    var commandStack = injector.get('commandStack', false);
    commandStack && setupKeyboard(this._container, eventBus, commandStack);
    eventBus.on('diagram.init', () => {
      if (parent) {
        this.attachTo(parent);
      }
    });
    eventBus.on('diagram.destroy', () => {
      this.detach();
    });
    eventBus.on('root.added', event => {
      const {
        element
      } = event;
      this._render(element);
    });
  }

  /**
   * Attach the properties panel to a parent node.
   *
   * @param {HTMLElement} container
   */
  attachTo(container) {
    if (!container) {
      throw new Error('container required');
    }

    // unwrap jQuery if provided
    if (container.get && container.constructor.prototype.jquery) {
      container = container.get(0);
    }
    if (typeof container === 'string') {
      container = minDom.query(container);
    }

    // (1) detach from old parent
    this.detach();

    // (2) append to parent container
    container.appendChild(this._container);

    // (3) notify interested parties
    this._eventBus.fire('propertiesPanel.attach');
  }

  /**
   * Detach the properties panel from its parent node.
   */
  detach() {
    const parentNode = this._container.parentNode;
    if (parentNode) {
      parentNode.removeChild(this._container);
      this._eventBus.fire('propertiesPanel.detach');
    }
  }

  /**
   * Register a new properties provider to the properties panel.
   *
   * @param {Number} [priority]
   * @param {PropertiesProvider} provider
   */
  registerProvider(priority, provider) {
    if (!provider) {
      provider = priority;
      priority = DEFAULT_PRIORITY;
    }
    if (typeof provider.getGroups !== 'function') {
      console.error('Properties provider does not implement #getGroups(element) API');
      return;
    }
    this._eventBus.on('propertiesPanel.getProviders', priority, function (event) {
      event.providers.push(provider);
    });
    this._eventBus.fire('propertiesPanel.providersChanged');
  }

  /**
   * Updates the layout of the properties panel.
   * @param {Object} layout
   */
  setLayout(layout) {
    this._eventBus.fire('propertiesPanel.setLayout', {
      layout
    });
  }
  _getProviders() {
    const event = this._eventBus.createEvent({
      type: 'propertiesPanel.getProviders',
      providers: []
    });
    this._eventBus.fire(event);
    return event.providers;
  }
  _render(element) {
    const canvas = this._injector.get('canvas');
    if (!element) {
      element = canvas.getRootElement();
    }
    if (isImplicitRoot(element)) {
      return;
    }
    preact.render(jsxRuntime.jsx(BpmnPropertiesPanel, {
      element: element,
      injector: this._injector,
      getProviders: this._getProviders.bind(this),
      layoutConfig: this._layoutConfig,
      descriptionConfig: this._descriptionConfig,
      tooltipConfig: this._tooltipConfig,
      feelPopupContainer: this._feelPopupContainer,
      feelEditorExtensions: this._feelEditorExtensions
    }), this._container);
    this._eventBus.fire('propertiesPanel.rendered');
  }
  _destroy() {
    if (this._container) {
      preact.render(null, this._container);
      this._eventBus.fire('propertiesPanel.destroyed');
    }
  }
}
BpmnPropertiesPanelRenderer.$inject = ['config.propertiesPanel', 'injector', 'eventBus'];

// helpers ///////////////////////

function isImplicitRoot(element) {
  // Backwards compatibility for diagram-js<7.4.0, see https://github.com/bpmn-io/bpmn-properties-panel/pull/102
  return element && (element.isImplicit || element.id === '__implicitroot');
}

/**
 * Setup keyboard bindings (undo, redo) on the given container.
 *
 * @param {Element} container
 * @param {EventBus} eventBus
 * @param {CommandStack} commandStack
 */
function setupKeyboard(container, eventBus, commandStack) {
  function cancel(event) {
    event.preventDefault();
    event.stopPropagation();
  }
  function handleKeys(event) {
    if (KeyboardUtil.isUndo(event)) {
      commandStack.undo();
      return cancel(event);
    }
    if (KeyboardUtil.isRedo(event)) {
      commandStack.redo();
      return cancel(event);
    }
  }
  eventBus.on('keyboard.bind', function () {
    minDom.event.bind(container, 'keydown', handleKeys);
  });
  eventBus.on('keyboard.unbind', function () {
    minDom.event.unbind(container, 'keydown', handleKeys);
  });
}

/**
 * A handler that combines and executes multiple commands.
 *
 * All updates are bundled on the command stack and executed in one step.
 * This also makes it possible to revert the changes in one step.
 *
 * Example use case: remove the camunda:formKey attribute and in addition
 * add all form fields needed for the camunda:formData property.
 */
class MultiCommandHandler {
  constructor(commandStack) {
    this._commandStack = commandStack;
  }
  preExecute(context) {
    const commandStack = this._commandStack;
    minDash.forEach(context, function (command) {
      commandStack.execute(command.cmd, command.context);
    });
  }
}
MultiCommandHandler.$inject = ['commandStack'];

const HANDLERS = {
  'properties-panel.multi-command-executor': MultiCommandHandler
};
function CommandInitializer(eventBus, commandStack) {
  eventBus.on('diagram.init', function () {
    minDash.forEach(HANDLERS, function (handler, id) {
      commandStack.registerHandler(id, handler);
    });
  });
}
CommandInitializer.$inject = ['eventBus', 'commandStack'];
var Commands = {
  __init__: [CommandInitializer]
};

var index$3 = {
  __depends__: [Commands, propertiesPanel.DebounceInputModule, propertiesPanel.FeelPopupModule],
  __init__: ['propertiesPanel'],
  propertiesPanel: ['type', BpmnPropertiesPanelRenderer]
};

function ReferenceSelectEntry(props) {
  const {
    autoFocusEntry,
    element,
    getOptions
  } = props;
  const options = getOptions(element);
  const prevOptions = propertiesPanel.usePrevious(options);

  // auto focus specifc other entry when options changed
  hooks.useEffect(() => {
    if (autoFocusEntry && prevOptions && options.length > prevOptions.length) {
      const entry = minDom.query(`[data-entry-id="${autoFocusEntry}"]`);
      const focusableInput = minDom.query('.bio-properties-panel-input', entry);
      if (focusableInput) {
        focusableInput.select();
      }
    }
  }, [options]);
  return jsxRuntime.jsx(propertiesPanel.SelectEntry, {
    ...props
  });
}

function isErrorSupported(element) {
  return ModelingUtil.isAny(element, ['bpmn:StartEvent', 'bpmn:BoundaryEvent', 'bpmn:EndEvent']) && !!getErrorEventDefinition(element);
}
function getErrorEventDefinition(element) {
  return getEventDefinition$1(element, 'bpmn:ErrorEventDefinition');
}
function getTimerEventDefinition$1(element) {
  return getEventDefinition$1(element, 'bpmn:TimerEventDefinition');
}
function getError(element) {
  const errorEventDefinition = getErrorEventDefinition(element);
  return errorEventDefinition && errorEventDefinition.get('errorRef');
}
function getEventDefinition$1(element, eventType) {
  const businessObject = ModelUtil.getBusinessObject(element);
  const eventDefinitions = businessObject.get('eventDefinitions') || [];
  return minDash.find(eventDefinitions, function (definition) {
    return ModelUtil.is(definition, eventType);
  });
}
function isMessageSupported(element) {
  return ModelUtil.is(element, 'bpmn:ReceiveTask') || ModelingUtil.isAny(element, ['bpmn:StartEvent', 'bpmn:EndEvent', 'bpmn:IntermediateThrowEvent', 'bpmn:BoundaryEvent', 'bpmn:IntermediateCatchEvent']) && !!getMessageEventDefinition(element);
}
function getMessageEventDefinition(element) {
  if (ModelUtil.is(element, 'bpmn:ReceiveTask')) {
    return ModelUtil.getBusinessObject(element);
  }
  return getEventDefinition$1(element, 'bpmn:MessageEventDefinition');
}
function getMessage(element) {
  const messageEventDefinition = getMessageEventDefinition(element);
  return messageEventDefinition && messageEventDefinition.get('messageRef');
}
function getLinkEventDefinition(element) {
  return getEventDefinition$1(element, 'bpmn:LinkEventDefinition');
}
function getSignalEventDefinition$1(element) {
  return getEventDefinition$1(element, 'bpmn:SignalEventDefinition');
}
function isLinkSupported(element) {
  return ModelingUtil.isAny(element, ['bpmn:IntermediateThrowEvent', 'bpmn:IntermediateCatchEvent']) && !!getLinkEventDefinition(element);
}
function isSignalSupported$1(element) {
  return ModelUtil.is(element, 'bpmn:Event') && !!getSignalEventDefinition$1(element);
}
function getSignal$1(element) {
  const signalEventDefinition = getSignalEventDefinition$1(element);
  return signalEventDefinition && signalEventDefinition.get('signalRef');
}
function getEscalationEventDefinition(element) {
  return getEventDefinition$1(element, 'bpmn:EscalationEventDefinition');
}
function isEscalationSupported(element) {
  return ModelUtil.is(element, 'bpmn:Event') && !!getEscalationEventDefinition(element);
}
function getEscalation(element) {
  const escalationEventDefinition = getEscalationEventDefinition(element);
  return escalationEventDefinition && escalationEventDefinition.get('escalationRef');
}
function isCompensationSupported(element) {
  return ModelingUtil.isAny(element, ['bpmn:EndEvent', 'bpmn:IntermediateThrowEvent']) && !!getCompensateEventDefinition(element);
}
function getCompensateEventDefinition(element) {
  return getEventDefinition$1(element, 'bpmn:CompensateEventDefinition');
}
function getCompensateActivity(element) {
  const compensateEventDefinition = getCompensateEventDefinition(element);
  return compensateEventDefinition && compensateEventDefinition.get('activityRef');
}

/**
 * @typedef { import('@bpmn-io/properties-panel').EntryDefinition } Entry
 */

/**
 * @returns {Array<Entry>} entries
 */
function CompensationProps(props) {
  const {
    element
  } = props;
  if (!isCompensationSupported(element)) {
    return [];
  }
  return [{
    id: 'waitForCompletion',
    component: WaitForCompletion,
    isEdited: propertiesPanel.isCheckboxEntryEdited
  }, {
    id: 'activityRef',
    component: ActivityRef,
    isEdited: propertiesPanel.isSelectEntryEdited
  }];
}
function WaitForCompletion(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const compensateEventDefinition = getCompensateEventDefinition(element);
  const getValue = () => {
    return compensateEventDefinition.get('waitForCompletion');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: compensateEventDefinition,
      properties: {
        waitForCompletion: value
      }
    });
  };
  return propertiesPanel.CheckboxEntry({
    element,
    id: 'waitForCompletion',
    label: translate('Wait for completion'),
    getValue,
    setValue
  });
}
function ActivityRef(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const elementRegistry = useService('elementRegistry');
  const translate = useService('translate');
  const compensateEventDefinition = getCompensateEventDefinition(element);
  const getValue = () => {
    const activityRef = getCompensateActivity(element);
    return activityRef && activityRef.get('id');
  };
  const setValue = value => {
    // update (or remove) activityRef
    const activityRef = value ? ModelUtil.getBusinessObject(elementRegistry.get(value)) : undefined;
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: compensateEventDefinition,
      properties: {
        activityRef
      }
    });
  };
  const getOptions = () => {
    let options = [{
      value: '',
      label: translate('<none>')
    }];
    const activities = findActivityRefs(element);
    sortByName$6(activities).forEach(function (activity) {
      options.push({
        value: activity.id,
        label: createOptionLabel(activity)
      });
    });
    return options;
  };
  return ReferenceSelectEntry({
    element,
    id: 'activityRef',
    label: translate('Activity reference'),
    getValue,
    setValue,
    getOptions
  });
}

// helper /////////////////////////

function getFlowElements(element, type) {
  const {
    flowElements
  } = element;
  return flowElements.filter(function (flowElement) {
    return ModelUtil.is(flowElement, type);
  });
}
function getContainedActivities(element) {
  return getFlowElements(element, 'bpmn:Activity');
}
function getContainedBoundaryEvents(element) {
  return getFlowElements(element, 'bpmn:BoundaryEvent');
}

/**
 * Checks whether an Activity is attaching a CompensateEvent of the parent container.
 *
 * @param {ModdleElement} activity
 * @param {Array<ModdleElement>} boundaryEvents
 * @returns {Boolean}
 */
function hasCompensationEventAttached(activity, boundaryEvents) {
  const {
    id: activityId
  } = activity;
  return !!minDash.find(boundaryEvents, function (boundaryEvent) {
    const {
      attachedToRef
    } = boundaryEvent;
    const compensateEventDefinition = getCompensateEventDefinition(boundaryEvent);
    return attachedToRef && compensateEventDefinition && attachedToRef.id === activityId;
  });
}

/**
 * Checks whether an Activity can be compensated. That's the case when it is
 * a) a CallActivity
 * b) a SubProcess, when it is not event based and not a compensation
 * c) any other Activity, when it is attaching a CompensateEvent of the parent container
 *
 * @param {ModdleElement} activity
 * @param {Array<ModdleElement>} boundaryEvents
 * @returns {Boolean}
 */
function canBeCompensated(activity, boundaryEvents) {
  return ModelUtil.is(activity, 'bpmn:CallActivity') || ModelUtil.is(activity, 'bpmn:SubProcess') && !activity.triggeredByEvent && !activity.isForCompensation || hasCompensationEventAttached(activity, boundaryEvents);
}
function getActivitiesForCompensation(element) {
  const activities = getContainedActivities(element);
  const boundaryEvents = getContainedBoundaryEvents(element);
  return activities.filter(function (activity) {
    return canBeCompensated(activity, boundaryEvents);
  });
}

/**
 * Retrieves all possible activities to reference for a Compensation.
 *
 * @param {djs.model.Base} element
 * @returns {Array<ModdleElement>}
 */
function findActivityRefs(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  let parent = businessObject.$parent;

  // (1) get all activities in parent container
  let activities = getActivitiesForCompensation(parent);

  // (2) if throwing compensation event is inside an EventSubProcess,
  // also get all activities outside of the event sub process
  if (ModelUtil.is(parent, 'bpmn:SubProcess') && parent.triggeredByEvent) {
    parent = parent.$parent;
    if (parent) {
      activities = [...activities, ...getActivitiesForCompensation(parent)];
    }
  }
  return activities;
}

/**
 * Retrieves an option label in the form
 * a) with name: "my Task (id=Task_1)"
 * b) without name: "(id=Task_1)"
 *
 * @param {ModdleElement} activity
 * @returns {String}
 */
function createOptionLabel(activity) {
  const {
    id,
    name
  } = activity;
  return `${name ? name + ' ' : ''}(id=${id})`;
}
function sortByName$6(elements) {
  return minDash.sortBy(elements, e => (e.name || '').toLowerCase());
}

const DOCUMENTATION_TEXT_FORMAT = 'text/plain';

/**
 * @typedef { import('@bpmn-io/properties-panel').EntryDefinition } Entry
 */

/**
 * @returns {Array<Entry>} entries
 */
function DocumentationProps(props) {
  const {
    element
  } = props;
  const entries = [{
    id: 'documentation',
    component: ElementDocumentationProperty,
    isEdited: propertiesPanel.isTextAreaEntryEdited
  }];
  if (hasProcessRef$2(element)) {
    entries.push({
      id: 'processDocumentation',
      component: ProcessDocumentationProperty,
      isEdited: propertiesPanel.isTextAreaEntryEdited
    });
  }
  return entries;
}
function ElementDocumentationProperty(props) {
  const {
    element
  } = props;
  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = getDocumentation(ModelUtil.getBusinessObject(element));
  const setValue = setDocumentation(element, ModelUtil.getBusinessObject(element), bpmnFactory, commandStack);
  return propertiesPanel.TextAreaEntry({
    element,
    id: 'documentation',
    label: translate('Element documentation'),
    getValue,
    setValue,
    debounce
  });
}
function ProcessDocumentationProperty(props) {
  const {
    element
  } = props;
  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const processRef = ModelUtil.getBusinessObject(element).processRef;
  const getValue = getDocumentation(processRef);
  const setValue = setDocumentation(element, processRef, bpmnFactory, commandStack);
  return propertiesPanel.TextAreaEntry({
    element,
    id: 'processDocumentation',
    label: translate('Process documentation'),
    getValue,
    setValue,
    debounce
  });
}

// helper ////////////////////////////

function hasProcessRef$2(element) {
  return ModelUtil.is(element, 'bpmn:Participant') && element.businessObject.get('processRef');
}
function findDocumentation(docs) {
  return docs.find(function (d) {
    return (d.textFormat || DOCUMENTATION_TEXT_FORMAT) === DOCUMENTATION_TEXT_FORMAT;
  });
}

/**
 * Retrieves a documentation element from a given moddle element.
 *
 * @param {ModdleElement} businessObject
 *
 * @returns {ModdleElement} documentation element inside the given moddle element.
 */
function getDocumentation(businessObject) {
  return function () {
    const documentation = findDocumentation(businessObject && businessObject.get('documentation'));
    return documentation && documentation.text;
  };
}

/**
 * Sets a documentation element for a given moddle element.
 *
 * @param {ModdleElement} businessObject
 */
function setDocumentation(element, businessObject, bpmnFactory, commandStack) {
  return function (value) {
    let documentation = findDocumentation(businessObject && businessObject.get('documentation'));

    // (1) update or removing existing documentation
    if (documentation) {
      if (value) {
        return commandStack.execute('element.updateModdleProperties', {
          element,
          moddleElement: documentation,
          properties: {
            text: value
          }
        });
      } else {
        return commandStack.execute('element.updateModdleProperties', {
          element,
          moddleElement: businessObject,
          properties: {
            documentation: minDash.without(businessObject.get('documentation'), documentation)
          }
        });
      }
    }

    // (2) create new documentation entry
    if (value) {
      documentation = bpmnFactory.create('bpmn:Documentation', {
        text: value
      });
      return commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: businessObject,
        properties: {
          documentation: [...businessObject.get('documentation'), documentation]
        }
      });
    }
  };
}

/**
 * Create a new element and (optionally) set its parent.
 *
 * @param {string} type
 * @param {Object} properties
 * @param {import('bpmn-js/lib/model/Types').ModdleElement} parent
 * @param {import('bpmn-js/lib/features/modeling/BpmnFactory').default} bpmnFactory
 *
 * @returns {import('bpmn-js/lib/model/Types').ModdleElement}
 */
function createElement(type, properties, parent, bpmnFactory) {
  const element = bpmnFactory.create(type, properties);
  if (parent) {
    element.$parent = parent;
  }
  return element;
}

/**
 * generate a semantic id with given prefix
 */
function nextId(prefix) {
  const ids = new Ids([32, 32, 1]);
  return ids.nextPrefixed(prefix);
}
function getRoot(businessObject) {
  let parent = businessObject;
  while (parent.$parent) {
    parent = parent.$parent;
  }
  return parent;
}
function filterElementsByType(objectList, type) {
  const list = objectList || [];
  return list.filter(element => ModelUtil.is(element, type));
}
function findRootElementsByType(businessObject, referencedType) {
  const root = getRoot(businessObject);
  return filterElementsByType(root.get('rootElements'), referencedType);
}
function findRootElementById(businessObject, type, id) {
  const elements = findRootElementsByType(businessObject, type);
  return elements.find(element => element.id === id);
}

const EMPTY_OPTION$4 = '';
const CREATE_NEW_OPTION$4 = 'create-new';

/**
 * @typedef { import('@bpmn-io/properties-panel').EntryDefinition } Entry
 */

/**
 * @returns {Array<Entry>} entries
 */
function ErrorProps$2(props) {
  const {
    element
  } = props;
  if (!isErrorSupported(element)) {
    return [];
  }
  const error = getError(element);
  let entries = [{
    id: 'errorRef',
    component: ErrorRef$1,
    isEdited: propertiesPanel.isSelectEntryEdited
  }];
  if (error) {
    entries = [...entries, {
      id: 'errorName',
      component: ErrorName$1,
      isEdited: propertiesPanel.isTextFieldEntryEdited
    }, {
      id: 'errorCode',
      component: ErrorCode$2,
      isEdited: propertiesPanel.isTextFieldEntryEdited
    }];
  }
  return entries;
}
function ErrorRef$1(props) {
  const {
    element
  } = props;
  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const errorEventDefinition = getErrorEventDefinition(element);
  const getValue = () => {
    const error = getError(element);
    if (error) {
      return error.get('id');
    }
    return EMPTY_OPTION$4;
  };
  const setValue = value => {
    const root = getRoot(errorEventDefinition);
    const commands = [];
    let error;

    // (1) create new error
    if (value === CREATE_NEW_OPTION$4) {
      error = createElement('bpmn:Error', {
        name: nextId('Error_')
      }, root, bpmnFactory);
      value = error.get('id');
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: root,
          properties: {
            rootElements: [...root.get('rootElements'), error]
          }
        }
      });
    }

    // (2) update (or remove) errorRef
    error = error || findRootElementById(errorEventDefinition, 'bpmn:Error', value);
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: errorEventDefinition,
        properties: {
          errorRef: error
        }
      }
    });

    // (3) commit all updates
    return commandStack.execute('properties-panel.multi-command-executor', commands);
  };
  const getOptions = () => {
    let options = [{
      value: EMPTY_OPTION$4,
      label: translate('<none>')
    }, {
      value: CREATE_NEW_OPTION$4,
      label: translate('Create new ...')
    }];
    const errors = findRootElementsByType(ModelUtil.getBusinessObject(element), 'bpmn:Error');
    sortByName$5(errors).forEach(error => {
      options.push({
        value: error.get('id'),
        label: error.get('name')
      });
    });
    return options;
  };
  return ReferenceSelectEntry({
    element,
    id: 'errorRef',
    label: translate('Global error reference'),
    autoFocusEntry: 'errorName',
    getValue,
    setValue,
    getOptions
  });
}
function ErrorName$1(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const error = getError(element);
  const getValue = () => {
    return error.get('name');
  };
  const setValue = value => {
    return commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: error,
      properties: {
        name: value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'errorName',
    label: translate('Name'),
    getValue,
    setValue,
    debounce
  });
}
function ErrorCode$2(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const error = getError(element);
  const getValue = () => {
    return error.get('errorCode');
  };
  const setValue = value => {
    return commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: error,
      properties: {
        errorCode: value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'errorCode',
    label: translate('Code'),
    getValue,
    setValue,
    debounce
  });
}

// helper /////////////////////////

function sortByName$5(elements) {
  return minDash.sortBy(elements, e => (e.name || '').toLowerCase());
}

const CREATE_NEW_OPTION$3 = 'create-new';

/**
 * @typedef { import('@bpmn-io/properties-panel').EntryDefinition } Entry
 */

/**
 * @returns {Array<Entry>} entries
 */
function EscalationProps$2(props) {
  const {
    element
  } = props;
  if (!isEscalationSupported(element)) {
    return [];
  }
  const escalation = getEscalation(element);
  let entries = [{
    id: 'escalationRef',
    component: EscalationRef,
    isEdited: propertiesPanel.isSelectEntryEdited
  }];
  if (escalation) {
    entries = [...entries, {
      id: 'escalationName',
      component: EscalationName,
      isEdited: propertiesPanel.isTextFieldEntryEdited
    }, {
      id: 'escalationCode',
      component: EscalationCode$1,
      isEdited: propertiesPanel.isTextFieldEntryEdited
    }];
  }
  return entries;
}
function EscalationRef(props) {
  const {
    element
  } = props;
  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const escalationEventDefinition = getEscalationEventDefinition(element);
  const getValue = () => {
    const escalation = getEscalation(element);
    return escalation && escalation.get('id');
  };
  const setValue = value => {
    const root = getRoot(escalationEventDefinition);
    const commands = [];
    let escalation;

    // (1) create new escalation
    if (value === CREATE_NEW_OPTION$3) {
      const id = nextId('Escalation_');
      escalation = createElement('bpmn:Escalation', {
        id,
        name: id
      }, root, bpmnFactory);
      value = escalation.get('id');
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: root,
          properties: {
            rootElements: [...root.get('rootElements'), escalation]
          }
        }
      });
    }

    // (2) update (or remove) escalationRef
    escalation = escalation || findRootElementById(escalationEventDefinition, 'bpmn:Escalation', value);
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: escalationEventDefinition,
        properties: {
          escalationRef: escalation
        }
      }
    });

    // (3) commit all updates
    return commandStack.execute('properties-panel.multi-command-executor', commands);
  };
  const getOptions = () => {
    let options = [{
      value: '',
      label: translate('<none>')
    }, {
      value: CREATE_NEW_OPTION$3,
      label: translate('Create new ...')
    }];
    const escalations = findRootElementsByType(ModelUtil.getBusinessObject(element), 'bpmn:Escalation');
    sortByName$4(escalations).forEach(escalation => {
      options.push({
        value: escalation.get('id'),
        label: escalation.get('name')
      });
    });
    return options;
  };
  return ReferenceSelectEntry({
    element,
    id: 'escalationRef',
    label: translate('Global escalation reference'),
    autoFocusEntry: 'escalationName',
    getValue,
    setValue,
    getOptions
  });
}
function EscalationName(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const escalation = getEscalation(element);
  const getValue = () => {
    return escalation.get('name');
  };
  const setValue = value => {
    return commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: escalation,
      properties: {
        name: value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'escalationName',
    label: translate('Name'),
    getValue,
    setValue,
    debounce
  });
}
function EscalationCode$1(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const escalation = getEscalation(element);
  const getValue = () => {
    return escalation.get('escalationCode');
  };
  const setValue = value => {
    return commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: escalation,
      properties: {
        escalationCode: value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'escalationCode',
    label: translate('Code'),
    getValue,
    setValue,
    debounce
  });
}

// helper /////////////////////////

function sortByName$4(elements) {
  return minDash.sortBy(elements, e => (e.name || '').toLowerCase());
}

/**
 * @typedef { import('@bpmn-io/properties-panel').EntryDefinition } Entry
 */

/**
 * @returns {Array<Entry>} entries
 */
function ExecutableProps(props) {
  const {
    element
  } = props;
  if (!ModelUtil.is(element, 'bpmn:Process') && !hasProcessRef$1(element)) {
    return [];
  }
  return [{
    id: 'isExecutable',
    component: Executable,
    isEdited: propertiesPanel.isCheckboxEntryEdited
  }];
}
function Executable(props) {
  const {
    element
  } = props;
  const modeling = useService('modeling');
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  let getValue, setValue;
  setValue = value => {
    modeling.updateProperties(element, {
      isExecutable: value
    });
  };
  getValue = element => {
    return element.businessObject.isExecutable;
  };

  // handle properties on processRef level for participants
  if (ModelUtil.is(element, 'bpmn:Participant')) {
    const process = element.businessObject.get('processRef');
    setValue = value => {
      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: process,
        properties: {
          isExecutable: value
        }
      });
    };
    getValue = () => {
      return process.get('isExecutable');
    };
  }
  return propertiesPanel.CheckboxEntry({
    element,
    id: 'isExecutable',
    label: translate('Executable'),
    getValue,
    setValue
  });
}

// helper /////////////////////

function hasProcessRef$1(element) {
  return ModelUtil.is(element, 'bpmn:Participant') && element.businessObject.get('processRef');
}

const SPACE_REGEX = /\s/;

// for QName validation as per http://www.w3.org/TR/REC-xml/#NT-NameChar
const QNAME_REGEX = /^([a-z][\w-.]*:)?[a-z_][\w-.]*$/i;

// for ID validation as per BPMN Schema (QName - Namespace)
const ID_REGEX = /^[a-z_][\w-.]*$/i;

/**
 * checks whether the id value is valid
 *
 * @param {ModdleElement} element
 * @param {String} idValue
 * @param {Function} translate
 *
 * @return {String} error message
 */
function isIdValid(element, idValue, translate) {
  const assigned = element.$model.ids.assigned(idValue);
  const idAlreadyExists = assigned && assigned !== element;
  if (!idValue) {
    return translate('ID must not be empty.');
  }
  if (idAlreadyExists) {
    return translate('ID must be unique.');
  }
  return validateId(idValue, translate);
}
function validateId(idValue, translate) {
  if (containsSpace(idValue)) {
    return translate('ID must not contain spaces.');
  }
  if (!ID_REGEX.test(idValue)) {
    if (QNAME_REGEX.test(idValue)) {
      return translate('ID must not contain prefix.');
    }
    return translate('ID must be a valid QName.');
  }
}
function containsSpace(value) {
  return SPACE_REGEX.test(value);
}

/**
 * @typedef { import('@bpmn-io/properties-panel').EntryDefinition } Entry
 */

/**
 * @returns {Array<Entry>} entries
 */
function IdProps() {
  return [{
    id: 'id',
    component: Id$3,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  }];
}
function Id$3(props) {
  const {
    element
  } = props;
  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const translate = useService('translate');
  const setValue = (value, error) => {
    if (error) {
      return;
    }
    modeling.updateProperties(element, {
      id: value
    });
  };
  const getValue = element => {
    return element.businessObject.id;
  };
  const validate = value => {
    const businessObject = ModelUtil.getBusinessObject(element);
    return isIdValid(businessObject, value, translate);
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'id',
    label: translate(ModelUtil.is(element, 'bpmn:Participant') ? 'Participant ID' : 'ID'),
    getValue,
    setValue,
    debounce,
    validate
  });
}

/**
 * @typedef { import('@bpmn-io/properties-panel').EntryDefinition } Entry
 */

/**
 * @returns {Array<Entry>} entries
 */
function LinkProps(props) {
  const {
    element
  } = props;
  if (!isLinkSupported(element)) {
    return [];
  }
  return [{
    id: 'linkName',
    component: LinkName,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  }];
}
function LinkName(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const linkEventDefinition = getLinkEventDefinition(element);
  const getValue = () => {
    return linkEventDefinition.get('name');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: linkEventDefinition,
      properties: {
        name: value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'linkName',
    label: translate('Name'),
    getValue,
    setValue,
    debounce
  });
}

const EMPTY_OPTION$3 = '';
const CREATE_NEW_OPTION$2 = 'create-new';

/**
 * @typedef { import('@bpmn-io/properties-panel').EntryDefinition } Entry
 */

/**
 * @returns {Array<Entry>} entries
 */
function MessageProps$1(props) {
  const {
    element
  } = props;
  if (!isMessageSupported(element)) {
    return [];
  }
  const message = getMessage(element);
  let entries = [{
    id: 'messageRef',
    component: MessageRef,
    isEdited: propertiesPanel.isSelectEntryEdited
  }];
  if (message) {
    entries = [...entries, {
      id: 'messageName',
      component: MessageName$1,
      isEdited: propertiesPanel.isTextFieldEntryEdited
    }];
  }
  return entries;
}
function MessageRef(props) {
  const {
    element
  } = props;
  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const messageEventDefinition = getMessageEventDefinition(element);
  const getValue = () => {
    const message = getMessage(element);
    if (message) {
      return message.get('id');
    }
    return EMPTY_OPTION$3;
  };
  const setValue = value => {
    const root = getRoot(messageEventDefinition);
    const commands = [];
    let message;

    // (1) create new message
    if (value === CREATE_NEW_OPTION$2) {
      const id = nextId('Message_');
      message = createElement('bpmn:Message', {
        id,
        name: id
      }, root, bpmnFactory);
      value = message.get('id');
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: root,
          properties: {
            rootElements: [...root.get('rootElements'), message]
          }
        }
      });
    }

    // (2) update (or remove) messageRef
    message = message || findRootElementById(messageEventDefinition, 'bpmn:Message', value);
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: messageEventDefinition,
        properties: {
          messageRef: message
        }
      }
    });

    // (3) commit all updates
    return commandStack.execute('properties-panel.multi-command-executor', commands);
  };
  const getOptions = () => {
    let options = [{
      value: EMPTY_OPTION$3,
      label: translate('<none>')
    }, {
      value: CREATE_NEW_OPTION$2,
      label: translate('Create new ...')
    }];
    const messages = findRootElementsByType(ModelUtil.getBusinessObject(element), 'bpmn:Message');
    sortByName$3(messages).forEach(message => {
      options.push({
        value: message.get('id'),
        label: message.get('name')
      });
    });
    return options;
  };
  return ReferenceSelectEntry({
    element,
    id: 'messageRef',
    label: translate('Global message reference'),
    autoFocusEntry: 'messageName',
    getValue,
    setValue,
    getOptions
  });
}
function MessageName$1(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const message = getMessage(element);
  const getValue = () => {
    return message.get('name');
  };
  const setValue = value => {
    return commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: message,
      properties: {
        name: value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'messageName',
    label: translate('Name'),
    getValue,
    setValue,
    debounce
  });
}

// helper /////////////////////////

function sortByName$3(elements) {
  return minDash.sortBy(elements, e => (e.name || '').toLowerCase());
}

/**
 * @typedef { import('@bpmn-io/properties-panel').EntryDefinition } Entry
 */

/**
 * @returns {Array<Entry>} entries
 */
function MultiInstanceProps$2(props) {
  const {
    element
  } = props;
  if (!isMultiInstanceSupported$1(element)) {
    return [];
  }
  const entries = [{
    id: 'loopCardinality',
    component: LoopCardinality,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  }, {
    id: 'completionCondition',
    component: CompletionCondition$1,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  }];
  return entries;
}
function LoopCardinality(props) {
  const {
    element
  } = props;
  const bpmnFactory = useService('bpmnFactory');
  const debounce = useService('debounceInput');
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const getValue = () => {
    return getLoopCardinalityValue(element);
  };
  const setValue = value => {
    return commandStack.execute('element.updateModdleProperties', updateFormalExpression(element, 'loopCardinality', value, bpmnFactory));
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'loopCardinality',
    label: translate('Loop cardinality'),
    getValue,
    setValue,
    debounce
  });
}
function CompletionCondition$1(props) {
  const {
    element
  } = props;
  const bpmnFactory = useService('bpmnFactory');
  const debounce = useService('debounceInput');
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const getValue = () => {
    return getCompletionConditionValue(element);
  };
  const setValue = value => {
    return commandStack.execute('element.updateModdleProperties', updateFormalExpression(element, 'completionCondition', value, bpmnFactory));
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'completionCondition',
    label: translate('Completion condition'),
    getValue,
    setValue,
    debounce
  });
}

// helper ////////////////////////////

// generic ///////////////////////////

/**
 * isMultiInstanceSupported - check whether given element supports MultiInstanceLoopCharacteristics.
 *
 * @param {djs.model.Base} element
 * @return {boolean}
 */
function isMultiInstanceSupported$1(element) {
  const loopCharacteristics = getLoopCharacteristics$2(element);
  return !!loopCharacteristics && ModelUtil.is(loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics');
}

/**
 * getBody - get the body of a given expression.
 *
 * @param {ModdleElement<bpmn:FormalExpression>} expression
 * @return {string} the body (value) of the expression
 */
function getBody(expression) {
  return expression && expression.get('body');
}

/**
 * getProperty - get a property value of the loop characteristics.
 *
 * @param {djs.model.Base} element
 * @param {string} propertyName
 *
 * @return {any} the property value
 */
function getProperty$2(element, propertyName) {
  const loopCharacteristics = getLoopCharacteristics$2(element);
  return loopCharacteristics && loopCharacteristics.get(propertyName);
}

/**
 * getLoopCharacteristics - get loopCharacteristics of a given element.
 *
 * @param {djs.model.Base} element
 * @return {ModdleElement<bpmn:MultiInstanceLoopCharacteristics> | undefined}
 */
function getLoopCharacteristics$2(element) {
  const bo = ModelUtil.getBusinessObject(element);
  return bo.loopCharacteristics;
}

/**
 * createFormalExpression - creates a 'bpmn:FormalExpression' element.
 *
 * @param {ModdleElement} parent
 * @param {string} body
 * @param {BpmnFactory} bpmnFactory
 *
 * @result {ModdleElement<bpmn:FormalExpression>} a formal expression
 */
function createFormalExpression$1(parent, body, bpmnFactory) {
  return createElement('bpmn:FormalExpression', {
    body: body
  }, parent, bpmnFactory);
}

/**
 * updateFormalExpression - updates a specific formal expression of the loop characteristics.
 *
 * @param {djs.model.Base} element
 * @param {string} propertyName
 * @param {string} newValue
 * @param {BpmnFactory} bpmnFactory
 */
function updateFormalExpression(element, propertyName, newValue, bpmnFactory) {
  const loopCharacteristics = getLoopCharacteristics$2(element);
  const expressionProps = {};
  if (!newValue) {
    // remove formal expression
    expressionProps[propertyName] = undefined;
    return {
      element,
      moddleElement: loopCharacteristics,
      properties: expressionProps
    };
  }
  const existingExpression = loopCharacteristics.get(propertyName);
  if (!existingExpression) {
    // add formal expression
    expressionProps[propertyName] = createFormalExpression$1(loopCharacteristics, newValue, bpmnFactory);
    return {
      element,
      moddleElement: loopCharacteristics,
      properties: expressionProps
    };
  }

  // edit existing formal expression
  return {
    element,
    moddleElement: existingExpression,
    properties: {
      body: newValue
    }
  };
}

// loopCardinality

/**
 * getLoopCardinality - get the loop cardinality of the loop characteristics.
 *
 * @param {djs.model.Base} element
 *
 * @return {ModdleElement<bpmn:FormalExpression>} an expression representing the loop cardinality
 */
function getLoopCardinality(element) {
  return getProperty$2(element, 'loopCardinality');
}

/**
 * getLoopCardinalityValue - get the loop cardinality value of the loop characteristics.
 *
 * @param {djs.model.Base} element
 *
 * @return {string} the loop cardinality value
 */
function getLoopCardinalityValue(element) {
  const loopCardinality = getLoopCardinality(element);
  return getBody(loopCardinality);
}

// completionCondition /////////////////////

/**
 * getCompletionCondition - get the completion condition of the loop characteristics.
 *
 * @param {djs.model.Base} element
 *
 * @return {ModdleElement<bpmn:FormalExpression>} an expression representing the completion condition
 */
function getCompletionCondition$1(element) {
  return getProperty$2(element, 'completionCondition');
}

/**
 * getCompletionConditionValue - get the completion condition value of the loop characteristics.
 *
 * @param {djs.model.Base} element
 *
 * @return {string} the completion condition value
 */
function getCompletionConditionValue(element) {
  const completionCondition = getCompletionCondition$1(element);
  return getBody(completionCondition);
}

/**
 * @typedef { import('@bpmn-io/properties-panel').EntryDefinition } Entry
 */

/**
 * @returns {Array<Entry>} entries
 */
function NameProps(props) {
  const {
    element
  } = props;
  if (ModelingUtil.isAny(element, ['bpmn:Collaboration', 'bpmn:DataAssociation', 'bpmn:Association'])) {
    return [];
  }
  return [{
    id: 'name',
    component: Name$3,
    isEdited: propertiesPanel.isTextAreaEntryEdited
  }];
}
function Name$3(props) {
  const {
    element
  } = props;
  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const canvas = useService('canvas');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');

  // (1) default: name
  let options = {
    element,
    id: 'name',
    label: translate('Name'),
    debounce,
    setValue: value => {
      modeling.updateProperties(element, {
        name: value
      });
    },
    getValue: element => {
      return element.businessObject.name;
    },
    autoResize: true
  };

  // (2) text annotations
  if (ModelUtil.is(element, 'bpmn:TextAnnotation')) {
    options = {
      ...options,
      setValue: value => {
        modeling.updateProperties(element, {
          text: value
        });
      },
      getValue: element => {
        return element.businessObject.text;
      }
    };
  }

  // (3) groups
  else if (ModelUtil.is(element, 'bpmn:Group')) {
    options = {
      ...options,
      setValue: value => {
        const businessObject = ModelUtil.getBusinessObject(element),
          categoryValueRef = businessObject.categoryValueRef;
        if (!categoryValueRef) {
          initializeCategory(businessObject, canvas.getRootElement(), bpmnFactory);
        }
        modeling.updateLabel(element, value);
      },
      getValue: element => {
        const businessObject = ModelUtil.getBusinessObject(element),
          categoryValueRef = businessObject.categoryValueRef;
        return categoryValueRef && categoryValueRef.value;
      }
    };
  }

  // (4) participants (only update label)
  else if (ModelUtil.is(element, 'bpmn:Participant')) {
    options.label = translate('Participant Name');
  }
  return propertiesPanel.TextAreaEntry(options);
}

// helpers ////////////////////////

function initializeCategory(businessObject, rootElement, bpmnFactory) {
  const definitions = ModelUtil.getBusinessObject(rootElement).$parent;
  const categoryValue = createCategoryValue(definitions, bpmnFactory);
  businessObject.categoryValueRef = categoryValue;
}
function createCategoryValue(definitions, bpmnFactory) {
  const categoryValue = bpmnFactory.create('bpmn:CategoryValue');
  const category = bpmnFactory.create('bpmn:Category', {
    categoryValue: [categoryValue]
  });

  // add to correct place
  Collections.add(definitions.get('rootElements'), category);
  ModelUtil.getBusinessObject(category).$parent = definitions;
  ModelUtil.getBusinessObject(categoryValue).$parent = category;
  return categoryValue;
}

/**
 * @typedef { import('@bpmn-io/properties-panel').EntryDefinition } Entry
 */

/**
 * @returns {Array<Entry>} entries
 */
function ProcessProps(props) {
  const {
    element
  } = props;
  if (!hasProcessRef(element)) {
    return [];
  }
  return [{
    id: 'processId',
    component: ProcessId,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  }, {
    id: 'processName',
    component: ProcessName,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  }];
}
function ProcessName(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const process = element.businessObject.get('processRef');
  const getValue = () => {
    return process.get('name');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: process,
      properties: {
        name: value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'processName',
    label: translate('Process name'),
    getValue,
    setValue,
    debounce
  });
}
function ProcessId(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const process = element.businessObject.get('processRef');
  const getValue = () => {
    return process.get('id');
  };
  const setValue = (value, error) => {
    if (error) {
      return;
    }
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: process,
      properties: {
        id: value
      }
    });
  };
  const validate = value => {
    return isIdValid(process, value, translate);
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'processId',
    label: translate('Process ID'),
    getValue,
    setValue,
    debounce,
    validate
  });
}

// helper ////////////////

function hasProcessRef(element) {
  return ModelUtil.is(element, 'bpmn:Participant') && element.businessObject.get('processRef');
}

/**
 * @typedef { import('@bpmn-io/properties-panel').EntryDefinition } Entry
 */

const EMPTY_OPTION$2 = '';
const CREATE_NEW_OPTION$1 = 'create-new';

/**
 * @returns {Entry[]}
 */
function SignalProps$1(props) {
  const {
    element
  } = props;
  if (!isSignalSupported$1(element)) {
    return [];
  }
  const signal = getSignal$1(element);
  let entries = [{
    id: 'signalRef',
    component: SignalRef,
    isEdited: propertiesPanel.isSelectEntryEdited
  }];
  if (signal) {
    entries = [...entries, {
      id: 'signalName',
      component: SignalName$1,
      isEdited: propertiesPanel.isTextFieldEntryEdited
    }];
  }
  return entries;
}
function SignalRef(props) {
  const {
    element
  } = props;
  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const signalEventDefinition = getSignalEventDefinition$1(element);
  const getValue = () => {
    const signal = getSignal$1(element);
    if (signal) {
      return signal.get('id');
    }
    return EMPTY_OPTION$2;
  };
  const setValue = value => {
    const root = getRoot(signalEventDefinition);
    const commands = [];
    let signal;

    // (1) create new signal
    if (value === CREATE_NEW_OPTION$1) {
      const id = nextId('Signal_');
      signal = createElement('bpmn:Signal', {
        id,
        name: id
      }, root, bpmnFactory);
      value = signal.get('id');
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: root,
          properties: {
            rootElements: [...root.get('rootElements'), signal]
          }
        }
      });
    }

    // (2) update (or remove) signalRef
    signal = signal || findRootElementById(signalEventDefinition, 'bpmn:Signal', value);
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: signalEventDefinition,
        properties: {
          signalRef: signal
        }
      }
    });

    // (3) commit all updates
    return commandStack.execute('properties-panel.multi-command-executor', commands);
  };
  const getOptions = () => {
    let options = [{
      value: EMPTY_OPTION$2,
      label: translate('<none>')
    }, {
      value: CREATE_NEW_OPTION$1,
      label: translate('Create new ...')
    }];
    const signals = findRootElementsByType(ModelUtil.getBusinessObject(element), 'bpmn:Signal');
    sortByName$2(signals).forEach(signal => {
      options.push({
        value: signal.get('id'),
        label: signal.get('name')
      });
    });
    return options;
  };
  return ReferenceSelectEntry({
    element,
    id: 'signalRef',
    label: translate('Global signal reference'),
    autoFocusEntry: 'signalName',
    getValue,
    setValue,
    getOptions
  });
}
function SignalName$1(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const signal = getSignal$1(element);
  const getValue = () => {
    return signal.get('name');
  };
  const setValue = value => {
    return commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: signal,
      properties: {
        name: value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'signalName',
    label: translate('Name'),
    getValue,
    setValue,
    debounce
  });
}

// helper /////////////////////////

function sortByName$2(elements) {
  return minDash.sortBy(elements, e => (e.name || '').toLowerCase());
}

function isTimerSupported(element) {
  return ModelingUtil.isAny(element, ['bpmn:StartEvent', 'bpmn:IntermediateCatchEvent', 'bpmn:BoundaryEvent']) && !!getTimerEventDefinition(element);
}

/**
 * Get the timer definition type for a given timer event definition.
 *
 * @param {ModdleElement<bpmn:TimerEventDefinition>} timer
 *
 * @return {string|undefined} the timer definition type
 */
function getTimerDefinitionType(timer) {
  if (!timer) {
    return;
  }
  const timeDate = timer.get('timeDate');
  if (typeof timeDate !== 'undefined') {
    return 'timeDate';
  }
  const timeCycle = timer.get('timeCycle');
  if (typeof timeCycle !== 'undefined') {
    return 'timeCycle';
  }
  const timeDuration = timer.get('timeDuration');
  if (typeof timeDuration !== 'undefined') {
    return 'timeDuration';
  }
}
function getTimerEventDefinition(element) {
  return getEventDefinition(element, 'bpmn:TimerEventDefinition');
}
function getEventDefinition(element, eventType) {
  const businessObject = ModelUtil.getBusinessObject(element);
  const eventDefinitions = businessObject.get('eventDefinitions') || [];
  return minDash.find(eventDefinitions, function (definition) {
    return ModelUtil.is(definition, eventType);
  });
}
function getSignalEventDefinition(element) {
  return getEventDefinition(element, 'bpmn:SignalEventDefinition');
}
function isSignalSupported(element) {
  return ModelUtil.is(element, 'bpmn:Event') && !!getSignalEventDefinition(element);
}
function getSignal(element) {
  const signalEventDefinition = getSignalEventDefinition(element);
  return signalEventDefinition && signalEventDefinition.get('signalRef');
}

function TimerProps$2(props) {
  const {
    element,
    idPrefix
  } = props;
  let {
    timerEventDefinition
  } = props;
  if (!timerEventDefinition) {
    const businessObject = ModelUtil.getBusinessObject(element);
    timerEventDefinition = getTimerEventDefinition(businessObject);
  }
  const timerEventDefinitionType = getTimerDefinitionType(timerEventDefinition);

  // (1) Only show for supported elements
  if (!isTimerSupported(element)) {
    return [];
  }

  // (2) Provide entries, have a value only if selection was made
  const entries = [];
  entries.push({
    id: getId$1(idPrefix, 'timerEventDefinitionType'),
    component: TimerEventDefinitionType$2,
    isEdited: propertiesPanel.isSelectEntryEdited,
    timerEventDefinition,
    timerEventDefinitionType
  });
  if (timerEventDefinitionType) {
    entries.push({
      id: getId$1(idPrefix, 'timerEventDefinitionValue'),
      component: TimerEventDefinitionValue$2,
      isEdited: propertiesPanel.isTextFieldEntryEdited,
      timerEventDefinition,
      timerEventDefinitionType
    });
  }
  return entries;
}

/**
 * TimerEventDefinitionType - Generic select entry allowing to select a specific
 * timerEventDefintionType. To be used together with timerEventDefinitionValue.
 *
 * @param  {type} props
 * @return {SelectEntry}
 */
function TimerEventDefinitionType$2(props) {
  const {
    element,
    timerEventDefinition,
    timerEventDefinitionType
  } = props;
  const commandStack = useService('commandStack'),
    bpmnFactory = useService('bpmnFactory'),
    translate = useService('translate');
  const getValue = () => {
    return timerEventDefinitionType || '';
  };
  const setValue = value => {
    // (1) Check if value is different to current type
    if (value === timerEventDefinitionType) {
      return;
    }

    // (2) Create empty formalExpression element
    const formalExpression = bpmnFactory.create('bpmn:FormalExpression', {
      body: undefined
    });
    formalExpression.$parent = timerEventDefinition;

    // (3) Set the value for selected timerEventDefinitionType
    const newProps = {
      timeDuration: undefined,
      timeDate: undefined,
      timeCycle: undefined
    };
    if (value !== '') {
      newProps[value] = formalExpression;
    }

    // (4) Execute businessObject update
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: timerEventDefinition,
      properties: newProps
    });
  };
  const getOptions = element => {
    return [{
      value: '',
      label: translate('<none>')
    }, {
      value: 'timeDate',
      label: translate('Date')
    }, {
      value: 'timeDuration',
      label: translate('Duration')
    }, {
      value: 'timeCycle',
      label: translate('Cycle')
    }];
  };
  return propertiesPanel.SelectEntry({
    element,
    id: 'timerEventDefinitionType',
    label: translate('Type'),
    getValue,
    setValue,
    getOptions
  });
}

/**
 * TimerEventDefinitionValue - Generic textField entry allowing to specify the
 * timerEventDefintionValue based on the set timerEventDefintionType. To be used
 * together with timerEventDefinitionType.
 *
 * @param  {type} props
 * @return {TextFieldEntry}
 */
function TimerEventDefinitionValue$2(props) {
  const {
    element,
    timerEventDefinition,
    timerEventDefinitionType
  } = props;
  const commandStack = useService('commandStack'),
    translate = useService('translate'),
    debounce = useService('debounceInput');
  const timerEventFormalExpression = timerEventDefinition.get(timerEventDefinitionType);
  const getValue = () => {
    return timerEventFormalExpression && timerEventFormalExpression.get('body');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: timerEventFormalExpression,
      properties: {
        body: value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'timerEventDefinitionValue',
    label: translate('Value'),
    getValue,
    setValue,
    debounce,
    tooltip: getTimerEventDefinitionValueDescription$2(timerEventDefinitionType, translate)
  });
}

// helper //////////////////////////

function getTimerEventDefinitionValueDescription$2(timerDefinitionType, translate) {
  switch (timerDefinitionType) {
    case 'timeDate':
      return jsxRuntime.jsxs("div", {
        children: [jsxRuntime.jsx("p", {
          children: translate('A specific point in time defined as ISO 8601 combined date and time representation.')
        }), jsxRuntime.jsxs("ul", {
          children: [jsxRuntime.jsxs("li", {
            children: [jsxRuntime.jsx("code", {
              children: "2019-10-01T12:00:00Z"
            }), " - ", translate('UTC time')]
          }), jsxRuntime.jsxs("li", {
            children: [jsxRuntime.jsx("code", {
              children: "2019-10-02T08:09:40+02:00"
            }), " - ", translate('UTC plus 2 hours zone offset')]
          })]
        }), jsxRuntime.jsx("a", {
          href: "https://docs.camunda.org/manual/latest/reference/bpmn20/events/timer-events/#time-date",
          target: "_blank",
          rel: "noopener",
          children: translate('Documentation: Timer events')
        })]
      });
    case 'timeCycle':
      return jsxRuntime.jsxs("div", {
        children: [jsxRuntime.jsx("p", {
          children: translate('A cycle defined as ISO 8601 repeating intervals format.')
        }), jsxRuntime.jsxs("ul", {
          children: [jsxRuntime.jsxs("li", {
            children: [jsxRuntime.jsx("code", {
              children: "R5/PT10S"
            }), " - ", translate('every 10 seconds, up to 5 times')]
          }), jsxRuntime.jsxs("li", {
            children: [jsxRuntime.jsx("code", {
              children: "R/P1D"
            }), " - ", translate('every day, infinitely')]
          })]
        }), jsxRuntime.jsx("a", {
          href: "https://docs.camunda.org/manual/latest/reference/bpmn20/events/timer-events/#time-cycle",
          target: "_blank",
          rel: "noopener",
          children: translate('Documentation: Timer events')
        })]
      });
    case 'timeDuration':
      return jsxRuntime.jsxs("div", {
        children: [jsxRuntime.jsx("p", {
          children: translate('A time duration defined as ISO 8601 durations format.')
        }), jsxRuntime.jsxs("ul", {
          children: [jsxRuntime.jsxs("li", {
            children: [jsxRuntime.jsx("code", {
              children: "PT15S"
            }), " - ", translate('15 seconds')]
          }), jsxRuntime.jsxs("li", {
            children: [jsxRuntime.jsx("code", {
              children: "PT1H30M"
            }), " - ", translate('1 hour and 30 minutes')]
          }), jsxRuntime.jsxs("li", {
            children: [jsxRuntime.jsx("code", {
              children: "P14D"
            }), " - ", translate('14 days')]
          })]
        }), jsxRuntime.jsx("a", {
          href: "https://docs.camunda.org/manual/latest/reference/bpmn20/events/timer-events/#time-duration",
          target: "_blank",
          rel: "noopener",
          children: translate('Documentation: Timer events')
        })]
      });
  }
}
function getId$1(idPrefix, id) {
  return idPrefix ? idPrefix + id : id;
}

function GeneralGroup(element, injector) {
  const translate = injector.get('translate');
  const entries = [...NameProps({
    element
  }), ...IdProps(), ...ProcessProps({
    element
  }), ...ExecutableProps({
    element
  })];
  return {
    id: 'general',
    label: translate('General'),
    entries,
    component: propertiesPanel.Group
  };
}
function CompensationGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Compensation'),
    id: 'compensation',
    component: propertiesPanel.Group,
    entries: [...CompensationProps({
      element
    })]
  };
  if (group.entries.length) {
    return group;
  }
  return null;
}
function DocumentationGroup(element, injector) {
  const translate = injector.get('translate');
  const entries = [...DocumentationProps({
    element
  })];
  return {
    id: 'documentation',
    label: translate('Documentation'),
    entries,
    component: propertiesPanel.Group
  };
}
function ErrorGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    id: 'error',
    label: translate('Error'),
    component: propertiesPanel.Group,
    entries: [...ErrorProps$2({
      element
    })]
  };
  if (group.entries.length) {
    return group;
  }
  return null;
}
function MessageGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    id: 'message',
    label: translate('Message'),
    component: propertiesPanel.Group,
    entries: [...MessageProps$1({
      element
    })]
  };
  if (group.entries.length) {
    return group;
  }
  return null;
}
function SignalGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    id: 'signal',
    label: translate('Signal'),
    component: propertiesPanel.Group,
    entries: [...SignalProps$1({
      element
    })]
  };
  if (group.entries.length) {
    return group;
  }
  return null;
}
function LinkGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Link'),
    id: 'link',
    component: propertiesPanel.Group,
    entries: [...LinkProps({
      element
    })]
  };
  if (group.entries.length) {
    return group;
  }
  return null;
}
function EscalationGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    id: 'escalation',
    label: translate('Escalation'),
    component: propertiesPanel.Group,
    entries: [...EscalationProps$2({
      element
    })]
  };
  if (group.entries.length) {
    return group;
  }
  return null;
}
function TimerGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Timer'),
    id: 'timer',
    component: propertiesPanel.Group,
    entries: [...TimerProps$2({
      element
    })]
  };
  if (group.entries.length) {
    return group;
  }
  return null;
}
function MultiInstanceGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Multi-instance'),
    id: 'multiInstance',
    component: propertiesPanel.Group,
    entries: [...MultiInstanceProps$2({
      element
    })]
  };
  if (group.entries.length) {
    return group;
  }
  return null;
}
function getGroups(element, injector) {
  const groups = [GeneralGroup(element, injector), DocumentationGroup(element, injector), CompensationGroup(element, injector), ErrorGroup(element, injector), LinkGroup(element, injector), MessageGroup(element, injector), MultiInstanceGroup(element, injector), SignalGroup(element, injector), EscalationGroup(element, injector), TimerGroup(element, injector)];

  // contract: if a group returns null, it should not be displayed at all
  return groups.filter(group => group !== null);
}
class BpmnPropertiesProvider {
  constructor(propertiesPanel, injector) {
    propertiesPanel.registerProvider(this);
    this._injector = injector;
  }
  getGroups(element) {
    return groups => {
      groups = groups.concat(getGroups(element, this._injector));
      return groups;
    };
  }
}
BpmnPropertiesProvider.$inject = ['propertiesPanel', 'injector'];

var index$2 = {
  __init__: ['bpmnPropertiesProvider'],
  bpmnPropertiesProvider: ['type', BpmnPropertiesProvider]
};

/**
 * Get extension elements of business object. Optionally filter by type.
 *
 * @param {ModdleElement} businessObject
 * @param {string} [type=undefined]
 * @returns {Array<ModdleElement>}
 */
function getExtensionElementsList(businessObject, type = undefined) {
  const extensionElements = businessObject.get('extensionElements');
  if (!extensionElements) {
    return [];
  }
  const values = extensionElements.get('values');
  if (!values || !values.length) {
    return [];
  }
  if (type) {
    return values.filter(value => ModelUtil.is(value, type));
  }
  return values;
}

/**
 * Add one or more extension elements. Create bpmn:ExtensionElements if it doesn't exist.
 *
 * @param {ModdleElement} element
 * @param {ModdleElement} businessObject
 * @param {ModdleElement|Array<ModdleElement>} extensionElementsToAdd
 * @param {CommandStack} commandStack
 */
function addExtensionElements(element, businessObject, extensionElementToAdd, bpmnFactory, commandStack) {
  const commands = [];
  let extensionElements = businessObject.get('extensionElements');

  // (1) create bpmn:ExtensionElements if it doesn't exist
  if (!extensionElements) {
    extensionElements = createElement('bpmn:ExtensionElements', {
      values: []
    }, businessObject, bpmnFactory);
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: businessObject,
        properties: {
          extensionElements
        }
      }
    });
  }
  extensionElementToAdd.$parent = extensionElements;

  // (2) add extension element to list
  commands.push({
    cmd: 'element.updateModdleProperties',
    context: {
      element,
      moddleElement: extensionElements,
      properties: {
        values: [...extensionElements.get('values'), extensionElementToAdd]
      }
    }
  });
  commandStack.execute('properties-panel.multi-command-executor', commands);
}

/**
 * Remove one or more extension elements. Remove bpmn:ExtensionElements afterwards if it's empty.
 *
 * @param {ModdleElement} element
 * @param {ModdleElement} businessObject
 * @param {ModdleElement|Array<ModdleElement>} extensionElementsToRemove
 * @param {CommandStack} commandStack
 */
function removeExtensionElements(element, businessObject, extensionElementsToRemove, commandStack) {
  if (!minDash.isArray(extensionElementsToRemove)) {
    extensionElementsToRemove = [extensionElementsToRemove];
  }
  const extensionElements = businessObject.get('extensionElements'),
    values = extensionElements.get('values').filter(value => !extensionElementsToRemove.includes(value));
  commandStack.execute('element.updateModdleProperties', {
    element,
    moddleElement: extensionElements,
    properties: {
      values
    }
  });
}

const fallbackResolver = {
  getVariablesForElement: bo => zeebe.getVariablesForElement(bo)
};
function withVariableContext(Component) {
  return props => {
    const {
      bpmnElement,
      element
    } = props;
    const bo = (bpmnElement || element).businessObject;
    const [variables, setVariables] = hooks.useState([]);
    const eventBus = useService('eventBus');
    const variableResolver = useServiceIfAvailable('variableResolver', fallbackResolver);
    hooks.useEffect(() => {
      const extractVariables = async () => {
        const variables = await variableResolver.getVariablesForElement(bo, element);
        setVariables(variables.map(variable => {
          return {
            ...variable,
            info: variable.info || variable.origin && 'Written in ' + variable.origin.map(origin => origin.name || origin.id).join(', ')
          };
        }));
      };

      // The callback must return undefined, so the event propagation is not canceled.
      // Cf. https://github.com/camunda/camunda-modeler/issues/3392
      const callback = () => {
        extractVariables();
      };
      eventBus.on('commandStack.changed', callback);
      callback();
      return () => {
        eventBus.off('commandStack.changed', callback);
      };
    }, [bo]);
    return jsxRuntime.jsx(Component, {
      ...props,
      variables: variables
    });
  };
}

// helpers //////////

function useServiceIfAvailable(service, fallback) {
  const resolved = useService(service, false);
  if (!resolved) {
    return fallback;
  }
  return resolved;
}

function withTooltipContainer(Component) {
  return props => {
    const tooltipContainer = hooks.useMemo(() => {
      const config = useService('config');
      return config && config.propertiesPanel && config.propertiesPanel.feelTooltipContainer;
    }, []);
    return jsxRuntime.jsx(Component, {
      ...props,
      tooltipContainer: tooltipContainer
    });
  };
}

const FeelEntry = withTooltipContainer(propertiesPanel.FeelEntry);
const FeelEntryWithVariableContext = withVariableContext(FeelEntry);

function AssignmentDefinitionProps(props) {
  const {
    element
  } = props;
  if (!ModelUtil.is(element, 'bpmn:UserTask')) {
    return [];
  }
  return [{
    id: 'assignmentDefinitionAssignee',
    component: Assignee$1,
    isEdited: propertiesPanel.isFeelEntryEdited
  }, {
    id: 'assignmentDefinitionCandidateGroups',
    component: CandidateGroups$1,
    isEdited: propertiesPanel.isFeelEntryEdited
  }, {
    id: 'assignmentDefinitionCandidateUsers',
    component: CandidateUsers$1,
    isEdited: propertiesPanel.isFeelEntryEdited
  }];
}
function Assignee$1(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return (getAssignmentDefinition(element) || {}).assignee;
  };
  const setValue = value => {
    const commands = [];
    const businessObject = ModelUtil.getBusinessObject(element);
    let extensionElements = businessObject.get('extensionElements');

    // (1) ensure extension elements
    if (!extensionElements) {
      extensionElements = createElement('bpmn:ExtensionElements', {
        values: []
      }, businessObject, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
          properties: {
            extensionElements
          }
        }
      });
    }

    // (2) ensure AssignmentDefinition
    let assignmentDefinition = getAssignmentDefinition(element);
    if (!assignmentDefinition) {
      assignmentDefinition = createElement('zeebe:AssignmentDefinition', {}, extensionElements, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [...extensionElements.get('values'), assignmentDefinition]
          }
        }
      });
    }

    // (3) update assignee definition type
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: assignmentDefinition,
        properties: {
          assignee: value
        }
      }
    });

    // (4) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
  return FeelEntryWithVariableContext({
    element,
    id: 'assignmentDefinitionAssignee',
    label: translate('Assignee'),
    feel: 'optional',
    getValue,
    setValue,
    debounce
  });
}
function CandidateGroups$1(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return (getAssignmentDefinition(element) || {}).candidateGroups;
  };
  const setValue = value => {
    let commands = [];
    const businessObject = ModelUtil.getBusinessObject(element);
    let extensionElements = businessObject.get('extensionElements');

    // (1) ensure extension elements
    if (!extensionElements) {
      extensionElements = createElement('bpmn:ExtensionElements', {
        values: []
      }, businessObject, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
          properties: {
            extensionElements
          }
        }
      });
    }

    // (2) ensure assignmentDefinition
    let assignmentDefinition = getAssignmentDefinition(element);
    if (!assignmentDefinition) {
      assignmentDefinition = createElement('zeebe:AssignmentDefinition', {}, extensionElements, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [...extensionElements.get('values'), assignmentDefinition]
          }
        }
      });
    }

    // (3) update candidateGroups
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: assignmentDefinition,
        properties: {
          candidateGroups: value
        }
      }
    });
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
  return FeelEntryWithVariableContext({
    element,
    id: 'assignmentDefinitionCandidateGroups',
    label: translate('Candidate groups'),
    feel: 'optional',
    getValue,
    setValue,
    debounce
  });
}
function CandidateUsers$1(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return (getAssignmentDefinition(element) || {}).candidateUsers;
  };
  const setValue = value => {
    let commands = [];
    const businessObject = ModelUtil.getBusinessObject(element);
    let extensionElements = businessObject.get('extensionElements');

    // (1) ensure extension elements
    if (!extensionElements) {
      extensionElements = createElement('bpmn:ExtensionElements', {
        values: []
      }, businessObject, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
          properties: {
            extensionElements
          }
        }
      });
    }

    // (2) ensure assignmentDefinition
    let assignmentDefinition = getAssignmentDefinition(element);
    if (!assignmentDefinition) {
      assignmentDefinition = createElement('zeebe:AssignmentDefinition', {}, extensionElements, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [...extensionElements.get('values'), assignmentDefinition]
          }
        }
      });
    }

    // (3) update candidateUsers
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: assignmentDefinition,
        properties: {
          candidateUsers: value
        }
      }
    });
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
  return FeelEntryWithVariableContext({
    element,
    id: 'assignmentDefinitionCandidateUsers',
    label: translate('Candidate users'),
    feel: 'optional',
    getValue,
    setValue,
    debounce
  });
}

// helper ///////////////////////

function getAssignmentDefinition(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  return getExtensionElementsList(businessObject, 'zeebe:AssignmentDefinition')[0];
}

function isZeebeServiceTask(element) {
  if (!ModelUtil.is(element, 'zeebe:ZeebeServiceTask')) return false;
  if (ModelUtil.is(element, 'bpmn:EndEvent') || ModelUtil.is(element, 'bpmn:IntermediateThrowEvent')) {
    return !!getMessageEventDefinition(element);
  }

  // BusinessRuleTask and ScriptTask are ServiceTasks only if they have a TaskDefinition
  // (ie. if the implementation is set to ==JobWorker)
  if (ModelUtil.isAny(element, ['bpmn:BusinessRuleTask', 'bpmn:ScriptTask']) && !getTaskDefinition$3(element)) {
    return false;
  }
  return true;
}
function isMessageEndEvent(element) {
  return ModelUtil.is(element, 'bpmn:EndEvent') && !!getMessageEventDefinition(element);
}
function isMessageThrowEvent(element) {
  return ModelUtil.is(element, 'bpmn:IntermediateThrowEvent') && !!getMessageEventDefinition(element);
}

// helper ////////////////

function getTaskDefinition$3(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  return getExtensionElementsList(businessObject, 'zeebe:TaskDefinition')[0];
}

function areHeadersSupported(element) {
  return ModelUtil.is(element, 'bpmn:UserTask') || isZeebeServiceTask(element);
}

/**
 * Get first zeebe:TaskHeaders element for a specific element.
 *
 * @param  {ModdleElement} element
 *
 * @return {ModdleElement} a zeebe:TaskHeader element
 */
function getTaskHeaders$1(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  return getExtensionElementsList(businessObject, 'zeebe:TaskHeaders')[0];
}

/**
 * Retrieve all zeebe:Header elements for a specific element.
 *
 * @param  {ModdleElement} element
 *
 * @return {Array<ModdleElement>} a list of zeebe:Header elements
 */
function getHeaders(element) {
  const taskHeaders = getTaskHeaders$1(element);
  return taskHeaders ? taskHeaders.get('values') : [];
}

const DMN_IMPLEMENTATION_OPTION = 'dmn',
  JOB_WORKER_IMPLEMENTATION_OPTION$1 = 'jobWorker',
  DEFAULT_IMPLEMENTATION_OPTION$1 = '';
function BusinessRuleImplementationProps(props) {
  const {
    element
  } = props;
  if (!ModelUtil.is(element, 'bpmn:BusinessRuleTask')) {
    return [];
  }
  return [{
    id: 'businessRuleImplementation',
    component: BusinessRuleImplementation,
    isEdited: () => isBusinessRuleImplementationEdited(element)
  }];
}
function BusinessRuleImplementation(props) {
  const {
    element,
    id
  } = props;
  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const getValue = () => {
    if (getCalledDecision$1(element)) {
      return DMN_IMPLEMENTATION_OPTION;
    }
    if (getTaskDefinition$2(element)) {
      return JOB_WORKER_IMPLEMENTATION_OPTION$1;
    }
    return DEFAULT_IMPLEMENTATION_OPTION$1;
  };

  /**
   * Set value by either creating a zeebe:calledDecision or a zeebe:taskDefintion
   * extension element. Note that they must not exist both at the same time, however
   * this will be ensured by a bpmn-js behavior (and not by the propPanel).
   */
  const setValue = value => {
    let extensionElement, extensionElementType;
    if (value === DMN_IMPLEMENTATION_OPTION) {
      extensionElement = getCalledDecision$1(element);
      extensionElementType = 'zeebe:CalledDecision';
    } else if (value === JOB_WORKER_IMPLEMENTATION_OPTION$1) {
      extensionElement = getTaskDefinition$2(element);
      extensionElementType = 'zeebe:TaskDefinition';
    } else {
      resetElement$1(element, commandStack);
    }
    if (!extensionElement && extensionElementType) {
      extensionElement = createElement(extensionElementType, {}, null, bpmnFactory);
      updateExtensionElements$1(element, extensionElement, bpmnFactory, commandStack);
    }
  };
  const getOptions = () => {
    const options = [{
      value: DEFAULT_IMPLEMENTATION_OPTION$1,
      label: translate('<none>')
    }, {
      value: DMN_IMPLEMENTATION_OPTION,
      label: translate('DMN decision')
    }, {
      value: JOB_WORKER_IMPLEMENTATION_OPTION$1,
      label: translate('Job worker')
    }];
    return options;
  };
  return propertiesPanel.SelectEntry({
    element,
    id,
    label: translate('Implementation'),
    getValue,
    setValue,
    getOptions
  });
}

// helper ///////////////////////

function getTaskDefinition$2(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  return getExtensionElementsList(businessObject, 'zeebe:TaskDefinition')[0];
}
function getCalledDecision$1(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  return getExtensionElementsList(businessObject, 'zeebe:CalledDecision')[0];
}
function isBusinessRuleImplementationEdited(element) {
  return getTaskDefinition$2(element);
}
function resetElement$1(element, commandStack) {
  const businessObject = ModelUtil.getBusinessObject(element);
  const toRemove = [getTaskDefinition$2(element), getTaskHeaders$1(element), getCalledDecision$1(element)].filter(Boolean);
  removeExtensionElements(element, businessObject, toRemove, commandStack);
}
function updateExtensionElements$1(element, extensionElementToAdd, bpmnFactory, commandStack) {
  const businessObject = ModelUtil.getBusinessObject(element);
  const commands = [];
  let extensionElements = businessObject.get('extensionElements');
  let extensionElementValues;

  // (1) create bpmn:ExtensionElements if it doesn't exist
  if (!extensionElements) {
    extensionElements = createElement('bpmn:ExtensionElements', {
      values: []
    }, businessObject, bpmnFactory);
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: businessObject,
        properties: {
          extensionElements
        }
      }
    });
  }
  extensionElementToAdd.$parent = extensionElements;

  // (2) remove old exension element from extensionElements
  if (ModelUtil.is(extensionElementToAdd, 'zeebe:TaskDefinition')) {
    extensionElementValues = minDash.without(extensionElements.get('values'), getCalledDecision$1(element));
  } else if (ModelUtil.is(extensionElementToAdd, 'zeebe:CalledDecision')) {
    extensionElementValues = minDash.without(extensionElements.get('values'), getTaskDefinition$2(element));
  }

  // (3) add extension element to list
  commands.push({
    cmd: 'element.updateModdleProperties',
    context: {
      element,
      moddleElement: extensionElements,
      properties: {
        values: [...extensionElementValues, extensionElementToAdd]
      }
    }
  });
  commandStack.execute('properties-panel.multi-command-executor', commands);
}

function CalledDecisionProps(props) {
  const {
    element
  } = props;
  if (!ModelUtil.is(element, 'bpmn:BusinessRuleTask') || !getCalledDecision(element)) {
    return [];
  }
  return [{
    id: 'decisionId',
    component: DecisionID,
    isEdited: propertiesPanel.isFeelEntryEdited
  }, {
    id: 'resultVariable',
    component: ResultVariable$4,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  }];
}
function DecisionID(props) {
  const {
    element,
    id
  } = props;
  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return (getCalledDecision(element) || {}).decisionId;
  };
  const setValue = value => {
    const commands = [];
    const businessObject = ModelUtil.getBusinessObject(element);
    let extensionElements = businessObject.get('extensionElements');

    // (1) ensure extension elements
    if (!extensionElements) {
      extensionElements = createElement('bpmn:ExtensionElements', {
        values: []
      }, businessObject, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
          properties: {
            extensionElements
          }
        }
      });
    }

    // (2) ensure calledDecision
    let calledDecision = getCalledDecision(element);
    if (!calledDecision) {
      calledDecision = createElement('zeebe:CalledDecision', {}, extensionElements, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [...extensionElements.get('values'), calledDecision]
          }
        }
      });
    }

    // (3) update caledDecision.decisionId
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: calledDecision,
        properties: {
          decisionId: value
        }
      }
    });

    // (4) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
  return FeelEntryWithVariableContext({
    element,
    id,
    label: translate('Decision ID'),
    feel: 'optional',
    getValue,
    setValue,
    debounce
  });
}
function ResultVariable$4(props) {
  const {
    element,
    id
  } = props;
  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return (getCalledDecision(element) || {}).resultVariable;
  };
  const setValue = value => {
    const commands = [];
    const businessObject = ModelUtil.getBusinessObject(element);
    let extensionElements = businessObject.get('extensionElements');

    // (1) ensure extension elements
    if (!extensionElements) {
      extensionElements = createElement('bpmn:ExtensionElements', {
        values: []
      }, businessObject, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
          properties: {
            extensionElements
          }
        }
      });
    }

    // (2) ensure calledDecision
    let calledDecision = getCalledDecision(element);
    if (!calledDecision) {
      calledDecision = createElement('zeebe:CalledDecision', {}, extensionElements, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [...extensionElements.get('values'), calledDecision]
          }
        }
      });
    }

    // (3) update caledDecision.decisionId
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: calledDecision,
        properties: {
          resultVariable: value
        }
      }
    });

    // (4) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id,
    label: translate('Result variable'),
    getValue,
    setValue,
    debounce
  });
}

// helper ///////////////////////

function getCalledDecision(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  return getExtensionElementsList(businessObject, 'zeebe:CalledDecision')[0];
}

function ConditionProps$1(props) {
  const {
    element
  } = props;
  if (!ModelUtil.is(element, 'bpmn:SequenceFlow')) {
    return [];
  }
  const conditionProps = [];
  if (isConditionalSource$1(element.source)) {
    conditionProps.push({
      id: 'conditionExpression',
      component: ConditionExpression$1,
      isEdited: propertiesPanel.isFeelEntryEdited
    });
  }
  return conditionProps;
}
function ConditionExpression$1(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack'),
    bpmnFactory = useService('bpmnFactory'),
    translate = useService('translate'),
    debounce = useService('debounceInput');
  const getValue = () => {
    return getConditionExpression$1(element);
  };
  const setValue = value => {
    const commands = [];
    const businessObject = ModelUtil.getBusinessObject(element);

    // (1) If we set value to a default flow, make it a non-default flow
    // by updating the element source
    const source = element.source;
    if (source.businessObject.default === businessObject) {
      commands.push({
        cmd: 'element.updateProperties',
        context: {
          element: source,
          properties: {
            'default': undefined
          }
        }
      });
    }

    // (2) Create and set formalExpression element containing the conditionExpression,
    // unless the provided value is empty
    const formalExpressionElement = value && value != '' ? createElement('bpmn:FormalExpression', {
      body: value
    }, businessObject, bpmnFactory) : undefined;
    commands.push({
      cmd: 'element.updateProperties',
      context: {
        element: element,
        properties: {
          conditionExpression: formalExpressionElement
        }
      }
    });

    // (3) Execute the commands
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
  return FeelEntryWithVariableContext({
    element,
    id: 'conditionExpression',
    label: translate('Condition expression'),
    feel: 'required',
    getValue,
    setValue,
    debounce
  });
}

// helper //////////////////////////

const CONDITIONAL_SOURCES$1 = ['bpmn:Activity', 'bpmn:ExclusiveGateway', 'bpmn:InclusiveGateway'];
function isConditionalSource$1(element) {
  return ModelingUtil.isAny(element, CONDITIONAL_SOURCES$1);
}

/**
 * getConditionExpression - get the body value of a condition expression for a given element
 *
 * @param  {ModdleElement} element
 *
 * @return {string|undefined}
 */
function getConditionExpression$1(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  const conditionExpression = businessObject.conditionExpression;
  if (conditionExpression) {
    return conditionExpression.get('body');
  }
}

function ErrorProps$1(props) {
  const {
    element
  } = props;
  const error = getError(element);
  const entries = [];
  if (error && ModelUtil.is(element, 'bpmn:ThrowEvent')) {
    entries.push({
      id: 'errorCode',
      component: ErrorCode$1,
      isEdited: propertiesPanel.isFeelEntryEdited
    });
  }
  return entries;
}
function ErrorCode$1(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const error = getError(element);
  const getValue = () => {
    return error.get('errorCode');
  };
  const setValue = value => {
    return commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: error,
      properties: {
        errorCode: value
      }
    });
  };
  return FeelEntryWithVariableContext({
    element,
    id: 'errorCode',
    label: translate('Code'),
    feel: 'optional',
    getValue,
    setValue,
    debounce
  });
}

/**
 * @typedef { import('@bpmn-io/properties-panel').EntryDefinition } Entry
 */

/**
 * @returns {Array<Entry>} entries
 */
function EscalationProps$1(props) {
  const {
    element
  } = props;

  // update throw events only
  if (!ModelUtil.is(element, 'bpmn:ThrowEvent')) {
    return [];
  }
  const escalation = getEscalation(element);
  const entries = [];
  if (escalation) {
    entries.push({
      id: 'escalationCode',
      component: EscalationCode,
      isEdited: propertiesPanel.isFeelEntryEdited
    });
  }
  return entries;
}
function EscalationCode(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const escalation = getEscalation(element);
  const getValue = () => {
    return escalation.get('escalationCode');
  };
  const setValue = value => {
    return commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: escalation,
      properties: {
        escalationCode: value
      }
    });
  };
  return FeelEntryWithVariableContext({
    element,
    id: 'escalationCode',
    label: translate('Code'),
    feel: 'optional',
    getValue,
    setValue,
    debounce
  });
}

const FORM_KEY_PREFIX = 'camunda-forms:bpmn:',
  USER_TASK_FORM_ID_PREFIX = 'UserTaskForm_';
const FORM_TYPES = {
  CAMUNDA_FORM_EMBEDDED: 'camunda-form-embedded',
  CAMUNDA_FORM_LINKED: 'camunda-form-linked',
  CUSTOM_FORM: 'custom-form'
};
function getFormDefinition(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  const formDefinitions = getExtensionElementsList(businessObject, 'zeebe:FormDefinition');
  return formDefinitions[0];
}
function getUserTaskForm(element, rootElement) {
  rootElement = rootElement || getRootElement$1(element);
  const formDefinition = getFormDefinition(element);
  if (!formDefinition) {
    return;
  }
  const formKey = formDefinition.get('formKey');
  const userTaskForms = getExtensionElementsList(rootElement, 'zeebe:UserTaskForm');
  return userTaskForms.find(userTaskForm => {
    return userTaskFormIdToFormKey(userTaskForm.get('id')) === formKey;
  });
}
function userTaskFormIdToFormKey(userTaskFormId) {
  return `${FORM_KEY_PREFIX}${userTaskFormId}`;
}
function createUserTaskFormId() {
  return nextId(USER_TASK_FORM_ID_PREFIX);
}
function getRootElement$1(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  let parent = businessObject;
  while (parent.$parent && !ModelUtil.is(parent, 'bpmn:Process')) {
    parent = parent.$parent;
  }
  return parent;
}
function getFormType$1(element) {
  const formDefinition = getFormDefinition(element);
  if (!formDefinition) {
    return;
  }
  const formId = formDefinition.get('formId'),
    formKey = formDefinition.get('formKey');
  if (minDash.isDefined(formId)) {
    return FORM_TYPES.CAMUNDA_FORM_LINKED;
  }
  if (minDash.isDefined(formKey)) {
    if (getUserTaskForm(element)) {
      return FORM_TYPES.CAMUNDA_FORM_EMBEDDED;
    }
    return FORM_TYPES.CUSTOM_FORM;
  }
}

function FormProps$1(props) {
  const {
    element
  } = props;
  if (!ModelUtil.is(element, 'bpmn:UserTask')) {
    return [];
  }
  const entries = [{
    id: 'formType',
    component: FormType$1,
    isEdited: propertiesPanel.isSelectEntryEdited
  }];
  const formType = getFormType$1(element);
  if (formType === FORM_TYPES.CAMUNDA_FORM_EMBEDDED) {
    entries.push({
      id: 'formConfiguration',
      component: FormConfiguration,
      isEdited: propertiesPanel.isTextAreaEntryEdited
    });
  } else if (formType === FORM_TYPES.CAMUNDA_FORM_LINKED) {
    entries.push({
      id: 'formId',
      component: FormId,
      isEdited: propertiesPanel.isTextFieldEntryEdited
    });
  } else if (formType === FORM_TYPES.CUSTOM_FORM) {
    entries.push({
      id: 'customFormKey',
      component: CustomFormKey,
      isEdited: propertiesPanel.isTextFieldEntryEdited
    });
  }
  return entries;
}
function FormType$1(props) {
  const {
    element
  } = props;
  const injector = useService('injector'),
    translate = useService('translate');
  const getValue = () => {
    return getFormType$1(element) || '';
  };
  const setValue = value => {
    if (value === FORM_TYPES.CAMUNDA_FORM_EMBEDDED) {
      setUserTaskForm(injector, element, '');
    } else if (value === FORM_TYPES.CAMUNDA_FORM_LINKED) {
      setFormId(injector, element, '');
    } else if (value === FORM_TYPES.CUSTOM_FORM) {
      setCustomFormKey(injector, element, '');
    } else {
      removeFormDefinition(injector, element);
    }
  };
  const getOptions = () => {
    return [{
      value: '',
      label: translate('<none>')
    }, {
      value: FORM_TYPES.CAMUNDA_FORM_LINKED,
      label: translate('Camunda Form (linked)')
    }, {
      value: FORM_TYPES.CAMUNDA_FORM_EMBEDDED,
      label: translate('Camunda Form (embedded)')
    }, {
      value: FORM_TYPES.CUSTOM_FORM,
      label: translate('Custom form key')
    }];
  };
  return propertiesPanel.SelectEntry({
    element,
    id: 'formType',
    label: translate('Type'),
    getValue,
    setValue,
    getOptions
  });
}
function FormConfiguration(props) {
  const {
    element
  } = props;
  const debounce = useService('debounceInput'),
    injector = useService('injector'),
    translate = useService('translate');
  const getValue = () => {
    return getUserTaskForm(element).get('body');
  };
  const setValue = value => {
    setUserTaskForm(injector, element, minDash.isUndefined(value) ? '' : value);
  };
  return propertiesPanel.TextAreaEntry({
    element,
    id: 'formConfiguration',
    label: translate('Form JSON configuration'),
    rows: 4,
    getValue,
    setValue,
    debounce
  });
}
function FormId(props) {
  const {
    element
  } = props;
  const debounce = useService('debounceInput'),
    injector = useService('injector'),
    translate = useService('translate');
  const getValue = () => {
    return getFormDefinition(element).get('formId');
  };
  const setValue = value => {
    setFormId(injector, element, minDash.isUndefined(value) ? '' : value);
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'formId',
    label: translate('Form ID'),
    getValue,
    setValue,
    debounce
  });
}
function CustomFormKey(props) {
  const {
    element
  } = props;
  const debounce = useService('debounceInput'),
    injector = useService('injector'),
    translate = useService('translate');
  const getValue = () => {
    return getFormDefinition(element).get('formKey');
  };
  const setValue = value => {
    setCustomFormKey(injector, element, minDash.isUndefined(value) ? '' : value);
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'customFormKey',
    label: translate('Form key'),
    getValue,
    setValue,
    debounce
  });
}

// helpers /////////////

/**
 * @typedef { { cmd: string, context: Object } } Command
 * @typedef {Command[]} Commands
 *
 * @typedef {import('diagram-js/lib/model/Types').Element} Element
 * @typedef {import('bpmn-js/lib/model/Types').ModdleElement} ModdleElement
 *
 * @param {import('didi').Injector} Injector
 */

/**
 * @param {Injector} injector
 * @param {Element} element
 *
 * @returns { {
 *   commands: Commands,
 *   extensionElements: ModdleElement
 * } }
 */
function getOrCreateExtensionElements(injector, element, moddleElement) {
  const businessObject = moddleElement || ModelUtil.getBusinessObject(element);
  let extensionElements = businessObject.get('extensionElements');
  if (extensionElements) {
    return {
      commands: [],
      extensionElements
    };
  }
  const bpmnFactory = injector.get('bpmnFactory');
  extensionElements = createElement('bpmn:ExtensionElements', {
    values: []
  }, businessObject, bpmnFactory);
  return {
    commands: [createUpdateModdlePropertiesCommand(element, businessObject, {
      extensionElements
    })],
    extensionElements
  };
}

/**
 * @param {Injector} injector
 * @param {Element} element
 *
 * @returns { {
*   commands: Commands,
*   formDefinition: ModdleElement
* } }
*/
function getOrCreateFormDefintition(injector, element) {
  let formDefinition = getFormDefinition(element);
  if (formDefinition) {
    return {
      commands: [],
      formDefinition
    };
  }
  const {
    extensionElements,
    commands
  } = getOrCreateExtensionElements(injector, element);
  formDefinition = createFormDefinition(injector, {}, extensionElements);
  return {
    commands: [...commands, createUpdateModdlePropertiesCommand(element, extensionElements, {
      values: [...extensionElements.get('values'), formDefinition]
    })],
    formDefinition
  };
}

/**
 * @param {Injector} injector
 * @param {Element} element
 *
 * @returns { {
 *   commands: Commands,
 *   formDefinition: ModdleElement,
 *   userTaskForm: ModdleElement
 * } }
 */
function getOrCreateUserTaskForm(injector, element) {
  let userTaskForm = getUserTaskForm(element);
  if (userTaskForm) {
    return {
      commands: [],
      formDefinition: getFormDefinition(element),
      userTaskForm
    };
  }
  const rootElement = getRootElement$1(element);
  const {
    extensionElements,
    commands: extensionElementsCommands
  } = getOrCreateExtensionElements(injector, element, rootElement);
  const {
    formDefinition,
    commands: formDefinitionCommands
  } = getOrCreateFormDefintition(injector, element);
  const formId = createUserTaskFormId();
  userTaskForm = createUserTaskForm(injector, {
    id: formId
  }, extensionElements);
  return {
    commands: [...extensionElementsCommands, ...formDefinitionCommands, createUpdateModdlePropertiesCommand(element, extensionElements, {
      values: [...extensionElements.get('values'), userTaskForm]
    }), createUpdateModdlePropertiesCommand(element, formDefinition, {
      formKey: userTaskFormIdToFormKey(formId)
    })],
    formDefinition,
    userTaskForm
  };
}
function setFormId(injector, element, formId) {
  let {
    commands,
    formDefinition
  } = getOrCreateFormDefintition(injector, element);
  const commandStack = injector.get('commandStack');
  commandStack.execute('properties-panel.multi-command-executor', [...commands, createUpdateModdlePropertiesCommand(element, formDefinition, {
    formId
  })]);
}
function setCustomFormKey(injector, element, formKey) {
  let {
    commands,
    formDefinition
  } = getOrCreateFormDefintition(injector, element);
  const commandStack = injector.get('commandStack');
  commandStack.execute('properties-panel.multi-command-executor', [...commands, createUpdateModdlePropertiesCommand(element, formDefinition, {
    formKey
  })]);
}
function setUserTaskForm(injector, element, body) {
  let {
    commands,
    userTaskForm
  } = getOrCreateUserTaskForm(injector, element);
  const commandStack = injector.get('commandStack');
  commandStack.execute('properties-panel.multi-command-executor', [...commands, createUpdateModdlePropertiesCommand(element, userTaskForm, {
    body
  })]);
}
function removeFormDefinition(injector, element) {
  const formDefinition = getFormDefinition(element);

  /**
   * @type {import('bpmn-js/lib/features/modeling/Modeling').default}
   */
  const modeling = injector.get('modeling');
  if (formDefinition) {
    const businessObject = ModelUtil.getBusinessObject(element),
      extensionElements = businessObject.get('extensionElements');
    modeling.updateModdleProperties(element, extensionElements, {
      values: minDash.without(extensionElements.get('values'), formDefinition)
    });
  }
}

/**
 * @param {Injector} injector
 * @param {Object} properties
 * @param {ModdleElement} parent
 *
 * @returns {ModdleElement}
 */
function createFormDefinition(injector, properties, parent) {
  const bpmnFactory = injector.get('bpmnFactory');
  return createElement('zeebe:FormDefinition', properties, parent, bpmnFactory);
}

/**
 * @param {Injector} injector
 * @param {Object} properties
 * @param {ModdleElement} parent
 *
 * @returns {ModdleElement}
 */
function createUserTaskForm(injector, properties, parent) {
  const bpmnFactory = injector.get('bpmnFactory');
  return createElement('zeebe:UserTaskForm', properties, parent, bpmnFactory);
}

/**
 * @param {Element} element
 * @param {ModdleElement} moddleElement
 * @param {Object} properties
 *
 * @returns {Command}
 */
function createUpdateModdlePropertiesCommand(element, moddleElement, properties) {
  return {
    cmd: 'element.updateModdleProperties',
    context: {
      element,
      moddleElement,
      properties
    }
  };
}

function Header(props) {
  const {
    idPrefix,
    header
  } = props;
  const entries = [{
    id: idPrefix + '-key',
    component: KeyProperty,
    header,
    idPrefix
  }, {
    id: idPrefix + '-value',
    component: ValueProperty$2,
    header,
    idPrefix
  }];
  return entries;
}
function KeyProperty(props) {
  const {
    idPrefix,
    element,
    header
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: header,
      properties: {
        key: value
      }
    });
  };
  const getValue = header => {
    return header.key;
  };
  return propertiesPanel.TextFieldEntry({
    element: header,
    id: idPrefix + '-key',
    label: translate('Key'),
    getValue,
    setValue,
    debounce
  });
}
function ValueProperty$2(props) {
  const {
    idPrefix,
    element,
    header
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: header,
      properties: {
        value
      }
    });
  };
  const getValue = header => {
    return header.value;
  };
  return propertiesPanel.TextFieldEntry({
    element: header,
    id: idPrefix + '-value',
    label: translate('Value'),
    getValue,
    setValue,
    debounce
  });
}

function HeaderProps({
  element,
  injector
}) {
  if (!areHeadersSupported(element)) {
    return null;
  }
  const headers = getHeaders(element) || [];
  const bpmnFactory = injector.get('bpmnFactory'),
    commandStack = injector.get('commandStack');
  const items = headers.map((header, index) => {
    const id = element.id + '-header-' + index;
    return {
      id,
      label: header.get('key') || '',
      entries: Header({
        idPrefix: id,
        element,
        header
      }),
      autoFocusEntry: id + '-key',
      remove: removeFactory$c({
        commandStack,
        element,
        header
      })
    };
  });
  return {
    items,
    add: addFactory$9({
      bpmnFactory,
      commandStack,
      element
    }),
    shouldSort: false
  };
}
function removeFactory$c({
  commandStack,
  element,
  header
}) {
  return function (event) {
    event.stopPropagation();
    let commands = [];
    const taskHeaders = getTaskHeaders$1(element);
    if (!taskHeaders) {
      return;
    }
    const newTaskHeaders = minDash.without(taskHeaders.get('values'), header);
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: taskHeaders,
        properties: {
          values: newTaskHeaders
        }
      }
    });

    // remove zeebe:TaskHeaders if there are no headers anymore
    if (!newTaskHeaders.length) {
      const businessObject = ModelUtil.getBusinessObject(element),
        extensionElements = businessObject.get('extensionElements');
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: minDash.without(extensionElements.get('values'), taskHeaders)
          }
        }
      });
    }
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
}
function addFactory$9({
  bpmnFactory,
  commandStack,
  element
}) {
  return function (event) {
    event.stopPropagation();
    let commands = [];
    const businessObject = ModelUtil.getBusinessObject(element);
    let extensionElements = businessObject.get('extensionElements');

    // (1) ensure extension elements
    if (!extensionElements) {
      extensionElements = createElement('bpmn:ExtensionElements', {
        values: []
      }, businessObject, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
          properties: {
            extensionElements
          }
        }
      });
    }

    // (2) ensure zeebe:TaskHeaders
    let taskHeaders = getTaskHeaders$1(element);
    if (!taskHeaders) {
      const parent = extensionElements;
      taskHeaders = createElement('zeebe:TaskHeaders', {
        values: []
      }, parent, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [...extensionElements.get('values'), taskHeaders]
          }
        }
      });
    }

    // (3) create header
    const header = createElement('zeebe:Header', {}, taskHeaders, bpmnFactory);

    // (4) add header to list
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: taskHeaders,
        properties: {
          values: [...taskHeaders.get('values'), header]
        }
      }
    });
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
}

function getProcessId(element) {
  const calledElement = getCalledElement(element);
  return calledElement ? calledElement.get('processId') : '';
}
function getCalledElement(element) {
  const calledElements = getCalledElements(element);
  return calledElements[0];
}
function getCalledElements(element) {
  const bo = ModelUtil.getBusinessObject(element);
  const extElements = getExtensionElementsList(bo, 'zeebe:CalledElement');
  return extElements;
}

function InputPropagationProps(props) {
  const {
    element
  } = props;
  if (!ModelUtil.is(element, 'bpmn:CallActivity')) {
    return [];
  }
  return [{
    id: 'propagateAllParentVariables',
    component: PropagateAllParentVariables,
    isEdited: propertiesPanel.isToggleSwitchEntryEdited
  }];
}
function PropagateAllParentVariables(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack'),
    bpmnFactory = useService('bpmnFactory'),
    translate = useService('translate');
  const propagateAllParentVariables = isPropagateAllParentVariables(element);
  const getValue = () => {
    return propagateAllParentVariables;
  };
  const setValue = value => {
    const commands = [];
    const businessObject = ModelUtil.getBusinessObject(element);

    // (1) ensure extension elements
    let extensionElements = businessObject.get('extensionElements');
    if (!extensionElements) {
      extensionElements = createElement('bpmn:ExtensionElements', {
        values: []
      }, businessObject, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
          properties: {
            extensionElements
          }
        }
      });
    }

    // (2) ensure zeebe:calledElement
    let calledElement = getCalledElement(businessObject);
    if (!calledElement) {
      calledElement = createElement('zeebe:CalledElement', {}, extensionElements, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [...extensionElements.get('values'), calledElement]
          }
        }
      });
    }

    // (3) Update propagateAllParentVariables attribute
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: calledElement,
        properties: {
          propagateAllParentVariables: value
        }
      }
    });

    // (4) Execute the commands
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
  return propertiesPanel.ToggleSwitchEntry({
    id: 'propagateAllParentVariables',
    label: translate('Propagate all variables'),
    switcherLabel: propagateAllParentVariables ? translate('On') : translate('Off'),
    tooltip: jsxRuntime.jsxs("div", {
      children: [jsxRuntime.jsx("p", {
        children: translate('If turned on, all variables from this process instance will be propagated to the child process instance.')
      }), jsxRuntime.jsx("p", {
        children: translate('Otherwise, only variables defined via input mappings will be propagated.')
      })]
    }),
    getValue,
    setValue
  });
}

// helper //////////////////////////

/**
  * Check whether the propagateAllParentVariables attribute is set on an element.
  * @param {Object} element
  *
  * @returns {boolean}
  */
function isPropagateAllParentVariables(element) {
  if (!ModelUtil.is(element, 'bpmn:CallActivity')) {
    return undefined;
  }
  const bo = ModelUtil.getBusinessObject(element),
    calledElement = getCalledElement(bo);
  return calledElement && minDash.has(calledElement, 'propagateAllParentVariables') ? calledElement.get('propagateAllParentVariables') : /* default value */true;
}

function InputOutputParameter$1(props) {
  const {
    idPrefix,
    parameter
  } = props;
  const entries = [{
    id: idPrefix + '-target',
    component: TargetProperty,
    idPrefix,
    parameter
  }, {
    id: idPrefix + '-source',
    component: SourceProperty,
    idPrefix,
    parameter
  }];
  return entries;
}
function TargetProperty(props) {
  const {
    idPrefix,
    element,
    parameter
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: parameter,
      properties: {
        target: value
      }
    });
  };
  const getValue = parameter => {
    return parameter.target;
  };
  return propertiesPanel.TextFieldEntry({
    element: parameter,
    id: idPrefix + '-target',
    label: translate(ModelUtil.is(parameter, 'zeebe:Input') ? 'Local variable name' : 'Process variable name'),
    getValue,
    setValue,
    debounce
  });
}
function SourceProperty(props) {
  const {
    idPrefix,
    element,
    parameter
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: parameter,
      properties: {
        source: value
      }
    });
  };
  const getValue = parameter => {
    return parameter.source;
  };
  return FeelEntryWithVariableContext({
    bpmnElement: element,
    element: parameter,
    id: idPrefix + '-source',
    label: translate('Variable assignment value'),
    feel: 'required',
    getValue,
    setValue,
    debounce
  });
}

function getElements$1(bo, type, prop) {
  const elems = getExtensionElementsList(bo, type);
  return !prop ? elems : (elems[0] || {})[prop] || [];
}
function getParameters$1(element, prop) {
  const ioMapping = getIoMapping(element);
  return ioMapping && ioMapping.get(prop) || [];
}

/**
 * Get a ioMapping from the business object
 *
 * @param {djs.model.Base} element
 *
 * @return {ModdleElement} the ioMapping object
 */
function getIoMapping(element) {
  const bo = ModelUtil.getBusinessObject(element);
  return (getElements$1(bo, 'zeebe:IoMapping') || [])[0];
}

/**
 * Return all input parameters existing in the business object, and
 * an empty array if none exist.
 *
 * @param  {djs.model.Base} element
 *
 * @return {Array} a list of input parameter objects
 */
function getInputParameters$1(element) {
  return getParameters$1.apply(this, [element, 'inputParameters']);
}

/**
 * Return all output parameters existing in the business object, and
 * an empty array if none exist.
 *
 * @param  {djs.model.Base} element
 *
 * @return {Array} a list of output parameter objects
 */
function getOutputParameters$1(element) {
  return getParameters$1.apply(this, [element, 'outputParameters']);
}
function areInputParametersSupported$1(element) {
  return ModelingUtil.isAny(element, ['bpmn:UserTask', 'bpmn:SubProcess', 'bpmn:CallActivity', 'bpmn:BusinessRuleTask', 'bpmn:ScriptTask']) || isZeebeServiceTask(element) || isSignalThrowEvent(element);
}
function areOutputParametersSupported$1(element) {
  if (ModelUtil.is(element, 'bpmn:EndEvent') && getErrorEventDefinition(element)) {
    return false;
  }
  return ModelingUtil.isAny(element, ['zeebe:ZeebeServiceTask', 'bpmn:UserTask', 'bpmn:SubProcess', 'bpmn:ReceiveTask', 'bpmn:CallActivity', 'bpmn:Event', 'bpmn:BusinessRuleTask']);
}
function createIOMapping(properties, parent, bpmnFactory) {
  return createElement('zeebe:IoMapping', properties, parent, bpmnFactory);
}
function isSignalThrowEvent(element) {
  if (!ModelingUtil.isAny(element, ['bpmn:EndEvent', 'bpmn:IntermediateThrowEvent'])) {
    return false;
  }
  return !!getEventDefinition$1(element, 'bpmn:SignalEventDefinition');
}

function InputProps$1({
  element,
  injector
}) {
  if (!areInputParametersSupported$1(element)) {
    return null;
  }
  const inputParameters = getInputParameters$1(element) || [];
  const bpmnFactory = injector.get('bpmnFactory'),
    commandStack = injector.get('commandStack');
  const items = inputParameters.map((parameter, index) => {
    const id = element.id + '-input-' + index;
    return {
      id,
      label: parameter.get('target') || '',
      entries: InputOutputParameter$1({
        idPrefix: id,
        element,
        parameter
      }),
      autoFocusEntry: id + '-target',
      remove: removeFactory$b({
        commandStack,
        element,
        parameter
      })
    };
  });
  return {
    items,
    add: addFactory$8({
      element,
      bpmnFactory,
      commandStack
    }),
    shouldSort: false
  };
}
function removeFactory$b({
  commandStack,
  element,
  parameter
}) {
  return function (event) {
    event.stopPropagation();
    const commands = [];
    const ioMapping = getIoMapping(element);
    if (!ioMapping) {
      return;
    }
    const inputParameters = minDash.without(ioMapping.get('inputParameters'), parameter);
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: ioMapping,
        properties: {
          inputParameters
        }
      }
    });
    const businessObject = ModelUtil.getBusinessObject(element),
      extensionElements = businessObject.get('extensionElements'),
      values = minDash.without(extensionElements.get('values'), ioMapping);

    // remove ioMapping if there are no input/output parameters anymore
    if (!inputParameters.length && !ioMapping.get('outputParameters').length) {
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values
          }
        }
      });
    }
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
}
function addFactory$8({
  element,
  bpmnFactory,
  commandStack
}) {
  return function (event) {
    event.stopPropagation();
    const commands = [];
    const businessObject = ModelUtil.getBusinessObject(element);
    let extensionElements = businessObject.get('extensionElements');

    // (1) ensure extension elements
    if (!extensionElements) {
      extensionElements = createElement('bpmn:ExtensionElements', {
        values: []
      }, businessObject, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
          properties: {
            extensionElements
          }
        }
      });
    }

    // (2) ensure IoMapping
    let ioMapping = getIoMapping(element);
    if (!ioMapping) {
      ioMapping = createIOMapping({
        inputParameters: [],
        outputParameters: []
      }, extensionElements, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [...extensionElements.get('values'), ioMapping]
          }
        }
      });
    }

    // (3) create parameter
    const newParameter = createElement('zeebe:Input', {
      target: nextId('InputVariable_')
    }, ioMapping, bpmnFactory);

    // (4) add parameter to list
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: ioMapping,
        properties: {
          inputParameters: [...ioMapping.get('inputParameters'), newParameter]
        }
      }
    });
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
}

function MessageProps(props) {
  const {
    element
  } = props;
  const message = getMessage(element);
  const entries = [];
  if (message) {
    entries.push({
      id: 'messageName',
      component: MessageName,
      isEdited: propertiesPanel.isFeelEntryEdited
    });
  }
  if (message && canHaveSubscriptionCorrelationKey(element)) {
    entries.push({
      id: 'messageSubscriptionCorrelationKey',
      component: SubscriptionCorrelationKey,
      isEdited: propertiesPanel.isFeelEntryEdited
    });
  }
  return entries;
}
function MessageName(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const message = getMessage(element);
  const getValue = () => {
    return message.get('name');
  };
  const setValue = value => {
    return commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: message,
      properties: {
        name: value
      }
    });
  };
  return FeelEntryWithVariableContext({
    element,
    id: 'messageName',
    label: translate('Name'),
    feel: 'optional',
    getValue,
    setValue,
    debounce
  });
}
function SubscriptionCorrelationKey(props) {
  const {
    element
  } = props;
  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return getCorrelationKey(element);
  };
  const setValue = value => {
    const commands = [];
    const properties = {
      correlationKey: value
    };
    const message = getMessage(element);
    let extensionElements = message.get('extensionElements');

    // (1) ensure extension elements
    if (!extensionElements) {
      extensionElements = createElement('bpmn:ExtensionElements', {
        values: []
      }, message, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: message,
          properties: {
            extensionElements
          }
        }
      });
    }
    let subscription = getSubscription(element);

    // (2a) add subscription with correlation key
    if (!subscription) {
      subscription = createElement('zeebe:Subscription', properties, extensionElements, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [...extensionElements.get('values'), subscription]
          }
        }
      });
    } else {
      // (2b) update existing subscription's correlation key
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          properties,
          moddleElement: subscription
        }
      });
    }

    // (3) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
  return FeelEntryWithVariableContext({
    element,
    id: 'messageSubscriptionCorrelationKey',
    label: translate('Subscription correlation key'),
    feel: 'required',
    getValue,
    setValue,
    debounce
  });
}

// helper ///////////////////////

function canHaveSubscriptionCorrelationKey(element) {
  // (1) allow for receive task
  if (ModelUtil.is(element, 'bpmn:ReceiveTask')) {
    return true;
  }

  // (2) allow for non start events
  if (!ModelUtil.is(element, 'bpmn:StartEvent')) {
    return true;
  }

  // (3) allow for start events inside event sub processes
  if (ModelUtil.is(element, 'bpmn:StartEvent') && DiUtil.isEventSubProcess(element.parent)) {
    return true;
  }
  return false;
}
function getCorrelationKey(element) {
  const subscription = getSubscription(element);
  return subscription ? subscription.get('correlationKey') : '';
}
function getSubscription(element) {
  const message = getMessage(element);
  const subscriptions = getSubscriptions(message);
  return subscriptions[0];
}
function getSubscriptions(message) {
  const extensionElements = getExtensionElementsList(message, 'zeebe:Subscription');
  return extensionElements;
}

function MultiInstanceProps$1(props) {
  const {
    element
  } = props;
  if (!supportsMultiInstances(element)) {
    return [];
  }
  return [{
    id: 'multiInstance-inputCollection',
    component: InputCollection,
    isEdited: propertiesPanel.isFeelEntryEdited
  }, {
    id: 'multiInstance-inputElement',
    component: InputElement,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  }, {
    id: 'multiInstance-outputCollection',
    component: OutputCollection,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  }, {
    id: 'multiInstance-outputElement',
    component: OutputElement,
    isEdited: propertiesPanel.isFeelEntryEdited
  }, {
    id: 'multiInstance-completionCondition',
    component: CompletionCondition,
    isEdited: propertiesPanel.isFeelEntryEdited
  }];
}
function InputCollection(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return getProperty$1(element, 'inputCollection');
  };
  const setValue = value => {
    return setProperty(element, 'inputCollection', value, commandStack, bpmnFactory);
  };
  return FeelEntryWithVariableContext({
    element,
    id: 'multiInstance-inputCollection',
    label: translate('Input collection'),
    feel: 'required',
    getValue,
    setValue,
    debounce
  });
}
function InputElement(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return getProperty$1(element, 'inputElement');
  };
  const setValue = value => {
    return setProperty(element, 'inputElement', value, commandStack, bpmnFactory);
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'multiInstance-inputElement',
    label: translate('Input element'),
    getValue,
    setValue,
    debounce
  });
}
function OutputCollection(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return getProperty$1(element, 'outputCollection');
  };
  const setValue = value => {
    return setProperty(element, 'outputCollection', value, commandStack, bpmnFactory);
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'multiInstance-outputCollection',
    label: translate('Output collection'),
    getValue,
    setValue,
    debounce
  });
}
function OutputElement(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return getProperty$1(element, 'outputElement');
  };
  const setValue = value => {
    return setProperty(element, 'outputElement', value, commandStack, bpmnFactory);
  };
  return FeelEntryWithVariableContext({
    element,
    id: 'multiInstance-outputElement',
    label: translate('Output element'),
    feel: 'required',
    getValue,
    setValue,
    debounce
  });
}
function CompletionCondition(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    const completionCondition = getCompletionCondition(element);
    return completionCondition && completionCondition.get('body');
  };
  const setValue = value => {
    if (value && value !== '') {
      const loopCharacteristics = getLoopCharacteristics$1(element);
      const completionCondition = createElement('bpmn:FormalExpression', {
        body: value
      }, loopCharacteristics, bpmnFactory);
      setCompletionCondition(element, commandStack, completionCondition);
    } else {
      setCompletionCondition(element, commandStack, undefined);
    }
  };
  return FeelEntryWithVariableContext({
    element,
    id: 'multiInstance-completionCondition',
    label: translate('Completion condition'),
    feel: 'required',
    getValue,
    setValue,
    debounce
  });
}

// helper ///////////////////////

function getLoopCharacteristics$1(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  return businessObject.get('loopCharacteristics');
}
function getZeebeLoopCharacteristics(loopCharacteristics) {
  const extensionElements = getExtensionElementsList(loopCharacteristics, 'zeebe:LoopCharacteristics');
  return extensionElements && extensionElements[0];
}
function supportsMultiInstances(element) {
  return !!getLoopCharacteristics$1(element);
}
function getCompletionCondition(element) {
  return getLoopCharacteristics$1(element).get('completionCondition');
}
function setCompletionCondition(element, commandStack, completionCondition = undefined) {
  commandStack.execute('element.updateModdleProperties', {
    element,
    moddleElement: getLoopCharacteristics$1(element),
    properties: {
      completionCondition
    }
  });
}
function getProperty$1(element, propertyName) {
  const loopCharacteristics = getLoopCharacteristics$1(element),
    zeebeLoopCharacteristics = getZeebeLoopCharacteristics(loopCharacteristics);
  return zeebeLoopCharacteristics && zeebeLoopCharacteristics.get(propertyName);
}
function setProperty(element, propertyName, value, commandStack, bpmnFactory) {
  const loopCharacteristics = getLoopCharacteristics$1(element);
  const commands = [];

  // (1) ensure extension elements
  let extensionElements = loopCharacteristics.get('extensionElements');
  if (!extensionElements) {
    extensionElements = createElement('bpmn:ExtensionElements', {
      values: []
    }, loopCharacteristics, bpmnFactory);
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: loopCharacteristics,
        properties: {
          extensionElements
        }
      }
    });
  }

  // (2) ensure zeebe loop characteristics
  let zeebeLoopCharacteristics = getZeebeLoopCharacteristics(loopCharacteristics);
  if (!zeebeLoopCharacteristics) {
    zeebeLoopCharacteristics = createElement('zeebe:LoopCharacteristics', {}, extensionElements, bpmnFactory);
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: extensionElements,
        properties: {
          values: [...extensionElements.get('values'), zeebeLoopCharacteristics]
        }
      }
    });
  }

  // (3) update defined property
  commands.push({
    cmd: 'element.updateModdleProperties',
    context: {
      element,
      moddleElement: zeebeLoopCharacteristics,
      properties: {
        [propertyName]: value
      }
    }
  });

  // (4) commit all updates
  commandStack.execute('properties-panel.multi-command-executor', commands);
}

function OutputPropagationProps(props) {
  const {
    element
  } = props;
  if (!ModelUtil.is(element, 'bpmn:CallActivity')) {
    return [];
  }
  return [{
    id: 'propagateAllChildVariables',
    component: PropagateAllChildVariables,
    isEdited: propertiesPanel.isToggleSwitchEntryEdited
  }];
}
function PropagateAllChildVariables(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack'),
    bpmnFactory = useService('bpmnFactory'),
    translate = useService('translate');
  const propagateAllChildVariables = isPropagateAllChildVariables(element);
  const getValue = () => {
    return propagateAllChildVariables;
  };
  const setValue = value => {
    const commands = [];
    const businessObject = ModelUtil.getBusinessObject(element);

    // (1) ensure extension elements
    let extensionElements = businessObject.get('extensionElements');
    if (!extensionElements) {
      extensionElements = createElement('bpmn:ExtensionElements', {
        values: []
      }, businessObject, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
          properties: {
            extensionElements
          }
        }
      });
    }

    // (2) ensure zeebe:calledElement
    let calledElement = getCalledElement(businessObject);
    if (!calledElement) {
      calledElement = createElement('zeebe:CalledElement', {}, extensionElements, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [...extensionElements.get('values'), calledElement]
          }
        }
      });
    }

    // (3) Update propagateAllChildVariables attribute
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: calledElement,
        properties: {
          propagateAllChildVariables: value
        }
      }
    });

    // (4) Execute the commands
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
  return propertiesPanel.ToggleSwitchEntry({
    id: 'propagateAllChildVariables',
    label: translate('Propagate all child process variables'),
    switcherLabel: propagateAllChildVariables ? translate('On') : translate('Off'),
    tooltip: jsxRuntime.jsxs("div", {
      children: [jsxRuntime.jsx("p", {
        children: translate('If turned on, all variables from the child process instance will be propagated to the parent process instance.')
      }), jsxRuntime.jsx("p", {
        children: translate('Otherwise, only variables defined via output mappings will be propagated.')
      })]
    }),
    getValue,
    setValue
  });
}

// helper //////////////////////////

/**
  * Determine default value for propagateAllChildVariables attribute
  * @param {Object} element representing a bpmn:CallActivity
  *
  * @returns {boolean}
  */
function determinePropAllChildVariablesDefault(element) {
  const outputParameters = getOutputParameters$1(element);
  if (outputParameters) {
    return outputParameters.length > 0 ? false : true;
  }
}

/**
  * Check whether the propagateAllChildVariables attribute is set on an element.
  * Note that a default logic will be determine if it is not explicitly set.
  * @param {Object} element
  *
  * @returns {boolean}
  */
function isPropagateAllChildVariables(element) {
  if (!ModelUtil.is(element, 'bpmn:CallActivity')) {
    return undefined;
  }
  const bo = ModelUtil.getBusinessObject(element),
    calledElement = getCalledElement(bo);
  return calledElement && minDash.has(calledElement, 'propagateAllChildVariables') ? calledElement.get('propagateAllChildVariables') : determinePropAllChildVariablesDefault(element);
}

function OutputProps$1({
  element,
  injector
}) {
  if (!areOutputParametersSupported$1(element)) {
    return null;
  }
  const outputParameters = getOutputParameters$1(element) || [];
  const bpmnFactory = injector.get('bpmnFactory'),
    commandStack = injector.get('commandStack');
  const items = outputParameters.map((parameter, index) => {
    const id = element.id + '-output-' + index;
    return {
      id,
      label: parameter.get('target') || '',
      entries: InputOutputParameter$1({
        idPrefix: id,
        element,
        parameter
      }),
      autoFocusEntry: id + '-target',
      remove: removeFactory$a({
        commandStack,
        element,
        parameter
      })
    };
  });
  return {
    items,
    add: addFactory$7({
      element,
      bpmnFactory,
      commandStack
    }),
    shouldSort: false
  };
}
function removeFactory$a({
  commandStack,
  element,
  parameter
}) {
  return function (event) {
    event.stopPropagation();
    let commands = [];
    const ioMapping = getIoMapping(element);
    if (!ioMapping) {
      return;
    }
    const outputParameters = minDash.without(ioMapping.get('outputParameters'), parameter);
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: ioMapping,
        properties: {
          outputParameters
        }
      }
    });

    // remove ioMapping if there are no input/output parameters anymore
    if (!ioMapping.get('inputParameters').length && !outputParameters.length) {
      const businessObject = ModelUtil.getBusinessObject(element),
        extensionElements = businessObject.get('extensionElements'),
        values = minDash.without(extensionElements.get('values'), ioMapping);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values
          }
        }
      });
    }
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
}
function addFactory$7({
  element,
  bpmnFactory,
  commandStack
}) {
  return function (event) {
    event.stopPropagation();
    let commands = [];
    const businessObject = ModelUtil.getBusinessObject(element);
    let extensionElements = businessObject.get('extensionElements');

    // (1) ensure extension elements
    if (!extensionElements) {
      extensionElements = createElement('bpmn:ExtensionElements', {
        values: []
      }, businessObject, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
          properties: {
            extensionElements
          }
        }
      });
    }

    // (2) ensure IoMapping
    let ioMapping = getIoMapping(element);
    if (!ioMapping) {
      const parent = extensionElements;
      ioMapping = createIOMapping({
        inputParameters: [],
        outputParameters: []
      }, parent, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [...extensionElements.get('values'), ioMapping]
          }
        }
      });
    }

    // (3) create parameter
    const newParameter = createElement('zeebe:Output', {
      target: nextId('OutputVariable_')
    }, ioMapping, bpmnFactory);

    // (4) add parameter to list
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: ioMapping,
        properties: {
          outputParameters: [...ioMapping.get('outputParameters'), newParameter]
        }
      }
    });
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
}

const SCRIPT_IMPLEMENTATION_OPTION = 'script',
  JOB_WORKER_IMPLEMENTATION_OPTION = 'jobWorker',
  DEFAULT_IMPLEMENTATION_OPTION = '';
function ScriptImplementationProps(props) {
  const {
    element
  } = props;
  if (!ModelUtil.is(element, 'bpmn:ScriptTask')) {
    return [];
  }
  return [{
    id: 'scriptImplementation',
    component: ScriptImplementation,
    isEdited: () => isScriptImplementationEdited(element)
  }];
}
function ScriptImplementation(props) {
  const {
    element,
    id
  } = props;
  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const getValue = () => {
    if (getScript$1(element)) {
      return SCRIPT_IMPLEMENTATION_OPTION;
    }
    if (getTaskDefinition$1(element)) {
      return JOB_WORKER_IMPLEMENTATION_OPTION;
    }
    return DEFAULT_IMPLEMENTATION_OPTION;
  };

  /**
   * Set value by either creating a zeebe:script or a zeebe:taskDefintion
   * extension element. Note that they must not exist both at the same time, however
   * this will be ensured by a bpmn-js behavior (and not by the propPanel).
   */
  const setValue = value => {
    let extensionElement, extensionElementType;
    if (value === SCRIPT_IMPLEMENTATION_OPTION) {
      extensionElement = getScript$1(element);
      extensionElementType = 'zeebe:Script';
    } else if (value === JOB_WORKER_IMPLEMENTATION_OPTION) {
      extensionElement = getTaskDefinition$1(element);
      extensionElementType = 'zeebe:TaskDefinition';
    } else {
      resetElement(element, commandStack);
    }
    if (!extensionElement && extensionElementType) {
      extensionElement = createElement(extensionElementType, {}, null, bpmnFactory);
      updateExtensionElements(element, extensionElement, bpmnFactory, commandStack);
    }
  };
  const getOptions = () => {
    const options = [{
      value: DEFAULT_IMPLEMENTATION_OPTION,
      label: translate('<none>')
    }, {
      value: SCRIPT_IMPLEMENTATION_OPTION,
      label: translate('FEEL expression')
    }, {
      value: JOB_WORKER_IMPLEMENTATION_OPTION,
      label: translate('Job worker')
    }];
    return options;
  };
  return propertiesPanel.SelectEntry({
    element,
    id,
    label: translate('Implementation'),
    getValue,
    setValue,
    getOptions
  });
}

// helper ///////////////////////

function getTaskDefinition$1(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  return getExtensionElementsList(businessObject, 'zeebe:TaskDefinition')[0];
}
function getScript$1(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  return getExtensionElementsList(businessObject, 'zeebe:Script')[0];
}
function getTaskHeaders(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  return getExtensionElementsList(businessObject, 'zeebe:TaskHeaders');
}
function isScriptImplementationEdited(element) {
  return getTaskDefinition$1(element) || getScript$1(element);
}
function resetElement(element, commandStack) {
  const businessObject = ModelUtil.getBusinessObject(element);
  const taskDefinition = getTaskDefinition$1(element);
  const taskHeaders = getTaskHeaders(element);
  const script = getScript$1(element);
  if (taskDefinition) {
    const removed = [taskDefinition, taskHeaders].filter(Boolean);
    removeExtensionElements(element, businessObject, removed, commandStack);
    return;
  }
  if (script) {
    removeExtensionElements(element, businessObject, script, commandStack);
  }
}
function updateExtensionElements(element, extensionElementToAdd, bpmnFactory, commandStack) {
  const businessObject = ModelUtil.getBusinessObject(element);
  const commands = [];
  let extensionElements = businessObject.get('extensionElements');
  let extensionElementValues;

  // (1) create bpmn:ExtensionElements if it doesn't exist
  if (!extensionElements) {
    extensionElements = createElement('bpmn:ExtensionElements', {
      values: []
    }, businessObject, bpmnFactory);
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: businessObject,
        properties: {
          extensionElements
        }
      }
    });
  }
  extensionElementToAdd.$parent = extensionElements;

  // (2) remove old exension element from extensionElements
  if (ModelUtil.is(extensionElementToAdd, 'zeebe:TaskDefinition')) {
    extensionElementValues = minDash.without(extensionElements.get('values'), getScript$1(element));
  } else if (ModelUtil.is(extensionElementToAdd, 'zeebe:Script')) {
    const matcher = extension => ModelUtil.isAny(extension, ['zeebe:TaskDefinition', 'zeebe:TaskHeaders']);
    extensionElementValues = minDash.without(extensionElements.get('values'), matcher);
  }

  // (3) add extension element to list
  commands.push({
    cmd: 'element.updateModdleProperties',
    context: {
      element,
      moddleElement: extensionElements,
      properties: {
        values: [...extensionElementValues, extensionElementToAdd]
      }
    }
  });
  commandStack.execute('properties-panel.multi-command-executor', commands);
}

function ScriptProps$1(props) {
  const {
    element
  } = props;
  if (!ModelUtil.is(element, 'bpmn:ScriptTask') || !getScript(element)) {
    return [];
  }
  return [{
    id: 'resultVariable',
    component: ResultVariable$3,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  }, {
    id: 'scriptExpression',
    component: Expression$2,
    isEdited: propertiesPanel.isFeelEntryEdited
  }];
}
function Expression$2(props) {
  const {
    element,
    id
  } = props;
  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return (getScript(element) || {}).get('expression');
  };
  const setValue = value => {
    const commands = [];
    const businessObject = ModelUtil.getBusinessObject(element);
    let extensionElements = businessObject.get('extensionElements');

    // (1) ensure extension elements
    if (!extensionElements) {
      extensionElements = createElement('bpmn:ExtensionElements', {
        values: []
      }, businessObject, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
          properties: {
            extensionElements
          }
        }
      });
    }

    // (2) ensure script
    let script = getScript(element);
    if (!script) {
      script = createElement('zeebe:Script', {}, extensionElements, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [...extensionElements.get('values'), script]
          }
        }
      });
    }

    // (3) update script.expression
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: script,
        properties: {
          expression: value
        }
      }
    });

    // (4) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
  return FeelEntryWithVariableContext({
    element,
    id,
    label: translate('FEEL expression'),
    feel: 'required',
    getValue,
    setValue,
    debounce
  });
}
function ResultVariable$3(props) {
  const {
    element,
    id
  } = props;
  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return (getScript(element) || {}).resultVariable;
  };
  const setValue = value => {
    const commands = [];
    const businessObject = ModelUtil.getBusinessObject(element);
    let extensionElements = businessObject.get('extensionElements');

    // (1) ensure extension elements
    if (!extensionElements) {
      extensionElements = createElement('bpmn:ExtensionElements', {
        values: []
      }, businessObject, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
          properties: {
            extensionElements
          }
        }
      });
    }

    // (2) ensure script
    let script = getScript(element);
    if (!script) {
      script = createElement('zeebe:Script', {}, extensionElements, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [...extensionElements.get('values'), script]
          }
        }
      });
    }

    // (3) update script.resultVariable
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: script,
        properties: {
          resultVariable: value
        }
      }
    });

    // (4) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id,
    label: translate('Result variable'),
    getValue,
    setValue,
    debounce
  });
}

// helper ///////////////////////

function getScript(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  return getExtensionElementsList(businessObject, 'zeebe:Script')[0];
}

/**
 * @returns {Entry[]}
 */
function SignalProps(props) {
  const {
    element
  } = props;
  if (!isSignalSupported(element)) {
    return [];
  }
  const signal = getSignal(element);
  let entries = [];
  if (signal) {
    entries = [...entries, {
      id: 'signalName',
      component: SignalName,
      isEdited: propertiesPanel.isFeelEntryEdited
    }];
  }
  return entries;
}
function SignalName(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const signal = getSignal(element);
  const getValue = () => {
    return signal.get('name');
  };
  const setValue = value => {
    return commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: signal,
      properties: {
        name: value
      }
    });
  };
  return FeelEntryWithVariableContext({
    element,
    id: 'signalName',
    label: translate('Name'),
    feel: 'optional',
    getValue,
    setValue,
    debounce
  });
}

function TargetProps(props) {
  const {
    element
  } = props;
  if (!ModelUtil.is(element, 'bpmn:CallActivity')) {
    return [];
  }
  return [{
    id: 'targetProcessId',
    component: TargetProcessId,
    isEdited: propertiesPanel.isFeelEntryEdited
  }];
}
function TargetProcessId(props) {
  const {
    element,
    id
  } = props;
  const commandStack = useService('commandStack'),
    bpmnFactory = useService('bpmnFactory'),
    translate = useService('translate'),
    debounce = useService('debounceInput');
  const getValue = () => {
    return getProcessId(element);
  };
  const setValue = value => {
    const commands = [];
    const businessObject = ModelUtil.getBusinessObject(element);

    // (1) ensure extension elements
    let extensionElements = businessObject.get('extensionElements');
    if (!extensionElements) {
      extensionElements = createElement('bpmn:ExtensionElements', {
        values: []
      }, businessObject, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
          properties: {
            extensionElements
          }
        }
      });
    }

    // (2) ensure zeebe:calledElement
    let calledElement = getCalledElement(businessObject);
    if (!calledElement) {
      calledElement = createElement('zeebe:CalledElement', {}, extensionElements, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [...extensionElements.get('values'), calledElement]
          }
        }
      });
    }

    // (3) Update processId attribute
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: calledElement,
        properties: {
          processId: value
        }
      }
    });

    // (4) Execute the commands
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
  return FeelEntryWithVariableContext({
    element,
    id,
    label: translate('Process ID'),
    feel: 'optional',
    getValue,
    setValue,
    debounce
  });
}

function TaskDefinitionProps(props) {
  const {
    element
  } = props;
  if (!isZeebeServiceTask(element)) {
    return [];
  }
  return [{
    id: 'taskDefinitionType',
    component: TaskDefinitionType,
    isEdited: propertiesPanel.isFeelEntryEdited
  }, {
    id: 'taskDefinitionRetries',
    component: TaskDefinitionRetries,
    isEdited: propertiesPanel.isFeelEntryEdited
  }];
}
function TaskDefinitionType(props) {
  const {
    element,
    id
  } = props;
  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return (getTaskDefinition(element) || {}).type;
  };
  const setValue = value => {
    const commands = [];
    const businessObject = ModelUtil.getBusinessObject(element);
    let extensionElements = businessObject.get('extensionElements');

    // (1) ensure extension elements
    if (!extensionElements) {
      extensionElements = createElement('bpmn:ExtensionElements', {
        values: []
      }, businessObject, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
          properties: {
            extensionElements
          }
        }
      });
    }

    // (2) ensure task definition
    let taskDefinition = getTaskDefinition(element);
    if (!taskDefinition) {
      taskDefinition = createElement('zeebe:TaskDefinition', {}, extensionElements, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [...extensionElements.get('values'), taskDefinition]
          }
        }
      });
    }

    // (3) update task definition type
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: taskDefinition,
        properties: {
          type: value
        }
      }
    });

    // (4) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
  return FeelEntryWithVariableContext({
    element,
    id,
    label: translate('Type'),
    feel: 'optional',
    getValue,
    setValue,
    debounce
  });
}
function TaskDefinitionRetries(props) {
  const {
    element,
    id
  } = props;
  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return (getTaskDefinition(element) || {}).retries;
  };
  const setValue = value => {
    let commands = [];
    const businessObject = ModelUtil.getBusinessObject(element);
    let extensionElements = businessObject.get('extensionElements');

    // (1) ensure extension elements
    if (!extensionElements) {
      extensionElements = createElement('bpmn:ExtensionElements', {
        values: []
      }, businessObject, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
          properties: {
            extensionElements
          }
        }
      });
    }

    // (2) ensure task definition
    let taskDefinition = getTaskDefinition(element);
    if (!taskDefinition) {
      taskDefinition = createElement('zeebe:TaskDefinition', {}, extensionElements, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [...extensionElements.get('values'), taskDefinition]
          }
        }
      });
    }

    // (3) update task definition retries
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: taskDefinition,
        properties: {
          retries: value
        }
      }
    });
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
  return FeelEntryWithVariableContext({
    element,
    id,
    label: translate('Retries'),
    feel: 'optional',
    getValue,
    setValue,
    debounce,
    tooltip: translate('Specifies the number of times the job is retried when a worker signals failure. The default is three.')
  });
}

// helper ///////////////////////

function getTaskDefinition(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  return getExtensionElementsList(businessObject, 'zeebe:TaskDefinition')[0];
}

function TaskScheduleProps(props) {
  const {
    element
  } = props;
  if (!ModelUtil.is(element, 'bpmn:UserTask')) {
    return [];
  }
  return [{
    id: 'taskScheduleDueDate',
    component: DueDate$1,
    isEdited: propertiesPanel.isFeelEntryEdited
  }, {
    id: 'taskScheduleFollowUpDate',
    component: FollowUpDate$1,
    isEdited: propertiesPanel.isFeelEntryEdited
  }];
}
function DueDate$1(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    const taskSchedule = getTaskSchedule(element);
    if (!taskSchedule) {
      return;
    }
    return taskSchedule.get('dueDate');
  };
  const setValue = value => {
    let commands = [];
    const businessObject = ModelUtil.getBusinessObject(element);
    let extensionElements = businessObject.get('extensionElements');

    // (1) ensure extension elements
    if (!extensionElements) {
      extensionElements = createElement('bpmn:ExtensionElements', {
        values: []
      }, businessObject, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
          properties: {
            extensionElements
          }
        }
      });
    }

    // (2) ensure zeebe:TaskSchedule
    let taskSchedule = getTaskSchedule(element);
    if (!taskSchedule) {
      taskSchedule = createElement('zeebe:TaskSchedule', {}, extensionElements, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [...extensionElements.get('values'), taskSchedule]
          }
        }
      });
    }

    // (3) update zeebe:dueDate
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: taskSchedule,
        properties: {
          dueDate: value
        }
      }
    });
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
  return FeelEntryWithVariableContext({
    element,
    id: 'taskScheduleDueDate',
    label: translate('Due date'),
    feel: 'optional',
    getValue,
    setValue,
    debounce
  });
}
function FollowUpDate$1(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    const taskSchedule = getTaskSchedule(element);
    if (!taskSchedule) {
      return;
    }
    return taskSchedule.get('followUpDate');
  };
  const setValue = value => {
    let commands = [];
    const businessObject = ModelUtil.getBusinessObject(element);
    let extensionElements = businessObject.get('extensionElements');

    // (1) ensure extension elements
    if (!extensionElements) {
      extensionElements = createElement('bpmn:ExtensionElements', {
        values: []
      }, businessObject, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
          properties: {
            extensionElements
          }
        }
      });
    }

    // (2) ensure zeebe:TaskSchedule
    let taskSchedule = getTaskSchedule(element);
    if (!taskSchedule) {
      taskSchedule = createElement('zeebe:TaskSchedule', {}, extensionElements, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [...extensionElements.get('values'), taskSchedule]
          }
        }
      });
    }

    // (3) update zeebe:followUpDate
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: taskSchedule,
        properties: {
          followUpDate: value
        }
      }
    });
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
  return FeelEntryWithVariableContext({
    element,
    id: 'taskScheduleFollowUpDate',
    label: translate('Follow up date'),
    feel: 'optional',
    getValue,
    setValue,
    debounce
  });
}

// helper ///////////////////////

function getTaskSchedule(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  return getExtensionElementsList(businessObject, 'zeebe:TaskSchedule')[0];
}

/**
 * Check whether a given timer expression type is supported for a given element.
 *
 * @param {string} type
 * @param {Element|ModdleElement} element
 *
 * @return {boolean}
 */
function isTimerExpressionTypeSupported(type, element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  switch (type) {
    case 'timeDate':
      return ModelUtil.isAny(element, ['bpmn:BoundaryEvent', 'bpmn:IntermediateCatchEvent', 'bpmn:StartEvent']);
    case 'timeCycle':
      if (ModelUtil.is(element, 'bpmn:StartEvent') && !hasParentEventSubProcess(businessObject) || !isInterrupting(businessObject)) {
        return true;
      }
      if (ModelUtil.is(element, 'bpmn:BoundaryEvent') && !isInterrupting(businessObject)) {
        return true;
      }
      return false;
    case 'timeDuration':
      if (ModelUtil.isAny(element, ['bpmn:BoundaryEvent', 'bpmn:IntermediateCatchEvent'])) {
        return true;
      }
      if (ModelUtil.is(element, 'bpmn:StartEvent') && hasParentEventSubProcess(businessObject)) {
        return true;
      }
      return false;
    default:
      return false;
  }
}
function isInterrupting(businessObject) {
  if (ModelUtil.is(businessObject, 'bpmn:BoundaryEvent')) {
    return businessObject.get('cancelActivity') !== false;
  }
  return businessObject.get('isInterrupting') !== false;
}
function hasParentEventSubProcess(businessObject) {
  const parent = businessObject.$parent;
  return parent && ModelUtil.is(parent, 'bpmn:SubProcess') && parent.get('triggeredByEvent');
}

function TimerProps$1(props) {
  const {
    element,
    injector
  } = props;
  const translate = injector.get('translate');
  const businessObject = ModelUtil.getBusinessObject(element),
    timerEventDefinition = getTimerEventDefinition(businessObject),
    timerEventDefinitionType = getTimerDefinitionType(timerEventDefinition);

  // (1) Only show for supported elements
  if (!isTimerSupported(element)) {
    return [];
  }
  const timerOptions = getTimerOptions(element, translate);
  const entries = [];
  entries.push({
    id: 'timerEventDefinitionType',
    component: TimerEventDefinitionType$1,
    isEdited: propertiesPanel.isSelectEntryEdited,
    options: timerOptions
  });
  if (timerEventDefinitionType) {
    entries.push({
      id: 'timerEventDefinitionValue',
      component: TimerEventDefinitionValue$1,
      isEdited: propertiesPanel.isFeelEntryEdited,
      timerEventDefinitionType: timerEventDefinitionType || timerOptions[0].value
    });
  }
  return entries;
}
function getTimerOptions(element, translate) {
  const options = [];
  if (isTimerExpressionTypeSupported('timeDate', element)) {
    options.push({
      value: 'timeDate',
      label: translate('Date')
    });
  }
  if (isTimerExpressionTypeSupported('timeDuration', element)) {
    options.push({
      value: 'timeDuration',
      label: translate('Duration')
    });
  }
  if (isTimerExpressionTypeSupported('timeCycle', element)) {
    options.push({
      value: 'timeCycle',
      label: translate('Cycle')
    });
  }
  return options;
}

/**
 * TimerEventDefinitionType - Generic select entry allowing to select a specific
 * timerEventDefintionType. To be used together with timerEventDefinitionValue.
 *
 * @param  {type} props
 * @return {SelectEntry}
 */
function TimerEventDefinitionType$1(props) {
  const {
    element,
    options
  } = props;
  const commandStack = useService('commandStack'),
    bpmnFactory = useService('bpmnFactory'),
    translate = useService('translate');
  const businessObject = ModelUtil.getBusinessObject(element),
    timerEventDefinition = getTimerEventDefinition(businessObject),
    timerEventDefinitionType = getTimerDefinitionType(timerEventDefinition);
  const getValue = () => {
    return timerEventDefinitionType || '';
  };
  const setValue = value => {
    // (1) Check if value is different to current type
    if (value === timerEventDefinitionType) {
      return;
    }

    // (2) Create empty formalExpression element
    const formalExpression = createTimerFormalExpression(bpmnFactory, timerEventDefinition);

    // (3) Set the value for selected timerEventDefinitionType
    const newProps = {
      timeDuration: undefined,
      timeDate: undefined,
      timeCycle: undefined
    };
    if (value !== '') {
      newProps[value] = formalExpression;
    }

    // (4) Execute businessObject update
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: timerEventDefinition,
      properties: newProps
    });
  };
  const getOptions = element => {
    return [{
      value: '',
      label: translate('<none>')
    }, ...options];
  };
  return propertiesPanel.SelectEntry({
    element,
    id: 'timerEventDefinitionType',
    label: translate('Type'),
    getValue,
    setValue,
    getOptions
  });
}

/**
 * TimerEventDefinitionValue - Generic textField entry allowing to specify the
 * timerEventDefintionValue based on the set timerEventDefintionType. To be used
 * together with timerEventDefinitionType.
 *
 * @param {object} props
 * @param {ModdleElement} props.element
 * @param {'timeCycle'|'timeDate'|'timeDuration'} props.timerEventDefinitionType?
 * @param {string} props.label?
 * @return {TextFieldEntry}
 */
function TimerEventDefinitionValue$1(props) {
  const {
    element,
    label,
    timerEventDefinitionType
  } = props;
  const commandStack = useService('commandStack'),
    translate = useService('translate'),
    debounce = useService('debounceInput'),
    bpmnFactory = useService('bpmnFactory');
  const businessObject = ModelUtil.getBusinessObject(element),
    timerEventDefinition = getTimerEventDefinition(businessObject),
    timerEventFormalExpression = timerEventDefinition.get(timerEventDefinitionType);
  const getValue = () => {
    return timerEventFormalExpression && timerEventFormalExpression.get('body');
  };
  const setValue = value => {
    if (!timerEventFormalExpression) {
      const expression = createTimerFormalExpression(bpmnFactory, timerEventDefinition);
      expression.set('body', value);
      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: timerEventDefinition,
        properties: {
          [timerEventDefinitionType]: expression
        }
      });
      return;
    }
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: timerEventFormalExpression,
      properties: {
        body: value
      }
    });
  };
  return FeelEntryWithVariableContext({
    element,
    id: 'timerEventDefinitionValue',
    label: label || translate('Value'),
    feel: 'optional',
    getValue,
    setValue,
    debounce,
    tooltip: getTimerEventDefinitionValueDescription$1(timerEventDefinitionType, translate)
  });
}

// helper //////////////////////////

function createTimerFormalExpression(bpmnFactory, eventDefinition) {
  const formalExpression = bpmnFactory.create('bpmn:FormalExpression', {
    body: undefined
  });
  formalExpression.$parent = eventDefinition;
  return formalExpression;
}
function getTimerEventDefinitionValueDescription$1(timerDefinitionType, translate) {
  switch (timerDefinitionType) {
    case 'timeDate':
      return jsxRuntime.jsxs("div", {
        children: [jsxRuntime.jsx("p", {
          children: translate('A specific point in time defined as ISO 8601 combined date and time representation.')
        }), jsxRuntime.jsxs("ul", {
          children: [jsxRuntime.jsxs("li", {
            children: [jsxRuntime.jsx("code", {
              children: "2019-10-01T12:00:00Z"
            }), " - ", translate('UTC time')]
          }), jsxRuntime.jsxs("li", {
            children: [jsxRuntime.jsx("code", {
              children: "2019-10-02T08:09:40+02:00"
            }), " - ", translate('UTC plus 2 hours zone offset')]
          })]
        }), jsxRuntime.jsx("a", {
          href: "https://docs.camunda.io/docs/reference/bpmn-processes/timer-events/timer-events#time-date",
          target: "_blank",
          rel: "noopener",
          title: translate('Timer documentation'),
          children: translate('How to configure a timer')
        })]
      });
    case 'timeCycle':
      return jsxRuntime.jsxs("div", {
        children: [jsxRuntime.jsx("p", {
          children: translate('A cycle defined as ISO 8601 repeating intervals format, or a cron expression.')
        }), jsxRuntime.jsxs("ul", {
          children: [jsxRuntime.jsxs("li", {
            children: [jsxRuntime.jsx("code", {
              children: "R5/PT10S"
            }), " - ", translate('every 10 seconds, up to 5 times')]
          }), jsxRuntime.jsxs("li", {
            children: [jsxRuntime.jsx("code", {
              children: "R/P1D"
            }), " - ", translate('every day, infinitely')]
          }), jsxRuntime.jsxs("li", {
            children: [jsxRuntime.jsx("code", {
              children: "0 0 9-17 * * MON-FRI"
            }), " - ", translate('every hour on the hour from 9-5 p.m. UTC Monday-Friday')]
          })]
        }), jsxRuntime.jsx("a", {
          href: "https://docs.camunda.io/docs/reference/bpmn-processes/timer-events/timer-events#time-cycle",
          target: "_blank",
          rel: "noopener",
          title: translate('Timer documentation'),
          children: translate('How to configure a timer')
        })]
      });
    case 'timeDuration':
      return jsxRuntime.jsxs("div", {
        children: [jsxRuntime.jsx("p", {
          children: translate('A time duration defined as ISO 8601 durations format.')
        }), jsxRuntime.jsxs("ul", {
          children: [jsxRuntime.jsxs("li", {
            children: [jsxRuntime.jsx("code", {
              children: "PT15S"
            }), " - ", translate('15 seconds')]
          }), jsxRuntime.jsxs("li", {
            children: [jsxRuntime.jsx("code", {
              children: "PT1H30M"
            }), " - ", translate('1 hour and 30 minutes')]
          }), jsxRuntime.jsxs("li", {
            children: [jsxRuntime.jsx("code", {
              children: "P14D"
            }), " - ", translate('14 days')]
          })]
        }), jsxRuntime.jsx("a", {
          href: "https://docs.camunda.io/docs/reference/bpmn-processes/timer-events/timer-events#time-duration",
          target: "_blank",
          rel: "noopener",
          title: translate('Timer documentation'),
          children: translate('How to configure a timer')
        })]
      });
  }
}

function ExtensionProperty(props) {
  const {
    idPrefix,
    property
  } = props;
  const entries = [{
    id: idPrefix + '-name',
    component: NameProperty$1,
    idPrefix,
    property
  }, {
    id: idPrefix + '-value',
    component: ValueProperty$1,
    idPrefix,
    property
  }];
  return entries;
}
function NameProperty$1(props) {
  const {
    idPrefix,
    element,
    property
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: property,
      properties: {
        name: value
      }
    });
  };
  const getValue = () => {
    return property.name;
  };
  return propertiesPanel.TextFieldEntry({
    element: property,
    id: idPrefix + '-name',
    label: translate('Name'),
    getValue,
    setValue,
    debounce
  });
}
function ValueProperty$1(props) {
  const {
    idPrefix,
    element,
    property
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: property,
      properties: {
        value
      }
    });
  };
  const getValue = () => {
    return property.value;
  };
  return propertiesPanel.TextFieldEntry({
    element: property,
    id: idPrefix + '-value',
    label: translate('Value'),
    getValue,
    setValue,
    debounce
  });
}

function ExtensionPropertiesProps({
  element,
  injector,
  namespace = 'camunda'
}) {
  let businessObject = getRelevantBusinessObject(element);

  // do not offer for empty pools
  if (!businessObject) {
    return;
  }
  const properties = getPropertiesList(businessObject, namespace) || [];
  const bpmnFactory = injector.get('bpmnFactory'),
    commandStack = injector.get('commandStack');
  const items = properties.map((property, index) => {
    const id = element.id + '-extensionProperty-' + index;
    return {
      id,
      label: property.get('name') || '',
      entries: ExtensionProperty({
        idPrefix: id,
        element,
        property
      }),
      autoFocusEntry: id + '-name',
      remove: removeFactory$9({
        commandStack,
        element,
        property,
        namespace
      })
    };
  });
  return {
    items,
    add: addFactory$6({
      bpmnFactory,
      commandStack,
      element,
      namespace
    }),
    shouldSort: false
  };
}
function removeFactory$9({
  commandStack,
  element,
  property,
  namespace
}) {
  return function (event) {
    event.stopPropagation();
    const commands = [];
    const businessObject = getRelevantBusinessObject(element);
    const extensionElements = businessObject.get('extensionElements');
    const properties = getProperties(businessObject, namespace);
    if (!properties) {
      return;
    }
    const propertyName = getPropertyName(namespace);
    const values = minDash.without(properties.get(propertyName), property);
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: properties,
        properties: {
          [propertyName]: values
        }
      }
    });

    // remove camunda:Properties if there are no properties anymore
    if (!values.length) {
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: minDash.without(extensionElements.get('values'), properties)
          }
        }
      });
    }
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
}
function addFactory$6({
  bpmnFactory,
  commandStack,
  element,
  namespace
}) {
  return function (event) {
    event.stopPropagation();
    let commands = [];
    const businessObject = getRelevantBusinessObject(element);
    let extensionElements = businessObject.get('extensionElements');

    // (1) ensure extension elements
    if (!extensionElements) {
      extensionElements = createElement('bpmn:ExtensionElements', {
        values: []
      }, businessObject, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
          properties: {
            extensionElements
          }
        }
      });
    }
    const propertyName = getPropertyName(namespace);

    // (2) ensure camunda:Properties
    let properties = getProperties(businessObject, namespace);
    if (!properties) {
      const parent = extensionElements;
      properties = createElement(`${namespace}:Properties`, {
        [propertyName]: []
      }, parent, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [...extensionElements.get('values'), properties]
          }
        }
      });
    }

    // (3) create camunda:Property
    const property = createElement(`${namespace}:Property`, {}, properties, bpmnFactory);

    // (4) add property to list
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: properties,
        properties: {
          [propertyName]: [...properties.get(propertyName), property]
        }
      }
    });

    // (5) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
}

// helper //////////////////

function getRelevantBusinessObject(element) {
  let businessObject = ModelUtil.getBusinessObject(element);
  if (ModelUtil.is(element, 'bpmn:Participant')) {
    return businessObject.get('processRef');
  }
  return businessObject;
}
function getPropertyName(namespace = 'camunda') {
  if (namespace === 'zeebe') {
    return 'properties';
  }
  return 'values';
}
function getProperties(element, namespace = 'camunda') {
  const businessObject = getRelevantBusinessObject(element);
  return getExtensionElementsList(businessObject, `${namespace}:Properties`)[0];
}
function getPropertiesList(element, namespace = 'camunda') {
  const businessObject = getRelevantBusinessObject(element);
  const properties = getProperties(businessObject, namespace);
  return properties && properties.get(getPropertyName(namespace));
}

/**
 * @typedef { import('@bpmn-io/properties-panel').EntryDefinition } Entry
 */

const LOW_PRIORITY$1 = 500;
const ZEEBE_GROUPS = [BusinessRuleImplementationGroup, CalledDecisionGroup, ScriptImplementationGroup, ScriptGroup$1, TaskDefinitionGroup, AssignmentDefinitionGroup, FormGroup$1, ConditionGroup$1, TargetGroup, InputPropagationGroup, InputGroup$1, OutputPropagationGroup, OutputGroup$1, HeaderGroup, ExtensionPropertiesGroup$1];
class ZeebePropertiesProvider {
  constructor(propertiesPanel, injector) {
    propertiesPanel.registerProvider(LOW_PRIORITY$1, this);
    this._injector = injector;
  }
  getGroups(element) {
    return groups => {
      // (1) add zeebe specific groups
      groups = groups.concat(this._getGroups(element));

      // (2) update existing groups with zeebe specific properties
      updateErrorGroup$1(groups, element);
      updateEscalationGroup$1(groups, element);
      updateMessageGroup(groups, element);
      updateSignalGroup(groups, element);
      updateTimerGroup$1(groups, element, this._injector);
      updateMultiInstanceGroup$1(groups, element);

      // (3) remove message group when not applicable
      groups = removeMessageGroup(groups, element);
      return groups;
    };
  }
  _getGroups(element) {
    const groups = ZEEBE_GROUPS.map(createGroup => createGroup(element, this._injector));
    return groups.filter(group => group !== null);
  }
}
ZeebePropertiesProvider.$inject = ['propertiesPanel', 'injector'];
function CalledDecisionGroup(element) {
  const group = {
    id: 'calledDecision',
    label: 'Called decision',
    entries: [...CalledDecisionProps({
      element
    })],
    component: propertiesPanel.Group
  };
  return group.entries.length ? group : null;
}
function ScriptGroup$1(element) {
  const group = {
    id: 'script',
    label: 'Script',
    entries: [...ScriptProps$1({
      element
    })],
    component: propertiesPanel.Group
  };
  return group.entries.length ? group : null;
}
function TaskDefinitionGroup(element) {
  const group = {
    id: 'taskDefinition',
    label: 'Task definition',
    entries: [...TaskDefinitionProps({
      element
    })],
    component: propertiesPanel.Group
  };
  return group.entries.length ? group : null;
}
function InputGroup$1(element, injector) {
  const group = {
    id: 'inputs',
    label: 'Inputs',
    component: propertiesPanel.ListGroup,
    ...InputProps$1({
      element,
      injector
    })
  };
  return group.items ? group : null;
}
function OutputGroup$1(element, injector) {
  const group = {
    id: 'outputs',
    label: 'Outputs',
    component: propertiesPanel.ListGroup,
    ...OutputProps$1({
      element,
      injector
    })
  };
  return group.items ? group : null;
}
function ConditionGroup$1(element) {
  const group = {
    id: 'condition',
    label: 'Condition',
    entries: [...ConditionProps$1({
      element
    })],
    component: propertiesPanel.Group
  };
  return group.entries.length ? group : null;
}
function FormGroup$1(element, injector) {
  const group = {
    id: 'form',
    label: 'Form',
    entries: [...FormProps$1({
      element,
      injector
    })],
    component: propertiesPanel.Group
  };
  return group.entries.length ? group : null;
}
function TargetGroup(element) {
  const group = {
    id: 'calledElement',
    label: 'Called element',
    entries: [...TargetProps({
      element
    })],
    component: propertiesPanel.Group
  };
  return group.entries.length ? group : null;
}
function HeaderGroup(element, injector) {
  const group = {
    id: 'headers',
    label: 'Headers',
    component: propertiesPanel.ListGroup,
    ...HeaderProps({
      element,
      injector
    })
  };
  return group.items ? group : null;
}
function OutputPropagationGroup(element) {
  const group = {
    id: 'outputPropagation',
    label: 'Output propagation',
    entries: [...OutputPropagationProps({
      element
    })],
    component: propertiesPanel.Group
  };
  return group.entries.length ? group : null;
}
function InputPropagationGroup(element) {
  const group = {
    id: 'inputPropagation',
    label: 'Input propagation',
    entries: [...InputPropagationProps({
      element
    })],
    component: propertiesPanel.Group
  };
  return group.entries.length ? group : null;
}
function BusinessRuleImplementationGroup(element) {
  const group = {
    id: 'businessRuleImplementation',
    label: 'Implementation',
    entries: [...BusinessRuleImplementationProps({
      element
    })],
    component: propertiesPanel.Group
  };
  return group.entries.length ? group : null;
}
function ScriptImplementationGroup(element) {
  const group = {
    id: 'scriptImplementation',
    label: 'Implementation',
    entries: [...ScriptImplementationProps({
      element
    })],
    component: propertiesPanel.Group
  };
  return group.entries.length ? group : null;
}
function AssignmentDefinitionGroup(element) {
  const group = {
    id: 'assignmentDefinition',
    label: 'Assignment',
    entries: [...AssignmentDefinitionProps({
      element
    }), ...TaskScheduleProps({
      element
    })],
    component: propertiesPanel.Group
  };
  return group.entries.length ? group : null;
}
function ExtensionPropertiesGroup$1(element, injector) {
  const group = {
    label: 'Extension properties',
    id: 'Zeebe__ExtensionProperties',
    component: propertiesPanel.ListGroup,
    ...ExtensionPropertiesProps({
      element,
      injector,
      namespace: 'zeebe'
    })
  };
  if (group.items) {
    return group;
  }
  return null;
}
function updateErrorGroup$1(groups, element) {
  const errorGroup = findGroup$1(groups, 'error');
  if (!errorGroup) {
    return;
  }
  errorGroup.entries = replaceEntries(errorGroup.entries, ErrorProps$1({
    element
  }));
}
function updateEscalationGroup$1(groups, element) {
  const escalationGroup = findGroup$1(groups, 'escalation');
  if (!escalationGroup) {
    return;
  }
  escalationGroup.entries = replaceEntries(escalationGroup.entries, EscalationProps$1({
    element
  }));
}
function updateSignalGroup(groups, element) {
  const signalGroup = findGroup$1(groups, 'signal');
  if (!signalGroup) {
    return;
  }
  signalGroup.entries = replaceEntries(signalGroup.entries, SignalProps({
    element
  }));
}
function updateMessageGroup(groups, element) {
  const messageGroup = findGroup$1(groups, 'message');
  if (!messageGroup) {
    return;
  }
  messageGroup.entries = replaceEntries(messageGroup.entries, MessageProps({
    element
  }));
}

// overwrite bpmn generic timerEventDefinition group with zeebe-specific one
function updateTimerGroup$1(groups, element, injector) {
  const timerEventGroup = findGroup$1(groups, 'timer');
  if (!timerEventGroup) {
    return;
  }
  timerEventGroup.entries = [...TimerProps$1({
    element,
    injector
  })];
}

// overwrite bpmn generic multiInstance group with zeebe-specific one
function updateMultiInstanceGroup$1(groups, element) {
  const multiInstanceGroup = findGroup$1(groups, 'multiInstance');
  if (!multiInstanceGroup) {
    return;
  }
  multiInstanceGroup.entries = [...MultiInstanceProps$1({
    element
  })];
}

// remove message group from Message End Event & Message Throw Event
function removeMessageGroup(groups, element) {
  const messageGroup = findGroup$1(groups, 'message');
  if (isMessageEndEvent(element) || isMessageThrowEvent(element)) {
    groups = groups.filter(g => g != messageGroup);
  }
  return groups;
}

// helper /////////////////////

function findGroup$1(groups, id) {
  return groups.find(g => g.id === id);
}

/**
 * Replace entries with the same ID.
 *s
 * @param {Entry[]} oldEntries
 * @param {Entry[]} newEntries
 *
 * @returns {Entry[]} combined entries
 */
function replaceEntries(oldEntries, newEntries) {
  const filteredEntries = oldEntries.filter(oldEntry => !newEntries.find(newEntry => newEntry.id === oldEntry.id));
  return [...filteredEntries, ...newEntries];
}

var index$1 = {
  __init__: ['zeebePropertiesProvider'],
  zeebePropertiesProvider: ['type', ZeebePropertiesProvider]
};

function AsynchronousContinuationsProps(props) {
  const {
    element
  } = props;
  const checkboxIsEditedInverted = node => {
    return node && !node.checked;
  };
  const businessObject = ModelUtil.getBusinessObject(element);
  const entries = [];
  if (ModelUtil.is(element, 'camunda:AsyncCapable')) {
    entries.push({
      id: 'asynchronousContinuationBefore',
      component: AsynchronousContinuationBefore,
      isEdited: propertiesPanel.isCheckboxEntryEdited
    }, {
      id: 'asynchronousContinuationAfter',
      component: AsynchronousContinuationAfter,
      isEdited: propertiesPanel.isCheckboxEntryEdited
    });
    if (isAsyncBefore$2(businessObject) || isAsyncAfter$2(businessObject)) {
      entries.push({
        id: 'exclusive',
        component: Exclusive,
        isEdited: checkboxIsEditedInverted
      });
    }
  }
  return entries;
}
function AsynchronousContinuationBefore(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack'),
    translate = useService('translate');
  const businessObject = ModelUtil.getBusinessObject(element);
  const getValue = () => {
    return isAsyncBefore$2(businessObject);
  };
  const setValue = value => {
    // overwrite the legacy `async` property, we will use the more explicit `asyncBefore`
    const props = {
      'camunda:asyncBefore': value,
      'camunda:async': undefined
    };
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: props
    });
  };
  return propertiesPanel.CheckboxEntry({
    element,
    id: 'asynchronousContinuationBefore',
    label: translate('Before'),
    getValue,
    setValue
  });
}
function AsynchronousContinuationAfter(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack'),
    translate = useService('translate');
  const businessObject = ModelUtil.getBusinessObject(element);
  const getValue = () => {
    return isAsyncAfter$2(businessObject);
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:asyncAfter': value
      }
    });
  };
  return propertiesPanel.CheckboxEntry({
    element,
    id: 'asynchronousContinuationAfter',
    label: translate('After'),
    getValue,
    setValue
  });
}
function Exclusive(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack'),
    translate = useService('translate');
  const businessObject = ModelUtil.getBusinessObject(element);
  const getValue = () => {
    return isExclusive$1(businessObject);
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:exclusive': value
      }
    });
  };
  return propertiesPanel.CheckboxEntry({
    element,
    id: 'exclusive',
    label: translate('Exclusive'),
    getValue,
    setValue
  });
}

// helper //////////////////

/**
 * Returns true if the attribute 'camunda:asyncBefore' is set
 * to true.
 *
 * @param  {ModdleElement} bo
 *
 * @return {boolean} a boolean value
 */
function isAsyncBefore$2(bo) {
  return !!(bo.get('camunda:asyncBefore') || bo.get('camunda:async'));
}

/**
 * Returns true if the attribute 'camunda:asyncAfter' is set
 * to true.
 *
 * @param  {ModdleElement} bo
 *
 * @return {boolean} a boolean value
 */
function isAsyncAfter$2(bo) {
  return !!bo.get('camunda:asyncAfter');
}

/**
 * Returns true if the attribute 'camunda:exclusive' is set
 * to true.
 *
 * @param  {ModdleElement} bo
 *
 * @return {boolean} a boolean value
 */
function isExclusive$1(bo) {
  return !!bo.get('camunda:exclusive');
}

const EMPTY_OPTION$1 = '';
function BusinessKeyProps$1(props) {
  const {
    element
  } = props;
  if (!ModelUtil.is(element, 'bpmn:StartEvent') || !hasFormFields(element)) {
    return [];
  }
  return [{
    id: 'businessKey',
    component: BusinessKey$1,
    isEdited: propertiesPanel.isSelectEntryEdited
  }];
}
function BusinessKey$1(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const formData = getFormData$2(element);
  const getValue = () => {
    return formData.get('camunda:businessKey') || '';
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: formData,
      properties: {
        'camunda:businessKey': value
      }
    });
  };
  const getOptions = () => {
    const options = [{
      value: EMPTY_OPTION$1,
      label: translate('<none>')
    }];
    const fields = formData.get('fields');
    fields.forEach(field => {
      const id = field.get('camunda:id');
      if (id) {
        options.push({
          value: id,
          label: id
        });
      }
    });
    return options;
  };
  return propertiesPanel.SelectEntry({
    element,
    id: 'businessKey',
    label: translate('Key'),
    getValue,
    setValue,
    getOptions
  });
}

// helper ///////////////////

function getFormData$2(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  return getExtensionElementsList(businessObject, 'camunda:FormData')[0];
}
function hasFormFields(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  const formData = getFormData$2(businessObject);
  return formData && formData.get('camunda:fields').length;
}

function CalledBpmnProps(props) {
  const {
    element
  } = props;
  const entries = [{
    id: 'calledElement',
    component: CalledElement,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  }, {
    id: 'calledElementBinding',
    component: CalledElementBinding,
    isEdited: propertiesPanel.isSelectEntryEdited
  }, {
    id: 'calledElementTenantId',
    component: CalledElementTenantId,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  }];
  const binding = ModelUtil.getBusinessObject(element).get('camunda:calledElementBinding');
  if (binding === 'version') {
    entries.splice(-1, 0, {
      id: 'calledElementVersion',
      component: CalledElementVersion,
      isEdited: propertiesPanel.isTextFieldEntryEdited
    });
  } else if (binding === 'versionTag') {
    entries.splice(-1, 0, {
      id: 'calledElementVersionTag',
      component: CalledElementVersionTag,
      isEdited: propertiesPanel.isTextFieldEntryEdited
    });
  }
  return entries;
}
function CalledElement(props) {
  const {
    element
  } = props;
  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return ModelUtil.getBusinessObject(element).get('calledElement');
  };
  const setValue = value => {
    modeling.updateProperties(element, {
      calledElement: value || ''
    });
  };
  return jsxRuntime.jsx(propertiesPanel.TextFieldEntry, {
    element: element,
    id: "calledElement",
    label: translate('Called element'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce
  });
}
function CalledElementBinding(props) {
  const {
    element
  } = props;
  const modeling = useService('modeling');
  const translate = useService('translate');
  const getValue = () => {
    return ModelUtil.getBusinessObject(element).get('camunda:calledElementBinding') || 'latest';
  };
  const setValue = value => {
    modeling.updateProperties(element, {
      calledElementBinding: value === 'latest' ? undefined : value,
      calledElementVersion: undefined,
      calledElementVersionTag: undefined
    });
  };
  const getOptions = () => [{
    value: 'latest',
    label: translate('latest')
  }, {
    value: 'deployment',
    label: translate('deployment')
  }, {
    value: 'version',
    label: translate('version')
  }, {
    value: 'versionTag',
    label: translate('version tag')
  }];
  return jsxRuntime.jsx(propertiesPanel.SelectEntry, {
    element: element,
    id: "calledElementBinding",
    label: translate('Binding'),
    getValue: getValue,
    setValue: setValue,
    getOptions: getOptions
  });
}
function CalledElementVersion(props) {
  const {
    element
  } = props;
  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return ModelUtil.getBusinessObject(element).get('camunda:calledElementVersion');
  };
  const setValue = value => {
    modeling.updateProperties(element, {
      calledElementVersion: value
    });
  };
  return jsxRuntime.jsx(propertiesPanel.TextFieldEntry, {
    element: element,
    id: "calledElementVersion",
    label: translate('Version'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce
  });
}
function CalledElementVersionTag(props) {
  const {
    element
  } = props;
  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return ModelUtil.getBusinessObject(element).get('camunda:calledElementVersionTag');
  };
  const setValue = value => {
    modeling.updateProperties(element, {
      calledElementVersionTag: value
    });
  };
  return jsxRuntime.jsx(propertiesPanel.TextFieldEntry, {
    element: element,
    id: "calledElementVersionTag",
    label: translate('Version tag'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce
  });
}
function CalledElementTenantId(props) {
  const {
    element
  } = props;
  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return ModelUtil.getBusinessObject(element).get('camunda:calledElementTenantId');
  };
  const setValue = value => {
    modeling.updateProperties(element, {
      calledElementTenantId: value
    });
  };
  return jsxRuntime.jsx(propertiesPanel.TextFieldEntry, {
    element: element,
    id: "calledElementTenantId",
    label: translate('Tenant ID'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce
  });
}

function CalledCmmnProps(props) {
  const {
    element
  } = props;
  const entries = [{
    id: 'calledElementCaseRef',
    component: CaseRef,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  }, {
    id: 'calledElementCaseBinding',
    component: CaseBinding,
    isEdited: propertiesPanel.isSelectEntryEdited
  }, {
    id: 'calledElementCaseTenantId',
    component: CaseTenantId,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  }];
  if (ModelUtil.getBusinessObject(element).get('camunda:caseBinding') === 'version') {
    entries.splice(-1, 0, {
      id: 'calledElementCaseVersion',
      component: CaseVersion,
      isEdited: propertiesPanel.isTextFieldEntryEdited
    });
  }
  return entries;
}
function CaseRef(props) {
  const {
    element
  } = props;
  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return ModelUtil.getBusinessObject(element).get('camunda:caseRef');
  };
  const setValue = value => {
    modeling.updateProperties(element, {
      caseRef: value || ''
    });
  };
  return jsxRuntime.jsx(propertiesPanel.TextFieldEntry, {
    element: element,
    id: "calledElementCaseRef",
    label: translate('Case ref'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce
  });
}
function CaseBinding(props) {
  const {
    element
  } = props;
  const modeling = useService('modeling');
  const translate = useService('translate');
  const getValue = () => {
    return ModelUtil.getBusinessObject(element).get('camunda:caseBinding') || 'latest';
  };
  const setValue = value => {
    modeling.updateProperties(element, {
      caseBinding: value === 'latest' ? undefined : value,
      caseVersion: undefined
    });
  };
  const getOptions = () => [{
    value: 'latest',
    label: translate('latest')
  }, {
    value: 'deployment',
    label: translate('deployment')
  }, {
    value: 'version',
    label: translate('version')
  }];
  return jsxRuntime.jsx(propertiesPanel.SelectEntry, {
    element: element,
    id: "calledElementCaseBinding",
    label: translate('Binding'),
    getValue: getValue,
    setValue: setValue,
    getOptions: getOptions
  });
}
function CaseVersion(props) {
  const {
    element
  } = props;
  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return ModelUtil.getBusinessObject(element).get('camunda:caseVersion');
  };
  const setValue = value => {
    modeling.updateProperties(element, {
      caseVersion: value
    });
  };
  return jsxRuntime.jsx(propertiesPanel.TextFieldEntry, {
    element: element,
    id: "calledElementCaseVersion",
    label: translate('Version'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce
  });
}
function CaseTenantId(props) {
  const {
    element
  } = props;
  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return ModelUtil.getBusinessObject(element).get('camunda:caseTenantId');
  };
  const setValue = value => {
    modeling.updateProperties(element, {
      caseTenantId: value
    });
  };
  return jsxRuntime.jsx(propertiesPanel.TextFieldEntry, {
    element: element,
    id: "calledElementCaseTenantId",
    label: translate('Tenant ID'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce
  });
}

function DelegateVariableMappingProps(props) {
  const {
    element
  } = props;
  const entries = [{
    id: 'calledElementDelegateVariableMappingType',
    component: DelegateVariableMappingType,
    isEdited: propertiesPanel.isSelectEntryEdited
  }];
  const type = getDelegateVariableMappingType(element);
  if (type === 'class') {
    entries.push({
      id: 'calledElementVariableMappingClass',
      component: VariableMappingClass,
      isEdited: propertiesPanel.isTextFieldEntryEdited
    });
  } else if (type === 'delegateExpression') {
    entries.push({
      id: 'calledElementVariableMappingDelegateExpression',
      component: VariableMappingDelegateExpression,
      isEdited: propertiesPanel.isTextFieldEntryEdited
    });
  }
  return entries;
}
const DEFAULT_PROPS$5 = {
  'camunda:variableMappingClass': undefined,
  'camunda:variableMappingDelegateExpression': undefined
};
function DelegateVariableMappingType(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const getValue = () => {
    return getDelegateVariableMappingType(element);
  };
  const setValue = value => {
    const properties = {
      ...DEFAULT_PROPS$5
    };
    if (value === 'class') {
      properties['camunda:variableMappingClass'] = '';
    } else if (value === 'delegateExpression') {
      properties['camunda:variableMappingDelegateExpression'] = '';
    }
    commandStack.execute('element.updateProperties', {
      element,
      properties
    });
  };
  const getOptions = () => [{
    value: 'none',
    label: translate('<none>')
  }, {
    value: 'class',
    label: translate('Class')
  }, {
    value: 'delegateExpression',
    label: translate('Delegate expression')
  }];
  return jsxRuntime.jsx(propertiesPanel.SelectEntry, {
    element: element,
    id: "calledElementDelegateVariableMappingType",
    label: translate('Delegate Variable Mapping'),
    getValue: getValue,
    setValue: setValue,
    getOptions: getOptions
  });
}
function VariableMappingDelegateExpression(props) {
  const {
    element
  } = props;
  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return ModelUtil.getBusinessObject(element).get('camunda:variableMappingDelegateExpression');
  };
  const setValue = value => {
    modeling.updateProperties(element, {
      variableMappingDelegateExpression: value || '',
      variableMappingClass: undefined
    });
  };
  return jsxRuntime.jsx(propertiesPanel.TextFieldEntry, {
    element: element,
    id: "calledElementVariableMappingDelegateExpression",
    label: translate('Delegate Expression'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce
  });
}
function VariableMappingClass(props) {
  const {
    element
  } = props;
  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return ModelUtil.getBusinessObject(element).get('camunda:variableMappingClass');
  };
  const setValue = value => {
    modeling.updateProperties(element, {
      variableMappingDelegateExpression: undefined,
      variableMappingClass: value || ''
    });
  };
  return jsxRuntime.jsx(propertiesPanel.TextFieldEntry, {
    element: element,
    id: "calledElementVariableMappingClass",
    label: translate('Delegate Class'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce
  });
}

// helper /////

function getDelegateVariableMappingType(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  if (businessObject.get('camunda:variableMappingClass') !== undefined) {
    return 'class';
  } else if (businessObject.get('camunda:variableMappingDelegateExpression') !== undefined) {
    return 'delegateExpression';
  }
  return 'none';
}

function CallActivityProps(props) {
  const {
    element
  } = props;
  if (!ModelUtil.is(element, 'bpmn:CallActivity')) {
    return [];
  }
  const entries = [];
  entries.push({
    id: 'calledElementType',
    component: CalledElementType,
    isEdited: propertiesPanel.isSelectEntryEdited
  });
  const calledElementType = getCalledElementType(element);
  if (calledElementType === 'bpmn') {
    entries.push(...CalledBpmnProps({
      element
    }), ...BusinessKeyProps({
      element
    }), ...DelegateVariableMappingProps({
      element
    }));
  } else if (calledElementType === 'cmmn') {
    entries.push(...CalledCmmnProps({
      element
    }), ...BusinessKeyProps({
      element
    }));
  } else {
    entries.push(...BusinessKeyProps({
      element
    }));
  }
  return entries;
}
const DEFAULT_PROPS$4 = {
  calledElement: undefined,
  'camunda:calledElementBinding': undefined,
  'camunda:calledElementVersion': undefined,
  'camunda:calledElementTenantId': undefined,
  'camunda:variableMappingClass': undefined,
  'camunda:variableMappingDelegateExpression': undefined,
  'camunda:caseRef': undefined,
  'camunda:caseBinding': undefined,
  'camunda:caseVersion': undefined,
  'camunda:caseTenantId': undefined
};
const DEFAULT_BUSINESS_KEY = '#{execution.processBusinessKey}';
function CalledElementType(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const getValue = () => {
    return getCalledElementType(element);
  };
  const setValue = value => {
    const properties = {
      ...DEFAULT_PROPS$4
    };
    if (value === 'bpmn') {
      properties['calledElement'] = '';
    } else if (value === 'cmmn') {
      properties['camunda:caseRef'] = '';
    }
    commandStack.execute('element.updateProperties', {
      element,
      properties
    });
  };
  const getOptions = () => [{
    value: '',
    label: translate('<none>')
  }, {
    value: 'bpmn',
    label: translate('BPMN')
  }, {
    value: 'cmmn',
    label: translate('CMMN')
  }];
  return jsxRuntime.jsx(propertiesPanel.SelectEntry, {
    element: element,
    id: "calledElementType",
    label: translate('Type'),
    getValue: getValue,
    setValue: setValue,
    getOptions: getOptions
  });
}
function BusinessKeyProps(props) {
  const {
    element
  } = props;
  const entries = [{
    id: 'calledElementBusinessKey',
    component: BusinessKey,
    isEdited: propertiesPanel.isCheckboxEntryEdited
  }];
  if (hasBusinessKey(element)) {
    entries.push({
      id: 'calledElementBusinessKeyExpression',
      component: BusinessKeyExpression,
      isEdited: propertiesPanel.isTextFieldEntryEdited
    });
  }
  return entries;
}
function BusinessKey(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const modeling = useService('modeling');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const getValue = () => {
    return hasBusinessKey(element);
  };
  const setValue = value => {
    if (value) {
      addBusinessKey();
    } else {
      removeBusinessKey();
    }
  };
  function addBusinessKey() {
    const businessObject = ModelUtil.getBusinessObject(element);
    let extensionElements = businessObject.get('extensionElements');

    // (1) If there are no extension elements, create camunda:In and update element's properties
    if (!extensionElements) {
      extensionElements = createElement('bpmn:ExtensionElements', {}, businessObject, bpmnFactory);
      const businessKeyItem = createBusinessKey(extensionElements);
      extensionElements.set('values', [businessKeyItem]);
      modeling.updateProperties(element, {
        extensionElements
      });
    } else {
      // (2) Otherwise, add camunda:In to the existing values
      const businessKeyItem = createBusinessKey(extensionElements);
      addExtensionElements(element, businessObject, businessKeyItem, bpmnFactory, commandStack);
    }
  }
  function createBusinessKey(parent) {
    return createElement('camunda:In', {
      businessKey: DEFAULT_BUSINESS_KEY
    }, parent, bpmnFactory);
  }
  function removeBusinessKey() {
    const businessObject = ModelUtil.getBusinessObject(element);
    const camundaInList = getExtensionElementsList(businessObject, 'camunda:In');
    const businessKeyItems = camundaInList.filter(camundaIn => camundaIn.get('businessKey') !== undefined);
    removeExtensionElements(element, businessObject, businessKeyItems, commandStack);
  }
  return jsxRuntime.jsx(propertiesPanel.CheckboxEntry, {
    element: element,
    id: "calledElementBusinessKey",
    label: translate('Business key'),
    getValue: getValue,
    setValue: setValue
  });
}
function BusinessKeyExpression(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => getBusinessKey(element);
  const setValue = value => {
    const camundaIn = findCamundaInWithBusinessKey(element);
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: camundaIn,
      properties: {
        businessKey: value || ''
      }
    });
  };
  return jsxRuntime.jsx(propertiesPanel.TextFieldEntry, {
    element: element,
    id: "calledElementBusinessKeyExpression",
    label: translate('Business key expression'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce
  });
}

// helper //////

function getCalledElementType(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  if (businessObject.get('calledElement') !== undefined) {
    return 'bpmn';
  } else if (businessObject.get('camunda:caseRef') !== undefined) {
    return 'cmmn';
  }
  return '';
}
function hasBusinessKey(element) {
  return getBusinessKey(element) !== undefined;
}
function getBusinessKey(element) {
  const camundaIn = findCamundaInWithBusinessKey(element);
  if (camundaIn) {
    return camundaIn.get('businessKey');
  }
}
function findCamundaInWithBusinessKey(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  const camundaInList = getExtensionElementsList(businessObject, 'camunda:In');
  for (const camundaIn of camundaInList) {
    const businessKey = camundaIn.get('businessKey');
    if (businessKey !== undefined) {
      return camundaIn;
    }
  }
}

function CandidateStarterProps(props) {
  const {
    element
  } = props;
  const businessObject = ModelUtil.getBusinessObject(element);
  if (!ModelUtil.is(element, 'bpmn:Process') && !(ModelUtil.is(element, 'bpmn:Participant') && businessObject.get('processRef'))) {
    return [];
  }
  return [{
    id: 'candidateStarterGroups',
    component: CandidateStarterGroups,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  }, {
    id: 'candidateStarterUsers',
    component: CandidateStarterUsers,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  }];
}
function CandidateStarterGroups(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack'),
    translate = useService('translate'),
    debounce = useService('debounceInput');
  const process = getProcess$3(element);
  const getValue = () => {
    return process.get('camunda:candidateStarterGroups') || '';
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element: element,
      moddleElement: process,
      properties: {
        'camunda:candidateStarterGroups': value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'candidateStarterGroups',
    label: translate('Candidate starter groups'),
    description: translate('Specify more than one group as a comma separated list.'),
    getValue,
    setValue,
    debounce
  });
}
function CandidateStarterUsers(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack'),
    translate = useService('translate'),
    debounce = useService('debounceInput');
  const process = getProcess$3(element);
  const getValue = () => {
    return process.get('camunda:candidateStarterUsers') || '';
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element: element,
      moddleElement: process,
      properties: {
        'camunda:candidateStarterUsers': value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'candidateStarterUsers',
    label: translate('Candidate starter users'),
    description: translate('Specify more than one user as a comma separated list.'),
    getValue,
    setValue,
    debounce
  });
}

// helper //////////////////

/**
 * getProcess - get the businessObject of the process referred to by a bpmn:Process
 * or by a bpmn:Participant
 *
 * @param  {ModdleElement} element either a bpmn:Process or a bpmn:Participant
 * @return {BusinessObject}
 */
function getProcess$3(element) {
  return ModelUtil.is(element, 'bpmn:Process') ? ModelUtil.getBusinessObject(element) : ModelUtil.getBusinessObject(element).get('processRef');
}

function ConditionProps(props) {
  const {
    element
  } = props;
  if (!(ModelUtil.is(element, 'bpmn:SequenceFlow') && isConditionalSource(element.source)) && !getConditionalEventDefinition(element)) {
    return [];
  }
  const entries = [];
  if (getConditionalEventDefinition(element)) {
    entries.push(...VariableEventProps({
      element
    }));
  }
  entries.push({
    id: 'conditionType',
    component: ConditionType,
    isEdited: propertiesPanel.isSelectEntryEdited
  });
  const conditionType = getConditionType(element);
  if (conditionType === 'script') {
    entries.push(...ConditionScriptProps({
      element
    }));
  } else if (conditionType === 'expression') {
    entries.push({
      id: 'conditionExpression',
      component: ConditionExpression,
      isEdited: propertiesPanel.isTextFieldEntryEdited
    });
  }
  return entries;
}
function ConditionType(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const getValue = () => {
    return getConditionType(element);
  };
  const setValue = value => {
    // (1) Remove formalExpression if <none> is selected
    if (value === '') {
      updateCondition(element, commandStack, undefined);
    } else {
      // (2) Create and set formalExpression element containing the conditionExpression
      const attributes = {
        body: '',
        language: value === 'script' ? '' : undefined
      };
      const formalExpressionElement = createFormalExpression(element, attributes, bpmnFactory);
      updateCondition(element, commandStack, formalExpressionElement);
    }
  };
  const getOptions = () => [{
    value: '',
    label: translate('<none>')
  }, {
    value: 'script',
    label: translate('Script')
  }, {
    value: 'expression',
    label: translate('Expression')
  }];
  return jsxRuntime.jsx(propertiesPanel.SelectEntry, {
    element: element,
    id: "conditionType",
    label: translate('Type'),
    getValue: getValue,
    setValue: setValue,
    getOptions: getOptions
  });
}
function ConditionExpression(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack'),
    bpmnFactory = useService('bpmnFactory'),
    translate = useService('translate'),
    debounce = useService('debounceInput');
  const getValue = () => {
    return getConditionExpression(element).get('body');
  };
  const setValue = value => {
    const conditionExpression = createFormalExpression(element, {
      body: value
    }, bpmnFactory);
    updateCondition(element, commandStack, conditionExpression);
  };
  return jsxRuntime.jsx(propertiesPanel.TextFieldEntry, {
    element: element,
    id: "conditionExpression",
    label: translate('Condition Expression'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce
  });
}
function ConditionScriptProps(props) {
  const {
    element
  } = props;
  const entries = [];
  const scriptType = getScriptType$1(element);

  // (1) language
  entries.push({
    id: 'conditionScriptLanguage',
    component: Language,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  });

  // (2) type
  entries.push({
    id: 'conditionScriptType',
    component: ScriptType,
    isEdited: propertiesPanel.isSelectEntryEdited
  });

  // (3) script
  if (scriptType === 'script') {
    entries.push({
      id: 'conditionScriptValue',
      component: Script$1,
      isEdited: propertiesPanel.isTextAreaEntryEdited
    });
  } else if (scriptType === 'resource') {
    // (4) resource
    entries.push({
      id: 'conditionScriptResource',
      component: Resource$1,
      isEdited: propertiesPanel.isTextFieldEntryEdited
    });
  }
  return entries;
}
function Language(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return getConditionExpression(element).get('language');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element: element,
      moddleElement: getConditionExpression(element),
      properties: {
        language: value || ''
      }
    });
  };
  return jsxRuntime.jsx(propertiesPanel.TextFieldEntry, {
    element: element,
    id: "conditionScriptLanguage",
    label: translate('Format'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce
  });
}
function ScriptType(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const getValue = () => {
    return getScriptType$1(element);
  };
  const setValue = value => {
    // reset script properties on type change
    const updatedProperties = {
      'body': value === 'script' ? '' : undefined,
      'camunda:resource': value === 'resource' ? '' : undefined
    };
    commandStack.execute('element.updateModdleProperties', {
      element: element,
      moddleElement: getConditionExpression(element),
      properties: updatedProperties
    });
  };
  const getOptions = () => {
    const options = [{
      value: 'resource',
      label: translate('External resource')
    }, {
      value: 'script',
      label: translate('Inline script')
    }];
    return options;
  };
  return propertiesPanel.SelectEntry({
    element,
    id: 'conditionScriptType',
    label: translate('Script type'),
    getValue,
    setValue,
    getOptions
  });
}
function Script$1(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return getConditionExpression(element).get('body');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element: element,
      moddleElement: getConditionExpression(element),
      properties: {
        'body': value || ''
      }
    });
  };
  return jsxRuntime.jsx(propertiesPanel.TextAreaEntry, {
    element: element,
    id: "conditionScriptValue",
    label: translate('Script'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce,
    monospace: true
  });
}
function Resource$1(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return getConditionExpression(element).get('camunda:resource');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element: element,
      moddleElement: getConditionExpression(element),
      properties: {
        'camunda:resource': value || ''
      }
    });
  };
  return jsxRuntime.jsx(propertiesPanel.TextFieldEntry, {
    element: true,
    id: "conditionScriptResource",
    label: translate('Resource'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce
  });
}
function VariableEventProps(props) {
  const {
    element
  } = props;
  const entries = [];
  entries.push({
    id: 'conditionVariableName',
    component: VariableName,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  });
  if (!ModelUtil.is(element, 'bpmn:StartEvent') || isInEventSubProcess(element)) {
    entries.push({
      id: 'conditionVariableEvents',
      component: VariableEvents,
      isEdited: propertiesPanel.isTextFieldEntryEdited
    });
  }
  return entries;
}
function VariableName(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return getConditionalEventDefinition(element).get('variableName');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element: element,
      moddleElement: getConditionalEventDefinition(element),
      properties: {
        variableName: value || ''
      }
    });
  };
  return jsxRuntime.jsx(propertiesPanel.TextFieldEntry, {
    element: element,
    id: "conditionVariableName",
    label: translate('Variable name'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce
  });
}
function VariableEvents(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return getConditionalEventDefinition(element).get('variableEvents');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element: element,
      moddleElement: getConditionalEventDefinition(element),
      properties: {
        variableEvents: value || ''
      }
    });
  };
  return jsxRuntime.jsx(propertiesPanel.TextFieldEntry, {
    element: element,
    id: "conditionVariableEvents",
    label: translate('Variable events'),
    description: translate('Specify more than one variable change event as a comma separated list.'),
    getValue: getValue,
    setValue: setValue,
    debounce: debounce
  });
}

// helper ////////////////////

const CONDITIONAL_SOURCES = ['bpmn:Activity', 'bpmn:ExclusiveGateway', 'bpmn:InclusiveGateway', 'bpmn:ComplexGateway'];
function isConditionalSource(element) {
  return ModelingUtil.isAny(element, CONDITIONAL_SOURCES);
}
function getConditionalEventDefinition(element) {
  if (!ModelUtil.is(element, 'bpmn:Event')) {
    return false;
  }
  return getEventDefinition$1(element, 'bpmn:ConditionalEventDefinition');
}
function getConditionType(element) {
  const conditionExpression = getConditionExpression(element);
  if (!conditionExpression) {
    return '';
  } else {
    return conditionExpression.get('language') === undefined ? 'expression' : 'script';
  }
}

/**
 * getConditionExpression - get the body value of a condition expression for a given element
 *
 * @param  {ModdleElement} element
 *
 * @return {string|undefined}
 */
function getConditionExpression(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  if (ModelUtil.is(businessObject, 'bpmn:SequenceFlow')) {
    return businessObject.get('conditionExpression');
  } else if (getConditionalEventDefinition(businessObject)) {
    return getConditionalEventDefinition(businessObject).get('condition');
  }
}
function getScriptType$1(element) {
  const conditionExpression = getConditionExpression(element);
  const resource = conditionExpression.get('camunda:resource');
  if (typeof resource !== 'undefined') {
    return 'resource';
  } else {
    return 'script';
  }
}
function updateCondition(element, commandStack, condition = undefined) {
  if (ModelUtil.is(element, 'bpmn:SequenceFlow')) {
    commandStack.execute('element.updateProperties', {
      element,
      properties: {
        conditionExpression: condition
      }
    });
  } else {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: getConditionalEventDefinition(element),
      properties: {
        condition
      }
    });
  }
}
function createFormalExpression(parent, attributes, bpmnFactory) {
  return createElement('bpmn:FormalExpression', attributes, ModelUtil.is(parent, 'bpmn:SequenceFlow') ? ModelUtil.getBusinessObject(parent) : getConditionalEventDefinition(parent), bpmnFactory);
}
function isInEventSubProcess(element) {
  const bo = ModelUtil.getBusinessObject(element),
    parent = bo.$parent;
  return ModelUtil.is(parent, 'bpmn:SubProcess') && parent.triggeredByEvent;
}

/**
 * Cf. https://docs.camunda.org/manual/latest/user-guide/process-engine/scripting/
 */
function ScriptProps(props) {
  const {
    element,
    script,
    prefix
  } = props;
  const entries = [];
  const scriptType = getScriptType(script || element);
  const idPrefix = prefix || '';

  // (1) scriptFormat
  entries.push({
    id: idPrefix + 'scriptFormat',
    component: Format,
    isEdited: propertiesPanel.isTextFieldEntryEdited,
    idPrefix,
    script
  });

  // (2) type
  entries.push({
    id: idPrefix + 'scriptType',
    component: Type$3,
    isEdited: propertiesPanel.isSelectEntryEdited,
    idPrefix,
    script
  });

  // (3) script
  if (scriptType === 'script') {
    entries.push({
      id: idPrefix + 'scriptValue',
      component: Script,
      isEdited: propertiesPanel.isTextAreaEntryEdited,
      idPrefix,
      script
    });
  }

  // (4) resource
  if (scriptType === 'resource') {
    entries.push({
      id: idPrefix + 'scriptResource',
      component: Resource,
      isEdited: propertiesPanel.isTextFieldEntryEdited,
      idPrefix,
      script
    });
  }
  return entries;
}
function Format(props) {
  const {
    element,
    idPrefix,
    script
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const businessObject = script || ModelUtil.getBusinessObject(element);
  const getValue = () => {
    return businessObject.get('scriptFormat');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        scriptFormat: value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: idPrefix + 'scriptFormat',
    label: translate('Format'),
    getValue,
    setValue,
    debounce
  });
}
function Type$3(props) {
  const {
    element,
    idPrefix,
    script
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const businessObject = script || ModelUtil.getBusinessObject(element);
  const scriptProperty = getScriptProperty(businessObject);
  const getValue = () => {
    return getScriptType(businessObject);
  };
  const setValue = value => {
    // reset script properties on type change
    const properties = {
      [scriptProperty]: value === 'script' ? '' : undefined,
      'camunda:resource': value === 'resource' ? '' : undefined
    };
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties
    });
  };
  const getOptions = () => {
    const options = [{
      value: '',
      label: translate('<none>')
    }, {
      value: 'resource',
      label: translate('External resource')
    }, {
      value: 'script',
      label: translate('Inline script')
    }];
    return options;
  };
  return propertiesPanel.SelectEntry({
    element,
    id: idPrefix + 'scriptType',
    label: translate('Type'),
    getValue,
    setValue,
    getOptions
  });
}
function Script(props) {
  const {
    element,
    idPrefix,
    script
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const businessObject = script || ModelUtil.getBusinessObject(element);
  const scriptProperty = getScriptProperty(businessObject);
  const getValue = () => {
    return getScriptValue(businessObject);
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        [scriptProperty]: value || ''
      }
    });
  };
  return propertiesPanel.TextAreaEntry({
    element,
    id: idPrefix + 'scriptValue',
    label: translate('Script'),
    getValue,
    setValue,
    debounce,
    monospace: true
  });
}
function Resource(props) {
  const {
    element,
    idPrefix,
    script
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const businessObject = script || ModelUtil.getBusinessObject(element);
  const getValue = () => {
    return businessObject.get('camunda:resource');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:resource': value || ''
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: idPrefix + 'scriptResource',
    label: translate('Resource'),
    getValue,
    setValue,
    debounce
  });
}

// helper ////////////////////

function getScriptType(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  const scriptValue = getScriptValue(businessObject);
  if (typeof scriptValue !== 'undefined') {
    return 'script';
  }
  const resource = businessObject.get('camunda:resource');
  if (typeof resource !== 'undefined') {
    return 'resource';
  }
}
function getScriptValue(businessObject) {
  return businessObject.get(getScriptProperty(businessObject));
}
function isScript$2(element) {
  return ModelUtil.is(element, 'camunda:Script');
}
function getScriptProperty(businessObject) {
  return isScript$2(businessObject) ? 'value' : 'script';
}

function getElements(businessObject, type, property) {
  const elements = getExtensionElementsList(businessObject, type);
  return !property ? elements : (elements[0] || {})[property] || [];
}
function getParameters(element, prop) {
  const inputOutput = getInputOutput(element);
  return inputOutput && inputOutput.get(prop) || [];
}

/**
 * Get a camunda:inputOutput from the business object
 *
 * @param {djs.model.Base | ModdleElement} element
 *
 * @return {ModdleElement} the inputOutput object
 */
function getInputOutput(element) {
  if (ModelUtil.is(element, 'camunda:Connector')) {
    return element.get('inputOutput');
  }
  const businessObject = ModelUtil.getBusinessObject(element);
  return (getElements(businessObject, 'camunda:InputOutput') || [])[0];
}

/**
 * Return all input parameters existing in the business object, and
 * an empty array if none exist.
 *
 * @param  {djs.model.Base} element
 *
 * @return {Array} a list of input parameter objects
 */
function getInputParameters(element) {
  return getParameters(element, 'inputParameters');
}

/**
 * Return all output parameters existing in the business object, and
 * an empty array if none exist.
 *
 * @param  {djs.model.Base} element
 *
 * @return {Array} a list of output parameter objects
 */
function getOutputParameters(element) {
  return getParameters(element, 'outputParameters');
}
function isInputOutputSupported(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  return ModelUtil.is(businessObject, 'bpmn:FlowNode') && !(ModelingUtil.isAny(businessObject, ['bpmn:StartEvent', 'bpmn:BoundaryEvent', 'bpmn:Gateway']) || ModelUtil.is(businessObject, 'bpmn:SubProcess') && businessObject.get('triggeredByEvent'));
}
function areInputParametersSupported(element) {
  return isInputOutputSupported(element);
}
function areOutputParametersSupported(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  return isInputOutputSupported(element) && !ModelUtil.is(businessObject, 'bpmn:EndEvent') && !businessObject.loopCharacteristics;
}
function getInputOutputType(parameter) {
  const definitionTypes = {
    'camunda:Map': 'map',
    'camunda:List': 'list',
    'camunda:Script': 'script'
  };
  let type = 'stringOrExpression';
  const definition = parameter.get('definition');
  if (typeof definition !== 'undefined') {
    type = definitionTypes[definition.$type];
  }
  return type;
}
function CreateParameterCmd(element, type, parent, bpmnFactory) {
  const isInput = type === 'camunda:InputParameter';
  const newParameter = createElement(type, {
    name: nextId(isInput ? 'Input_' : 'Output_')
  }, parent, bpmnFactory);
  const propertyName = isInput ? 'inputParameters' : 'outputParameters';
  return {
    cmd: 'element.updateModdleProperties',
    context: {
      element,
      moddleElement: parent,
      properties: {
        [propertyName]: [...parent.get(propertyName), newParameter]
      }
    }
  };
}
function AddParameterCmd(element, type, bpmnFactory) {
  const commands = [];
  const businessObject = ModelUtil.getBusinessObject(element);
  let extensionElements = businessObject.get('extensionElements');

  // (1) ensure extension elements
  if (!extensionElements) {
    extensionElements = createElement('bpmn:ExtensionElements', {
      values: []
    }, businessObject, bpmnFactory);
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: businessObject,
        properties: {
          extensionElements
        }
      }
    });
  }

  // (2) ensure inputOutput
  let inputOutput = getInputOutput(element);
  if (!inputOutput) {
    const parent = extensionElements;
    inputOutput = createElement('camunda:InputOutput', {
      inputParameters: [],
      outputParameters: []
    }, parent, bpmnFactory);
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: extensionElements,
        properties: {
          values: [...extensionElements.get('values'), inputOutput]
        }
      }
    });
  }

  // (3) create + add parameter
  commands.push(CreateParameterCmd(element, type, inputOutput, bpmnFactory));
  return commands;
}

function ListProp(props) {
  const {
    element,
    id: idPrefix,
    index,
    item
  } = props;
  const id = `${idPrefix}-listItem-${index}`;
  return jsxRuntime.jsx(ListItem, {
    idPrefix: id,
    element: element,
    item: item
  });
}
function ListProps(props) {
  const {
    idPrefix,
    element,
    parameter
  } = props;
  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const list = parameter.get('definition');
  const items = list.get('items');
  function addItem() {
    const value = createElement('camunda:Value', {}, parameter, bpmnFactory);
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: list,
      properties: {
        items: [...list.get('items'), value]
      }
    });
  }
  function removeItem(item) {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: list,
      properties: {
        items: minDash.without(list.get('items'), item)
      }
    });
  }
  function compareFn(item, anotherItem) {
    const [value = '', anotherValue = ''] = [item.value, anotherItem.value];
    return value === anotherValue ? 0 : value > anotherValue ? 1 : -1;
  }
  return propertiesPanel.ListEntry({
    element,
    autoFocusEntry: true,
    compareFn,
    id: idPrefix + '-list',
    items,
    label: translate('List values'),
    onAdd: addItem,
    onRemove: removeItem,
    component: ListProp
  });
}
function ListItem(props) {
  const {
    idPrefix,
    element,
    item
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const definitionLabels = {
    'camunda:Map': translate('Map'),
    'camunda:List': translate('List'),
    'camunda:Script': translate('Script')
  };
  const getValue = () => {
    if (isDefinitionType$1(item)) {
      return definitionLabels[item.$type];
    }
    return item.get('value');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: item,
      properties: {
        value
      }
    });
  };
  return ListValue({
    id: idPrefix + '-value',
    disabled: isDefinitionType$1(item),
    getValue,
    setValue
  });
}
function ListValue(props) {
  const {
    id,
    disabled,
    getValue,
    setValue
  } = props;
  const debounce = useService('debounceInput', true);
  return jsxRuntime.jsx(propertiesPanel.SimpleEntry, {
    id: id,
    getValue: getValue,
    setValue: setValue,
    disabled: disabled,
    debounce: debounce
  });
}

// helper //////////////////////

function isScript$1(element) {
  return ModelUtil.is(element, 'camunda:Script');
}
function isList$1(element) {
  return ModelUtil.is(element, 'camunda:List');
}
function isMap$1(element) {
  return ModelUtil.is(element, 'camunda:Map');
}
function isDefinitionType$1(element) {
  return isScript$1(element) || isList$1(element) || isMap$1(element);
}

function MapProp(props) {
  const {
    element,
    id: idPrefix,
    index,
    item: entry,
    open
  } = props;
  const id = `${idPrefix}-mapEntry-${index}`;
  const translate = useService('translate');
  return jsxRuntime.jsx(propertiesPanel.CollapsibleEntry, {
    id: id,
    element: element,
    entries: MapEntry({
      element,
      entry,
      idPrefix: id
    }),
    label: entry.get('key') || translate('<empty>'),
    open: open
  });
}
function MapProps(props) {
  const {
    idPrefix,
    element,
    parameter
  } = props;
  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const map = parameter.get('definition');
  const entries = map.get('entries');
  function addEntry() {
    const entry = createElement('camunda:Entry', {}, parameter, bpmnFactory);
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: map,
      properties: {
        entries: [...map.get('entries'), entry]
      }
    });
  }
  function removeEntry(entry) {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: map,
      properties: {
        entries: minDash.without(map.get('entries'), entry)
      }
    });
  }
  function compareFn(entry, anotherEntry) {
    const [key = '', anotherKey = ''] = [entry.key, anotherEntry.key];
    return key === anotherKey ? 0 : key > anotherKey ? 1 : -1;
  }
  return propertiesPanel.ListEntry({
    element,
    autoFocusEntry: true,
    compareFn,
    id: idPrefix + '-map',
    items: entries,
    label: translate('Map entries'),
    onAdd: addEntry,
    onRemove: removeEntry,
    component: MapProp
  });
}
function MapEntry(props) {
  const {
    element,
    entry,
    idPrefix
  } = props;
  const entries = [{
    id: idPrefix + '-key',
    component: MapKey,
    entry,
    idPrefix,
    element
  }, {
    id: idPrefix + '-value',
    component: MapValue,
    entry,
    idPrefix,
    element
  }];
  return entries;
}
function MapKey(props) {
  const {
    element,
    entry,
    idPrefix
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: entry,
      properties: {
        key: value
      }
    });
  };
  const getValue = () => {
    return entry.get('key');
  };
  return propertiesPanel.TextFieldEntry({
    element: entry,
    id: idPrefix + '-key',
    label: translate('Key'),
    getValue,
    setValue,
    debounce
  });
}
function MapValue(props) {
  const {
    element,
    entry,
    idPrefix
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const definition = entry.get('definition');
  const definitionLabels = {
    'camunda:Map': translate('Map'),
    'camunda:List': translate('List'),
    'camunda:Script': translate('Script')
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: entry,
      properties: {
        value
      }
    });
  };
  const getValue = () => {
    if (isDefinitionType(definition)) {
      return definitionLabels[definition.$type];
    }
    return entry.get('value');
  };
  return propertiesPanel.TextFieldEntry({
    element: entry,
    id: idPrefix + '-value',
    label: translate('Value'),
    getValue,
    setValue,
    disabled: isDefinitionType(definition),
    debounce
  });
}

// helper ///////////////////

function isScript(element) {
  return ModelUtil.is(element, 'camunda:Script');
}
function isList(element) {
  return ModelUtil.is(element, 'camunda:List');
}
function isMap(element) {
  return ModelUtil.is(element, 'camunda:Map');
}
function isDefinitionType(element) {
  return isScript(element) || isList(element) || isMap(element);
}

const DEFAULT_PROPS$3 = {
  value: undefined,
  definition: undefined
};
function InputOutputParameter(props) {
  const {
    idPrefix,
    element,
    parameter
  } = props;
  const inputOutputType = getInputOutputType(parameter);
  let entries = [{
    id: idPrefix + '-name',
    component: Name$2,
    isEdited: propertiesPanel.isTextFieldEntryEdited,
    idPrefix,
    parameter
  }, {
    id: idPrefix + '-type',
    component: Type$2,
    isEdited: propertiesPanel.isSelectEntryEdited,
    idPrefix,
    parameter
  }];

  // (1) String or expression
  if (inputOutputType === 'stringOrExpression') {
    entries.push({
      id: idPrefix + '-stringOrExpression',
      component: StringOrExpression,
      isEdited: propertiesPanel.isTextAreaEntryEdited,
      idPrefix,
      parameter
    });

    // (2) Script
  } else if (inputOutputType === 'script') {
    const script = parameter.get('definition');
    entries = [...entries, ...ScriptProps({
      element,
      prefix: idPrefix + '-',
      script
    })];

    // (3) List
  } else if (inputOutputType === 'list') {
    entries.push({
      id: `${idPrefix}-list`,
      component: ListProps,
      idPrefix,
      parameter
    });

    // (4) Map
  } else if (inputOutputType === 'map') {
    entries.push({
      id: `${idPrefix}-map`,
      component: MapProps,
      idPrefix,
      parameter
    });
  }
  return entries;
}
function Name$2(props) {
  const {
    idPrefix,
    element,
    parameter
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: parameter,
      properties: {
        name: value
      }
    });
  };
  const getValue = parameter => {
    return parameter.get('name');
  };
  return propertiesPanel.TextFieldEntry({
    element: parameter,
    id: idPrefix + '-name',
    label: translate(isInput(parameter) ? 'Local variable name' : 'Process variable name'),
    getValue,
    setValue,
    debounce
  });
}
function Type$2(props) {
  const {
    idPrefix,
    element,
    parameter
  } = props;
  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const createDefinitionElement = type => {
    return createElement(type, {}, parameter, bpmnFactory);
  };
  const getValue = mapping => {
    return getInputOutputType(mapping);
  };
  const setValue = value => {
    let properties = {
      ...DEFAULT_PROPS$3
    };
    if (value === 'script') {
      properties.definition = createDefinitionElement('camunda:Script');
    } else if (value === 'list') {
      properties.definition = createDefinitionElement('camunda:List');
    } else if (value === 'map') {
      properties.definition = createDefinitionElement('camunda:Map');
    }
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: parameter,
      properties
    });
  };
  const getOptions = () => {
    const options = [{
      label: translate('List'),
      value: 'list'
    }, {
      label: translate('Map'),
      value: 'map'
    }, {
      label: translate('Script'),
      value: 'script'
    }, {
      label: translate('String or expression'),
      value: 'stringOrExpression'
    }];
    return options;
  };
  return propertiesPanel.SelectEntry({
    element: parameter,
    id: idPrefix + '-type',
    label: translate('Assignment type'),
    getValue,
    setValue,
    getOptions
  });
}
function StringOrExpression(props) {
  const {
    idPrefix,
    element,
    parameter
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: parameter,
      properties: {
        value
      }
    });
  };
  const getValue = parameter => {
    return parameter.get('value');
  };
  return propertiesPanel.TextAreaEntry({
    element: parameter,
    id: idPrefix + '-stringOrExpression',
    label: translate('Value'),
    description: translate('Start typing "${}" to create an expression.'),
    getValue,
    setValue,
    rows: 1,
    debounce
  });
}

// helper /////////////////////

function isInput(parameter) {
  return ModelUtil.is(parameter, 'camunda:InputParameter');
}

/**
 * Check whether an element is camunda:ServiceTaskLike
 *
 * @param {djs.model.Base} element
 *
 * @return {boolean} a boolean value
 */
function isServiceTaskLike(element) {
  return ModelUtil.is(element, 'camunda:ServiceTaskLike');
}

/**
 * Returns 'true' if the given element is 'camunda:DmnCapable'
 *
 * @param {djs.model.Base} element
 *
 * @return {boolean} a boolean value
 */
function isDmnCapable(element) {
  return ModelUtil.is(element, 'camunda:DmnCapable');
}

/**
 * Returns 'true' if the given element is 'camunda:ExternalCapable'
 *
 * @param {djs.model.Base} element
 *
 * @return {boolean} a boolean value
 */
function isExternalCapable(element) {
  return ModelUtil.is(element, 'camunda:ExternalCapable');
}

/**
 * getServiceTaskLikeBusinessObject - Get a 'camunda:ServiceTaskLike' business object.
 *
 * If the given element is not a 'camunda:ServiceTaskLike', then 'false'
 * is returned.
 *
 * @param {djs.model.Base} element
 * @return {ModdleElement} the 'camunda:ServiceTaskLike' business object
 */
function getServiceTaskLikeBusinessObject(element) {
  if (ModelUtil.is(element, 'bpmn:IntermediateThrowEvent') || ModelUtil.is(element, 'bpmn:EndEvent')) {
    // change business object to 'messageEventDefinition' when
    // the element is a message intermediate throw event or message end event
    // because the camunda extensions (e.g. camunda:class) are in the message
    // event definition tag and not in the intermediate throw event or end event tag
    const messageEventDefinition = getMessageEventDefinition(element);
    if (messageEventDefinition) {
      element = messageEventDefinition;
    }
  }
  return isServiceTaskLike(element) && ModelUtil.getBusinessObject(element);
}

/**
 * Returns the implementation type of the given element.
 *
 * Possible implementation types are:
 * - dmn
 * - connector
 * - external
 * - class
 * - expression
 * - delegateExpression
 * - script
 * - or undefined, when no matching implementation type is found
 *
 * @param  {djs.model.Base} element
 *
 * @return {String} the implementation type
 */
function getImplementationType(element) {
  const businessObject = getListenerBusinessObject(element) || getServiceTaskLikeBusinessObject(element);
  if (!businessObject) {
    return;
  }
  if (isDmnCapable(businessObject)) {
    const decisionRef = businessObject.get('camunda:decisionRef');
    if (typeof decisionRef !== 'undefined') {
      return 'dmn';
    }
  }
  if (isServiceTaskLike(businessObject)) {
    const connectors = getExtensionElementsList(businessObject, 'camunda:Connector');
    if (connectors.length) {
      return 'connector';
    }
  }
  if (isExternalCapable(businessObject)) {
    const type = businessObject.get('camunda:type');
    if (type === 'external') {
      return 'external';
    }
  }
  const cls = businessObject.get('camunda:class');
  if (typeof cls !== 'undefined') {
    return 'class';
  }
  const expression = businessObject.get('camunda:expression');
  if (typeof expression !== 'undefined') {
    return 'expression';
  }
  const delegateExpression = businessObject.get('camunda:delegateExpression');
  if (typeof delegateExpression !== 'undefined') {
    return 'delegateExpression';
  }
  const script = businessObject.get('script');
  if (typeof script !== 'undefined') {
    return 'script';
  }
}
function getListenerBusinessObject(businessObject) {
  if (ModelingUtil.isAny(businessObject, ['camunda:ExecutionListener', 'camunda:TaskListener'])) {
    return businessObject;
  }
}

function areConnectorsSupported(element) {
  const businessObject = getServiceTaskLikeBusinessObject(element);
  return businessObject && getImplementationType(businessObject) === 'connector';
}
function getConnectors$2(businessObject) {
  return getExtensionElementsList(businessObject, 'camunda:Connector');
}
function getConnector$1(element) {
  const businessObject = getServiceTaskLikeBusinessObject(element);
  const connectors = getConnectors$2(businessObject);
  return connectors[0];
}

function ConnectorInputProps(props) {
  const {
    element,
    injector
  } = props;
  if (!areConnectorsSupported(element)) {
    return null;
  }
  const connector = getConnector$1(element);
  const commandStack = injector.get('commandStack'),
    bpmnFactory = injector.get('bpmnFactory');
  const inputParameters = getInputParameters(connector) || [];
  const items = inputParameters.map((parameter, index) => {
    const id = element.id + '-connector-inputParameter-' + index;
    return {
      id,
      label: parameter.get('name') || '',
      entries: InputOutputParameter({
        element,
        idPrefix: id,
        parameter
      }),
      autoFocusEntry: id + '-name',
      remove: removeFactory$8({
        connector,
        element,
        parameter,
        commandStack
      })
    };
  });
  function add(event) {
    event.stopPropagation();
    const commands = [];

    // (1) ensure inputOutput
    let inputOutput = getInputOutput(connector);
    if (!inputOutput) {
      inputOutput = createElement('camunda:InputOutput', {
        inputParameters: [],
        outputParameters: []
      }, connector, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element: element,
          moddleElement: connector,
          properties: {
            inputOutput
          }
        }
      });
    }

    // (2) create + add parameter
    commands.push(CreateParameterCmd(element, 'camunda:InputParameter', inputOutput, bpmnFactory));

    // (3) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  }
  return {
    items,
    add
  };
}
function removeFactory$8(props) {
  const {
    commandStack,
    connector,
    element,
    parameter
  } = props;
  return function (event) {
    event.stopPropagation();
    const inputOutput = getInputOutput(connector);
    if (!inputOutput) {
      return;
    }
    commandStack.execute('element.updateModdleProperties', {
      element: element,
      moddleElement: inputOutput,
      properties: {
        inputParameters: minDash.without(inputOutput.get('inputParameters'), parameter)
      }
    });
  };
}

function ConnectorOutputProps(props) {
  const {
    element,
    injector
  } = props;
  if (!areConnectorsSupported(element)) {
    return null;
  }
  const connector = getConnector$1(element);
  const commandStack = injector.get('commandStack'),
    bpmnFactory = injector.get('bpmnFactory');
  const outputParameters = getOutputParameters(connector) || [];
  const items = outputParameters.map((parameter, index) => {
    const id = element.id + '-connector-outputParameter-' + index;
    return {
      id,
      label: parameter.get('name') || '',
      entries: InputOutputParameter({
        idPrefix: id,
        element,
        parameter
      }),
      autoFocusEntry: id + '-name',
      remove: removeFactory$7({
        connector,
        element,
        commandStack,
        parameter
      })
    };
  });
  function add(event) {
    event.stopPropagation();
    const commands = [];

    // (1) ensure inputOutput
    let inputOutput = getInputOutput(connector);
    if (!inputOutput) {
      inputOutput = createElement('camunda:InputOutput', {
        inputParameters: [],
        outputParameters: []
      }, connector, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element: element,
          moddleElement: connector,
          properties: {
            inputOutput
          }
        }
      });
    }

    // (2) create + add parameter
    commands.push(CreateParameterCmd(element, 'camunda:OutputParameter', inputOutput, bpmnFactory));

    // (3) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  }
  return {
    items,
    add
  };
}
function removeFactory$7(props) {
  const {
    commandStack,
    connector,
    element,
    parameter
  } = props;
  return function (event) {
    event.stopPropagation();
    const inputOutput = getInputOutput(connector);
    if (!inputOutput) {
      return;
    }
    commandStack.execute('element.updateModdleProperties', {
      element: element,
      moddleElement: inputOutput,
      properties: {
        outputParameters: minDash.without(inputOutput.get('outputParameters'), parameter)
      }
    });
  };
}

function ErrorProps(props) {
  const {
    element,
    entries
  } = props;
  if (!isErrorSupported(element)) {
    return entries;
  }
  const error = getError(element);

  // (1) errorMessage (error)
  if (error) {
    const idx = findPlaceToInsert(entries, 'errorCode');

    // place below errorCode
    entries.splice(idx, 0, {
      id: 'errorMessage',
      component: ErrorMessage$1,
      isEdited: propertiesPanel.isTextFieldEntryEdited
    });
  }
  if (!canHaveErrorVariables(element)) {
    return entries;
  }

  // (2) errorCodeVariable + errorMessageVariable (errorEventDefinition)
  entries.push({
    id: 'errorCodeVariable',
    component: ErrorCodeVariable,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  }, {
    id: 'errorMessageVariable',
    component: ErrorMessageVariable,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  });
  return entries;
}
function ErrorMessage$1(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const error = getError(element);
  const getValue = () => {
    return error.get('camunda:errorMessage');
  };
  const setValue = value => {
    return commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: error,
      properties: {
        'camunda:errorMessage': value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'errorMessage',
    label: translate('Message'),
    getValue,
    setValue,
    debounce
  });
}
function ErrorCodeVariable(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const errorEventDefinition = getErrorEventDefinition(element);
  const getValue = () => {
    return errorEventDefinition.get('camunda:errorCodeVariable');
  };
  const setValue = value => {
    return commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: errorEventDefinition,
      properties: {
        'camunda:errorCodeVariable': value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'errorCodeVariable',
    label: translate('Code variable'),
    description: translate('Define the name of the variable that will contain the error code.'),
    getValue,
    setValue,
    debounce
  });
}
function ErrorMessageVariable(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const errorEventDefinition = getErrorEventDefinition(element);
  const getValue = () => {
    return errorEventDefinition.get('camunda:errorMessageVariable');
  };
  const setValue = value => {
    return commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: errorEventDefinition,
      properties: {
        'camunda:errorMessageVariable': value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'errorMessageVariable',
    label: translate('Message variable'),
    description: translate('Define the name of the variable that will contain the error message.'),
    getValue,
    setValue,
    debounce
  });
}

// helper ///////////////////////

function canHaveErrorVariables(element) {
  return ModelUtil.is(element, 'bpmn:StartEvent') || ModelUtil.is(element, 'bpmn:BoundaryEvent');
}
function findPlaceToInsert(entries, idx) {
  const entryIndex = minDash.findIndex(entries, entry => entry.id === idx);
  return entryIndex >= 0 ? entryIndex + 1 : entries.length;
}

const EMPTY_OPTION = '';
const CREATE_NEW_OPTION = 'create-new';
function Error$1(props) {
  const {
    idPrefix,
    errorEventDefinition
  } = props;
  let entries = [{
    id: idPrefix + '-errorRef',
    component: ErrorRef,
    isEdited: propertiesPanel.isSelectEntryEdited,
    errorEventDefinition,
    idPrefix
  }];
  const error = errorEventDefinition.get('errorRef');
  if (error) {
    entries = [...entries, {
      id: idPrefix + '-errorName',
      component: ErrorName,
      isEdited: propertiesPanel.isTextFieldEntryEdited,
      error,
      errorEventDefinition,
      idPrefix
    }, {
      id: idPrefix + '-errorCode',
      component: ErrorCode,
      isEdited: propertiesPanel.isTextFieldEntryEdited,
      error,
      errorEventDefinition,
      idPrefix
    }, {
      id: idPrefix + '-errorMessage',
      component: ErrorMessage,
      isEdited: propertiesPanel.isTextFieldEntryEdited,
      error,
      errorEventDefinition,
      idPrefix
    }];
  }
  entries.push({
    id: idPrefix + '-expression',
    component: Expression$1,
    errorEventDefinition,
    idPrefix
  });
  return entries;
}
function ErrorRef(props) {
  const {
    element,
    errorEventDefinition,
    idPrefix
  } = props;
  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const businessObject = ModelUtil.getBusinessObject(element);
  const getValue = () => {
    const error = errorEventDefinition.get('errorRef');
    if (error) {
      return error.get('id');
    }
    return EMPTY_OPTION;
  };
  const setValue = value => {
    const root = getRoot(businessObject);
    const commands = [];
    let error;

    // (1) create new error
    if (value === CREATE_NEW_OPTION) {
      error = createElement('bpmn:Error', {
        name: nextId('Error_')
      }, root, bpmnFactory);
      value = error.get('id');
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: root,
          properties: {
            rootElements: [...root.get('rootElements'), error]
          }
        }
      });
    }

    // (2) update (or remove) errorRef
    error = error || findRootElementById(businessObject, 'bpmn:Error', value);
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: errorEventDefinition,
        properties: {
          errorRef: error
        }
      }
    });

    // (3) commit all updates
    return commandStack.execute('properties-panel.multi-command-executor', commands);
  };
  const getOptions = () => {
    let options = [{
      value: EMPTY_OPTION,
      label: translate('<none>')
    }, {
      value: CREATE_NEW_OPTION,
      label: translate('Create new ...')
    }];
    const errors = findRootElementsByType(ModelUtil.getBusinessObject(element), 'bpmn:Error');
    sortByName$1(errors).forEach(error => {
      options.push({
        value: error.get('id'),
        label: error.get('name') || error.get('id')
      });
    });
    return options;
  };
  return ReferenceSelectEntry({
    element,
    id: idPrefix + '-errorRef',
    label: translate('Global error reference'),
    autoFocusEntry: idPrefix + '-errorName',
    getValue,
    setValue,
    getOptions
  });
}
function ErrorName(props) {
  const {
    element,
    error,
    idPrefix
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return error.get('name');
  };
  const setValue = value => {
    return commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: error,
      properties: {
        name: value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: idPrefix + '-errorName',
    label: translate('Name'),
    getValue,
    setValue,
    debounce
  });
}
function ErrorCode(props) {
  const {
    element,
    error,
    idPrefix
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return error.get('errorCode');
  };
  const setValue = value => {
    return commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: error,
      properties: {
        errorCode: value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: idPrefix + '-errorCode',
    label: translate('Code'),
    getValue,
    setValue,
    debounce
  });
}
function ErrorMessage(props) {
  const {
    element,
    error,
    idPrefix
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return error.get('errorMessage');
  };
  const setValue = value => {
    return commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: error,
      properties: {
        errorMessage: value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: idPrefix + '-errorMessage',
    label: translate('Message'),
    getValue,
    setValue,
    debounce
  });
}
function Expression$1(props) {
  const {
    element,
    errorEventDefinition,
    idPrefix
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: errorEventDefinition,
      properties: {
        'camunda:expression': value
      }
    });
  };
  const getValue = () => {
    return errorEventDefinition.get('camunda:expression');
  };
  return propertiesPanel.TextFieldEntry({
    element: errorEventDefinition,
    id: idPrefix + '-expression',
    label: translate('Throw expression'),
    getValue,
    setValue,
    debounce
  });
}

// helpers //////////

function sortByName$1(elements) {
  return minDash.sortBy(elements, e => (e.name || '').toLowerCase());
}

function ErrorsProps({
  element,
  injector
}) {
  const businessObject = ModelUtil.getBusinessObject(element);
  if (!ModelUtil.is(element, 'bpmn:ServiceTask') || getImplementationType(element) !== 'external') {
    return null;
  }
  const errorEventDefinitions = getExtensionElementsList(businessObject, 'camunda:ErrorEventDefinition');
  const bpmnFactory = injector.get('bpmnFactory'),
    commandStack = injector.get('commandStack');
  const items = errorEventDefinitions.map((errorEventDefinition, index) => {
    const id = element.id + '-error-' + index;
    return {
      id,
      label: getErrorLabel(errorEventDefinition),
      entries: Error$1({
        idPrefix: id,
        element,
        errorEventDefinition
      }),
      autoFocusEntry: id + '-errorRef',
      remove: removeFactory$6({
        commandStack,
        element,
        errorEventDefinition
      })
    };
  });
  return {
    items,
    add: addFactory$5({
      bpmnFactory,
      commandStack,
      element
    }),
    shouldSort: false
  };
}
function removeFactory$6({
  commandStack,
  element,
  errorEventDefinition
}) {
  return function (event) {
    event.stopPropagation();
    const businessObject = ModelUtil.getBusinessObject(element);
    removeExtensionElements(element, businessObject, errorEventDefinition, commandStack);
  };
}
function addFactory$5({
  bpmnFactory,
  commandStack,
  element
}) {
  return function (event) {
    event.stopPropagation();
    const businessObject = ModelUtil.getBusinessObject(element);
    const error = createElement('camunda:ErrorEventDefinition', {}, undefined, bpmnFactory);
    addExtensionElements(element, businessObject, error, bpmnFactory, commandStack);
  };
}

// helpers //////////

function getErrorLabel(errorEventDefinition) {
  const error = errorEventDefinition.get('errorRef');
  if (!error) {
    return '<no reference>';
  }
  const errorCode = error.get('errorCode'),
    name = error.get('name') || '<unnamed>';
  if (errorCode) {
    return `${name} (code = ${errorCode})`;
  }
  return name;
}

/**
 * @typedef { import('@bpmn-io/properties-panel').EntryDefinition } Entry
 */

/**
 * @returns {Array<Entry>} entries
 */
function EscalationProps(props) {
  const {
    element,
    entries
  } = props;
  if (!(isEscalationSupported(element) && canHaveEscalationVariables(element))) {
    return entries;
  }
  entries.push({
    id: 'escalationCodeVariable',
    component: EscalationCodeVariable,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  });
  return entries;
}
function EscalationCodeVariable(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const escalationEventDefinition = getEscalationEventDefinition(element);
  const getValue = () => {
    return escalationEventDefinition.get('camunda:escalationCodeVariable');
  };
  const setValue = value => {
    return commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: escalationEventDefinition,
      properties: {
        'camunda:escalationCodeVariable': value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'escalationCodeVariable',
    label: translate('Code variable'),
    description: translate('Define the name of the variable that will contain the escalation code.'),
    getValue,
    setValue,
    debounce
  });
}

// helper ///////////////////////

function canHaveEscalationVariables(element) {
  return ModelUtil.is(element, 'bpmn:StartEvent') || ModelUtil.is(element, 'bpmn:BoundaryEvent');
}

function ExternalTaskPriorityProps(props) {
  const {
    element
  } = props;
  const businessObject = ModelUtil.getBusinessObject(element);
  if (!ModelUtil.is(element, 'bpmn:Process') && !(ModelUtil.is(element, 'bpmn:Participant') && businessObject.get('processRef')) && !isExternalTaskLike(element)) {
    return [];
  }
  return [{
    id: 'externalTaskPriority',
    component: ExternalTaskPriority,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  }];
}
function ExternalTaskPriority(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack'),
    translate = useService('translate'),
    debounce = useService('debounceInput');
  let businessObject;
  if (ModelUtil.is(element, 'bpmn:Participant')) {
    businessObject = ModelUtil.getBusinessObject(element).get('processRef');
  } else if (isExternalTaskLike(element)) {
    businessObject = getServiceTaskLikeBusinessObject(element);
  } else {
    businessObject = ModelUtil.getBusinessObject(element);
  }
  const getValue = () => {
    return businessObject.get('camunda:taskPriority');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:taskPriority': value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'externalTaskPriority',
    label: translate('Priority'),
    getValue,
    setValue,
    debounce
  });
}

// helper //////////////////

function isExternalTaskLike(element) {
  const bo = getServiceTaskLikeBusinessObject(element),
    type = bo && bo.get('camunda:type');
  return ModelUtil.is(bo, 'camunda:ServiceTaskLike') && type && type === 'external';
}

const DEFAULT_PROPS$2 = {
  'stringValue': undefined,
  'string': undefined,
  'expression': undefined
};
function FieldInjection(props) {
  const {
    element,
    idPrefix,
    field
  } = props;
  const entries = [{
    id: idPrefix + '-name',
    component: NameProperty,
    field,
    idPrefix,
    element
  }, {
    id: idPrefix + '-type',
    component: TypeProperty,
    field,
    idPrefix,
    element
  }, {
    id: idPrefix + '-value',
    component: ValueProperty,
    field,
    idPrefix,
    element
  }];
  return entries;
}
function NameProperty(props) {
  const {
    idPrefix,
    element,
    field
  } = props;
  const commandStack = useService('commandStack'),
    translate = useService('translate'),
    debounce = useService('debounceInput');
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: field,
      properties: {
        name: value
      }
    });
  };
  const getValue = field => {
    return field.name;
  };
  return propertiesPanel.TextFieldEntry({
    element: field,
    id: idPrefix + '-name',
    label: translate('Name'),
    getValue,
    setValue,
    debounce
  });
}
function TypeProperty(props) {
  const {
    idPrefix,
    element,
    field
  } = props;
  const commandStack = useService('commandStack'),
    translate = useService('translate');
  const getValue = field => {
    return determineType(field);
  };
  const setValue = value => {
    const properties = Object.assign({}, DEFAULT_PROPS$2);
    properties[value] = '';
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: field,
      properties
    });
  };
  const getOptions = element => {
    const options = [{
      value: 'string',
      label: translate('String')
    }, {
      value: 'expression',
      label: translate('Expression')
    }];
    return options;
  };
  return propertiesPanel.SelectEntry({
    element: field,
    id: idPrefix + '-type',
    label: translate('Type'),
    getValue,
    setValue,
    getOptions
  });
}
function ValueProperty(props) {
  const {
    idPrefix,
    element,
    field
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const setValue = value => {
    // (1) determine which type we have set
    const type = determineType(field);

    // (2) set property accordingly
    const properties = Object.assign({}, DEFAULT_PROPS$2);
    properties[type] = value || '';

    // (3) execute the update command
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: field,
      properties
    });
  };
  const getValue = field => {
    return field.string || field.stringValue || field.expression;
  };
  return propertiesPanel.TextFieldEntry({
    element: field,
    id: idPrefix + '-value',
    label: translate('Value'),
    getValue,
    setValue,
    debounce
  });
}

// helper ///////////////////

/**
 * determineType - get the type of a fieldInjection based on the attributes
 * set on it
 *
 * @param  {ModdleElement} field
 * @return {('string'|'expression')}
 */
function determineType(field) {
  // string is the default type
  return 'string' in field && 'string' || 'expression' in field && 'expression' || 'stringValue' in field && 'string' || 'string';
}

function FieldInjectionProps({
  element,
  injector
}) {
  const businessObject = getServiceTaskLikeBusinessObject(element);
  if (!businessObject) {
    return null;
  }
  const fieldInjections = getExtensionElementsList(businessObject, 'camunda:Field');
  const bpmnFactory = injector.get('bpmnFactory'),
    commandStack = injector.get('commandStack');
  const items = fieldInjections.map((field, index) => {
    const id = element.id + '-fieldInjection-' + index;
    return {
      id,
      label: getFieldLabel(field),
      entries: FieldInjection({
        idPrefix: id,
        element,
        field
      }),
      autoFocusEntry: id + '-name',
      remove: removeFactory$5({
        commandStack,
        element,
        field
      })
    };
  });
  return {
    items,
    add: addFactory$4({
      bpmnFactory,
      commandStack,
      element
    })
  };
}
function removeFactory$5({
  commandStack,
  element,
  field
}) {
  return function (event) {
    event.stopPropagation();
    const businessObject = getServiceTaskLikeBusinessObject(element);
    removeExtensionElements(element, businessObject, field, commandStack);
  };
}
function addFactory$4({
  bpmnFactory,
  commandStack,
  element
}) {
  return function (event) {
    event.stopPropagation();
    const businessObject = getServiceTaskLikeBusinessObject(element);
    const fieldInjection = createElement('camunda:Field', {
      name: undefined,
      string: '',
      // string is the default type
      stringValue: undefined
    }, null, bpmnFactory);
    addExtensionElements(element, businessObject, fieldInjection, bpmnFactory, commandStack);
  };
}

// helper ///////////////

function getFieldLabel(field) {
  return field.name || '<empty>';
}

function FormFieldConstraint(props) {
  const {
    constraint,
    element,
    idPrefix
  } = props;
  const entries = [{
    id: idPrefix + '-name',
    component: Name$1,
    constraint,
    idPrefix,
    element
  }, {
    id: idPrefix + '-config',
    component: Config,
    constraint,
    idPrefix,
    element
  }];
  return entries;
}
function Name$1(props) {
  const {
    idPrefix,
    element,
    constraint
  } = props;
  const commandStack = useService('commandStack'),
    translate = useService('translate'),
    debounce = useService('debounceInput');
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: constraint,
      properties: {
        name: value
      }
    });
  };
  const getValue = () => {
    return constraint.name;
  };
  return propertiesPanel.TextFieldEntry({
    element: constraint,
    id: idPrefix + '-name',
    label: translate('Name'),
    getValue,
    setValue,
    debounce
  });
}
function Config(props) {
  const {
    idPrefix,
    element,
    constraint
  } = props;
  const commandStack = useService('commandStack'),
    translate = useService('translate'),
    debounce = useService('debounceInput');
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: constraint,
      properties: {
        config: value
      }
    });
  };
  const getValue = () => {
    return constraint.config;
  };
  return propertiesPanel.TextFieldEntry({
    element: constraint,
    id: idPrefix + '-config',
    label: translate('Config'),
    getValue,
    setValue,
    debounce
  });
}

function FormFieldProperty(props) {
  const {
    element,
    idPrefix,
    property
  } = props;
  const entries = [{
    id: idPrefix + '-id',
    component: Id$2,
    idPrefix,
    property,
    element
  }, {
    id: idPrefix + '-value',
    component: Value$1,
    idPrefix,
    property,
    element
  }];
  return entries;
}
function Id$2(props) {
  const {
    idPrefix,
    element,
    property
  } = props;
  const commandStack = useService('commandStack'),
    translate = useService('translate'),
    debounce = useService('debounceInput');
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: property,
      properties: {
        id: value
      }
    });
  };
  const getValue = () => {
    return property.id;
  };
  return propertiesPanel.TextFieldEntry({
    element: property,
    id: idPrefix + '-id',
    label: translate('ID'),
    getValue,
    setValue,
    debounce
  });
}
function Value$1(props) {
  const {
    idPrefix,
    element,
    property
  } = props;
  const commandStack = useService('commandStack'),
    translate = useService('translate'),
    debounce = useService('debounceInput');
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: property,
      properties: {
        value
      }
    });
  };
  const getValue = () => {
    return property.value;
  };
  return propertiesPanel.TextFieldEntry({
    element: property,
    id: idPrefix + '-value',
    label: translate('Value'),
    getValue,
    setValue,
    debounce
  });
}

function FormFieldValue(props) {
  const {
    element,
    idPrefix,
    value
  } = props;
  const entries = [{
    id: idPrefix + '-id',
    component: Id$1,
    idPrefix,
    value,
    element
  }, {
    id: idPrefix + '-name',
    component: Name,
    idPrefix,
    value,
    element
  }];
  return entries;
}
function Id$1(props) {
  const {
    idPrefix,
    element,
    value
  } = props;
  const commandStack = useService('commandStack'),
    translate = useService('translate'),
    debounce = useService('debounceInput');
  const setValue = val => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: value,
      properties: {
        id: val
      }
    });
  };
  const getValue = () => {
    return value.id;
  };
  return propertiesPanel.TextFieldEntry({
    element: value,
    id: idPrefix + '-id',
    label: translate('ID'),
    getValue,
    setValue,
    debounce
  });
}
function Name(props) {
  const {
    idPrefix,
    element,
    value
  } = props;
  const commandStack = useService('commandStack'),
    translate = useService('translate'),
    debounce = useService('debounceInput');
  const setValue = val => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: value,
      properties: {
        name: val
      }
    });
  };
  const getValue = () => {
    return value.name;
  };
  return propertiesPanel.TextFieldEntry({
    element: value,
    id: idPrefix + '-name',
    label: translate('Name'),
    getValue,
    setValue,
    debounce
  });
}

const CUSTOM_TYPE_VALUE = '',
  DEFINED_TYPE_VALUES = ['boolean', 'date', 'enum', 'long', 'string', undefined];
function FormField(props) {
  const {
    idPrefix,
    formField
  } = props;
  const entries = [{
    id: idPrefix + '-formFieldID',
    component: Id,
    idPrefix,
    formField
  }, {
    id: idPrefix + '-formFieldLabel',
    component: Label,
    idPrefix,
    formField
  }, {
    id: idPrefix + '-formFieldType',
    component: Type$1,
    idPrefix,
    formField
  }];
  if (!DEFINED_TYPE_VALUES.includes(formField.get('type'))) {
    entries.push({
      id: idPrefix + '-formFieldCustomType',
      component: CustomType,
      idPrefix,
      formField
    });
  }
  entries.push({
    id: idPrefix + '-formFieldDefaultValue',
    component: DefaultValue,
    idPrefix,
    formField
  });
  if (formField.get('type') === 'enum') {
    entries.push({
      id: idPrefix + '-formFieldValues',
      component: ValueList,
      formField,
      idPrefix
    });
  }
  entries.push({
    id: idPrefix + '-formFieldConstraints',
    component: ConstraintList,
    formField,
    idPrefix
  }, {
    id: idPrefix + '-formFieldProperties',
    component: PropertiesList,
    formField,
    idPrefix
  });
  return entries;
}
function Id(props) {
  const {
    idPrefix,
    element,
    formField
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: formField,
      properties: {
        id: value
      }
    });
  };
  const getValue = () => {
    return formField.get('id');
  };
  return propertiesPanel.TextFieldEntry({
    element: formField,
    id: idPrefix + '-formFieldID',
    label: translate('ID'),
    description: translate('Refers to the process variable name'),
    getValue,
    setValue,
    debounce
  });
}
function Label(props) {
  const {
    idPrefix,
    element,
    formField
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: formField,
      properties: {
        label: value
      }
    });
  };
  const getValue = () => {
    return formField.get('label');
  };
  return propertiesPanel.TextFieldEntry({
    element: formField,
    id: idPrefix + '-formFieldLabel',
    label: translate('Label'),
    getValue,
    setValue,
    debounce
  });
}
function Type$1(props) {
  const {
    idPrefix,
    element,
    formField
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: formField,
      properties: {
        type: value
      }
    });
  };
  const getValue = () => {
    const type = formField.get('type');
    return DEFINED_TYPE_VALUES.includes(type) ? type : CUSTOM_TYPE_VALUE;
  };
  const getOptions = () => {
    const options = [{
      label: translate('boolean'),
      value: 'boolean'
    }, {
      label: translate('date'),
      value: 'date'
    }, {
      label: translate('enum'),
      value: 'enum'
    }, {
      label: translate('long'),
      value: 'long'
    }, {
      label: translate('string'),
      value: 'string'
    }, {
      label: translate('<custom type>'),
      value: CUSTOM_TYPE_VALUE
    }];

    // for the initial state only, we want to show an empty state
    if (formField.get('type') === undefined) {
      options.unshift({
        label: translate('<none>'),
        value: ''
      });
    }
    return options;
  };
  return propertiesPanel.SelectEntry({
    element: formField,
    id: idPrefix + '-formFieldType',
    label: translate('Type'),
    getValue,
    setValue,
    getOptions
  });
}
function CustomType(props) {
  const {
    idPrefix,
    element,
    formField
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const setValue = value => {
    const type = value || '';
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: formField,
      properties: {
        type
      }
    });
  };
  const getValue = () => {
    return formField.get('type');
  };
  return propertiesPanel.TextFieldEntry({
    element: formField,
    id: idPrefix + '-formFieldCustomType',
    label: translate('Custom type'),
    getValue,
    setValue,
    debounce
  });
}
function DefaultValue(props) {
  const {
    idPrefix,
    element,
    formField
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: formField,
      properties: {
        defaultValue: value
      }
    });
  };
  const getValue = () => {
    return formField.get('defaultValue');
  };
  return propertiesPanel.TextFieldEntry({
    element: formField,
    id: idPrefix + '-formFieldDefaultValue',
    label: translate('Default value'),
    getValue,
    setValue,
    debounce
  });
}
function Value(props) {
  const {
    element,
    id: idPrefix,
    index,
    item: value,
    open
  } = props;
  const translate = useService('translate');
  const id = `${idPrefix}-value-${index}`;
  return jsxRuntime.jsx(propertiesPanel.CollapsibleEntry, {
    id: id,
    element: element,
    entries: FormFieldValue({
      idPrefix: id,
      element,
      value
    }),
    label: value.get('id') || translate('<empty>'),
    open: open
  });
}
function ValueList(props) {
  const {
    element,
    formField,
    idPrefix
  } = props;
  const id = `${idPrefix}-formFieldValues`;
  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const values = formField.get('values') || [];
  function addValue() {
    const value = createElement('camunda:Value', {
      id: undefined,
      name: undefined
    }, formField, bpmnFactory);
    commandStack.execute('element.updateModdleProperties', {
      element: element,
      moddleElement: formField,
      properties: {
        values: [...formField.get('values'), value]
      }
    });
  }
  function removeValue(value) {
    commandStack.execute('element.updateModdleProperties', {
      element: element,
      moddleElement: formField,
      properties: {
        values: minDash.without(formField.get('values'), value)
      }
    });
  }
  return jsxRuntime.jsx(propertiesPanel.ListEntry, {
    element: element,
    autoFocusEntry: `[data-entry-id="${id}-value-${values.length - 1}"] input`,
    id: id,
    label: translate('Values'),
    items: values,
    component: Value,
    onAdd: addValue,
    onRemove: removeValue
  });
}
function Constraint(props) {
  const {
    element,
    id: idPrefix,
    index,
    item: constraint,
    open
  } = props;
  const translate = useService('translate');
  const id = `${idPrefix}-constraint-${index}`;
  return jsxRuntime.jsx(propertiesPanel.CollapsibleEntry, {
    id: id,
    element: element,
    entries: FormFieldConstraint({
      constraint,
      element,
      idPrefix: id
    }),
    label: constraint.get('name') || translate('<empty>'),
    open: open
  });
}
function ConstraintList(props) {
  const {
    element,
    formField,
    idPrefix
  } = props;
  const id = `${idPrefix}-formFieldConstraints`;
  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const businessObject = ModelUtil.getBusinessObject(element);
  let validation = formField.get('validation');
  const constraints = validation && validation.get('constraints') || [];
  function addConstraint() {
    const commands = [];

    // (1) ensure validation
    if (!validation) {
      validation = createElement('camunda:Validation', {}, businessObject, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: formField,
          properties: {
            validation
          }
        }
      });
    }

    // (2) add constraint
    const constraint = createElement('camunda:Constraint', {
      name: undefined,
      config: undefined
    }, validation, bpmnFactory);
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: validation,
        properties: {
          constraints: [...validation.get('constraints'), constraint]
        }
      }
    });

    // (3) commit updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  }
  function removeConstraint(constraint) {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: validation,
      properties: {
        constraints: minDash.without(validation.get('constraints'), constraint)
      }
    });
  }
  return jsxRuntime.jsx(propertiesPanel.ListEntry, {
    element: element,
    autoFocusEntry: `[data-entry-id="${id}-constraint-${constraints.length - 1}"] input`,
    id: id,
    label: translate('Constraints'),
    items: constraints,
    component: Constraint,
    onAdd: addConstraint,
    onRemove: removeConstraint
  });
}
function Property(props) {
  const {
    element,
    id: idPrefix,
    index,
    item: property,
    open
  } = props;
  const translate = useService('translate');
  const id = `${idPrefix}-property-${index}`;
  return jsxRuntime.jsx(propertiesPanel.CollapsibleEntry, {
    id: id,
    element: element,
    entries: FormFieldProperty({
      element,
      idPrefix: id,
      property
    }),
    label: property.get('id') || translate('<empty>'),
    open: open
  });
}
function PropertiesList(props) {
  const {
    element,
    formField,
    idPrefix
  } = props;
  const id = `${idPrefix}-formFieldProperties`;
  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const businessObject = ModelUtil.getBusinessObject(element);
  let properties = formField.get('properties');
  const propertyEntries = properties && properties.get('values') || [];
  function addProperty() {
    const commands = [];

    // (1) ensure properties
    if (!properties) {
      properties = createElement('camunda:Properties', {}, businessObject, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: formField,
          properties: {
            properties
          }
        }
      });
    }

    // (2) add property
    const property = createElement('camunda:Property', {
      id: undefined,
      value: undefined
    }, properties, bpmnFactory);
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: properties,
        properties: {
          values: [...properties.get('values'), property]
        }
      }
    });

    // (3) commit updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  }
  function removeProperty(property) {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: properties,
      properties: {
        values: minDash.without(properties.get('values'), property)
      }
    });
  }
  return jsxRuntime.jsx(propertiesPanel.ListEntry, {
    element: element,
    autoFocusEntry: true,
    id: id,
    compareFn: createAlphanumericCompare('id'),
    label: translate('Properties'),
    items: propertyEntries,
    component: Property,
    onAdd: addProperty,
    onRemove: removeProperty
  });
}

// helper //////////////////

function createAlphanumericCompare(field) {
  return function (entry, anotherEntry) {
    const [key = '', anotherKey = ''] = [entry[field], anotherEntry[field]];
    return key === anotherKey ? 0 : key > anotherKey ? 1 : -1;
  };
}

function FormDataProps({
  element,
  injector
}) {
  if (!isFormDataSupported(element)) {
    return;
  }
  const formFields = getFormFieldsList(element) || [];
  const bpmnFactory = injector.get('bpmnFactory'),
    commandStack = injector.get('commandStack');
  const items = formFields.map((formField, index) => {
    const id = element.id + '-formField-' + index;
    return {
      id,
      label: formField.get('id') || '',
      entries: FormField({
        idPrefix: id,
        element,
        formField
      }),
      autoFocusEntry: id + '-formFieldID',
      remove: removeFactory$4({
        commandStack,
        element,
        formField
      })
    };
  });
  return {
    items,
    add: addFactory$3({
      bpmnFactory,
      commandStack,
      element
    }),
    shouldSort: false
  };
}
function addFactory$3({
  bpmnFactory,
  commandStack,
  element
}) {
  return function (event) {
    event.stopPropagation();
    const commands = [];

    // (1) get camunda:FormData
    const formData = getFormData$1(element);

    // (2) create camunda:FormField
    const formField = createElement('camunda:FormField', {}, formData, bpmnFactory);

    // (3) add formField to list
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: formData,
        properties: {
          fields: [...formData.get('fields'), formField]
        }
      }
    });

    // (4) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
}
function removeFactory$4({
  commandStack,
  element,
  formField
}) {
  return function (event) {
    event.stopPropagation();
    const formData = getFormData$1(element),
      formFields = getFormFieldsList(element);
    if (!formFields || !formFields.length) {
      return;
    }
    const fields = minDash.without(formData.get('fields'), formField);

    // update formData
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: formData,
      properties: {
        fields
      }
    });
  };
}

// helper ///////////////////////////////

function isFormDataSupported(element) {
  const formData = getFormData$1(element);
  return (ModelUtil.is(element, 'bpmn:StartEvent') && !ModelUtil.is(element.parent, 'bpmn:SubProcess') || ModelUtil.is(element, 'bpmn:UserTask')) && formData;
}
function getFormData$1(element) {
  const bo = ModelUtil.getBusinessObject(element);
  return getExtensionElementsList(bo, 'camunda:FormData')[0];
}
function getFormFieldsList(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  const formData = getFormData$1(businessObject);
  return formData && formData.fields;
}

const FORM_KEY_PROPS = {
  'camunda:formRef': undefined,
  'camunda:formRefBinding': undefined,
  'camunda:formRefVersion': undefined
};
const FORM_REF_PROPS = {
  'camunda:formKey': undefined
};
function FormTypeProps(props) {
  return [{
    id: 'formType',
    component: FormType,
    isEdited: propertiesPanel.isSelectEntryEdited
  }];
}
function FormType(props) {
  const {
    element
  } = props;
  const translate = useService('translate');
  const bpmnFactory = useService('bpmnFactory');
  const businessObject = ModelUtil.getBusinessObject(element);
  const commandStack = useService('commandStack');
  let extensionElements = businessObject.get('extensionElements');
  const getValue = () => {
    if (minDash.isDefined(businessObject.get('camunda:formKey'))) {
      return 'formKey';
    } else if (minDash.isDefined(businessObject.get('camunda:formRef'))) {
      return 'formRef';
    } else if (getFormData(element)) {
      return 'formData';
    }
    return '';
  };
  const setValue = value => {
    const commands = removePropertiesCommands(element);
    if (value === 'formData') {
      // (1) ensure extension elements
      if (!extensionElements) {
        extensionElements = createElement('bpmn:ExtensionElements', {
          values: []
        }, businessObject, bpmnFactory);
        commands.push({
          cmd: 'element.updateModdleProperties',
          context: {
            element,
            moddleElement: businessObject,
            properties: {
              extensionElements
            }
          }
        });
      }

      // (2) create camunda:FormData
      const parent = extensionElements;
      const formData = createElement('camunda:FormData', {
        fields: []
      }, parent, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [...extensionElements.get('values'), formData]
          }
        }
      });
    } else if (value === 'formKey') {
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
          properties: {
            'camunda:formKey': ''
          }
        }
      });
    } else if (value === 'formRef') {
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
          properties: {
            'camunda:formRef': ''
          }
        }
      });
    }
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
  const getOptions = () => {
    return [{
      value: '',
      label: translate('<none>')
    }, {
      value: 'formRef',
      label: translate('Camunda Forms')
    }, {
      value: 'formKey',
      label: translate('Embedded or External Task Forms')
    }, {
      value: 'formData',
      label: translate('Generated Task Forms')
    }];
  };
  return propertiesPanel.SelectEntry({
    element,
    id: 'formType',
    label: translate('Type'),
    getValue,
    setValue,
    getOptions
  });
}
function getFormData(element) {
  const bo = ModelUtil.getBusinessObject(element);
  return getExtensionElementsList(bo, 'camunda:FormData')[0];
}
function removePropertiesCommands(element, commandStack) {
  const businessObject = ModelUtil.getBusinessObject(element);
  const extensionElements = businessObject.get('extensionElements');
  const commands = [];

  // (1) reset formKey and formRef
  commands.push({
    cmd: 'element.updateModdleProperties',
    context: {
      element,
      moddleElement: businessObject,
      properties: {
        ...FORM_KEY_PROPS,
        ...FORM_REF_PROPS
      }
    }
  });

  // (2) remove formData if defined
  if (extensionElements && getFormData(element)) {
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: extensionElements,
        properties: {
          values: minDash.without(extensionElements.get('values'), getFormData(element))
        }
      }
    });
  }
  return commands;
}

function getFormRefBinding(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  return businessObject.get('camunda:formRefBinding') || 'latest';
}
function getFormType(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  if (minDash.isDefined(businessObject.get('camunda:formKey'))) {
    return 'formKey';
  } else if (minDash.isDefined(businessObject.get('camunda:formRef'))) {
    return 'formRef';
  }
}
function isFormSupported(element) {
  return ModelUtil.is(element, 'bpmn:StartEvent') && !ModelUtil.is(element.parent, 'bpmn:SubProcess') || ModelUtil.is(element, 'bpmn:UserTask');
}

function FormProps(props) {
  const {
    element
  } = props;
  if (!isFormSupported(element)) {
    return [];
  }
  const formType = getFormType(element),
    bindingType = getFormRefBinding(element);

  // (1) display form type select
  const entries = [...FormTypeProps()];

  // (2) display form properties based on type
  if (formType === 'formKey') {
    entries.push({
      id: 'formKey',
      component: FormKey,
      isEdited: propertiesPanel.isTextFieldEntryEdited
    });
  } else if (formType === 'formRef') {
    entries.push({
      id: 'formRef',
      component: FormRef,
      isEdited: propertiesPanel.isTextFieldEntryEdited
    }, {
      id: 'formRefBinding',
      component: Binding$1,
      isEdited: propertiesPanel.isSelectEntryEdited
    });
    if (bindingType === 'version') {
      entries.push({
        id: 'formRefVersion',
        component: Version$1,
        isEdited: propertiesPanel.isTextFieldEntryEdited
      });
    }
  }
  return entries;
}
function FormKey(props) {
  const {
    element
  } = props;
  const debounce = useService('debounceInput');
  const modeling = useService('modeling');
  const translate = useService('translate');
  const businessObject = ModelUtil.getBusinessObject(element);
  const getValue = () => {
    return businessObject.get('camunda:formKey');
  };
  const setValue = value => {
    modeling.updateProperties(element, {
      'camunda:formKey': minDash.isUndefined(value) ? '' : value
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'formKey',
    label: translate('Form key'),
    getValue,
    setValue,
    debounce
  });
}
function FormRef(props) {
  const {
    element
  } = props;
  const debounce = useService('debounceInput');
  const modeling = useService('modeling');
  const translate = useService('translate');
  const businessObject = ModelUtil.getBusinessObject(element);
  const getValue = () => {
    return businessObject.get('camunda:formRef');
  };
  const setValue = value => {
    modeling.updateProperties(element, {
      'camunda:formRef': minDash.isUndefined(value) ? '' : value
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'formRef',
    label: translate('Form reference'),
    getValue,
    setValue,
    debounce
  });
}
function Binding$1(props) {
  const {
    element
  } = props;
  const modeling = useService('modeling');
  const translate = useService('translate');
  const getValue = () => {
    return getFormRefBinding(element);
  };
  const setValue = value => {
    modeling.updateProperties(element, {
      'camunda:formRefBinding': value
    });
  };

  // Note: default is "latest",
  // cf. https://docs.camunda.org/manual/develop/reference/bpmn20/custom-extensions/extension-attributes/#formrefbinding
  const getOptions = () => {
    const options = [{
      value: 'deployment',
      label: translate('deployment')
    }, {
      value: 'latest',
      label: translate('latest')
    }, {
      value: 'version',
      label: translate('version')
    }];
    return options;
  };
  return propertiesPanel.SelectEntry({
    element,
    id: 'formRefBinding',
    label: translate('Binding'),
    getValue,
    setValue,
    getOptions
  });
}
function Version$1(props) {
  const {
    element
  } = props;
  const debounce = useService('debounceInput');
  const modeling = useService('modeling');
  const translate = useService('translate');
  const businessObject = ModelUtil.getBusinessObject(element);
  const getValue = () => {
    return businessObject.get('camunda:formRefVersion');
  };
  const setValue = value => {
    modeling.updateProperties(element, {
      'camunda:formRefVersion': value
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'formRefVersion',
    label: translate('Version'),
    getValue,
    setValue,
    debounce
  });
}

function HistoryCleanupProps(props) {
  const {
    element
  } = props;
  const businessObject = ModelUtil.getBusinessObject(element);
  if (!ModelUtil.is(element, 'bpmn:Process') && !(ModelUtil.is(element, 'bpmn:Participant') && businessObject.get('processRef'))) {
    return [];
  }
  return [{
    id: 'historyTimeToLive',
    component: HistoryTimeToLive,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  }];
}
function HistoryTimeToLive(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const process = getProcess$2(element);
  const getValue = () => {
    return process.get('camunda:historyTimeToLive') || '';
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: process,
      properties: {
        'camunda:historyTimeToLive': value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'historyTimeToLive',
    label: translate('Time to live'),
    getValue,
    setValue,
    debounce
  });
}

// helper //////////////////

function getProcess$2(element) {
  return ModelUtil.is(element, 'bpmn:Process') ? ModelUtil.getBusinessObject(element) : ModelUtil.getBusinessObject(element).get('processRef');
}

function DmnImplementationProps(props) {
  const {
    element
  } = props;
  const entries = [];
  const implementationType = getImplementationType(element);
  const bindingType = getDecisionRefBinding(element);
  if (implementationType !== 'dmn') {
    return entries;
  }

  // (1) decisionRef
  entries.push({
    id: 'decisionRef',
    component: DecisionRef,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  });

  // (2) binding
  entries.push({
    id: 'decisionRefBinding',
    component: Binding,
    isEdited: propertiesPanel.isSelectEntryEdited
  });

  // (3) version
  if (bindingType === 'version') {
    entries.push({
      id: 'decisionRefVersion',
      component: Version,
      isEdited: propertiesPanel.isTextFieldEntryEdited
    });
  }

  // (4) versionTag
  if (bindingType === 'versionTag') {
    entries.push({
      id: 'decisionRefVersionTag',
      component: VersionTag$1,
      isEdited: propertiesPanel.isTextFieldEntryEdited
    });
  }

  // (5) tenantId
  entries.push({
    id: 'decisionRefTenantId',
    component: TenantId,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  });

  // (6) resultVariable
  entries.push({
    id: 'decisionRefResultVariable',
    component: ResultVariable$2,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  });

  // (7) mapDecisionResult
  if (getResultVariable(element)) {
    entries.push({
      id: 'mapDecisionResult',
      component: MapDecisionResult,
      isEdited: propertiesPanel.isSelectEntryEdited
    });
  }
  return entries;
}
function DecisionRef(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const businessObject = ModelUtil.getBusinessObject(element);
  const getValue = () => {
    return businessObject.get('camunda:decisionRef');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:decisionRef': value || ''
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'decisionRef',
    label: translate('Decision reference'),
    getValue,
    setValue,
    debounce
  });
}
function Binding(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const getValue = () => {
    return getDecisionRefBinding(element);
  };
  const setValue = value => {
    const businessObject = ModelUtil.getBusinessObject(element);

    // reset version properties on binding type change
    const updatedProperties = {
      'camunda:decisionRefVersion': undefined,
      'camunda:decisionRefVersionTag': undefined,
      'camunda:decisionRefBinding': value
    };
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: updatedProperties
    });
  };

  // Note: default is "latest",
  // cf. https://docs.camunda.org/manual/latest/reference/bpmn20/custom-extensions/extension-attributes/#decisionrefbinding
  const getOptions = () => {
    const options = [{
      value: 'deployment',
      label: translate('deployment')
    }, {
      value: 'latest',
      label: translate('latest')
    }, {
      value: 'version',
      label: translate('version')
    }, {
      value: 'versionTag',
      label: translate('versionTag')
    }];
    return options;
  };
  return propertiesPanel.SelectEntry({
    element,
    id: 'decisionRefBinding',
    label: translate('Binding'),
    getValue,
    setValue,
    getOptions
  });
}
function Version(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const businessObject = ModelUtil.getBusinessObject(element);
  const getValue = () => {
    return businessObject.get('camunda:decisionRefVersion');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:decisionRefVersion': value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'decisionRefVersion',
    label: translate('Version'),
    getValue,
    setValue,
    debounce
  });
}
function VersionTag$1(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const businessObject = ModelUtil.getBusinessObject(element);
  const getValue = () => {
    return businessObject.get('camunda:decisionRefVersionTag');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:decisionRefVersionTag': value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'decisionRefVersionTag',
    label: translate('Version tag'),
    getValue,
    setValue,
    debounce
  });
}
function TenantId(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const businessObject = ModelUtil.getBusinessObject(element);
  const getValue = () => {
    return businessObject.get('camunda:decisionRefTenantId');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:decisionRefTenantId': value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'decisionRefTenantId',
    label: translate('Tenant ID'),
    getValue,
    setValue,
    debounce
  });
}
function ResultVariable$2(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const businessObject = ModelUtil.getBusinessObject(element);
  const getValue = () => {
    return getResultVariable(businessObject);
  };

  // Note: camunda:mapDecisionResult got cleaned up in modeling behavior
  // cf. https://github.com/camunda/camunda-bpmn-js/blob/main/lib/camunda-platform/features/modeling/behavior/UpdateResultVariableBehavior.js
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:resultVariable': value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'decisionRefResultVariable',
    label: translate('Result variable'),
    getValue,
    setValue,
    debounce
  });
}
function MapDecisionResult(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const businessObject = ModelUtil.getBusinessObject(element);
  const getValue = () => {
    return businessObject.get('camunda:mapDecisionResult') || 'resultList';
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:mapDecisionResult': value
      }
    });
  };

  // Note: default is "resultList",
  // cf. https://docs.camunda.org/manual/latest/reference/bpmn20/custom-extensions/extension-attributes/#mapdecisionresult
  const getOptions = () => {
    const options = [{
      value: 'collectEntries',
      label: translate('collectEntries (List<Object>)')
    }, {
      value: 'resultList',
      label: translate('resultList (List<Map<String, Object>>)')
    }, {
      value: 'singleEntry',
      label: translate('singleEntry (TypedValue)')
    }, {
      value: 'singleResult',
      label: translate('singleResult (Map<String, Object>)')
    }];
    return options;
  };
  return propertiesPanel.SelectEntry({
    element,
    id: 'mapDecisionResult',
    label: translate('Map decision result'),
    getValue,
    setValue,
    getOptions
  });
}

// helper ////////////////////

function getDecisionRefBinding(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  return businessObject.get('camunda:decisionRefBinding') || 'latest';
}
function getResultVariable(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  return businessObject.get('camunda:resultVariable');
}

const DELEGATE_PROPS = {
  'camunda:class': undefined,
  'camunda:expression': undefined,
  'camunda:delegateExpression': undefined,
  'camunda:resultVariable': undefined
};
const DMN_CAPABLE_PROPS = {
  'camunda:decisionRef': undefined,
  'camunda:decisionRefBinding': 'latest',
  'camunda:decisionRefVersion': undefined,
  'camunda:mapDecisionResult': 'resultList',
  'camunda:decisionRefTenantId': undefined
};
const EXTERNAL_CAPABLE_PROPS = {
  'camunda:type': undefined,
  'camunda:topic': undefined
};
const IMPLEMENTATION_TYPE_NONE_LABEL = '<none>',
  IMPLEMENTATION_TYPE_JAVA_LABEL = 'Java class',
  IMPLEMENTATION_TYPE_EXPRESSION_LABEL = 'Expression',
  IMPLEMENTATION_TYPE_DELEGATE_LABEL = 'Delegate expression',
  IMPLEMENTATION_TYPE_DMN_LABEL = 'DMN',
  IMPLEMENTATION_TYPE_EXTERNAL_LABEL = 'External',
  IMPLEMENTATION_TYPE_CONNECTOR_LABEL = 'Connector';
function ImplementationTypeProps(props) {
  return [{
    id: 'implementationType',
    component: ImplementationType,
    isEdited: propertiesPanel.isSelectEntryEdited
  }];
}
function ImplementationType(props) {
  const {
    element
  } = props;
  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const getValue = () => {
    return getImplementationType(element) || '';
  };
  const setValue = value => {
    const oldType = getImplementationType(element);
    const businessObject = getServiceTaskLikeBusinessObject(element);
    const commands = [];
    let updatedProperties = DELEGATE_PROPS;
    let extensionElements = businessObject.get('extensionElements');

    // (1) class, expression, delegateExpression
    if (isDelegateType(value)) {
      updatedProperties = {
        ...updatedProperties,
        [value]: isDelegateType(oldType) ? businessObject.get(`camunda:${oldType}`) : ''
      };
    }

    // (2) dmn
    if (isDmnCapable(businessObject)) {
      updatedProperties = {
        ...updatedProperties,
        ...DMN_CAPABLE_PROPS
      };
      if (value === 'dmn') {
        updatedProperties = {
          ...updatedProperties,
          'camunda:decisionRef': ''
        };
      }
    }

    // (3) external
    // Note: error event definition elements got cleaned up in modeling behavior
    // cf. https://github.com/camunda/camunda-bpmn-js/blob/main/lib/camunda-platform/features/modeling/behavior/DeleteErrorEventDefinitionBehavior.js
    if (isExternalCapable(businessObject)) {
      updatedProperties = {
        ...updatedProperties,
        ...EXTERNAL_CAPABLE_PROPS
      };
      if (value === 'external') {
        updatedProperties = {
          ...updatedProperties,
          'camunda:type': 'external',
          'camunda:topic': ''
        };
      }
    }

    // (4) connector
    if (isServiceTaskLike(businessObject)) {
      // (4.1) remove all connectors on type change
      const connectors = getConnectors$1(businessObject);
      if (connectors.length) {
        commands.push({
          cmd: 'element.updateModdleProperties',
          context: {
            element,
            moddleElement: extensionElements,
            properties: {
              values: minDash.without(extensionElements.get('values'), value => connectors.includes(value))
            }
          }
        });
      }

      // (4.2) create connector
      if (value === 'connector') {
        // ensure extension elements
        if (!extensionElements) {
          extensionElements = createElement('bpmn:ExtensionElements', {
            values: []
          }, businessObject, bpmnFactory);
          commands.push(UpdateModdlePropertiesCommand(element, businessObject, {
            extensionElements
          }));
        }
        const connector = createElement('camunda:Connector', {}, extensionElements, bpmnFactory);
        commands.push({
          cmd: 'element.updateModdleProperties',
          context: {
            element,
            moddleElement: extensionElements,
            properties: {
              values: [...extensionElements.get('values'), connector]
            }
          }
        });
      }
    }

    // (5) collect all property updates
    commands.push(UpdateModdlePropertiesCommand(element, businessObject, updatedProperties));

    // (6) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
  const getOptions = () => {
    const businessObject = getServiceTaskLikeBusinessObject(element);
    const options = [{
      value: '',
      label: translate(IMPLEMENTATION_TYPE_NONE_LABEL)
    }, {
      value: 'class',
      label: translate(IMPLEMENTATION_TYPE_JAVA_LABEL)
    }, {
      value: 'expression',
      label: translate(IMPLEMENTATION_TYPE_EXPRESSION_LABEL)
    }, {
      value: 'delegateExpression',
      label: translate(IMPLEMENTATION_TYPE_DELEGATE_LABEL)
    }];
    if (isDmnCapable(businessObject)) {
      options.push({
        value: 'dmn',
        label: translate(IMPLEMENTATION_TYPE_DMN_LABEL)
      });
    }
    if (isExternalCapable(businessObject)) {
      options.push({
        value: 'external',
        label: translate(IMPLEMENTATION_TYPE_EXTERNAL_LABEL)
      });
    }
    if (isServiceTaskLike(businessObject)) {
      options.push({
        value: 'connector',
        label: translate(IMPLEMENTATION_TYPE_CONNECTOR_LABEL)
      });
    }
    return sortByPriority(options);
  };
  return propertiesPanel.SelectEntry({
    element,
    id: 'implementationType',
    label: translate('Type'),
    getValue,
    setValue,
    getOptions
  });
}

// helper ///////////////////////

function isDelegateType(type) {
  return ['class', 'expression', 'delegateExpression'].includes(type);
}
function getConnectors$1(businessObject) {
  return getExtensionElementsList(businessObject, 'camunda:Connector');
}
function UpdateModdlePropertiesCommand(element, businessObject, newProperties) {
  return {
    cmd: 'element.updateModdleProperties',
    context: {
      element,
      moddleElement: businessObject,
      properties: newProperties
    }
  };
}
function sortByPriority(options) {
  const priorities = {
    [IMPLEMENTATION_TYPE_NONE_LABEL]: 0,
    [IMPLEMENTATION_TYPE_JAVA_LABEL]: 3,
    [IMPLEMENTATION_TYPE_EXPRESSION_LABEL]: 4,
    [IMPLEMENTATION_TYPE_DELEGATE_LABEL]: 5,
    [IMPLEMENTATION_TYPE_DMN_LABEL]: 1,
    [IMPLEMENTATION_TYPE_EXTERNAL_LABEL]: 2,
    [IMPLEMENTATION_TYPE_CONNECTOR_LABEL]: 6
  };
  return minDash.sortBy(options, o => priorities[o.label]);
}

function ImplementationProps(props) {
  const {
    element
  } = props;
  if (!getServiceTaskLikeBusinessObject(element)) {
    return [];
  }
  const implementationType = getImplementationType(element);

  // (1) display implementation type select
  const entries = [...ImplementationTypeProps()];

  // (2) display implementation properties based on type
  if (implementationType === 'class') {
    entries.push({
      id: 'javaClass',
      component: JavaClass,
      isEdited: propertiesPanel.isTextFieldEntryEdited
    });
  } else if (implementationType === 'expression') {
    entries.push({
      id: 'expression',
      component: Expression,
      isEdited: propertiesPanel.isTextFieldEntryEdited
    }, {
      id: 'expressionResultVariable',
      component: ResultVariable$1,
      isEdited: propertiesPanel.isTextFieldEntryEdited
    });
  } else if (implementationType === 'delegateExpression') {
    entries.push({
      id: 'delegateExpression',
      component: DelegateExpression,
      isEdited: propertiesPanel.isTextFieldEntryEdited
    });
  } else if (implementationType === 'dmn') {
    entries.push(...DmnImplementationProps({
      element
    }));
  } else if (implementationType === 'external') {
    entries.push({
      id: 'externalTopic',
      component: Topic,
      isEdited: propertiesPanel.isTextFieldEntryEdited
    });
  } else if (implementationType === 'connector') {
    entries.push({
      id: 'connectorId',
      component: ConnectorId,
      isEdited: propertiesPanel.isTextFieldEntryEdited
    });
  }
  return entries;
}
function JavaClass(props) {
  const {
    element,
    businessObject = getServiceTaskLikeBusinessObject(element),
    id = 'javaClass'
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return businessObject.get('camunda:class');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:class': value || ''
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id,
    label: translate('Java class'),
    getValue,
    setValue,
    debounce
  });
}
function Expression(props) {
  const {
    element,
    businessObject = getServiceTaskLikeBusinessObject(element),
    id = 'expression'
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return businessObject.get('camunda:expression');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:expression': value || ''
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id,
    label: translate('Expression'),
    getValue,
    setValue,
    debounce
  });
}
function ResultVariable$1(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const businessObject = getServiceTaskLikeBusinessObject(element);
  const getValue = () => {
    return businessObject.get('camunda:resultVariable');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:resultVariable': value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'expressionResultVariable',
    label: translate('Result variable'),
    getValue,
    setValue,
    debounce
  });
}
function DelegateExpression(props) {
  const {
    element,
    businessObject = getServiceTaskLikeBusinessObject(element),
    id = 'delegateExpression'
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return businessObject.get('camunda:delegateExpression');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:delegateExpression': value || ''
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id,
    label: translate('Delegate expression'),
    getValue,
    setValue,
    debounce
  });
}
function Topic(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const businessObject = getServiceTaskLikeBusinessObject(element);
  const getValue = () => {
    return businessObject.get('camunda:topic');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:topic': value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'externalTopic',
    label: translate('Topic'),
    getValue,
    setValue,
    debounce
  });
}
function ConnectorId(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const connector = getConnector(element);
  const getValue = () => {
    return connector.get('camunda:connectorId');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: connector,
      properties: {
        'camunda:connectorId': value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'connectorId',
    label: translate('Connector ID'),
    getValue,
    setValue,
    debounce
  });
}

// helper //////////////////

function getConnectors(businessObject) {
  return getExtensionElementsList(businessObject, 'camunda:Connector');
}
function getConnector(element) {
  const businessObject = getServiceTaskLikeBusinessObject(element);
  const connectors = getConnectors(businessObject);
  return connectors[0];
}

function InitiatorProps(props) {
  const {
    element
  } = props;
  if (!isInitiator(element)) {
    return [];
  }
  return [{
    id: 'initiator',
    component: Initiator,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  }];
}
function Initiator(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const businessObject = ModelUtil.getBusinessObject(element);
  const getValue = () => {
    return businessObject.get('camunda:initiator');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:initiator': value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'initiator',
    label: translate('Initiator'),
    getValue,
    setValue,
    debounce
  });
}

// helper ///////////////////

function isInitiator(element) {
  return ModelUtil.is(element, 'camunda:Initiator') && !ModelUtil.is(element.parent, 'bpmn:SubProcess');
}

/**
 * Cf. https://docs.camunda.org/manual/7.15/reference/bpmn20/subprocesses/call-activity/#passing-variables
 */
function InMappingPropagationProps(props) {
  const {
    element
  } = props;
  if (!areInMappingsSupported$1(element)) {
    return [];
  }
  const entries = [{
    id: 'inMapping-propagation',
    component: PropagateAll$1,
    isEdited: propertiesPanel.isCheckboxEntryEdited
  }];
  if (isPropagateAll$1(element)) {
    entries.push({
      id: 'inMapping-propagation-local',
      component: Local$2,
      isEdited: propertiesPanel.isCheckboxEntryEdited
    });
  }
  return entries;
}
function PropagateAll$1(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const getValue = () => {
    return isPropagateAll$1(element);
  };
  const setValue = value => {
    if (value) {
      addInMapping();
    } else {
      removeInMapping();
    }
  };
  function addInMapping() {
    const businessObject = getSignalEventDefinition$1(element) || ModelUtil.getBusinessObject(element);
    const mapping = createElement('camunda:In', {
      variables: 'all'
    }, null, bpmnFactory);
    addExtensionElements(element, businessObject, mapping, bpmnFactory, commandStack);
  }
  function removeInMapping() {
    const businessObject = getSignalEventDefinition$1(element) || ModelUtil.getBusinessObject(element);
    const mappings = findRelevantInMappings(element);
    removeExtensionElements(element, businessObject, mappings, commandStack);
  }
  return propertiesPanel.CheckboxEntry({
    id: 'inMapping-propagation',
    label: translate('Propagate all variables'),
    getValue,
    setValue
  });
}
function Local$2(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const mapping = findRelevantInMappings(element)[0];
  const getValue = () => {
    return mapping.get('camunda:local');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: mapping,
      properties: {
        local: value
      }
    });
  };
  return propertiesPanel.CheckboxEntry({
    element,
    id: 'inMapping-propagation-local',
    label: translate('Local'),
    getValue,
    setValue
  });
}

// helper //////////////////////////

function areInMappingsSupported$1(element) {
  const signalEventDefinition = getSignalEventDefinition$1(element);
  if (signalEventDefinition) {
    return ModelingUtil.isAny(element, ['bpmn:IntermediateThrowEvent', 'bpmn:EndEvent']);
  }
  return ModelUtil.is(element, 'bpmn:CallActivity');
}
function getInMappings$1(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  const signalEventDefinition = getSignalEventDefinition$1(businessObject);
  return getExtensionElementsList(signalEventDefinition || businessObject, 'camunda:In');
}
function findRelevantInMappings(element) {
  const inMappings = getInMappings$1(element);
  return minDash.filter(inMappings, function (mapping) {
    const variables = mapping.get('variables');
    return variables && variables === 'all';
  });
}
function isPropagateAll$1(element) {
  const mappings = findRelevantInMappings(element);
  return !!mappings.length;
}

const DEFAULT_PROPS$1 = {
  'source': undefined,
  'sourceExpression': undefined
};
function InOutMapping(props) {
  const {
    idPrefix,
    mapping
  } = props;
  const type = getInOutType(mapping);
  const entries = [];

  // (1) Type
  entries.push({
    id: idPrefix + '-type',
    component: Type,
    idPrefix,
    mapping
  });

  // (2) Source
  if (type === 'source') {
    entries.push({
      id: idPrefix + '-source',
      component: Source,
      idPrefix,
      mapping
    });
  }

  // (3) Source expression
  if (type === 'sourceExpression') {
    entries.push({
      id: idPrefix + '-sourceExpression',
      component: SourceExpression,
      idPrefix,
      mapping
    });
  }

  // (4) Target
  entries.push({
    id: idPrefix + '-target',
    component: Target,
    idPrefix,
    mapping
  });

  // (5) Local
  entries.push({
    id: idPrefix + '-local',
    component: Local$1,
    idPrefix,
    mapping
  });
  return entries;
}
function Type(props) {
  const {
    idPrefix,
    element,
    mapping
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const getValue = mapping => {
    return getInOutType(mapping);
  };
  const setValue = value => {
    const properties = {
      ...DEFAULT_PROPS$1,
      [value]: ''
    };
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: mapping,
      properties
    });
  };
  const getOptions = () => {
    const options = [{
      label: translate('Source'),
      value: 'source'
    }, {
      label: translate('Source expression'),
      value: 'sourceExpression'
    }];
    return options;
  };
  return propertiesPanel.SelectEntry({
    element: mapping,
    id: idPrefix + '-type',
    label: translate('Type'),
    getValue,
    setValue,
    getOptions
  });
}
function Source(props) {
  const {
    idPrefix,
    element,
    mapping
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: mapping,
      properties: {
        source: value
      }
    });
  };
  const getValue = mapping => {
    return mapping.get('camunda:source');
  };
  return propertiesPanel.TextFieldEntry({
    element: mapping,
    id: idPrefix + '-source',
    label: translate('Source'),
    getValue,
    setValue,
    debounce
  });
}
function SourceExpression(props) {
  const {
    idPrefix,
    element,
    mapping
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: mapping,
      properties: {
        sourceExpression: value
      }
    });
  };
  const getValue = mapping => {
    return mapping.get('camunda:sourceExpression');
  };
  return propertiesPanel.TextFieldEntry({
    element: mapping,
    id: idPrefix + '-sourceExpression',
    label: translate('Source expression'),
    getValue,
    setValue,
    debounce
  });
}
function Target(props) {
  const {
    idPrefix,
    element,
    mapping
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: mapping,
      properties: {
        target: value
      }
    });
  };
  const getValue = mapping => {
    return mapping.get('camunda:target');
  };
  return propertiesPanel.TextFieldEntry({
    element: mapping,
    id: idPrefix + '-target',
    label: translate('Target'),
    getValue,
    setValue,
    debounce
  });
}
function Local$1(props) {
  const {
    idPrefix,
    element,
    mapping
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const getValue = () => {
    return mapping.get('camunda:local');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: mapping,
      properties: {
        local: value
      }
    });
  };
  return propertiesPanel.CheckboxEntry({
    element,
    id: idPrefix + '-local',
    label: translate('Local'),
    getValue,
    setValue
  });
}

// helper ///////////////////

function getInOutType(mapping) {
  let inOutType = '';
  if (typeof mapping.source !== 'undefined') {
    inOutType = 'source';
  } else if (typeof mapping.sourceExpression !== 'undefined') {
    inOutType = 'sourceExpression';
  }
  return inOutType;
}

/**
 * Cf. https://docs.camunda.org/manual/latest/reference/bpmn20/custom-extensions/extension-elements/#in
 */
function InMappingProps({
  element,
  injector
}) {
  if (!areInMappingsSupported(element)) {
    return null;
  }
  const variableMappings = getInMappings(element) || [];
  const bpmnFactory = injector.get('bpmnFactory'),
    commandStack = injector.get('commandStack');
  const items = variableMappings.map((mapping, index) => {
    const id = element.id + '-inMapping-' + index;
    return {
      id,
      label: mapping.get('target') || '',
      entries: InOutMapping({
        idPrefix: id,
        element,
        mapping
      }),
      autoFocusEntry: id + '-target',
      remove: removeFactory$3({
        commandStack,
        element,
        mapping
      })
    };
  });
  return {
    items,
    add: addFactory$2({
      bpmnFactory,
      commandStack,
      element
    })
  };
}
function removeFactory$3({
  commandStack,
  element,
  mapping
}) {
  return function (event) {
    event.stopPropagation();
    const businessObject = getSignalEventDefinition$1(element) || ModelUtil.getBusinessObject(element);
    removeExtensionElements(element, businessObject, mapping, commandStack);
  };
}
function addFactory$2({
  bpmnFactory,
  commandStack,
  element
}) {
  return function (event) {
    event.stopPropagation();
    const businessObject = getSignalEventDefinition$1(element) || ModelUtil.getBusinessObject(element);
    const newMapping = createElement('camunda:In', {
      source: '' // source is the default type
    }, null, bpmnFactory);
    addExtensionElements(element, businessObject, newMapping, bpmnFactory, commandStack);
  };
}

// helper ///////////////

function getInMappings(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  const signalEventDefinition = getSignalEventDefinition$1(businessObject);
  const mappings = getExtensionElementsList(signalEventDefinition || businessObject, 'camunda:In');

  // only retrieve relevant mappings here, others are handled in other groups
  // mapping.businessKey => camunda-platform/CallAvtivityProps
  // mapping.variables => camunda-platform/InMappingPropagationProps
  return minDash.filter(mappings, function (mapping) {
    return !mapping.businessKey && !(mapping.variables && mapping.variables === 'all');
  });
}
function areInMappingsSupported(element) {
  const signalEventDefinition = getSignalEventDefinition$1(element);
  if (signalEventDefinition) {
    return ModelingUtil.isAny(element, ['bpmn:IntermediateThrowEvent', 'bpmn:EndEvent']);
  }
  return ModelUtil.is(element, 'bpmn:CallActivity');
}

function InputProps(props) {
  const {
    element,
    injector
  } = props;
  if (!areInputParametersSupported(element)) {
    return null;
  }
  const inputParameters = getInputParameters(element) || [];
  const bpmnFactory = injector.get('bpmnFactory'),
    commandStack = injector.get('commandStack');
  const items = inputParameters.map((parameter, index) => {
    const id = element.id + '-inputParameter-' + index;
    return {
      id,
      label: parameter.get('name') || '',
      entries: InputOutputParameter({
        idPrefix: id,
        element,
        parameter
      }),
      autoFocusEntry: id + '-name',
      remove: removeFactory$2({
        element,
        commandStack,
        parameter
      })
    };
  });
  function add(event) {
    event.stopPropagation();
    commandStack.execute('properties-panel.multi-command-executor', AddParameterCmd(element, 'camunda:InputParameter', bpmnFactory));
  }
  return {
    items,
    add,
    shouldSort: false
  };
}
function removeFactory$2(props) {
  const {
    commandStack,
    element,
    parameter
  } = props;
  return function (event) {
    event.stopPropagation();
    const inputOutput = getInputOutput(element);
    if (!inputOutput) {
      return;
    }
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: inputOutput,
      properties: {
        inputParameters: minDash.without(inputOutput.get('inputParameters'), parameter)
      }
    });
  };
}

function JobExecutionProps(props) {
  const {
    element
  } = props;
  const businessObject = ModelUtil.getBusinessObject(element);
  const entries = [];

  // (1) add retryTimeCycle field for camunda:asyncCapable enabled Elements
  // or TimerEvents
  if (ModelUtil.is(element, 'camunda:AsyncCapable') && isAsync$1(businessObject) || isTimerEvent(element)) {
    entries.push({
      id: 'retryTimeCycle',
      component: RetryTimeCycle,
      isEdited: propertiesPanel.isTextFieldEntryEdited
    });
  }

  // (2) add jobPriority field for camunda:jobPriorized with async enabled
  //  or Processes
  //  or Processes referred to by participants
  //  or TimerEvents
  if (ModelUtil.is(element, 'camunda:JobPriorized') && isAsync$1(businessObject) || ModelUtil.is(element, 'bpmn:Process') || ModelUtil.is(element, 'bpmn:Participant') && businessObject.get('processRef') || isTimerEvent(element)) {
    entries.push({
      id: 'jobPriority',
      component: JobPriority,
      isEdited: propertiesPanel.isTextFieldEntryEdited
    });
  }
  return entries;
}
function JobPriority(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack'),
    translate = useService('translate'),
    debounce = useService('debounceInput');
  const businessObject = ModelUtil.is(element, 'bpmn:Participant') ? ModelUtil.getBusinessObject(element).get('processRef') : ModelUtil.getBusinessObject(element);
  const getValue = () => {
    return businessObject.get('camunda:jobPriority');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:jobPriority': value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'jobPriority',
    label: translate('Priority'),
    getValue,
    setValue,
    debounce
  });
}
function RetryTimeCycle(props) {
  const {
    element
  } = props;
  const bpmnFactory = useService('bpmnFactory'),
    commandStack = useService('commandStack'),
    translate = useService('translate'),
    debounce = useService('debounceInput');
  const businessObject = ModelUtil.getBusinessObject(element);
  const getValue = () => {
    const failedJobRetryTimeCycle = getExtensionElementsList(businessObject, 'camunda:FailedJobRetryTimeCycle')[0];
    return failedJobRetryTimeCycle && failedJobRetryTimeCycle.body;
  };
  const setValue = value => {
    const commands = [];
    let extensionElements = businessObject.get('extensionElements');

    // (1) ensure extension elements
    if (!extensionElements) {
      extensionElements = createElement('bpmn:ExtensionElements', {
        values: []
      }, businessObject, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
          properties: {
            extensionElements
          }
        }
      });
    }

    // (2) ensure failedJobRetryTimeCycle
    let failedJobRetryTimeCycle = getExtensionElementsList(businessObject, 'camunda:FailedJobRetryTimeCycle')[0];
    if (!failedJobRetryTimeCycle) {
      failedJobRetryTimeCycle = createElement('camunda:FailedJobRetryTimeCycle', {}, extensionElements, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [...extensionElements.get('values'), failedJobRetryTimeCycle]
          }
        }
      });
    }

    // (3) update failedJobRetryTimeCycle value
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: failedJobRetryTimeCycle,
        properties: {
          body: value
        }
      }
    });

    // (4) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'retryTimeCycle',
    label: translate('Retry time cycle'),
    getValue,
    setValue,
    debounce
  });
}

// helper //////////////////

/**
 * @param  {ModdleElement} bo
 * @return {boolean} a boolean value
 */
function isAsyncBefore$1(bo) {
  return !!(bo.get('camunda:asyncBefore') || bo.get('camunda:async'));
}

/**
 * @param  {ModdleElement} bo
 * @return {boolean}
 */
function isAsyncAfter$1(bo) {
  return !!bo.get('camunda:asyncAfter');
}

/**
 * isAsync - returns true if the attribute 'camunda:asyncAfter' or 'camunda:asyncBefore'
 * is set to true.
 *
 * @param  {ModdleElement} bo
 * @return {boolean}
 */
function isAsync$1(bo) {
  return isAsyncAfter$1(bo) || isAsyncBefore$1(bo);
}

/**
 * isTimerEvent - returns true if the element is a bpmn:Event with a timerEventDefinition
 *
 * @param  {ModdleElement} element
 * @return {boolean}
 */
function isTimerEvent(element) {
  return ModelUtil.is(element, 'bpmn:Event') && getTimerEventDefinition$1(element);
}

/**
 * @typedef { import('@bpmn-io/properties-panel').EntryDefinition } Entry
 */

/**
 * @returns {Array<Entry>} entries
 */
function MultiInstanceProps(props) {
  const {
    element
  } = props;
  const loopCharacteristics = getLoopCharacteristics(element);
  let entries = props.entries || [];
  if (!isMultiInstanceSupported(element)) {
    return entries;
  }
  entries.push({
    id: 'collection',
    component: Collection,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  }, {
    id: 'elementVariable',
    component: ElementVariable,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  }, {
    id: 'multiInstanceAsynchronousBefore',
    component: MultiInstanceAsynchronousBefore,
    isEdited: propertiesPanel.isCheckboxEntryEdited
  }, {
    id: 'multiInstanceAsynchronousAfter',
    component: MultiInstanceAsynchronousAfter,
    isEdited: propertiesPanel.isCheckboxEntryEdited
  });
  if (isAsync(loopCharacteristics)) {
    entries.push({
      id: 'multiInstanceExclusive',
      component: MultiInstanceExclusive,
      isEdited: checkboxIsEditedInverted
    }, {
      id: 'multiInstanceRetryTimeCycle',
      component: MultiInstanceRetryTimeCycle,
      isEdited: propertiesPanel.isTextFieldEntryEdited
    });
  }
  return entries;
}
function Collection(props) {
  const {
    element
  } = props;
  const debounce = useService('debounceInput');
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const loopCharacteristics = getLoopCharacteristics(element);
  const getValue = () => {
    return getCollection(element);
  };
  const setValue = value => {
    return commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: loopCharacteristics,
      properties: {
        'camunda:collection': value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'collection',
    label: translate('Collection'),
    getValue,
    setValue,
    debounce
  });
}
function ElementVariable(props) {
  const {
    element
  } = props;
  const debounce = useService('debounceInput');
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const loopCharacteristics = getLoopCharacteristics(element);
  const getValue = () => {
    return getElementVariable(element);
  };
  const setValue = value => {
    return commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: loopCharacteristics,
      properties: {
        'camunda:elementVariable': value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'elementVariable',
    label: translate('Element variable'),
    getValue,
    setValue,
    debounce
  });
}
function MultiInstanceAsynchronousBefore(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const loopCharacteristics = getLoopCharacteristics(element);
  const getValue = () => {
    return isAsyncBefore(loopCharacteristics);
  };
  const setValue = value => {
    // overwrite the legacy `async` property, we will use the more explicit `asyncBefore`
    const properties = {
      'camunda:asyncBefore': value,
      'camunda:async': undefined
    };
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: loopCharacteristics,
      properties
    });
  };
  return propertiesPanel.CheckboxEntry({
    element,
    id: 'multiInstanceAsynchronousBefore',
    label: translate('Asynchronous before'),
    getValue,
    setValue
  });
}
function MultiInstanceAsynchronousAfter(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const loopCharacteristics = getLoopCharacteristics(element);
  const getValue = () => {
    return isAsyncAfter(loopCharacteristics);
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: loopCharacteristics,
      properties: {
        'camunda:asyncAfter': value
      }
    });
  };
  return propertiesPanel.CheckboxEntry({
    element,
    id: 'multiInstanceAsynchronousAfter',
    label: translate('Asynchronous after'),
    getValue,
    setValue
  });
}
function MultiInstanceExclusive(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack'),
    translate = useService('translate');
  const loopCharacteristics = getLoopCharacteristics(element);
  const getValue = () => {
    return isExclusive(loopCharacteristics);
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: loopCharacteristics,
      properties: {
        'camunda:exclusive': value
      }
    });
  };
  return propertiesPanel.CheckboxEntry({
    element,
    id: 'multiInstanceExclusive',
    label: translate('Exclusive'),
    getValue,
    setValue
  });
}
function MultiInstanceRetryTimeCycle(props) {
  const {
    element
  } = props;
  const bpmnFactory = useService('bpmnFactory'),
    commandStack = useService('commandStack'),
    translate = useService('translate'),
    debounce = useService('debounceInput');
  const loopCharacteristics = getLoopCharacteristics(element);
  const getValue = () => {
    const failedJobRetryTimeCycle = getExtensionElementsList(loopCharacteristics, 'camunda:FailedJobRetryTimeCycle')[0];
    return failedJobRetryTimeCycle && failedJobRetryTimeCycle.body;
  };
  const setValue = value => {
    const commands = [];
    let extensionElements = loopCharacteristics.get('extensionElements');

    // (1) ensure extension elements
    if (!extensionElements) {
      extensionElements = createElement('bpmn:ExtensionElements', {
        values: []
      }, loopCharacteristics, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: loopCharacteristics,
          properties: {
            extensionElements
          }
        }
      });
    }

    // (2) ensure failedJobRetryTimeCycle
    let failedJobRetryTimeCycle = getExtensionElementsList(loopCharacteristics, 'camunda:FailedJobRetryTimeCycle')[0];
    if (!failedJobRetryTimeCycle) {
      failedJobRetryTimeCycle = createElement('camunda:FailedJobRetryTimeCycle', {}, extensionElements, bpmnFactory);
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element: loopCharacteristics,
          moddleElement: extensionElements,
          properties: {
            values: [...extensionElements.get('values'), failedJobRetryTimeCycle]
          }
        }
      });
    }

    // (3) update failedJobRetryTimeCycle value
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: failedJobRetryTimeCycle,
        properties: {
          body: value
        }
      }
    });

    // (4) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'multiInstanceRetryTimeCycle',
    label: translate('Retry time cycle'),
    getValue,
    setValue,
    debounce
  });
}

// helper ////////////////////////////

// generic ///////////////////////////

/**
 * isMultiInstanceSupported - check whether given element supports camunda specific props
 * for multiInstance (ref. <camunda:Cllectable>).
 *
 * @param {djs.model.Base} element
 * @return {boolean}
 */
function isMultiInstanceSupported(element) {
  const loopCharacteristics = getLoopCharacteristics(element);
  return !!loopCharacteristics && ModelUtil.is(loopCharacteristics, 'camunda:Collectable');
}

/**
 * getProperty - get a property value of the loop characteristics.
 *
 * @param {djs.model.Base} element
 * @param {string} propertyName
 *
 * @return {any} the property value
 */
function getProperty(element, propertyName) {
  var loopCharacteristics = getLoopCharacteristics(element);
  return loopCharacteristics && loopCharacteristics.get(propertyName);
}

/**
 * getLoopCharacteristics - get loopCharacteristics of a given element.
 *
 * @param {djs.model.Base} element
 * @return {ModdleElement<bpmn:MultiInstanceLoopCharacteristics> | undefined}
 */
function getLoopCharacteristics(element) {
  const bo = ModelUtil.getBusinessObject(element);
  return bo.loopCharacteristics;
}

// collection

/**
 * getCollection - get the 'camunda:collection' attribute value of the loop characteristics.
 *
 * @param {djs.model.Base} element
 *
 * @return {string} the 'camunda:collection' value
 */
function getCollection(element) {
  return getProperty(element, 'camunda:collection');
}

// elementVariable

/**
 * getElementVariable - get the 'camunda:elementVariable' attribute value of the loop characteristics.
 *
 * @param {djs.model.Base} element
 *
 * @return {string} the 'camunda:elementVariable' value
 */
function getElementVariable(element) {
  return getProperty(element, 'camunda:elementVariable');
}

// asyncBefore asyncAfter

/**
 * Returns true if the attribute 'camunda:asyncBefore' is set
 * to true.
 *
 * @param  {ModdleElement} bo
 *
 * @return {boolean} a boolean value
 */
function isAsyncBefore(bo) {
  return !!(bo.get('camunda:asyncBefore') || bo.get('camunda:async'));
}

/**
 * Returns true if the attribute 'camunda:asyncAfter' is set
 * to true.
 *
 * @param  {ModdleElement} bo
 *
 * @return {boolean} a boolean value
 */
function isAsyncAfter(bo) {
  return !!bo.get('camunda:asyncAfter');
}

/**
 * Returns true if the attribute 'camunda:exclusive' is set
 * to true.
 *
 * @param  {ModdleElement} bo
 *
 * @return {boolean} a boolean value
 */
function isExclusive(bo) {
  return !!bo.get('camunda:exclusive');
}

/**
 * isAsync - returns true if the attribute 'camunda:asyncAfter' or 'camunda:asyncBefore'
 * is set to true.
 *
 * @param  {ModdleElement} bo
 * @return {boolean}
 */
function isAsync(bo) {
  return isAsyncAfter(bo) || isAsyncBefore(bo);
}

// Checkbox

function checkboxIsEditedInverted(node) {
  return node && !node.checked;
}

/**
 * Cf. https://docs.camunda.org/manual/7.15/reference/bpmn20/subprocesses/call-activity/#passing-variables
 */
function OutMappingPropagationProps(props) {
  const {
    element
  } = props;
  if (!areOutMappingsSupported$1(element)) {
    return [];
  }
  const entries = [{
    id: 'outMapping-propagation',
    component: PropagateAll,
    isEdited: propertiesPanel.isCheckboxEntryEdited
  }];
  if (isPropagateAll(element)) {
    entries.push({
      id: 'outMapping-propagation-local',
      component: Local,
      isEdited: propertiesPanel.isCheckboxEntryEdited
    });
  }
  return entries;
}
function PropagateAll(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const getValue = () => {
    return isPropagateAll(element);
  };
  const setValue = value => {
    if (value) {
      addOutMapping();
    } else {
      removeOutMapping();
    }
  };
  function addOutMapping() {
    const businessObject = ModelUtil.getBusinessObject(element);
    const mapping = createElement('camunda:Out', {
      variables: 'all'
    }, null, bpmnFactory);
    addExtensionElements(element, businessObject, mapping, bpmnFactory, commandStack);
  }
  function removeOutMapping() {
    const businessObject = ModelUtil.getBusinessObject(element);
    const mappings = findRelevantOutMappings(element);
    removeExtensionElements(element, businessObject, mappings, commandStack);
  }
  return propertiesPanel.CheckboxEntry({
    id: 'outMapping-propagation',
    label: translate('Propagate all variables'),
    getValue,
    setValue
  });
}
function Local(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const mapping = findRelevantOutMappings(element)[0];
  const getValue = () => {
    return mapping.get('camunda:local');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: mapping,
      properties: {
        local: value
      }
    });
  };
  return propertiesPanel.CheckboxEntry({
    element,
    id: 'outMapping-propagation-local',
    label: translate('Local'),
    getValue,
    setValue
  });
}

// helper //////////////////////////

function areOutMappingsSupported$1(element) {
  return ModelUtil.is(element, 'bpmn:CallActivity');
}
function getOutMappings$1(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  return getExtensionElementsList(businessObject, 'camunda:Out');
}
function findRelevantOutMappings(element) {
  const inMappings = getOutMappings$1(element);
  return minDash.filter(inMappings, function (mapping) {
    const variables = mapping.get('variables');
    return variables && variables === 'all';
  });
}
function isPropagateAll(element) {
  const mappings = findRelevantOutMappings(element);
  return !!mappings.length;
}

/**
 * Cf. https://docs.camunda.org/manual/latest/reference/bpmn20/custom-extensions/extension-elements/#out
 */
function OutMappingProps({
  element,
  injector
}) {
  if (!areOutMappingsSupported(element)) {
    return null;
  }
  const variableMappings = getOutMappings(element) || [];
  const bpmnFactory = injector.get('bpmnFactory'),
    commandStack = injector.get('commandStack');
  const items = variableMappings.map((mapping, index) => {
    const id = element.id + '-outMapping-' + index;
    return {
      id,
      label: mapping.get('target') || '',
      entries: InOutMapping({
        idPrefix: id,
        element,
        mapping
      }),
      autoFocusEntry: id + '-target',
      remove: removeFactory$1({
        commandStack,
        element,
        mapping
      })
    };
  });
  return {
    items,
    add: addFactory$1({
      bpmnFactory,
      commandStack,
      element
    })
  };
}
function removeFactory$1({
  commandStack,
  element,
  mapping
}) {
  return function (event) {
    event.stopPropagation();
    const businessObject = ModelUtil.getBusinessObject(element);
    removeExtensionElements(element, businessObject, mapping, commandStack);
  };
}
function addFactory$1({
  bpmnFactory,
  commandStack,
  element
}) {
  return function (event) {
    event.stopPropagation();
    const businessObject = ModelUtil.getBusinessObject(element);
    const newMapping = createElement('camunda:Out', {
      source: '' // source is the default type
    }, null, bpmnFactory);
    addExtensionElements(element, businessObject, newMapping, bpmnFactory, commandStack);
  };
}

// helper ///////////////

function getOutMappings(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  const mappings = getExtensionElementsList(businessObject, 'camunda:Out');

  // only retrieve relevant mappings here, others are handled in other groups
  // mapping.businessKey => camunda-platform/CallAvtivityProps
  // mapping.variables => camunda-platform/OutMappingPropagationProps
  return minDash.filter(mappings, function (mapping) {
    return !mapping.businessKey && !(mapping.variables && mapping.variables === 'all');
  });
}
function areOutMappingsSupported(element) {
  return ModelUtil.is(element, 'bpmn:CallActivity');
}

function OutputProps({
  element,
  injector
}) {
  if (!areOutputParametersSupported(element)) {
    return null;
  }
  const outputParameters = getOutputParameters(element) || [];
  const bpmnFactory = injector.get('bpmnFactory'),
    commandStack = injector.get('commandStack');
  const items = outputParameters.map((parameter, index) => {
    const id = element.id + '-outputParameter-' + index;
    return {
      id,
      label: parameter.get('name') || '',
      entries: InputOutputParameter({
        idPrefix: id,
        element,
        parameter
      }),
      autoFocusEntry: id + '-name',
      remove: removeFactory({
        commandStack,
        element,
        parameter
      })
    };
  });
  return {
    items,
    add: addFactory({
      bpmnFactory,
      commandStack,
      element
    }),
    shouldSort: false
  };
}
function removeFactory({
  commandStack,
  element,
  parameter
}) {
  return function (event) {
    event.stopPropagation();
    const inputOutput = getInputOutput(element);
    if (!inputOutput) {
      return;
    }
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: inputOutput,
      properties: {
        outputParameters: minDash.without(inputOutput.get('outputParameters'), parameter)
      }
    });
  };
}
function addFactory({
  bpmnFactory,
  commandStack,
  element
}) {
  return function (event) {
    event.stopPropagation();
    commandStack.execute('properties-panel.multi-command-executor', AddParameterCmd(element, 'camunda:OutputParameter', bpmnFactory));
  };
}

function TimerProps(props) {
  const {
    element,
    listener,
    idPrefix
  } = props;
  let {
    timerEventDefinition
  } = props;
  if (!timerEventDefinition) {
    const businessObject = ModelUtil.getBusinessObject(element);
    timerEventDefinition = getTimerEventDefinition(businessObject);
  }
  const timerEventDefinitionType = getTimerDefinitionType(timerEventDefinition);

  // (1) Only show for supported elements
  if (!isTimerSupported(element) && !isTimerSupportedOnListener(listener)) {
    return [];
  }

  // (2) Provide entries, have a value only if selection was made
  const entries = [];
  entries.push({
    id: getId(idPrefix, 'timerEventDefinitionType'),
    component: TimerEventDefinitionType,
    isEdited: propertiesPanel.isSelectEntryEdited,
    timerEventDefinition,
    timerEventDefinitionType
  });
  if (timerEventDefinitionType) {
    entries.push({
      id: getId(idPrefix, 'timerEventDefinitionValue'),
      component: TimerEventDefinitionValue,
      isEdited: propertiesPanel.isTextFieldEntryEdited,
      timerEventDefinition,
      timerEventDefinitionType
    });
  }
  return entries;
}

/**
 * TimerEventDefinitionType - Generic select entry allowing to select a specific
 * timerEventDefintionType. To be used together with timerEventDefinitionValue.
 *
 * @param  {type} props
 * @return {SelectEntry}
 */
function TimerEventDefinitionType(props) {
  const {
    element,
    timerEventDefinition,
    timerEventDefinitionType
  } = props;
  const commandStack = useService('commandStack'),
    bpmnFactory = useService('bpmnFactory'),
    translate = useService('translate');
  const getValue = () => {
    return timerEventDefinitionType || '';
  };
  const setValue = value => {
    // (1) Check if value is different to current type
    if (value === timerEventDefinitionType) {
      return;
    }

    // (2) Create empty formalExpression element
    const formalExpression = bpmnFactory.create('bpmn:FormalExpression', {
      body: undefined
    });
    formalExpression.$parent = timerEventDefinition;

    // (3) Set the value for selected timerEventDefinitionType
    const newProps = {
      timeDuration: undefined,
      timeDate: undefined,
      timeCycle: undefined
    };
    if (value !== '') {
      newProps[value] = formalExpression;
    }

    // (4) Execute businessObject update
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: timerEventDefinition,
      properties: newProps
    });
  };
  const getOptions = element => {
    return [{
      value: '',
      label: translate('<none>')
    }, {
      value: 'timeDate',
      label: translate('Date')
    }, {
      value: 'timeDuration',
      label: translate('Duration')
    }, {
      value: 'timeCycle',
      label: translate('Cycle')
    }];
  };
  return propertiesPanel.SelectEntry({
    element,
    id: 'timerEventDefinitionType',
    label: translate('Type'),
    getValue,
    setValue,
    getOptions
  });
}

/**
 * TimerEventDefinitionValue - Generic textField entry allowing to specify the
 * timerEventDefintionValue based on the set timerEventDefintionType. To be used
 * together with timerEventDefinitionType.
 *
 * @param  {type} props
 * @return {TextFieldEntry}
 */
function TimerEventDefinitionValue(props) {
  const {
    element,
    timerEventDefinition,
    timerEventDefinitionType
  } = props;
  const commandStack = useService('commandStack'),
    translate = useService('translate'),
    debounce = useService('debounceInput');
  const timerEventFormalExpression = timerEventDefinition.get(timerEventDefinitionType);
  const getValue = () => {
    return timerEventFormalExpression && timerEventFormalExpression.get('body');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: timerEventFormalExpression,
      properties: {
        body: value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'timerEventDefinitionValue',
    label: translate('Value'),
    getValue,
    setValue,
    debounce,
    tooltip: getTimerEventDefinitionValueDescription(timerEventDefinitionType, translate)
  });
}

// helper //////////////////////////

function getTimerEventDefinitionValueDescription(timerDefinitionType, translate) {
  switch (timerDefinitionType) {
    case 'timeDate':
      return jsxRuntime.jsxs("div", {
        children: [jsxRuntime.jsx("p", {
          children: translate('A specific point in time defined as ISO 8601 combined date and time representation.')
        }), jsxRuntime.jsxs("ul", {
          children: [jsxRuntime.jsxs("li", {
            children: [jsxRuntime.jsx("code", {
              children: "2019-10-01T12:00:00Z"
            }), " - ", translate('UTC time')]
          }), jsxRuntime.jsxs("li", {
            children: [jsxRuntime.jsx("code", {
              children: "2019-10-02T08:09:40+02:00"
            }), " - ", translate('UTC plus 2 hours zone offset')]
          })]
        }), jsxRuntime.jsx("a", {
          href: "https://docs.camunda.org/manual/latest/reference/bpmn20/events/timer-events/#time-date",
          target: "_blank",
          rel: "noopener",
          children: translate('Documentation: Timer events')
        })]
      });
    case 'timeCycle':
      return jsxRuntime.jsxs("div", {
        children: [jsxRuntime.jsx("p", {
          children: translate('A cycle defined as ISO 8601 repeating intervals format, or a cron expression.')
        }), jsxRuntime.jsxs("ul", {
          children: [jsxRuntime.jsxs("li", {
            children: [jsxRuntime.jsx("code", {
              children: "R5/PT10S"
            }), " - ", translate('every 10 seconds, up to 5 times')]
          }), jsxRuntime.jsxs("li", {
            children: [jsxRuntime.jsx("code", {
              children: "R/P1D"
            }), " - ", translate('every day, infinitely')]
          }), jsxRuntime.jsxs("li", {
            children: [jsxRuntime.jsx("code", {
              children: "0 0 9-17 * * MON-FRI"
            }), " - ", translate('every hour on the hour from 9-5 p.m. UTC Monday-Friday')]
          })]
        }), jsxRuntime.jsx("a", {
          href: "https://docs.camunda.org/manual/latest/reference/bpmn20/events/timer-events/#time-cycle",
          target: "_blank",
          rel: "noopener",
          children: translate('Documentation: Timer events')
        })]
      });
    case 'timeDuration':
      return jsxRuntime.jsxs("div", {
        children: [jsxRuntime.jsx("p", {
          children: translate('A time duration defined as ISO 8601 durations format.')
        }), jsxRuntime.jsxs("ul", {
          children: [jsxRuntime.jsxs("li", {
            children: [jsxRuntime.jsx("code", {
              children: "PT15S"
            }), " - ", translate('15 seconds')]
          }), jsxRuntime.jsxs("li", {
            children: [jsxRuntime.jsx("code", {
              children: "PT1H30M"
            }), " - ", translate('1 hour and 30 minutes')]
          }), jsxRuntime.jsxs("li", {
            children: [jsxRuntime.jsx("code", {
              children: "P14D"
            }), " - ", translate('14 days')]
          })]
        }), jsxRuntime.jsx("a", {
          href: "https://docs.camunda.org/manual/latest/reference/bpmn20/events/timer-events/#time-duration",
          target: "_blank",
          rel: "noopener",
          children: translate('Documentation: Timer events')
        })]
      });
  }
}
function isTimerSupportedOnListener(listener) {
  return listener && ModelUtil.is(listener, 'camunda:TaskListener') && getTimerEventDefinition(listener);
}
function getId(idPrefix, id) {
  return idPrefix ? idPrefix + id : id;
}

const LISTENER_ALLOWED_TYPES = ['bpmn:Activity', 'bpmn:Event', 'bpmn:Gateway', 'bpmn:SequenceFlow', 'bpmn:Process', 'bpmn:Participant'];
const SCRIPT_PROPS = {
  'script': undefined,
  'resource': undefined,
  'scriptFormat': undefined
};
const CLASS_PROPS = {
  'class': undefined
};
const EXPRESSION_PROPS = {
  'expression': undefined
};
const DELEGATE_EXPRESSION_PROPS = {
  'delegateExpression': undefined
};
const DEFAULT_PROPS = {
  ...SCRIPT_PROPS,
  ...CLASS_PROPS,
  ...EXPRESSION_PROPS,
  ...DELEGATE_EXPRESSION_PROPS
};
const DEFAULT_EVENT_PROPS = {
  'eventDefinitions': undefined,
  'event': undefined
};
const IMPLEMENTATION_TYPE_TO_LABEL = {
  class: 'Java class',
  expression: 'Expression',
  delegateExpression: 'Delegate expression',
  script: 'Script'
};
const EVENT_TO_LABEL = {
  start: 'Start',
  end: 'End',
  take: 'Take',
  create: 'Create',
  assignment: 'Assignment',
  complete: 'Complete',
  delete: 'Delete',
  update: 'Update',
  timeout: 'Timeout'
};

/**
 * Cf. https://docs.camunda.org/manual/latest/user-guide/process-engine/delegation-code/#execution-listener
 */
function ExecutionListenerProps({
  element,
  injector
}) {
  if (!ModelingUtil.isAny(element, LISTENER_ALLOWED_TYPES)) {
    return;
  }
  const bpmnFactory = injector.get('bpmnFactory'),
    commandStack = injector.get('commandStack');
  if (ModelUtil.is(element, 'bpmn:Participant') && !element.businessObject.processRef) {
    return;
  }
  const businessObject = getListenersContainer(element);
  const listeners = getExtensionElementsList(businessObject, 'camunda:ExecutionListener');
  return {
    items: listeners.map((listener, index) => {
      const id = `${element.id}-executionListener-${index}`;

      // @TODO(barmac): Find a way to pass translate for internationalized label.
      return {
        id,
        label: getListenerLabel(listener),
        entries: ExecutionListener({
          idPrefix: id,
          element,
          listener
        }),
        remove: removeListenerFactory({
          element,
          listener,
          commandStack
        })
      };
    }),
    add: addExecutionListenerFactory({
      bpmnFactory,
      commandStack,
      element
    })
  };
}
function ExecutionListener(props) {
  const {
    idPrefix,
    element,
    listener
  } = props;
  return [{
    id: `${idPrefix}-eventType`,
    component: EventType,
    listener
  }, {
    id: `${idPrefix}-listenerType`,
    component: ListenerType,
    listener
  }, ...ImplementationDetails({
    idPrefix,
    element,
    listener
  }), {
    id: `${idPrefix}-fields`,
    component: Fields,
    listener
  }];
}
function TaskListenerProps({
  element,
  injector
}) {
  if (!ModelUtil.is(element, 'bpmn:UserTask')) {
    return;
  }
  const bpmnFactory = injector.get('bpmnFactory'),
    commandStack = injector.get('commandStack');
  const businessObject = getListenersContainer(element);
  const listeners = getExtensionElementsList(businessObject, 'camunda:TaskListener');
  return {
    items: listeners.map((listener, index) => {
      const id = `${element.id}-taskListener-${index}`;

      // @TODO(barmac): Find a way to pass translate for internationalized label.
      return {
        id,
        label: getListenerLabel(listener),
        entries: TaskListener({
          idPrefix: id,
          element,
          listener
        }),
        remove: removeListenerFactory({
          element,
          listener,
          commandStack
        })
      };
    }),
    add: addTaskListenerFactory({
      bpmnFactory,
      commandStack,
      element
    })
  };
}
function TaskListener(props) {
  const {
    idPrefix,
    element,
    listener
  } = props;
  return [{
    id: `${idPrefix}-eventType`,
    component: EventType,
    listener
  }, {
    id: `${idPrefix}-listenerId`,
    component: ListenerId,
    listener
  }, {
    id: `${idPrefix}-listenerType`,
    component: ListenerType,
    listener
  }, ...ImplementationDetails({
    idPrefix,
    element,
    listener
  }), ...EventTypeDetails({
    idPrefix,
    element,
    listener
  }), {
    id: `${idPrefix}-fields`,
    component: Fields,
    listener
  }];
}
function removeListenerFactory({
  element,
  listener,
  commandStack
}) {
  return function removeListener(event) {
    event.stopPropagation();
    removeExtensionElements(element, getListenersContainer(element), listener, commandStack);
  };
}
function EventType({
  id,
  element,
  listener
}) {
  const translate = useService('translate');
  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  function getValue() {
    return listener.get('event');
  }
  function setValue(value) {
    const properties = getDefaultEventTypeProperties(value, bpmnFactory);
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: listener,
      properties
    });
  }
  function getOptions() {
    if (ModelUtil.is(listener, 'camunda:TaskListener')) {
      return [{
        value: 'create',
        label: translate('create')
      }, {
        value: 'assignment',
        label: translate('assignment')
      }, {
        value: 'complete',
        label: translate('complete')
      }, {
        value: 'delete',
        label: translate('delete')
      }, {
        value: 'update',
        label: translate('update')
      }, {
        value: 'timeout',
        label: translate('timeout')
      }];
    }
    if (ModelUtil.is(element, 'bpmn:SequenceFlow')) {
      return [{
        value: 'take',
        label: translate('take')
      }];
    }
    return [{
      value: 'start',
      label: translate('start')
    }, {
      value: 'end',
      label: translate('end')
    }];
  }
  return jsxRuntime.jsx(propertiesPanel.SelectEntry, {
    id: id,
    label: translate('Event type'),
    getValue: getValue,
    setValue: setValue,
    getOptions: getOptions
  });
}
function ListenerId({
  id,
  element,
  listener
}) {
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const commandStack = useService('commandStack');
  let options = {
    element,
    id: id,
    label: translate('Listener ID'),
    debounce,
    isEdited: propertiesPanel.isTextFieldEntryEdited,
    setValue: value => {
      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: listener,
        properties: {
          'camunda:id': value
        }
      });
    },
    getValue: () => {
      return listener.get('camunda:id');
    }
  };
  return propertiesPanel.TextFieldEntry(options);
}
function ListenerType({
  id,
  element,
  listener
}) {
  const modeling = useService('modeling');
  const translate = useService('translate');
  const bpmnFactory = useService('bpmnFactory');
  function getValue() {
    return getListenerType(listener);
  }
  function setValue(value) {
    const properties = getDefaultImplementationProperties(value, bpmnFactory);
    modeling.updateModdleProperties(element, listener, properties);
  }
  function getOptions() {
    return getListenerTypeOptions(translate);
  }
  return jsxRuntime.jsx(propertiesPanel.SelectEntry, {
    id: id,
    label: translate('Listener type'),
    getValue: getValue,
    setValue: setValue,
    getOptions: getOptions
  });
}
function ImplementationDetails(props) {
  const {
    idPrefix,
    element,
    listener
  } = props;
  const type = getListenerType(listener);
  if (type === 'class') {
    return [{
      id: getPrefixedId(idPrefix, 'javaClass'),
      component: JavaClass,
      businessObject: listener
    }];
  } else if (type === 'expression') {
    return [{
      id: getPrefixedId(idPrefix, 'expression'),
      component: Expression,
      businessObject: listener
    }];
  } else if (type === 'delegateExpression') {
    return [{
      id: getPrefixedId(idPrefix, 'delegateExpression'),
      component: DelegateExpression,
      businessObject: listener
    }];
  } else if (type === 'script') {
    return ScriptProps({
      element,
      script: listener.get('script'),
      prefix: idPrefix
    });
  }

  // should never happen
  return [];
}
function EventTypeDetails(props) {
  const {
    idPrefix,
    element,
    listener
  } = props;
  const type = listener.get('event');
  if (type === 'timeout') {
    return TimerProps({
      element,
      listener,
      timerEventDefinition: getTimerEventDefinition$1(listener),
      idPrefix: idPrefix
    });
  }
  return [];
}
function Field(props) {
  const {
    element,
    id: idPrefix,
    index,
    item: field,
    open
  } = props;
  const fieldId = `${idPrefix}-field-${index}`;
  return jsxRuntime.jsx(propertiesPanel.CollapsibleEntry, {
    id: fieldId,
    element: element,
    entries: FieldInjection({
      element,
      field,
      idPrefix: fieldId
    }),
    label: field.get('name') || '<empty>',
    open: open
  });
}
function Fields(props) {
  const {
    id,
    element,
    listener
  } = props;
  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const fields = listener.get('fields');
  function addField() {
    const field = createElement('camunda:Field', {}, listener, bpmnFactory);
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: listener,
      properties: {
        fields: [...listener.get('fields'), field]
      }
    });
  }
  function removeField(field) {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: listener,
      properties: {
        fields: minDash.without(listener.get('fields'), field)
      }
    });
  }
  return jsxRuntime.jsx(propertiesPanel.ListEntry, {
    id: id,
    element: element,
    label: translate('Field injection'),
    items: fields,
    component: Field,
    onAdd: addField,
    onRemove: removeField,
    compareFn: compareName,
    autoFocusEntry: true
  });
}
function addListenerFactory({
  bpmnFactory,
  commandStack,
  element,
  listenerGroup
}) {
  return function (event) {
    event.stopPropagation();
    const listener = bpmnFactory.create(listenerGroup, {
      event: getDefaultEvent(element, listenerGroup),
      class: ''
    });
    const businessObject = getListenersContainer(element);
    addExtensionElements(element, businessObject, listener, bpmnFactory, commandStack);
  };
}
function addTaskListenerFactory(props) {
  return addListenerFactory({
    ...props,
    listenerGroup: 'camunda:TaskListener'
  });
}
function addExecutionListenerFactory(props) {
  return addListenerFactory({
    ...props,
    listenerGroup: 'camunda:ExecutionListener'
  });
}

// helper

/**
 * Get a readable label for a listener.
 *
 * @param {ModdleElement} listener
 * @param {string => string} [translate]
 */
function getListenerLabel(listener, translate = value => value) {
  const event = listener.get('event');
  const implementationType = getListenerType(listener);
  return `${translate(EVENT_TO_LABEL[event])}: ${translate(IMPLEMENTATION_TYPE_TO_LABEL[implementationType])}`;
}
function getListenerTypeOptions(translate) {
  return Object.entries(IMPLEMENTATION_TYPE_TO_LABEL).map(([value, label]) => ({
    value,
    label: translate(label)
  }));
}
function getListenerType(listener) {
  return getImplementationType(listener);
}
function getDefaultEvent(element, listenerGroup) {
  if (listenerGroup === 'camunda:TaskListener') return 'create';
  return ModelUtil.is(element, 'bpmn:SequenceFlow') ? 'take' : 'start';
}
function getDefaultImplementationProperties(type, bpmnFactory) {
  switch (type) {
    case 'class':
      return {
        ...DEFAULT_PROPS,
        'class': ''
      };
    case 'expression':
      return {
        ...DEFAULT_PROPS,
        'expression': ''
      };
    case 'delegateExpression':
      return {
        ...DEFAULT_PROPS,
        'delegateExpression': ''
      };
    case 'script':
      return {
        ...DEFAULT_PROPS,
        'script': bpmnFactory.create('camunda:Script')
      };
  }
}
function getDefaultEventTypeProperties(type, bpmnFactory) {
  switch (type) {
    case 'timeout':
      return {
        ...DEFAULT_EVENT_PROPS,
        eventDefinitions: [bpmnFactory.create('bpmn:TimerEventDefinition')],
        event: type
      };
    default:
      return {
        ...DEFAULT_EVENT_PROPS,
        event: type
      };
  }
}
function getPrefixedId(prefix, id) {
  return `${prefix}-${id}`;
}
function compareName(field, anotherField) {
  const [name = '', anotherName = ''] = [field.name, anotherField.name];
  return name === anotherName ? 0 : name > anotherName ? 1 : -1;
}
function getListenersContainer(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  return businessObject.get('processRef') || businessObject;
}

function ProcessVariablesEntry(props) {
  const {
    element
  } = props;
  const [variables, setVariables] = hooks.useState([]);
  hooks.useEffect(async () => {
    const businessObject = ModelUtil.getBusinessObject(element);
    const rootElement = getRootElement(businessObject);
    const scope = getScope(element);
    const rawVariables = await extractProcessVariables.getVariablesForScope(scope, rootElement);
    const withName = populateElementNames(sortByName(rawVariables));
    setVariables(withName);
  }, [element]);
  if (!variables.length) {
    return null;
  }
  const byScope = groupByScope(variables);
  const multiScope = isMultiScope(byScope);
  let variableItems = [];

  // (2) get variables to display
  if (multiScope) {
    // (2a) multiple scopes, sub scopes first
    // assumption: variables extractor fetches parent variables first
    const reversed = minDash.map(reverse(minDash.keys(byScope)), scopeKey => byScope[scopeKey]);
    variableItems = minDash.flatten(reversed);
  } else {
    // (2b) single scope
    variableItems = variables;
  }
  const items = variableItems.map((variable, index) => {
    const id = element.id + '-variable-' + index;
    return {
      id,
      label: variable.name,
      entries: [...ProcessVariableItem({
        idPrefix: id,
        multiScope,
        variable
      })]
    };
  });
  return jsxRuntime.jsx(propertiesPanel.ListGroup, {
    ...props,
    items: items,
    shouldSort: false
  });
}
function ProcessVariablesProps(props) {
  const {
    element
  } = props;
  if (!canHaveProcessVariables(element)) {
    return null;
  }
  return {
    component: ProcessVariablesEntry,
    shouldSort: false
  };
}
function ProcessVariableItem(props) {
  const {
    idPrefix,
    multiScope,
    variable
  } = props;
  let entries = [];
  if (multiScope) {
    entries.push({
      id: idPrefix + '-scope',
      component: Scope,
      idPrefix,
      variable
    });
  }
  entries.push({
    id: idPrefix + '-createdIn',
    component: CreatedIn,
    idPrefix,
    variable
  });
  return entries;
}
function Scope(props) {
  const {
    idPrefix,
    variable
  } = props;
  const translate = useService('translate');
  const id = idPrefix + '-scope';
  return jsxRuntime.jsxs("div", {
    "data-entry-id": id,
    class: "bio-properties-panel-entry",
    children: [jsxRuntime.jsx("b", {
      style: "font-weight: bold",
      class: "bio-properties-panel-label",
      children: translate('Scope')
    }), jsxRuntime.jsx("label", {
      id: prefixId(id),
      class: "bio-properties-panel-label",
      children: variable.scope
    })]
  });
}
function CreatedIn(props) {
  const {
    idPrefix,
    variable
  } = props;
  const translate = useService('translate');
  const id = idPrefix + '-createdIn';
  const origin = variable.origin.join(', ');
  return jsxRuntime.jsxs("div", {
    "data-entry-id": id,
    class: "bio-properties-panel-entry",
    children: [jsxRuntime.jsx("b", {
      style: "font-weight: bold",
      class: "bio-properties-panel-label",
      children: translate('Created in')
    }), jsxRuntime.jsx("label", {
      id: prefixId(id),
      class: "bio-properties-panel-label",
      children: origin
    })]
  });
}

// helper //////////////////////

function canHaveProcessVariables(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  return ModelingUtil.isAny(element, ['bpmn:Process', 'bpmn:SubProcess']) || ModelUtil.is(element, 'bpmn:Participant') && businessObject.get('processRef');
}
function getRootElement(element) {
  const businessObject = ModelUtil.getBusinessObject(element);
  if (ModelUtil.is(businessObject, 'bpmn:Participant')) {
    return businessObject.processRef;
  }
  if (ModelUtil.is(businessObject, 'bpmn:Process')) {
    return businessObject;
  }
  let parent = businessObject;
  while (parent.$parent && !ModelUtil.is(parent, 'bpmn:Process')) {
    parent = parent.$parent;
  }
  return parent;
}
function getScope(element) {
  const bo = ModelUtil.getBusinessObject(element);
  if (ModelUtil.is(element, 'bpmn:Participant')) {
    return bo.processRef.id;
  }
  return bo.id;
}
function sortByName(variables) {
  return minDash.sortBy(variables, function (variable) {
    return variable.name;
  });
}
function groupByScope(variables) {
  return minDash.groupBy(variables, 'scope');
}
function populateElementNames(variables) {
  minDash.forEach(variables, function (variable) {
    const names = minDash.map(variable.origin, function (element) {
      return element.name || element.id;
    });
    variable.origin = names;
    variable.scope = variable.scope.name || variable.scope.id;
  });
  return variables;
}
function isMultiScope(scopedVariables) {
  return minDash.keys(scopedVariables).length > 1;
}
function reverse(array) {
  return minDash.map(array, function (a, i) {
    return array[array.length - 1 - i];
  });
}
function prefixId(id) {
  return `bio-properties-panel-${id}`;
}

function ScriptTaskProps(props) {
  const {
    element
  } = props;
  if (!ModelUtil.is(element, 'bpmn:ScriptTask')) {
    return [];
  }
  const entries = [...ScriptProps({
    element
  })];
  entries.push({
    id: 'scriptResultVariable',
    component: ResultVariable,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  });
  return entries;
}
function ResultVariable(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const businessObject = ModelUtil.getBusinessObject(element);
  const getValue = () => {
    return businessObject.get('camunda:resultVariable');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:resultVariable': value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'scriptResultVariable',
    label: translate('Result variable'),
    getValue,
    setValue,
    debounce
  });
}

function TasklistProps(props) {
  const {
    element
  } = props;
  const businessObject = ModelUtil.getBusinessObject(element);
  const isEdited = node => {
    return node && !node.checked;
  };
  if (!ModelUtil.is(element, 'bpmn:Process') && !(ModelUtil.is(element, 'bpmn:Participant') && businessObject.get('processRef'))) {
    return [];
  }
  return [{
    id: 'isStartableInTasklist',
    component: Startable,
    isEdited
  }];
}
function Startable(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const process = getProcess$1(element);
  const getValue = () => {
    return process.get('camunda:isStartableInTasklist');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: process,
      properties: {
        'camunda:isStartableInTasklist': value
      }
    });
  };
  return propertiesPanel.CheckboxEntry({
    element,
    id: 'isStartableInTasklist',
    label: translate('Startable'),
    getValue,
    setValue
  });
}

// helper //////////////////

function getProcess$1(element) {
  return ModelUtil.is(element, 'bpmn:Process') ? ModelUtil.getBusinessObject(element) : ModelUtil.getBusinessObject(element).get('processRef');
}

/**
 * Cf. https://docs.camunda.org/manual/latest/reference/bpmn20/tasks/user-task/
 */
function UserAssignmentProps(props) {
  const {
    element
  } = props;
  if (!ModelUtil.is(element, 'camunda:Assignable')) {
    return [];
  }
  return [{
    id: 'assignee',
    component: Assignee,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  }, {
    id: 'candidateGroups',
    component: CandidateGroups,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  }, {
    id: 'candidateUsers',
    component: CandidateUsers,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  }, {
    id: 'dueDate',
    component: DueDate,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  }, {
    id: 'followUpDate',
    component: FollowUpDate,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  }, {
    id: 'priority',
    component: Priority,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  }];
}
function Assignee(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const businessObject = ModelUtil.getBusinessObject(element);
  const getValue = () => {
    return businessObject.get('camunda:assignee');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:assignee': value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'assignee',
    label: translate('Assignee'),
    getValue,
    setValue,
    debounce
  });
}
function CandidateUsers(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const businessObject = ModelUtil.getBusinessObject(element);
  const getValue = () => {
    return businessObject.get('camunda:candidateUsers');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:candidateUsers': value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'candidateUsers',
    label: translate('Candidate users'),
    getValue,
    setValue,
    debounce
  });
}
function CandidateGroups(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const businessObject = ModelUtil.getBusinessObject(element);
  const getValue = () => {
    return businessObject.get('camunda:candidateGroups');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:candidateGroups': value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'candidateGroups',
    label: translate('Candidate groups'),
    getValue,
    setValue,
    debounce
  });
}
function DueDate(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const businessObject = ModelUtil.getBusinessObject(element);
  const getValue = () => {
    return businessObject.get('camunda:dueDate');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:dueDate': value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'dueDate',
    label: translate('Due date'),
    description: translate('The due date as an EL expression (e.g. ${someDate}) or an ISO date (e.g. 2015-06-26T09:54:00).'),
    getValue,
    setValue,
    debounce
  });
}
function FollowUpDate(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const businessObject = ModelUtil.getBusinessObject(element);
  const getValue = () => {
    return businessObject.get('camunda:followUpDate');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:followUpDate': value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'followUpDate',
    label: translate('Follow up date'),
    description: translate('The follow up date as an EL expression (e.g. ${someDate}) or an ' + 'ISO date (e.g. 2015-06-26T09:54:00).'),
    getValue,
    setValue,
    debounce
  });
}
function Priority(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const businessObject = ModelUtil.getBusinessObject(element);
  const getValue = () => {
    return businessObject.get('camunda:priority');
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:priority': value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'priority',
    label: translate('Priority'),
    getValue,
    setValue,
    debounce
  });
}

function VersionTagProps(props) {
  const {
    element
  } = props;
  const businessObject = ModelUtil.getBusinessObject(element);
  if (!ModelUtil.is(element, 'bpmn:Process') && !(ModelUtil.is(element, 'bpmn:Participant') && businessObject.get('processRef'))) {
    return [];
  }
  return [{
    id: 'versionTag',
    component: VersionTag,
    isEdited: propertiesPanel.isTextFieldEntryEdited
  }];
}
function VersionTag(props) {
  const {
    element
  } = props;
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const process = getProcess(element);
  const getValue = () => {
    return process.get('camunda:versionTag') || '';
  };
  const setValue = value => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: process,
      properties: {
        'camunda:versionTag': value
      }
    });
  };
  return propertiesPanel.TextFieldEntry({
    element,
    id: 'versionTag',
    label: translate('Version tag'),
    getValue,
    setValue,
    debounce
  });
}

// helper //////////////////

function getProcess(element) {
  return ModelUtil.is(element, 'bpmn:Process') ? ModelUtil.getBusinessObject(element) : ModelUtil.getBusinessObject(element).get('processRef');
}

const LOW_PRIORITY = 500;
const CAMUNDA_PLATFORM_GROUPS = [HistoryCleanupGroup, TasklistGroup, CandidateStarterGroup, ImplementationGroup, ExternalTaskGroup, ProcessVariablesGroup, ErrorsGroup, UserAssignmentGroup, FormGroup, FormDataGroup, TaskListenerGroup, StartInitiatorGroup, ScriptGroup, ConditionGroup, CallActivityGroup, AsynchronousContinuationsGroup, JobExecutionGroup, InMappingPropagationGroup, InMappingGroup, InputGroup, ConnectorInputGroup, OutMappingPropagationGroup, OutMappingGroup, OutputGroup, ConnectorOutputGroup, ExecutionListenerGroup, ExtensionPropertiesGroup, FieldInjectionGroup, BusinessKeyGroup];

/**
 * Provides `camunda` namespace properties.
 *
 * @example
 * ```javascript
 * import BpmnModeler from 'bpmn-js/lib/Modeler';
 * import {
 *   BpmnPropertiesPanelModule,
 *   BpmnPropertiesProviderModule,
 *   CamundaPlatformPropertiesProviderModule
 * } from 'bpmn-js-properties-panel';
 *
 * const modeler = new BpmnModeler({
 *   container: '#canvas',
 *   propertiesPanel: {
 *     parent: '#properties'
 *   },
 *   additionalModules: [
 *     BpmnPropertiesPanelModule,
 *     BpmnPropertiesProviderModule,
 *     CamundaPlatformPropertiesProviderModule
 *   ]
 * });
 * ```
 */
class CamundaPlatformPropertiesProvider {
  constructor(propertiesPanel, injector) {
    propertiesPanel.registerProvider(LOW_PRIORITY, this);
    this._injector = injector;
  }
  getGroups(element) {
    return groups => {
      // (1) add Camunda Platform specific groups
      groups = groups.concat(this._getGroups(element));

      // (2) update existing groups with Camunda Platform specific properties
      updateGeneralGroup(groups, element);
      updateErrorGroup(groups, element);
      updateEscalationGroup(groups, element);
      updateMultiInstanceGroup(groups, element);
      updateTimerGroup(groups, element);

      // (3) move groups given specific priorities
      moveImplementationGroup(groups);
      return groups;
    };
  }
  _getGroups(element) {
    const groups = CAMUNDA_PLATFORM_GROUPS.map(createGroup => createGroup(element, this._injector));

    // contract: if a group returns null, it should not be displayed at all
    return groups.filter(group => group !== null);
  }
}
CamundaPlatformPropertiesProvider.$inject = ['propertiesPanel', 'injector'];

/**
 * This ensures the <Implementation> group always locates after <Documentation>
 */
function moveImplementationGroup(groups) {
  const documentationGroupIdx = findGroupIndex(groups, 'documentation');
  if (documentationGroupIdx < 0) {
    return;
  }
  return moveGroup(groups, 'CamundaPlatform__Implementation', documentationGroupIdx + 1);
}
function updateGeneralGroup(groups, element) {
  const generalGroup = findGroup(groups, 'general');
  if (!generalGroup) {
    return;
  }
  const {
    entries
  } = generalGroup;

  // (1) add version tag before executable (if existing)
  const executableEntry = minDash.findIndex(entries, entry => entry.id === 'isExecutable');
  const insertIndex = executableEntry >= 0 ? executableEntry : entries.length;
  entries.splice(insertIndex, 0, ...VersionTagProps({
    element
  }));
}
function updateErrorGroup(groups, element) {
  const errorGroup = findGroup(groups, 'error');
  if (!errorGroup) {
    return;
  }
  const {
    entries
  } = errorGroup;
  ErrorProps({
    element,
    entries
  });
}
function updateMultiInstanceGroup(groups, element) {
  const multiInstanceGroup = findGroup(groups, 'multiInstance');
  if (!multiInstanceGroup) {
    return;
  }
  const {
    entries
  } = multiInstanceGroup;
  MultiInstanceProps({
    element,
    entries
  });
}
function updateEscalationGroup(groups, element) {
  const escalationGroup = findGroup(groups, 'escalation');
  if (!escalationGroup) {
    return;
  }
  const {
    entries
  } = escalationGroup;
  EscalationProps({
    element,
    entries
  });
}
function updateTimerGroup(groups, element) {
  const timerEventGroup = findGroup(groups, 'timer');
  if (!timerEventGroup) {
    return;
  }
  timerEventGroup.entries = [...TimerProps({
    element
  })];
}
function ImplementationGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Implementation'),
    id: 'CamundaPlatform__Implementation',
    component: propertiesPanel.Group,
    entries: [...ImplementationProps({
      element
    })]
  };
  if (group.entries.length) {
    return group;
  }
  return null;
}
function ErrorsGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Errors'),
    id: 'CamundaPlatform__Errors',
    component: propertiesPanel.ListGroup,
    ...ErrorsProps({
      element,
      injector
    })
  };
  if (group.items) {
    return group;
  }
  return null;
}
function UserAssignmentGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('User assignment'),
    id: 'CamundaPlatform__UserAssignment',
    component: propertiesPanel.Group,
    entries: [...UserAssignmentProps({
      element
    })]
  };
  if (group.entries.length) {
    return group;
  }
  return null;
}
function ScriptGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Script'),
    id: 'CamundaPlatform__Script',
    component: propertiesPanel.Group,
    entries: [...ScriptTaskProps({
      element
    })]
  };
  if (group.entries.length) {
    return group;
  }
  return null;
}
function CallActivityGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Called element'),
    id: 'CamundaPlatform__CallActivity',
    component: propertiesPanel.Group,
    entries: [...CallActivityProps({
      element
    })]
  };
  if (group.entries.length) {
    return group;
  }
  return null;
}
function ConditionGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Condition'),
    id: 'CamundaPlatform__Condition',
    component: propertiesPanel.Group,
    entries: [...ConditionProps({
      element
    })]
  };
  if (group.entries.length) {
    return group;
  }
  return null;
}
function StartInitiatorGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Start initiator'),
    id: 'CamundaPlatform__StartInitiator',
    component: propertiesPanel.Group,
    entries: [...InitiatorProps({
      element
    })]
  };
  if (group.entries.length) {
    return group;
  }
  return null;
}
function ExternalTaskGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('External task'),
    id: 'CamundaPlatform__ExternalTask',
    component: propertiesPanel.Group,
    entries: [...ExternalTaskPriorityProps({
      element
    })]
  };
  if (group.entries.length) {
    return group;
  }
  return null;
}
function AsynchronousContinuationsGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Asynchronous continuations'),
    id: 'CamundaPlatform__AsynchronousContinuations',
    component: propertiesPanel.Group,
    entries: [...AsynchronousContinuationsProps({
      element
    })]
  };
  if (group.entries.length) {
    return group;
  }
  return null;
}
function JobExecutionGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Job execution'),
    id: 'CamundaPlatform__JobExecution',
    component: propertiesPanel.Group,
    entries: [...JobExecutionProps({
      element
    })]
  };
  if (group.entries.length) {
    return group;
  }
  return null;
}
function CandidateStarterGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Candidate starter'),
    id: 'CamundaPlatform__CandidateStarter',
    component: propertiesPanel.Group,
    entries: [...CandidateStarterProps({
      element
    })]
  };
  if (group.entries.length) {
    return group;
  }
  return null;
}
function FieldInjectionGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Field injections'),
    id: 'CamundaPlatform__FieldInjection',
    component: propertiesPanel.ListGroup,
    ...FieldInjectionProps({
      element,
      injector
    })
  };
  if (group.items) {
    return group;
  }
  return null;
}
function HistoryCleanupGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('History cleanup'),
    id: 'CamundaPlatform__HistoryCleanup',
    component: propertiesPanel.Group,
    entries: [...HistoryCleanupProps({
      element
    })]
  };
  if (group.entries.length) {
    return group;
  }
  return null;
}
function TasklistGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Tasklist'),
    id: 'CamundaPlatform__Tasklist',
    component: propertiesPanel.Group,
    entries: [...TasklistProps({
      element
    })]
  };
  if (group.entries.length) {
    return group;
  }
  return null;
}
function InMappingGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('In mappings'),
    id: 'CamundaPlatform__InMapping',
    component: propertiesPanel.ListGroup,
    ...InMappingProps({
      element,
      injector
    })
  };
  if (group.items) {
    return group;
  }
  return null;
}
function InMappingPropagationGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('In mapping propagation'),
    id: 'CamundaPlatform__InMappingPropagation',
    component: propertiesPanel.Group,
    entries: [...InMappingPropagationProps({
      element
    })]
  };
  if (group.entries.length) {
    return group;
  }
  return null;
}
function OutMappingGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Out mappings'),
    id: 'CamundaPlatform__OutMapping',
    component: propertiesPanel.ListGroup,
    ...OutMappingProps({
      element,
      injector
    })
  };
  if (group.items) {
    return group;
  }
  return null;
}
function OutMappingPropagationGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Out mapping propagation'),
    id: 'CamundaPlatform__OutMappingPropagation',
    component: propertiesPanel.Group,
    entries: [...OutMappingPropagationProps({
      element
    })]
  };
  if (group.entries.length) {
    return group;
  }
  return null;
}
function ProcessVariablesGroup(element, injector) {
  const translate = injector.get('translate');
  const variableProps = ProcessVariablesProps({
    element,
    injector
  });
  if (!variableProps) {
    return null;
  }
  const group = {
    label: translate('Process variables'),
    id: 'CamundaPlatform__ProcessVariables',
    ...variableProps
  };
  return group;
}
function FormDataGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Form fields'),
    id: 'CamundaPlatform__FormData',
    component: propertiesPanel.ListGroup,
    ...FormDataProps({
      element,
      injector
    })
  };
  if (group.items) {
    return group;
  }
  return null;
}
function BusinessKeyGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Business key'),
    id: 'CamundaPlatform__BusinessKey',
    component: propertiesPanel.Group,
    entries: [...BusinessKeyProps$1({
      element
    })]
  };
  if (group.entries.length) {
    return group;
  }
  return null;
}
function FormGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Forms'),
    id: 'CamundaPlatform__Form',
    component: propertiesPanel.Group,
    entries: [...FormProps({
      element
    })]
  };
  if (group.entries.length) {
    return group;
  }
  return null;
}
function ExecutionListenerGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Execution listeners'),
    id: 'CamundaPlatform__ExecutionListener',
    component: propertiesPanel.ListGroup,
    ...ExecutionListenerProps({
      element,
      injector
    })
  };
  if (group.items) {
    return group;
  }
  return null;
}
function TaskListenerGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Task listeners'),
    id: 'CamundaPlatform__TaskListener',
    component: propertiesPanel.ListGroup,
    ...TaskListenerProps({
      element,
      injector
    })
  };
  if (group.items) {
    return group;
  }
  return null;
}
function InputGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Inputs'),
    id: 'CamundaPlatform__Input',
    component: propertiesPanel.ListGroup,
    ...InputProps({
      element,
      injector
    })
  };
  if (group.items) {
    return group;
  }
  return null;
}
function OutputGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Outputs'),
    id: 'CamundaPlatform__Output',
    component: propertiesPanel.ListGroup,
    ...OutputProps({
      element,
      injector
    })
  };
  if (group.items) {
    return group;
  }
  return null;
}
function ConnectorInputGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Connector inputs'),
    id: 'CamundaPlatform__ConnectorInput',
    component: propertiesPanel.ListGroup,
    ...ConnectorInputProps({
      element,
      injector
    })
  };
  if (group.items) {
    return group;
  }
  return null;
}
function ConnectorOutputGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Connector outputs'),
    id: 'CamundaPlatform__ConnectorOutput',
    component: propertiesPanel.ListGroup,
    ...ConnectorOutputProps({
      element,
      injector
    })
  };
  if (group.items) {
    return group;
  }
  return null;
}
function ExtensionPropertiesGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Extension properties'),
    id: 'CamundaPlatform__ExtensionProperties',
    component: propertiesPanel.ListGroup,
    ...ExtensionPropertiesProps({
      element,
      injector
    })
  };
  if (group.items) {
    return group;
  }
  return null;
}

// helper /////////////////////

function findGroup(groups, id) {
  return groups.find(g => g.id === id);
}
function findGroupIndex(groups, id) {
  return minDash.findIndex(groups, g => g.id === id);
}
function moveGroup(groups, id, position) {
  const groupIndex = findGroupIndex(groups, id);
  if (position < 0 || groupIndex < 0) {
    return;
  }
  return arrayMove.mutate(groups, groupIndex, position);
}

var index = {
  __init__: ['camundaPlatformPropertiesProvider'],
  camundaPlatformPropertiesProvider: ['type', CamundaPlatformPropertiesProvider]
};

/* eslint-disable react-hooks/rules-of-hooks */
const TooltipProvider = {
  'group-assignmentDefinition': element => {
    const translate = useService('translate');
    return jsxRuntime.jsxs("div", {
      children: [translate('Define who the task is assigned to. One or all of the following attributes can be specified simultaneously. '), jsxRuntime.jsx("a", {
        href: "https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/#assignments",
        target: "_blank",
        rel: "noopener",
        title: translate('User task documentation'),
        children: translate('Learn more.')
      })]
    });
  },
  'group-condition': element => {
    const translate = useService('translate');
    return jsxRuntime.jsxs("div", {
      children: [translate('Define a boolean condition expression that defines when this flow is taken. '), jsxRuntime.jsx("a", {
        href: "https://docs.camunda.io/docs/components/modeler/bpmn/exclusive-gateways/#conditions",
        target: "_blank",
        rel: "noopener",
        title: translate('Conditions documentation'),
        children: translate('Learn how to define conditions.')
      })]
    });
  },
  'group-businessRuleImplementation': element => {
    const translate = useService('translate');
    return jsxRuntime.jsxs("div", {
      children: [translate('Evaluate a business rule, for example a DMN. To add a custom implementation, use a job worker. '), jsxRuntime.jsx("a", {
        href: "https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/#defining-a-task",
        target: "_blank",
        rel: "noopener",
        title: translate('Business rule task documentation'),
        children: translate('Learn more.')
      })]
    });
  },
  'group-scriptImplementation': element => {
    const translate = useService('translate');
    return jsxRuntime.jsxs("div", {
      children: [translate('Implement a script task using an inline FEEL expression. To add a custom implementation, use a job worker. '), jsxRuntime.jsx("a", {
        href: "https://docs.camunda.io/docs/components/modeler/bpmn/script-tasks/#defining-a-script-task",
        target: "_blank",
        rel: "noopener",
        title: translate('Script task documentation'),
        children: translate('Learn more.')
      })]
    });
  },
  'group-form': element => {
    const translate = useService('translate');
    return jsxRuntime.jsxs("div", {
      children: [translate('Link or embed a form created with the Camunda Forms editor. To associate a custom form, application, or URL to the user task, specify a form key. '), jsxRuntime.jsx("a", {
        href: "https://docs.camunda.io/docs/guides/utilizing-forms/#connect-your-form-to-a-bpmn-diagram",
        target: "_blank",
        rel: "noopener",
        title: translate('User task form documentation'),
        children: translate('Learn more.')
      })]
    });
  },
  'group-message': element => {
    const translate = useService('translate');
    if (ModelUtil.is(element, 'bpmn:ReceiveTask')) {
      return jsxRuntime.jsxs("div", {
        children: [translate('Define the name of the message (e.g. '), jsxRuntime.jsx("code", {
          children: "Money collected"
        }), translate(') and the '), jsxRuntime.jsx("code", {
          children: "correlationKey"
        }), translate(' expression (e.g. '), jsxRuntime.jsx("code", {
          children: "= orderId"
        }), translate(')'), translate(' to subscribe to. '), translate('Learn more how to '), jsxRuntime.jsx("a", {
          href: "https://docs.camunda.io/docs/components/modeler/bpmn/send-tasks",
          target: "_blank",
          rel: "noopener",
          title: translate('Send task documentation'),
          children: translate('send ')
        }), translate('and '), jsxRuntime.jsx("a", {
          href: "https://docs.camunda.io/docs/components/modeler/bpmn/receive-tasks",
          target: "_blank",
          rel: "noopener",
          title: translate('Receive task documentation'),
          children: translate('receive messages. ')
        })]
      });
    }
    return jsxRuntime.jsxs("div", {
      children: [translate('Define the name of the message (e.g. '), jsxRuntime.jsx("code", {
        children: "Money collected"
      }), translate(') and the '), jsxRuntime.jsx("code", {
        children: "correlationKey"
      }), translate(' expression (e.g. '), jsxRuntime.jsx("code", {
        children: "= orderId"
      }), translate(')'), translate(' to subscribe to. '), jsxRuntime.jsx("a", {
        href: "https://docs.camunda.io/docs/components/modeler/bpmn/message-events/#messages",
        target: "_blank",
        rel: "noopener",
        title: translate('Message event documentation'),
        children: translate('Learn more.')
      })]
    });
  },
  'group-calledElement': element => {
    const translate = useService('translate');
    return jsxRuntime.jsxs("div", {
      children: [translate('Define the ID of the process to call (e.g. '), " ", jsxRuntime.jsx("code", {
        children: "shipping-process"
      }), translate(' or '), jsxRuntime.jsx("code", {
        children: "= \"shipping-\" + tenantId"
      }), " ", translate('). '), jsxRuntime.jsx("a", {
        href: "https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/",
        target: "_blank",
        rel: "noopener",
        title: translate('Call activity documentation'),
        children: translate('Learn more.')
      })]
    });
  },
  'group-taskDefinition': element => {
    const translate = useService('translate');
    if (ModelUtil.is(element, 'bpmn:ServiceTask')) {
      return jsxRuntime.jsxs("div", {
        children: [translate('Specify which job workers handle the task work to execute a service (e.g. '), jsxRuntime.jsx("code", {
          children: "order-items"
        }), translate('). '), jsxRuntime.jsx("a", {
          href: "https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks",
          target: "_blank",
          rel: "noopener",
          title: translate('Service task documentation'),
          children: translate('Learn more.')
        })]
      });
    }
    if (ModelUtil.is(element, 'bpmn:BusinessRuleTask')) {
      return jsxRuntime.jsxs("div", {
        children: [translate('Specify which job workers handle the task work to evaluate business rules. '), jsxRuntime.jsx("a", {
          href: "https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/#job-worker-implementation",
          target: "_blank",
          rel: "noopener",
          title: translate('Business rule task documentation'),
          children: translate('Learn more.')
        })]
      });
    }
    if (ModelUtil.is(element, 'bpmn:ScriptTask')) {
      return jsxRuntime.jsxs("div", {
        children: [translate('Specify which job workers handle the task work to execute a script. '), jsxRuntime.jsx("a", {
          href: "https://docs.camunda.io/docs/components/modeler/bpmn/script-tasks/#defining-a-task",
          target: "_blank",
          rel: "noopener",
          title: translate('Script task documentation'),
          children: translate('Learn more.')
        })]
      });
    }
    if (ModelUtil.is(element, 'bpmn:SendTask')) {
      return jsxRuntime.jsxs("div", {
        children: [translate('Specify which job workers handle the task work to send a message (e.g. '), jsxRuntime.jsx("code", {
          children: "kafka"
        }), translate(' or '), jsxRuntime.jsx("code", {
          children: "mail"
        }), translate('). '), jsxRuntime.jsx("a", {
          href: "https://docs.camunda.io/docs/components/modeler/bpmn/send-tasks/#defining-a-task",
          target: "_blank",
          rel: "noopener",
          title: translate('Send task documentation'),
          children: translate('Learn more.')
        })]
      });
    }
    if (ModelUtil.is(element, 'bpmn:ThrowEvent')) {
      return jsxRuntime.jsxs("div", {
        children: [translate('Specify which job workers handle the event work. '), jsxRuntime.jsx("a", {
          href: "https://docs.camunda.io/docs/components/modeler/bpmn/message-events/#message-throw-events",
          target: "_blank",
          rel: "noopener",
          title: translate('Message throw event documentation'),
          children: translate('Learn more.')
        })]
      });
    }
  },
  'group-multiInstance': element => {
    const translate = useService('translate');
    return jsxRuntime.jsxs("div", {
      children: [translate('Execute this task for each element of a given collection. '), jsxRuntime.jsx("br", {}), translate('Define an input collection expression that defines the collection to iterate over (e.g. '), jsxRuntime.jsx("code", {
        children: "= items"
      }), translate('). '), translate('To collect the output define the output collection and the output element expressions. '), jsxRuntime.jsx("a", {
        href: "https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/#defining-the-collection-to-iterate-over",
        target: "_blank",
        rel: "noopener",
        title: translate('Multi instance documentation'),
        children: translate('Learn more.')
      })]
    });
  },
  'group-error': element => {
    const translate = useService('translate');
    return jsxRuntime.jsxs("div", {
      children: [translate('Define an error code (e.g. '), jsxRuntime.jsx("code", {
        children: "order-not-found"
      }), translate('). '), jsxRuntime.jsx("a", {
        href: "https://docs.camunda.io/docs/components/modeler/bpmn/error-events/#defining-the-error",
        target: "_blank",
        rel: "noopener",
        title: translate('Error event documentation'),
        children: translate('Learn more.')
      })]
    });
  },
  'group-inputs': element => {
    const translate = useService('translate');
    return jsxRuntime.jsxs("div", {
      children: [translate('Create a new local variable in the scope of this task. '), jsxRuntime.jsx("a", {
        href: "https://docs.camunda.io/docs/components/concepts/variables/#input-mappings",
        target: "_blank",
        rel: "noopener",
        title: translate('Input mappings documentation'),
        children: translate('Learn more.')
      })]
    });
  },
  'group-outputs': element => {
    const translate = useService('translate');
    return jsxRuntime.jsxs("div", {
      children: [translate('Customize how result variables are merged into the global scope of the process instance. '), jsxRuntime.jsx("a", {
        href: "https://docs.camunda.io/docs/components/concepts/variables/#output-mappings",
        target: "_blank",
        rel: "noopener",
        title: translate('Output mappings documentation'),
        children: translate('Learn more.')
      })]
    });
  }
};

exports.BpmnPropertiesPanelModule = index$3;
exports.BpmnPropertiesProviderModule = index$2;
exports.CamundaPlatformPropertiesProviderModule = index;
exports.ZeebePropertiesProviderModule = index$1;
exports.ZeebeTooltipProvider = TooltipProvider;
exports.useService = useService;
//# sourceMappingURL=index.js.map
