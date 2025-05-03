/* 
                COMPLETED
**************************************
******** COUNTING FREQUENCIES ********
**************************************

Input: words = ["apple", "banana", "apple", "orange", "banana", "banana"]
Output: { "apple": 2, "banana": 3, "orange": 1 }

function countingFrequencies(words: string[]): Map<string, number>{
      // create a hashmap of string, numbers
      // iterate through the words array and store the values
      // if the word already exists get the value and increment it by 1
      // if the word does not exist add it to the dictionary and assign it a value of 1

      const wordMap: Map<string, number> = new Map();

      for(let i = 0; i < words.length; i++){
          if(wordMap.has(words[i])){
            wordMap.set(words[i], (wordMap.get(words[i])! + 1)) // the ! makes it typesafe
          }else{
            wordMap.set(words[i], 1)
          }
      }

      return wordMap;
}

Solution 2 cleaner using for...of: 
function countingFrequencies(words: string[]): Map<string, number> {
    const wordMap = new Map<string, number>();

    for (const word of words) {
        wordMap.set(word, (wordMap.get(word) || 0) + 1);
    }

    return wordMap;
}

******** FollowUp ******** SOLVED
Just return the word with the highest frequencies rather than the whole map
- I will be building on the cleaner solution since i understand it perfectly in what it is trying to accomplish

function countingFrequencies(words: string[]): string {
    const wordMap = new Map<string, number>();
    
    let finalWord: string = words[0]
    let maxCounter: number = 0

    if(words.length === 1) return finalWord;

    for (const word of words) {
        wordMap.set(word, (wordMap.get(word) || 0) + 1);
    }

    for (const [key, value] of wordMap.entries()) {
        if(value > maxCounter){
            maxCounter = value
            finalWord = key
        }
    }

    return finalWord;
}
*/

/*
**************************************
******** COUNTING FREQUENCIES ********
************ WITH A TWIST ************
**************************************

Problem Statement:
Given an array of words, return an object (or Map) where the keys are the frequencies (how often a word appears), 
and the values are arrays of words that appear that many times.

Example:
Input: ["apple", "banana", "apple", "orange", "banana", "banana", "grape", "grape", "grape"]
Output: { 
  1: ["orange"], 
  2: ["apple"], 
  3: ["banana", "grape"] 
}

function countingFrequencies(words: string[]): Map<number, string[]>{
    const wordMap: Map<string, number> = new Map();

    for(const word of words){
        wordMap.set(word, (wordMap.get(word) || 0) + 1);
    }

    // flip it so the frequency is the key
    const frequencyMap: Map<number, string[]> = new Map();

    for(const [key, value] of wordMap.entries()){
        if(frequencyMap.has(value)){
            let arr = frequencyMap.get(value) // can be undefined
            arr.push(key)
            frequencyMap.set(value, arr)
        }else{
            let arr: string[] = []
            arr.push(key)
            frequencyMap.set(value, arr)
        }
        
        // Below is a more concise version of what is above 
        frequencyMap.set(value, [...(frequencyMap.get(value) || []), key]);
    }

    return frequencyMap;
}
 */