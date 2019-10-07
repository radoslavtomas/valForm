/* NUMERIC Test
 * numericRegex: /^[0-9]+$/
 * */

import hooks from "./../_inc/_validationMethods";
const numeric = hooks.numeric;

test('numeric: "5" (as number) to be true', () => {
  expect(numeric({ value: 5 })).toBeTruthy();
});

test('numeric: "5" (as string) to be true', () => {
  expect(numeric({ value: "5" })).toBeTruthy();
});

test('numeric: "55 55" (as string) to be true', () => {
  expect(numeric({ value: "55 55" })).toBeFalsy();
});

test('numeric: "5.5" to be false', () => {
  expect(numeric({ value: 5.5 })).toBeFalsy();
});

test('numeric: "+44" to be false', () => {
  expect(numeric({ value: "+44" })).toBeFalsy();
});

test('numeric: "hello" to be false', () => {
  expect(numeric({ value: "hello" })).toBeFalsy();
});
