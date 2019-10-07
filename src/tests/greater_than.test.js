/*
 * GREATER_THAN Test
 * decimalRegex: /^\-?[0-9]*\.?[0-9]+$/,
 * */

import hooks from "./../_inc/_validationMethods";
const greater_than = hooks.greater_than;

test('greater_than: "5":4 to be true', () => {
  expect(greater_than({ value: 5 }, "4")).toBeTruthy();
});

test('greater_than: "5":5 to be false', () => {
  expect(greater_than({ value: 5 }, "5")).toBeFalsy();
});

test('greater_than: "5":=5 to be true', () => {
  expect(greater_than({ value: 5 }, "=5")).toBeTruthy();
});

test('greater_than: "5":=6 to be false', () => {
  expect(greater_than({ value: 5 }, "=6")).toBeFalsy();
});

test('greater_than: "5.5":5.4 to be true', () => {
  expect(greater_than({ value: 5.5 }, "5.4")).toBeTruthy();
});

test('greater_than: "5.5":5.5 to be false', () => {
  expect(greater_than({ value: 5.5 }, "5.5")).toBeFalsy();
});

test('greater_than: "5.5":=5.5 to be true', () => {
  expect(greater_than({ value: 5.5 }, "=5.5")).toBeTruthy();
});

test('greater_than: "5.5":5.6 to be false', () => {
  expect(greater_than({ value: 5.5 }, "5.6")).toBeFalsy();
});
