import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Collapse, Typography } from '@mui/material';
import en from '../../i18n/en';
import { WordOfTheDayDetails } from '../types/WordOfTheDayTypes';
import { formatYYYYMMDDToDDMMYYYY } from '../utils';

const WordOfTheDay: React.FC = () => {
  const [wordDetails, setWordDetails] = useState<WordOfTheDayDetails>({
    id: '',
    word: '',
    note: null,
    definitions: [],
    examples: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [definitionsOpen, setDefinitionsOpen] = useState<boolean>(false);
  const [examplesOpen, setExamplesOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchWordOfTheDay = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/daily-word`,
        );
        setWordDetails({
          id: response.data.id,
          word: response.data.word,
          displayDate: formatYYYYMMDDToDDMMYYYY(response.data.displayDate),
          note: response.data.note || null,
          definitions: response.data.definitions || [],
          examples: response.data.examples || [],
        });
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
    <div>
      <p id="word-of-the-day">
        {wordDetails.displayDate} - {en.wordOfTheDay.prefix}: {wordDetails.word}
      </p>
      {wordDetails.note && (
        <Typography variant="caption" component="p">
          {en.wordOfTheDay.note}: {wordDetails.note}
        </Typography>
      )}

      <Button size="small" onClick={() => setDefinitionsOpen((open) => !open)}>
        {definitionsOpen
          ? en.wordOfTheDay.hideDefinitions
          : en.wordOfTheDay.showDefinitions}
      </Button>
      <Collapse in={definitionsOpen}>
        <div>
          {wordDetails.definitions.map((definition, index) => (
            <Typography key={index} variant="body2" component="p">
              {index + 1}) {definition.definition} ({definition.partOfSpeech})
            </Typography>
          ))}
        </div>
      </Collapse>

      <Button size="small" onClick={() => setExamplesOpen((open) => !open)}>
        {examplesOpen
          ? en.wordOfTheDay.hideExamples
          : en.wordOfTheDay.showExamples}
      </Button>
      <Collapse in={examplesOpen}>
        <div>
          {wordDetails.examples.map((example, index) => (
            <Typography key={index} variant="body2" component="p">
              {index + 1}) {example.exampleText} - {example.title}
            </Typography>
          ))}
        </div>
      </Collapse>
    </div>
  );
};

export default WordOfTheDay;
