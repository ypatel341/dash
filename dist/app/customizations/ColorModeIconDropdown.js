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
const DarkModeRounded_1 = __importDefault(require("@mui/icons-material/DarkModeRounded"));
const LightModeRounded_1 = __importDefault(require("@mui/icons-material/LightModeRounded"));
const Box_1 = __importDefault(require("@mui/material/Box"));
const IconButton_1 = __importDefault(require("@mui/material/IconButton"));
const Menu_1 = __importDefault(require("@mui/material/Menu"));
const MenuItem_1 = __importDefault(require("@mui/material/MenuItem"));
const styles_1 = require("@mui/material/styles");
function ColorModeIconDropdown(props) {
    const { mode, systemMode, setMode } = (0, styles_1.useColorScheme)();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleMode = (targetMode) => () => {
        setMode(targetMode);
        handleClose();
    };
    if (!mode) {
        return ((0, jsx_runtime_1.jsx)(Box_1.default, { "data-screenshot": "toggle-mode", sx: (theme) => ({
                verticalAlign: 'bottom',
                display: 'inline-flex',
                width: '2.25rem',
                height: '2.25rem',
                borderRadius: theme.shape.borderRadius,
                border: '1px solid',
                borderColor: theme.palette.divider,
            }) }, void 0));
    }
    const resolvedMode = (systemMode || mode);
    const icon = {
        light: (0, jsx_runtime_1.jsx)(LightModeRounded_1.default, {}, void 0),
        dark: (0, jsx_runtime_1.jsx)(DarkModeRounded_1.default, {}, void 0),
    }[resolvedMode];
    return ((0, jsx_runtime_1.jsxs)(React.Fragment, { children: [(0, jsx_runtime_1.jsx)(IconButton_1.default, Object.assign({ "data-screenshot": "toggle-mode", onClick: handleClick, disableRipple: true, size: "small", "aria-controls": open ? 'color-scheme-menu' : undefined, "aria-haspopup": "true", "aria-expanded": open ? 'true' : undefined }, props, { children: icon }), void 0), (0, jsx_runtime_1.jsxs)(Menu_1.default, Object.assign({ anchorEl: anchorEl, id: "account-menu", open: open, onClose: handleClose, onClick: handleClose, slotProps: {
                    paper: {
                        variant: 'outlined',
                        elevation: 0,
                        sx: {
                            my: '4px',
                        },
                    },
                }, transformOrigin: { horizontal: 'right', vertical: 'top' }, anchorOrigin: { horizontal: 'right', vertical: 'bottom' } }, { children: [(0, jsx_runtime_1.jsx)(MenuItem_1.default, Object.assign({ selected: mode === 'system', onClick: handleMode('system') }, { children: "System" }), void 0), (0, jsx_runtime_1.jsx)(MenuItem_1.default, Object.assign({ selected: mode === 'light', onClick: handleMode('light') }, { children: "Light" }), void 0), (0, jsx_runtime_1.jsx)(MenuItem_1.default, Object.assign({ selected: mode === 'dark', onClick: handleMode('dark') }, { children: "Dark" }), void 0)] }), void 0)] }, void 0));
}
exports.default = ColorModeIconDropdown;
