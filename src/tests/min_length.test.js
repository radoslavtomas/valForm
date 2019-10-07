/*
 * MIN_LENGTH Test
 * numericRegex: /^[0-9]+$/
 * */

import hooks from "./../_inc/_validationMethods";
const min_length = hooks.min_length;

test('min_length: "Hello":5 to be true', () => {
  expect(min_length({ value: "Hello" }, 5)).toBeTruthy();
});

test('min_length: "Hello":6 to be false', () => {
  expect(min_length({ value: "Hello" }, 6)).toBeFalsy();
});

test('min_length: "123":3 (as number) to be true', () => {
  expect(min_length({ value: 123 }, 3)).toBeTruthy();
});

test('min_length: "123":4 (as number) to be false', () => {
  expect(min_length({ value: 123 }, 4)).toBeFalsy();
});

test('min_length: "123":3 (as string) to be true', () => {
  expect(min_length({ value: "123" }, 3)).toBeTruthy();
});

test('min_length: "123":4 (as string) to be false', () => {
  expect(min_length({ value: "123" }, "4")).toBeFalsy();
});
