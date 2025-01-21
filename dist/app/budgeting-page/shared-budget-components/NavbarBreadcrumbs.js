'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function () {
            return m[k];
          },
        });
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const jsx_runtime_1 = require('react/jsx-runtime');
const styles_1 = require('@mui/material/styles');
const Typography_1 = __importDefault(require('@mui/material/Typography'));
const Breadcrumbs_1 = __importStar(require('@mui/material/Breadcrumbs'));
const NavigateNextRounded_1 = __importDefault(
  require('@mui/icons-material/NavigateNextRounded'),
);
const StyledBreadcrumbs = (0, styles_1.styled)(Breadcrumbs_1.default)(
  ({ theme }) => ({
    margin: theme.spacing(1, 0),
    [`& .${Breadcrumbs_1.breadcrumbsClasses.separator}`]: {
      color: theme.palette.action.disabled,
      margin: 1,
    },
    [`& .${Breadcrumbs_1.breadcrumbsClasses.ol}`]: {
      alignItems: 'center',
    },
  }),
);
function NavbarBreadcrumbs() {
  return (0, jsx_runtime_1.jsxs)(
    StyledBreadcrumbs,
    Object.assign(
      {
        'aria-label': 'breadcrumb',
        separator: (0, jsx_runtime_1.jsx)(
          NavigateNextRounded_1.default,
          { fontSize: 'small' },
          void 0,
        ),
      },
      {
        children: [
          (0, jsx_runtime_1.jsx)(
            Typography_1.default,
            Object.assign({ variant: 'body1' }, { children: 'Dashboard' }),
            void 0,
          ),
          (0, jsx_runtime_1.jsx)(
            Typography_1.default,
            Object.assign(
              {
                variant: 'body1',
                sx: { color: 'text.primary', fontWeight: 600 },
              },
              { children: 'Home' },
            ),
            void 0,
          ),
        ],
      },
    ),
    void 0,
  );
}
exports.default = NavbarBreadcrumbs;
