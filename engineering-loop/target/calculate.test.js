const { calculateDiscountedPrice, calculateAverage } = require('./calculate');

test('10% discount on 100 should be 90', () => {
  expect(calculateDiscountedPrice(100, 10)).toBe(90);
});

test('20% discount on 50 should be 40', () => {
  expect(calculateDiscountedPrice(50, 20)).toBe(40);
});

test('average of [2, 4, 6] should be 4', () => {
  expect(calculateAverage([2, 4, 6])).toBe(4);
});

test('average of [10, 20] should be 15', () => {
  expect(calculateAverage([10, 20])).toBe(15);
});
