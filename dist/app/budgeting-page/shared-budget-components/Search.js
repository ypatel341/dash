'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const jsx_runtime_1 = require('react/jsx-runtime');
const FormControl_1 = __importDefault(require('@mui/material/FormControl'));
const InputAdornment_1 = __importDefault(
  require('@mui/material/InputAdornment'),
);
const OutlinedInput_1 = __importDefault(require('@mui/material/OutlinedInput'));
const SearchRounded_1 = __importDefault(
  require('@mui/icons-material/SearchRounded'),
);
function Search() {
  return (0, jsx_runtime_1.jsx)(
    FormControl_1.default,
    Object.assign(
      { sx: { width: { xs: '100%', md: '25ch' } }, variant: 'outlined' },
      {
        children: (0, jsx_runtime_1.jsx)(
          OutlinedInput_1.default,
          {
            size: 'small',
            id: 'search',
            placeholder: 'Search\u2026',
            sx: { flexGrow: 1 },
            startAdornment: (0, jsx_runtime_1.jsx)(
              InputAdornment_1.default,
              Object.assign(
                { position: 'start', sx: { color: 'text.primary' } },
                {
                  children: (0, jsx_runtime_1.jsx)(
                    SearchRounded_1.default,
                    { fontSize: 'small' },
                    void 0,
                  ),
                },
              ),
              void 0,
            ),
            inputProps: {
              'aria-label': 'search',
            },
          },
          void 0,
        ),
      },
    ),
    void 0,
  );
}
exports.default = Search;
