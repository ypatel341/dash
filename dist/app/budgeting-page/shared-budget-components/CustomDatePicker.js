"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const React = __importStar(require("react"));
const dayjs_1 = __importDefault(require("dayjs"));
const Button_1 = __importDefault(require("@mui/material/Button"));
const CalendarTodayRounded_1 = __importDefault(require("@mui/icons-material/CalendarTodayRounded"));
const AdapterDayjs_1 = require("@mui/x-date-pickers/AdapterDayjs");
const LocalizationProvider_1 = require("@mui/x-date-pickers/LocalizationProvider");
const DatePicker_1 = require("@mui/x-date-pickers/DatePicker");
function ButtonField(props) {
    const { setOpen, label, id, disabled, InputProps: { ref } = {}, inputProps: { 'aria-label': ariaLabel } = {}, } = props;
    return ((0, jsx_runtime_1.jsx)(Button_1.default, Object.assign({ variant: "outlined", id: id, disabled: disabled, ref: ref, "aria-label": ariaLabel, size: "small", onClick: () => setOpen === null || setOpen === void 0 ? void 0 : setOpen((prev) => !prev), startIcon: (0, jsx_runtime_1.jsx)(CalendarTodayRounded_1.default, { fontSize: "small" }, void 0), sx: { minWidth: 'fit-content' } }, { children: label ? `${label}` : 'Pick a date' }), void 0));
}
function CustomDatePicker() {
    const [value, setValue] = React.useState((0, dayjs_1.default)('2025-01-17'));
    const [open, setOpen] = React.useState(false);
    return ((0, jsx_runtime_1.jsx)(LocalizationProvider_1.LocalizationProvider, Object.assign({ dateAdapter: AdapterDayjs_1.AdapterDayjs }, { children: (0, jsx_runtime_1.jsx)(DatePicker_1.DatePicker, { value: value, label: value == null ? null : value.format('MMM DD, YYYY'), onChange: (newValue) => setValue(newValue), slots: { field: ButtonField }, slotProps: {
                field: { setOpen },
                nextIconButton: { size: 'small' },
                previousIconButton: { size: 'small' },
            }, open: open, onClose: () => setOpen(false), onOpen: () => setOpen(true), views: ['day', 'month', 'year'] }, void 0) }), void 0));
}
exports.default = CustomDatePicker;
