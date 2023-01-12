const roundNum = (num, length) =>
  Math.round(num * Math.pow(10, length)) / Math.pow(10, length);

const calculateDiscountedPrice = (price, discount) =>
  roundNum(price - price * (discount / 100), 2);

export { roundNum, calculateDiscountedPrice };
