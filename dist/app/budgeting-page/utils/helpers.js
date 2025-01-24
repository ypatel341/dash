'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.transformCategorytName = exports.transformBucketName = void 0;
const transformBucketName = (bucketname) => {
  const transformations = {
    rent: 'Rent',
    electric: 'Electric',
    gas: 'Gas',
    groceries: 'Groceries',
    house_supplies: 'Home Supplies',
    internet: 'Internet',
    parcel: 'Parcel Pending',
    therapy: 'Therapy',
    clothes: 'Clothes',
    netflix: 'Netflix',
    spotify: 'Spotify',
    vacation: 'Vacation',
    date_night: 'Date Night',
    going_out_yogi: 'Going Out',
    yogi_activities: 'Activities',
    gifts: 'Gifts',
    savings_chase_2112: 'Savings',
  };
  return transformations[bucketname] || `Error transforming: ${bucketname}`;
};
exports.transformBucketName = transformBucketName;
const transformCategorytName = (category) => {
  const transformations = {
    needs: 'Needs',
    wants: 'Wants',
    savings: 'Savings',
  };
  return transformations[category] || `Error transforming: ${category}`;
};
exports.transformCategorytName = transformCategorytName;
