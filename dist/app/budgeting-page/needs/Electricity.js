'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const jsx_runtime_1 = require('react/jsx-runtime');
const Electricity = ({ data }) => {
  return (0, jsx_runtime_1.jsxs)(
    'div',
    {
      children: [
        (0, jsx_runtime_1.jsx)('h1', { children: 'Electricity' }, void 0),
        (0, jsx_runtime_1.jsx)('p', { children: data.category }, void 0),
        (0, jsx_runtime_1.jsx)('p', { children: data.bucketname }, void 0),
        (0, jsx_runtime_1.jsx)('p', { children: data.amount }, void 0),
        (0, jsx_runtime_1.jsx)('p', { children: data.household }, void 0),
      ],
    },
    void 0,
  );
};
exports.default = Electricity;
