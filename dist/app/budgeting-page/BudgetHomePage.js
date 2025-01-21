'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const jsx_runtime_1 = require('react/jsx-runtime');
const Header_1 = __importDefault(require('./shared-budget-components/Header'));
const Rent_1 = __importDefault(require('./needs/Rent'));
const Electricity_1 = __importDefault(require('./needs/Electricity'));
const Gas_1 = __importDefault(require('./needs/Gas'));
const Groceries_1 = __importDefault(require('./needs/Groceries'));
const HomeSupplies_1 = __importDefault(require('./needs/HomeSupplies'));
const Internet_1 = __importDefault(require('./needs/Internet'));
const Parcel_1 = __importDefault(require('./needs/Parcel'));
const Therapy_1 = __importDefault(require('./needs/Therapy'));
const Clothes_1 = __importDefault(require('./wants/Clothes'));
const Netflix_1 = __importDefault(require('./wants/Netflix'));
const Spotify_1 = __importDefault(require('./wants/Spotify'));
const Vacation_1 = __importDefault(require('./wants/Vacation'));
const DateNight_1 = __importDefault(require('./wants/DateNight'));
const GoingOut_1 = __importDefault(require('./wants/GoingOut'));
const YogiActivities_1 = __importDefault(require('./wants/YogiActivities'));
const Gifts_1 = __importDefault(require('./wants/Gifts'));
const Savings_1 = __importDefault(require('./savings/Savings'));
const BudgetHomePage = () => {
  return (0, jsx_runtime_1.jsxs)(
    'div',
    {
      children: [
        (0, jsx_runtime_1.jsx)(Header_1.default, {}, void 0),
        (0, jsx_runtime_1.jsx)('h1', { children: 'Budget Home page' }, void 0),
        (0, jsx_runtime_1.jsx)(Rent_1.default, {}, void 0),
        (0, jsx_runtime_1.jsx)(Electricity_1.default, {}, void 0),
        (0, jsx_runtime_1.jsx)(Gas_1.default, {}, void 0),
        (0, jsx_runtime_1.jsx)(Groceries_1.default, {}, void 0),
        (0, jsx_runtime_1.jsx)(HomeSupplies_1.default, {}, void 0),
        (0, jsx_runtime_1.jsx)(Internet_1.default, {}, void 0),
        (0, jsx_runtime_1.jsx)(Parcel_1.default, {}, void 0),
        (0, jsx_runtime_1.jsx)(Therapy_1.default, {}, void 0),
        (0, jsx_runtime_1.jsx)(Clothes_1.default, {}, void 0),
        (0, jsx_runtime_1.jsx)(Netflix_1.default, {}, void 0),
        (0, jsx_runtime_1.jsx)(Spotify_1.default, {}, void 0),
        (0, jsx_runtime_1.jsx)(Vacation_1.default, {}, void 0),
        (0, jsx_runtime_1.jsx)(DateNight_1.default, {}, void 0),
        (0, jsx_runtime_1.jsx)(GoingOut_1.default, {}, void 0),
        (0, jsx_runtime_1.jsx)(YogiActivities_1.default, {}, void 0),
        (0, jsx_runtime_1.jsx)(Gifts_1.default, {}, void 0),
        (0, jsx_runtime_1.jsx)(Savings_1.default, {}, void 0),
      ],
    },
    void 0,
  );
};
exports.default = BudgetHomePage;
