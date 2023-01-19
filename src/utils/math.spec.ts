import { Model } from 'mongoose';
import { calculateDiscountedPrice, roundNum } from './math';

describe('roundNum', () => {
  it('should round the number to a specified number of decimal places', () => {
    expect(roundNum(3.14159, 2)).toBe(3.14);
    expect(roundNum(2.71828, 3)).toBe(2.718);
    expect(roundNum(1.23456, 4)).toBe(1.2346);
  });

  it('should calculate the discounted price', () => {
    expect(calculateDiscountedPrice(100, 10)).toBe(90);
    expect(calculateDiscountedPrice(50, 25)).toBe(37.5);
    expect(calculateDiscountedPrice(200, 5)).toBe(190);
  });
});
