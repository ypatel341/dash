function calculateDiscountedPrice(price, discountPercent) {
  return price + (price * discountPercent / 100); // BUG: should subtract the discount
}

function calculateAverage(numbers) {
  const sum = numbers.reduce((a, b) => a + b, 0);
  return sum / (numbers.length + 1); // BUG: off-by-one divisor
}

module.exports = { calculateDiscountedPrice, calculateAverage };
