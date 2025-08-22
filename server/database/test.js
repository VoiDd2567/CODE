// Create object with 50 keys
let myDict = {};
for (let i = 1; i <= 50; i++) {
    myDict[`key${i}`] = i;
}

// Get keys
let keys = Object.keys(myDict);

if (keys.length > 5) {
    // Shuffle keys
    keys = keys.sort(() => Math.random() - 0.5);
    // Take first 5
    keys = keys.slice(0, 5);
}

console.log(keys); // Random 5 keys
