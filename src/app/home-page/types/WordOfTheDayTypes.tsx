export interface WordOfTheDayDetails {
  id: string;
  word: string;
  displayDate?: string;
  note: string | null;
  definitions: Definition[];
  examples: Examples[];
}

type Definition = {
  definition: string;
  partOfSpeech: string | null;
  source: string | null;
  note: string | null;
  displayOrder: number;
};

type Examples = {
  exampleText: string;
  title: string;
  sourceUrl: string;
  displayOrder: number;
};
