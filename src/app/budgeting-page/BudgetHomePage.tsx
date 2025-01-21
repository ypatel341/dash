import React from 'react';
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

const BudgetHomePage: React.FC = () => {
  return (
    <div>
      <Header />

      <h1>Budget Home page</h1>

      <RentComponent />
      <ElectricityComponent />
      <GasComponent />
      <GroceriesComponent />
      <HomeSuppliesComponent />
      <InternetComponent />
      <ParcelComponent />
      <TherapyComponent />

      <ClothesComponent />
      <NetflixComponent />
      <SpotifyComponent />
      <VacationComponent />
      <DateNightComponent />
      <GoingOutComponent />
      <YogiActivitiesComponent />
      <GiftsComponent />

      <SavingsComponent />
    </div>
  );
};

export default BudgetHomePage;
