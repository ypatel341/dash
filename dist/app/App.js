"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_router_dom_1 = require("react-router-dom");
const Button_1 = __importDefault(require("@mui/material/Button"));
const BudgetHomePage_1 = __importDefault(require("./budgeting-page/BudgetHomePage"));
require("./App.css");
function App() {
    return ((0, jsx_runtime_1.jsx)(react_router_dom_1.BrowserRouter, { children: (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "App" }, { children: (0, jsx_runtime_1.jsxs)(react_router_dom_1.Routes, { children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/", element: (0, jsx_runtime_1.jsxs)("header", Object.assign({ className: "App-header" }, { children: [(0, jsx_runtime_1.jsxs)("p", { children: ["Edit ", (0, jsx_runtime_1.jsx)("code", { children: "src/App.tsx" }, void 0), " and save to reload."] }, void 0), (0, jsx_runtime_1.jsx)(Button_1.default, Object.assign({ variant: "contained", color: "primary", component: react_router_dom_1.Link, to: "/budget" }, { children: "Go to Budget Home Page" }), void 0)] }), void 0) }, void 0), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/budget", element: (0, jsx_runtime_1.jsx)(BudgetHomePage_1.default, {}, void 0) }, void 0)] }, void 0) }), void 0) }, void 0));
}
exports.default = App;
