import { expensePersonOptions, expenseTypeOptions } from "../../../app/budgeting-page/types/BudgetCategoryTypes"

const getRandomInt = (max: number): number => {
    return Math.floor(Math.random() * max);
}

export const generateRandomBucket = (): string => {
    return expenseTypeOptions[getRandomInt(17)]
}

export const generateRandomPerson = (): string => {
    return expensePersonOptions[getRandomInt(2)]
}