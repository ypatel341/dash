import { BudgetData } from "../app/budgeting-page/types/BudgetCategoryTypes";
import { calculateSurplus, formatMonthlyExpensesExpenseDate, formatMonthlyExpensesToBucketExpenses } from "../app/budgeting-page/utils/helpers";
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

describe('formatMonthlyExpensesExpenseDate', () => {
    it('should format the expensedate for each expense', async () => {
        const expenses: MonthlyExpense[] = [
            // 2025-02-07 21:58:17.539 -0500
            { id:'1', person:'test', vendor:'test', description:'test', expensedate:'2025-03-31T21:58:17.539', bucketname: 'rent', amount: 1000 },
            { id:'2', person:'test', vendor:'test', description:'test', expensedate:'2025-03-31T21:58:17.539', bucketname: 'groceries', amount: 200 },
        ];

        const result = await formatMonthlyExpensesExpenseDate(expenses);

        expect(result).toEqual([
            { id:'1', person:'test', vendor:'test', description:'test', expensedate:'03/31/2025', bucketname: 'rent', amount: 1000 },
            { id:'2', person:'test', vendor:'test', description:'test', expensedate:'03/31/2025', bucketname: 'groceries', amount: 200 },
        ]);
    });

    it('should handle empty expenses', async () => {
        const expenses: MonthlyExpense[] = [];

        const result = await formatMonthlyExpensesExpenseDate(expenses);

        expect(result).toEqual([]);
    });
});

describe('calculateSurplus', () => {
    it('should calculate the monthly total amount and current monthly usage', async () => {
        const budgetData: BudgetData[] = [
            { id:'1', category:'asdf', amount:1000, bucketname: 'rent', household: '', currentamount: 500 },
            { id:'2', category:'asdf', amount:200, bucketname: 'groceries', household: '', currentamount: 100 },
            { id:'3', category:'asdf', amount:300, bucketname: 'electric', household: '', currentamount: 200 },
        ];
        const result = await calculateSurplus(budgetData);
        expect(result).toEqual({ monthlyTotalBudget: 1500, currentMonthlyUsage: 800, monthlySurplus: 700 });
    });

    it('should handle empty budget data', async () => {
        const budgetData: BudgetData[] = [];
        const result = await calculateSurplus(budgetData);
        expect(result).toEqual({ monthlyTotalBudget: 0, currentMonthlyUsage: 0, monthlySurplus: 0 });
    });

    it('should handle budget data with negative amounts', async () => {
        const budgetData: BudgetData[] = [
            { id:'1', category:'asdf', amount:-1000, bucketname: 'rent', household: '', currentamount: -500 },
            { id:'2', category:'asdf', amount:-200, bucketname: 'groceries', household: '', currentamount: -100 },
            { id:'3', category:'asdf', amount:-300, bucketname: 'electric', household: '', currentamount: -200 },
        ];
        const result = await calculateSurplus(budgetData);
        expect(result).toEqual({ monthlyTotalBudget: -1500, currentMonthlyUsage: -800, monthlySurplus: -700 });
    })

    it('should handle budget data with mixed positive and negative amounts', async () => {
        const budgetData: BudgetData[] = [
            { id:'1', category:'asdf', amount:1000, bucketname: 'rent', household: '', currentamount: 500 },
            { id:'2', category:'asdf', amount:200, bucketname: 'groceries', household: '', currentamount: -100 },
            { id:'3', category:'asdf', amount:300, bucketname: 'electric', household: '', currentamount: -200 },
        ];
        const result = await calculateSurplus(budgetData);
        expect(result).toEqual({ monthlyTotalBudget: 1500, currentMonthlyUsage: 200, monthlySurplus: 1300 });
    });
})