/* 
**************************************
********* GREEDY ALGORITHMS **********
**************************************
LEET CODE: 322
************** WARM-UP ***************

Problem: VERY CLOSE PERSONAL SOLUTION, BUT COMPLETE ANSWER BELOW
You are given an array coins representing different denominations of coins and
an integer amount representing a target sum. Return the minimum number of coins needed to make up that amount.

If it is not possible to make the amount with the given coins, return -1.

Example:
Input: coins = [1, 2, 5], amount = 11  
Output: 3  
Explanation: 11 = 5 + 5 + 1 (3 coins)

function optimizingCoins(coins: number[], amount: number): number{
    // start with the largest coin value possible. store these in a hashmap of the amount
    // that they are used. Add up the total amount of coins that are then used
    // create a hashmap of the <coinvalue, frequency>, start with the largest first
    // begin subtracting from the amount value and incrementing the frequency in the map
    // once completed add all the frequencies up
    // IF none of that is possible, you will want to return -1 by default

    // base case would be that the coins array is empty, return -1;

    if(coins.length < 1) return -1;

    // Greedy algos will work better if starting with the largest first
    const sortedCoinValue = coins.sort((a, b) => b - a) // a - b = ascending, b - a = descending 


    function subtractNonNegative(a, b) {
        return a - b >= 0 ? a - b : null;
    }

    let returnValue = 0
    let coinCounter = 0;

    while(amount != 0 || null){
        if(coinCounter === -1) return -1;

        amount = subtractNonNegative(amount, sortedCoinValue[coinCounter])

        if(amount === null){
            coinCounter--;
        } else{
            returnValue++
        }
        
    }   
    return returnValue
}

************** WORKING-SOLUTION ***************
************** EXISTING ISSUES  ***************
The solution below, while it does work to most of the extent
the coin change problem ultimately needs to be resolved using 
dynamic programming and backtracking the solution does not 
take into consideration if the same coin can be used multiple times
not completely a Greedy question, but greedy principles were used
and will be revisiting this once we get to dynamic programming

function optimizingCoins(coins: number[], amount: number): number {
    if (coins.length === 0) return -1;

    const sortedCoins = coins.sort((a, b) => b - a);

    let coinCount = 0;
    let coinIndex = 0;

    while (amount > 0) {
        if (coinIndex >= sortedCoins.length) return -1; // No valid solution

        const coinValue = sortedCoins[coinIndex];

        if (amount >= coinValue) {
            const numCoins = Math.floor(amount / coinValue); // Get max number of coins possible
            amount -= numCoins * coinValue;
            coinCount += numCoins;
        }

        coinIndex++; // Move to the next smaller coin
    }

    return coinCount;
}





**************************************************
************** NUMBER OF ACTIVITIES **************
**************************************************
LEET CODE: 1353
PROBLEM:
You are given n activities with their start and end times in an array activities, 
where each activity is represented as [start, end].
You can only attend one activity at a time (i.e., no overlapping).
Return the maximum number of activities you can attend.


EXAMPLE:
const activities = [[1, 3], [2, 5], [3, 9], [6, 8], [8, 9]];
console.log(maximumActivities(activities)); 
// Output: 3 
// Explanation: Attend [1,3], [6,8], and [8,9].


function maximumActivities(activities: number[][]): number {
    // pick the activity that starts first
    // pick the activity that also ends first
    // this will maximize the amount of activities you can attend
    
    // base case: if there are no activities, return 0
    if (activities.length === 0) return 0;
    
    // Sort activities based on their end time (earliest end time first)
    activities.sort((a, b) => a[1] - b[1]);

    let activityCounter = 0;       // Counter to track how many activities we can attend
    let prevEndTime = -1;          // Variable to store the end time of the last selected activity

    // Loop through all activities
    for (let i = 0; i < activities.length; i++) {
        // If the current activity starts after or when the last selected activity ended, attend it
        if (activities[i][0] >= prevEndTime) {
            activityCounter++;        // Attend the activity
            prevEndTime = activities[i][1];  // Update the end time to the current activity's end time
        }
    }

    return activityCounter;  // Return the total number of activities attended
}







*/