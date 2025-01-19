"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const Stack_1 = __importDefault(require("@mui/material/Stack"));
const NotificationsRounded_1 = __importDefault(require("@mui/icons-material/NotificationsRounded"));
const CustomDatePicker_1 = __importDefault(require("./CustomDatePicker"));
const NavbarBreadcrumbs_1 = __importDefault(require("./NavbarBreadcrumbs"));
const MenuButton_1 = __importDefault(require("./MenuButton"));
const ColorModeIconDropdown_1 = __importDefault(require("../../customizations/ColorModeIconDropdown"));
const Search_1 = __importDefault(require("./Search"));
function Header() {
    return ((0, jsx_runtime_1.jsxs)(Stack_1.default, Object.assign({ direction: "row", sx: {
            display: { xs: 'none', md: 'flex' },
            width: '100%',
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            maxWidth: { sm: '100%', md: '1700px' },
            pt: 1.5,
        }, spacing: 2 }, { children: [(0, jsx_runtime_1.jsx)(NavbarBreadcrumbs_1.default, {}, void 0), (0, jsx_runtime_1.jsxs)(Stack_1.default, Object.assign({ direction: "row", sx: { gap: 1 } }, { children: [(0, jsx_runtime_1.jsx)(Search_1.default, {}, void 0), (0, jsx_runtime_1.jsx)(CustomDatePicker_1.default, {}, void 0), (0, jsx_runtime_1.jsx)(MenuButton_1.default, Object.assign({ showBadge: true, "aria-label": "Open notifications" }, { children: (0, jsx_runtime_1.jsx)(NotificationsRounded_1.default, {}, void 0) }), void 0), (0, jsx_runtime_1.jsx)(ColorModeIconDropdown_1.default, {}, void 0)] }), void 0)] }), void 0));
}
exports.default = Header;
