'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const jsx_runtime_1 = require('react/jsx-runtime');
const react_1 = require('react');
const axios_1 = __importDefault(require('axios'));
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
  const [data, setData] = (0, react_1.useState)();
  const [loading, setLoading] = (0, react_1.useState)(true);
  const [error, setError] = (0, react_1.useState)('');
  (0, react_1.useEffect)(() => {
    axios_1.default
      .get('http://localhost:5000/budget/info/all')
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
    return (0, jsx_runtime_1.jsx)('div', { children: 'Loading...' }, void 0);
  }
  if (error) {
    return (0, jsx_runtime_1.jsxs)(
      'div',
      { children: ['Error: with retrieving data', error] },
      void 0,
    );
  }
  const rentData =
    data === null || data === void 0
      ? void 0
      : data.find((item) => item.bucketname === 'rent');
  const electricityData =
    data === null || data === void 0
      ? void 0
      : data.find((item) => item.bucketname === 'electric');
  const gasData =
    data === null || data === void 0
      ? void 0
      : data.find((item) => item.bucketname === 'gas');
  const groceriesData =
    data === null || data === void 0
      ? void 0
      : data.find((item) => item.bucketname === 'groceries');
  const houseSuppliesData =
    data === null || data === void 0
      ? void 0
      : data.find((item) => item.bucketname === 'home_supplies');
  const internetData =
    data === null || data === void 0
      ? void 0
      : data.find((item) => item.bucketname === 'internet');
  const parcelData =
    data === null || data === void 0
      ? void 0
      : data.find((item) => item.bucketname === 'parcel');
  const therapyData =
    data === null || data === void 0
      ? void 0
      : data.find((item) => item.bucketname === 'therapy');
  const clothesData =
    data === null || data === void 0
      ? void 0
      : data.find((item) => item.bucketname === 'clothes');
  const netflixData =
    data === null || data === void 0
      ? void 0
      : data.find((item) => item.bucketname === 'netflix');
  const spotifyData =
    data === null || data === void 0
      ? void 0
      : data.find((item) => item.bucketname === 'spotify');
  const vacationData =
    data === null || data === void 0
      ? void 0
      : data.find((item) => item.bucketname === 'vacation');
  const dateNightData =
    data === null || data === void 0
      ? void 0
      : data.find((item) => item.bucketname === 'date_night');
  const goingOutData =
    data === null || data === void 0
      ? void 0
      : data.find((item) => item.bucketname === 'going_out');
  const yogiActivitiesData =
    data === null || data === void 0
      ? void 0
      : data.find((item) => item.bucketname === 'yogi_activities');
  const giftsData =
    data === null || data === void 0
      ? void 0
      : data.find((item) => item.bucketname === 'gifts');
  const savingsData =
    data === null || data === void 0
      ? void 0
      : data.find((item) => item.bucketname === 'savings');
  if (
    !clothesData ||
    !electricityData ||
    !rentData ||
    !savingsData ||
    !parcelData ||
    !therapyData ||
    !gasData ||
    !groceriesData ||
    !houseSuppliesData ||
    !internetData ||
    !netflixData ||
    !spotifyData ||
    !vacationData ||
    !dateNightData ||
    !goingOutData ||
    !yogiActivitiesData ||
    !giftsData
  ) {
    return (0, jsx_runtime_1.jsx)(
      'div',
      { children: 'Error: Data not found' },
      void 0,
    );
  }
  return (0, jsx_runtime_1.jsxs)(
    'div',
    {
      children: [
        (0, jsx_runtime_1.jsx)(Header_1.default, {}, void 0),
        (0, jsx_runtime_1.jsx)('h1', { children: 'Budget Home page' }, void 0),
        (0, jsx_runtime_1.jsx)(Rent_1.default, { data: rentData }, void 0),
        (0, jsx_runtime_1.jsx)(
          Electricity_1.default,
          { data: electricityData },
          void 0,
        ),
        (0, jsx_runtime_1.jsx)(Gas_1.default, { data: gasData }, void 0),
        (0, jsx_runtime_1.jsx)(
          Groceries_1.default,
          { data: groceriesData },
          void 0,
        ),
        (0, jsx_runtime_1.jsx)(
          HomeSupplies_1.default,
          { data: houseSuppliesData },
          void 0,
        ),
        (0, jsx_runtime_1.jsx)(
          Internet_1.default,
          { data: internetData },
          void 0,
        ),
        (0, jsx_runtime_1.jsx)(Parcel_1.default, { data: parcelData }, void 0),
        (0, jsx_runtime_1.jsx)(
          Therapy_1.default,
          { data: therapyData },
          void 0,
        ),
        (0, jsx_runtime_1.jsx)(
          Clothes_1.default,
          { data: clothesData },
          void 0,
        ),
        (0, jsx_runtime_1.jsx)(
          Netflix_1.default,
          { data: netflixData },
          void 0,
        ),
        (0, jsx_runtime_1.jsx)(
          Spotify_1.default,
          { data: spotifyData },
          void 0,
        ),
        (0, jsx_runtime_1.jsx)(
          Vacation_1.default,
          { data: vacationData },
          void 0,
        ),
        (0, jsx_runtime_1.jsx)(
          DateNight_1.default,
          { data: dateNightData },
          void 0,
        ),
        (0, jsx_runtime_1.jsx)(
          GoingOut_1.default,
          { data: goingOutData },
          void 0,
        ),
        (0, jsx_runtime_1.jsx)(
          YogiActivities_1.default,
          { data: yogiActivitiesData },
          void 0,
        ),
        (0, jsx_runtime_1.jsx)(Gifts_1.default, { data: giftsData }, void 0),
        (0, jsx_runtime_1.jsx)(
          Savings_1.default,
          { data: savingsData },
          void 0,
        ),
      ],
    },
    void 0,
  );
};
exports.default = BudgetHomePage;
