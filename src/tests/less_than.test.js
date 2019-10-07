/*
 * LESS_THAN Test
 * decimalRegex: /^\-?[0-9]*\.?[0-9]+$/,
 * */

import hooks from "./../_inc/_validationMethods";
const less_than = hooks.less_than;

test('less_than: "5":6 to be true', () => {
  expect(less_than({ value: 5 }, "6")).toBeTruthy();
});

test('less_than: "5":5 to be false', () => {
  expect(less_than({ value: 5 }, "5")).toBeFalsy();
});

test('less_than: "5":=5 to be true', () => {
  expect(less_than({ value: 5 }, "=5")).toBeTruthy();
});

test('less_than: "5":=4 to be false', () => {
  expect(less_than({ value: 5 }, "=4")).toBeFalsy();
});

test('less_than: "5.5":5.6 to be true', () => {
  expect(less_than({ value: 5.5 }, "5.6")).toBeTruthy();
});

test('less_than: "5.5":5.5 to be false', () => {
  expect(less_than({ value: 5.5 }, "5.5")).toBeFalsy();
});

test('less_than: "5.5":=5.5 to be true', () => {
  expect(less_than({ value: 5.5 }, "=5.5")).toBeTruthy();
});

test('less_than: "5.5":5.4 to be false', () => {
  expect(less_than({ value: 5.5 }, "5.4")).toBeFalsy();
});
