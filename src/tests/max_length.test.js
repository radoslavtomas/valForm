/*
 * MAX_LENGTH Test
 * numericRegex: /^[0-9]+$/
 * */

import hooks from "./../_inc/_validationMethods";
const max_length = hooks.max_length;

test('max_length: "Hello":5 to be true', () => {
  expect(max_length({ value: "Hello" }, 5)).toBeTruthy();
});

test('max_length: "Hello":4 to be false', () => {
  expect(max_length({ value: "Hello" }, 4)).toBeFalsy();
});

test('max_length: "123":3 (as number) to be true', () => {
  expect(max_length({ value: 123 }, 3)).toBeTruthy();
});

test('max_length: "123":2 (as number) to be false', () => {
  expect(max_length({ value: 123 }, 2)).toBeFalsy();
});

test('max_length: "123":3 (as string) to be true', () => {
  expect(max_length({ value: "123" }, 3)).toBeTruthy();
});

test('max_length: "123":2 (as string) to be false', () => {
  expect(max_length({ value: "123" }, "2")).toBeFalsy();
});
