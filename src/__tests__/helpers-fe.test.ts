import { BudgetData } from "../app/budgeting-page/types/BudgetCategoryTypes";
import { formatMonthlyExpensesToBucketExpenses } from "../app/budgeting-page/utils/helpers";
import { MonthlyExpense } from "../server/utils/types";

describe('formatMonthlyExpensesToBucketExpenses', () => {
    it('should accumulate amounts for each bucket and update existing budget data', async () => {
        const monthlyExpenses: MonthlyExpense[] = [
            { id:'1', person:'test', vendor:'test', description:'test', expensedate:'someDate', bucketname: 'rent', amount: 1000 },
            { id:'2', person:'test', vendor:'test', description:'test', expensedate:'someDate',bucketname: 'groceries', amount: 200 },
            { id:'3', person:'test', vendor:'test', description:'test', expensedate:'someDate', bucketname: 'rent', amount: 500 },
        ];

        const existingBudgetData: BudgetData[] = [
            { id:'1', category:'asdf', amount:0, bucketname: 'rent', household: '', currentamount: 0 },
            { id:'2', category:'asdf', amount:0, bucketname: 'groceries', household: '', currentamount: 0 },
            { id:'3', category:'asdf', amount:0, bucketname: 'electric', household: '', currentamount: 0 },
        ];

        const result = await formatMonthlyExpensesToBucketExpenses(monthlyExpenses, existingBudgetData);

        expect(result).toEqual([
            {  id:'1', category:'asdf', amount:0, bucketname: 'rent', household: '', currentamount: 1500 },
            {  id:'2', category:'asdf', amount:0, bucketname: 'groceries', household: '', currentamount: 200 },
            {  id:'3', category:'asdf', amount:0, bucketname: 'electric', household: '', currentamount: 0 },
        ]);
    });

    it('should not update buckets that are not in the monthly expenses', async () => {
        const monthlyExpenses: MonthlyExpense[] = [
            { id:'1', person:'test', vendor:'test', description:'test', expensedate:'someDate', bucketname: 'internet', amount: 100 },
        ];

        const existingBudgetData: BudgetData[] = [
            { id:'1', category:'asdf', amount:0, bucketname: 'rent', household: '', currentamount: 0 },
            { id:'2', category:'asdf', amount:0, bucketname: 'groceries', household: '', currentamount: 0 },
            { id:'3', category:'asdf', amount:0, bucketname: 'internet', household: '', currentamount: 0 },
        ];

        const result = await formatMonthlyExpensesToBucketExpenses(monthlyExpenses, existingBudgetData);

        expect(result).toEqual([
            { id:'1', category:'asdf', amount:0, bucketname: 'rent', household: '', currentamount: 0 },
            { id:'2', category:'asdf', amount:0, bucketname: 'groceries', household: '', currentamount: 0 },
            { id:'3', category:'asdf', amount:0, bucketname: 'internet', household: '', currentamount: 100 },
        ]);
    });

    it('should handle empty monthly expenses', async () => {
        const monthlyExpenses: MonthlyExpense[] = [];

        const existingBudgetData: BudgetData[] = [
            { id:'1', category:'asdf', amount:0, bucketname: 'rent', household: '', currentamount: 0 },
            { id:'2', category:'asdf', amount:0, bucketname: 'groceries', household: '', currentamount: 0 },
        ];

        const result = await formatMonthlyExpensesToBucketExpenses(monthlyExpenses, existingBudgetData);

        expect(result).toEqual([
            {  id:'1', category:'asdf', amount:0, bucketname: 'rent', household: '', currentamount: 0 },
            {  id:'2', category:'asdf', amount:0, bucketname: 'groceries', household: '', currentamount: 0 },
        ]);
    });
});