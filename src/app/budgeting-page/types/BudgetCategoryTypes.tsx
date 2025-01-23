export type BudgetCategoryResponse = {
  category: string;
  bucketname: string;
  budget: number;
};

export type BudgetData = {
  id: string;
  category: string;
  bucketname: string;
  amount: number;
  household: string;
};

export type BudgetComponentProps = {
  data: BudgetData;
};
