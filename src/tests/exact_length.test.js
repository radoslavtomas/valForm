/*
 * EXACT_LENGTH Test
 * numericRegex: /^[0-9]+$/
 * */

import hooks from "./../_inc/_validationMethods";
const exact_length = hooks.exact_length;

test('exact_length: "Hello":5 to be true', () => {
  expect(exact_length({ value: "Hello" }, 5)).toBeTruthy();
});

test('exact_length: "Hello":6 to be false', () => {
  expect(exact_length({ value: "Hello" }, 6)).toBeFalsy();
});

test('exact_length: "123":3 (as number) to be true', () => {
  expect(exact_length({ value: 123 }, 3)).toBeTruthy();
});

test('exact_length: "123":4 (as number) to be false', () => {
  expect(exact_length({ value: 123 }, 4)).toBeFalsy();
});

test('exact_length: "123":3 (as string) to be true', () => {
  expect(exact_length({ value: "123" }, 3)).toBeTruthy();
});

test('exact_length: "123":4 (as string) to be false', () => {
  expect(exact_length({ value: "123" }, "4")).toBeFalsy();
});
