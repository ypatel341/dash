import { expensePersonOptions, expenseTypeOptions } from "../../../app/budgeting-page/types/BudgetCategoryTypes"

const getRandomInt = (max: number): number => {
    return Math.floor(Math.random() * max);
}

export const generateRandomBucket = (): string => {
    return expenseTypeOptions[getRandomInt(expenseTypeOptions.length)]
}

export const generateRandomPerson = (): string => {
    return expensePersonOptions[getRandomInt(expensePersonOptions.length)]
}