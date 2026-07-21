export interface WordOfTheDayDetails {
  id: string;
  word: string;
  displayDate?: string;
  note: string | null;
  definitions: Definition[];
  examples: Example[];
}

type Definition = {
  definition: string;
  partOfSpeech: string | null;
  source: string | null;
  note: string | null;
  displayOrder: number;
};

type Example = {
  exampleText: string;
  title: string | null;
  sourceUrl: string | null;
  displayOrder: number;
};
