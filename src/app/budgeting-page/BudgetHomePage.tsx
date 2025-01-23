import React, { useEffect, useState } from 'react';
import axios from 'axios';

import Header from './shared-budget-components/Header';

import RentComponent from './needs/Rent';
import ElectricityComponent from './needs/Electricity';
import GasComponent from './needs/Gas';
import GroceriesComponent from './needs/Groceries';
import HomeSuppliesComponent from './needs/HomeSupplies';
import InternetComponent from './needs/Internet';
import ParcelComponent from './needs/Parcel';
import TherapyComponent from './needs/Therapy';

import ClothesComponent from './wants/Clothes';
import NetflixComponent from './wants/Netflix';
import SpotifyComponent from './wants/Spotify';
import VacationComponent from './wants/Vacation';
import DateNightComponent from './wants/DateNight';
import GoingOutComponent from './wants/GoingOut';
import YogiActivitiesComponent from './wants/YogiActivities';
import GiftsComponent from './wants/Gifts';

import SavingsComponent from './savings/Savings';

import { BudgetData } from './types/BudgetCategoryTypes';

const BudgetHomePage: React.FC = () => {
  const [data, setData] = useState<BudgetData[]>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    axios
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
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: with retrieving data{error}</div>;
  }

  console.log(data);

  const rentData = data?.find((item) => item.bucketname === 'rent');
  const electricityData = data?.find((item) => item.bucketname === 'electric');
  const gasData = data?.find((item) => item.bucketname === 'gas');
  const groceriesData = data?.find((item) => item.bucketname === 'groceries');
  const houseSuppliesData = data?.find(
    (item) => item.bucketname === 'house_supplies',
  );
  const internetData = data?.find((item) => item.bucketname === 'internet');
  const parcelData = data?.find((item) => item.bucketname === 'parcel');
  const therapyData = data?.find((item) => item.bucketname === 'therapy');
  const clothesData = data?.find((item) => item.bucketname === 'clothes');
  const netflixData = data?.find((item) => item.bucketname === 'netflix');
  const spotifyData = data?.find((item) => item.bucketname === 'spotify');
  const vacationData = data?.find((item) => item.bucketname === 'vacation');
  const dateNightData = data?.find((item) => item.bucketname === 'date_night');
  const goingOutData = data?.find(
    (item) => item.bucketname === 'going_out_yogi',
  );
  const yogiActivitiesData = data?.find(
    (item) => item.bucketname === 'yogi_activities',
  );
  const giftsData = data?.find((item) => item.bucketname === 'gifts');
  const savingsData = data?.find(
    (item) => item.bucketname === 'savings_chase_2112',
  );

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
    return <div>Error: Data not found</div>;
  }

  return (
    <div>
      <Header />

      <h1>Budget Home page</h1>

      <RentComponent data={rentData} />
      <ElectricityComponent data={electricityData} />
      <GasComponent data={gasData} />
      <GroceriesComponent data={groceriesData} />
      <HomeSuppliesComponent data={houseSuppliesData} />
      <InternetComponent data={internetData} />
      <ParcelComponent data={parcelData} />
      <TherapyComponent data={therapyData} />

      <ClothesComponent data={clothesData} />
      <NetflixComponent data={netflixData} />
      <SpotifyComponent data={spotifyData} />
      <VacationComponent data={vacationData} />
      <DateNightComponent data={dateNightData} />
      <GoingOutComponent data={goingOutData} />
      <YogiActivitiesComponent data={yogiActivitiesData} />
      <GiftsComponent data={giftsData} />

      <SavingsComponent data={savingsData} />
    </div>
  );
};

export default BudgetHomePage;
