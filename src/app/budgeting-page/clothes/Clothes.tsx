import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ClothesType } from '../types/ClothesTypes';

const Clothes: React.FC = () => {
  const [data, setData] = useState<ClothesType>();
  {
    /* this array is used for data once the data has been recieved from the endpoint*/
  }
  const [loading, setLoading] = useState<boolean>(true);
  {
    /* this boolean is used for isLoading or isNotLoading */
  }
  const [error, setError] = useState<string>('');
  {
    /* this string is used for error message */
  }

  useEffect(() => {
    axios
      .get('http://localhost:5000/budget/clothes')
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
    return <div>Error: {error}</div>;
  }

  console.log(data)

  return (
    <div>
      <h1>Clothes on it</h1>
        <p>{data?.bucketName}</p>
        <p>{data?.budget}</p>
    </div>
  );
};

export default Clothes;
