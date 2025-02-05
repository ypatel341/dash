import React from 'react';
import { Container } from '@mui/material';
import { useLocation, useParams } from 'react-router-dom';
import { BudgetTypeWithCurrentAmount } from '../../../../server/utils/types';

/**
 * NOTES FOR SELF:  
 * useLocation is used to access state, location, and history from the current route.
 * useParam is used to access the parameters from the current route (from the URL).
 * both are useful, ~but in ourcase since we have all of the data currently in state, lets go with useLocation~
 * We will use both, this is for navigating to the page directly as opposed clicking in
 */

const BudgetHomePage: React.FC = () => {
    const locationData = useLocation();
    const data = locationData.state?.data as BudgetTypeWithCurrentAmount;
    const { bucketname } = useParams<{bucketname: string}>();

    if(!data){
        // TODO: if there is no data, do a fetch request to get the data
        // TODO: set up an error page
        return <div>Error: Data not found</div>;
    }

  return (
    <Container>
      <h1>Bucket Details Page {bucketname}</h1>
      <p>Category: {data.category}</p>
      <p>Amount: {data.amount}</p>
      <p>Household: {data.household}</p>
      <p>Currently-Using: {data.currentamount}</p>
    </Container>
  );
};

export default BudgetHomePage;
