import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Collapse,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import en from '../../i18n/en';
import { WordOfTheDayDetails } from '../types/WordOfTheDayTypes';
import { formatYYYYMMDDToDDMMYYYY } from '../utils';

const CARD_SX = { maxWidth: 480, mx: 'auto', textAlign: 'left' as const };

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
    return (
      <Card sx={CARD_SX}>
        <CardContent>
          <Skeleton variant="text" width="70%" height={32} />
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="40%" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={CARD_SX}>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={CARD_SX}>
      <CardContent>
        <Typography variant="h6" component="p" id="word-of-the-day">
          {wordDetails.displayDate} - {en.wordOfTheDay.prefix}:{' '}
          {wordDetails.word}
        </Typography>
        {wordDetails.note && (
          <Typography variant="caption" component="p" sx={{ mt: 1 }}>
            {en.wordOfTheDay.note}: {wordDetails.note}
          </Typography>
        )}

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button
            size="small"
            onClick={() => setDefinitionsOpen((open) => !open)}
          >
            {definitionsOpen
              ? en.wordOfTheDay.hideDefinitions
              : en.wordOfTheDay.showDefinitions}
          </Button>
          <Button size="small" onClick={() => setExamplesOpen((open) => !open)}>
            {examplesOpen
              ? en.wordOfTheDay.hideExamples
              : en.wordOfTheDay.showExamples}
          </Button>
        </Stack>

        <Collapse in={definitionsOpen}>
          <div>
            {wordDetails.definitions.map((definition) => (
              <Typography
                key={definition.displayOrder}
                variant="body2"
                component="p"
                sx={{ mt: 1 }}
              >
                {definition.displayOrder + 1}) {definition.definition}
                {definition.partOfSpeech ? ` (${definition.partOfSpeech})` : ''}
              </Typography>
            ))}
          </div>
        </Collapse>

        <Collapse in={examplesOpen}>
          <div>
            {wordDetails.examples.map((example) => (
              <Typography
                key={example.displayOrder}
                variant="body2"
                component="p"
                sx={{ mt: 1 }}
              >
                {example.displayOrder + 1}) {example.exampleText}
                {example.title ? ` - ${example.title}` : ''}
              </Typography>
            ))}
          </div>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default WordOfTheDay;
