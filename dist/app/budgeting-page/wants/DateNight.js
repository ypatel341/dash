"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const axios_1 = __importDefault(require("axios"));
const DateNight = () => {
    const [data, setData] = (0, react_1.useState)();
    {
        /* this array is used for data once the data has been recieved from the endpoint*/
    }
    const [loading, setLoading] = (0, react_1.useState)(true);
    {
        /* this boolean is used for isLoading or isNotLoading */
    }
    const [error, setError] = (0, react_1.useState)('');
    {
        /* this string is used for error message */
    }
    (0, react_1.useEffect)(() => {
        axios_1.default
            .get('http://localhost:5000/budget/wants/date-night')
            .then((response) => {
            setData(response.data);
            setLoading(false);
        })
            .catch((error) => {
            setError(error.message);
            setLoading(false);
        });
    }, []);
    if (loading) {
        return (0, jsx_runtime_1.jsx)("div", { children: "Loading..." }, void 0);
    }
    if (error) {
        return (0, jsx_runtime_1.jsxs)("div", { children: ["Error: ", error] }, void 0);
    }
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { children: "DateNight" }, void 0), (0, jsx_runtime_1.jsx)("p", { children: data === null || data === void 0 ? void 0 : data.category }, void 0), (0, jsx_runtime_1.jsx)("p", { children: data === null || data === void 0 ? void 0 : data.bucketName }, void 0), (0, jsx_runtime_1.jsx)("p", { children: data === null || data === void 0 ? void 0 : data.budget }, void 0)] }, void 0));
};
exports.default = DateNight;
