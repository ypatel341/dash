"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const Header_1 = __importDefault(require("./shared-budget-components/Header"));
const Clothes_1 = __importDefault(require("./clothes/Clothes"));
const Clothes = () => {
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(Header_1.default, {}, void 0), (0, jsx_runtime_1.jsx)("h1", { children: "Budget Home page" }, void 0), (0, jsx_runtime_1.jsx)(Clothes_1.default, {}, void 0)] }, void 0));
};
exports.default = Clothes;
