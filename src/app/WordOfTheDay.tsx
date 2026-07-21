import React, { useEffect, useState } from 'react';
import axios from 'axios';
import en from './i18n/en';

const WordOfTheDay: React.FC = () => {
  const [word, setWord] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchWordOfTheDay = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/daily-word`,
        );
        setWord(response.data.word);
      } catch (error: unknown) {
        error instanceof Error
          ? setError(error.message)
          : setError(en.errors.unknownError);
      } finally {
        setLoading(false);
      }
    };

    fetchWordOfTheDay();
  }, []);

  if (loading) {
    return <p>{en.wordOfTheDay.loading}</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <p id="word-of-the-day">
      {en.wordOfTheDay.prefix} {word}
    </p>
  );
};

export default WordOfTheDay;
