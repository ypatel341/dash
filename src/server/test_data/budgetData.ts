// NEEDS
export const rentBudgetData = {
  category: 'needs',
  bucketName: 'rent',
  budget: 3200,
};

export const electricBudgetData = {
  category: 'needs',
  bucketName: 'electric',
  budget: 140,
};

export const internetBudgetData = {
  category: 'needs',
  bucketName: 'internet',
  budget: 70,
};

export const parcelBudgetData = {
  category: 'needs',
  bucketName: 'parcel',
  budget: 5,
};

export const groceriesBudgetData = {
  category: 'needs',
  bucketName: 'groceries',
  budget: 580,
};

export const gasBudgetData = {
  category: 'needs',
  bucketName: 'gas',
  budget: 150,
};

export const therapyBudgetData = {
  category: 'needs',
  bucketName: 'therapy',
  budget: 125,
};

export const homeSuppliesBudgetData = {
  category: 'needs',
  bucketName: 'home supplies',
  budget: 150,
};

// WANTS
export const netflixBudgetData = {
  category: 'wants',
  bucketName: 'netflix',
  budget: 17, // rounded up to the nearest dollar
};

export const spotifyBudgetData = {
  category: 'wants',
  bucketName: 'spotify',
  budget: 13, // rounded up to the nearest dollar
};

export const dateNightBudgetData = {
  category: 'wants',
  bucketName: 'date night',
  budget: 120,
};

export const vacationBudgetData = {
  category: 'wants',
  bucketName: 'vacation',
  budget: 1000,
};

export const goingOutBudgetData = {
  category: 'wants',
  bucketName: 'going out',
  budget: 200,
};

export const giftsBudgetData = {
  category: 'wants',
  bucketName: 'gifts',
  budget: 100,
};

export const yogiActivitiesBudgetData = {
  category: 'wants',
  bucketName: 'yogi activities',
  budget: 200,
};

export const clothesBudgetData = {
  category: 'wants',
  bucketName: 'clothes',
  budget: 200,
};

// SAVINGS
export const savingsFundBudgetData = {
  category: 'savings',
  bucketName: 'savings fund',
  budget: 5500,
};

//INFO: ACTUAL DATA USED FOR TESTING -> TEST DATA
export const insertData = {
  person: 'Yogi',
  bucketname: 'rent',
  vendor: 'Domus',
  amount: '3200',
  description: 'January Rent',
};

//INFO: ACTUAL DATA USED FOR TESTING -> ASSERTIONS
export const budgetAllDataInfo = [
  {
    id: '0a03dd40-87eb-4054-9d0a-5857d090fe30',
    category: 'needs',
    bucketname: 'rent',
    amount: 3200,
    household: 'domus',
  },
  {
    id: '8c0cc1c3-4e87-4223-8ce3-e721ff9417e7',
    category: 'needs',
    bucketname: 'electric',
    amount: 140,
    household: 'domus',
  },
  {
    id: '7a24bf63-aaee-45a1-9bd1-072b8d346e63',
    category: 'needs',
    bucketname: 'internet',
    amount: 70,
    household: 'domus',
  },
  {
    id: 'eea022f6-e307-4eaa-9ccf-dcd7f19b3717',
    category: 'needs',
    bucketname: 'parcel',
    amount: 5,
    household: 'domus',
  },
  {
    id: '6a106196-e0be-46d9-84cb-2e631c2504cf',
    category: 'needs',
    bucketname: 'groceries',
    amount: 580,
    household: 'domus',
  },
  {
    id: '4d76327b-b366-4f6b-b9ae-fb018ca4dddb',
    category: 'needs',
    bucketname: 'gas',
    amount: 150,
    household: 'domus',
  },
  {
    id: '76c046bb-f192-4148-9eda-d714c0c067f9',
    category: 'needs',
    bucketname: 'therapy',
    amount: 125,
    household: 'domus',
  },
  {
    id: 'bfb595cc-f8a2-4914-bd45-034526f205b1',
    category: 'needs',
    bucketname: 'house_supplies',
    amount: 150,
    household: 'domus',
  },
  {
    id: 'a13af0ba-3418-4c9a-9840-a0136c3d09fc',
    category: 'wants',
    bucketname: 'netflix',
    amount: 17,
    household: 'domus',
  },
  {
    id: '71cd8515-a587-4e40-8435-0c4381f65802',
    category: 'wants',
    bucketname: 'spotify',
    amount: 13,
    household: 'domus',
  },
  {
    id: 'c2239be8-3793-42da-9d9e-ea980ccca2a1',
    category: 'wants',
    bucketname: 'date_night',
    amount: 120,
    household: 'domus',
  },
  {
    id: '967aec6e-147e-42eb-a616-effa7a46d902',
    category: 'wants',
    bucketname: 'vacation',
    amount: 1000,
    household: 'domus',
  },
  {
    id: '94300054-ef4c-43de-82d8-d03de6402d50',
    category: 'wants',
    bucketname: 'going_out_yogi',
    amount: 200,
    household: 'domus',
  },
  {
    id: 'c4dd9e5b-7b80-41c6-b6e9-1525dc8925cc',
    category: 'wants',
    bucketname: 'gifts',
    amount: 166,
    household: 'domus',
  },
  {
    id: '744c5921-5430-4725-a812-1de76b8a0ee5',
    category: 'wants',
    bucketname: 'yogi_activities',
    amount: 200,
    household: 'domus',
  },
  {
    id: 'a0bc7722-ab7d-4925-934d-ae29005ca823',
    category: 'wants',
    bucketname: 'clothes',
    amount: 200,
    household: 'domus',
  },
  {
    id: '26a0d0aa-5f81-4902-8372-cb4219e66a80',
    category: 'savings',
    bucketname: 'savings_chase_2112',
    amount: 5500,
    household: 'domus',
  },
];
