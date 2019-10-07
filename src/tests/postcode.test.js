/*
 * UK_POSTCODE Test
 * postcodeRegex: /([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})/
 * */

import hooks from "./../_inc/_validationMethods";
const postcode = hooks.uk_postcode;

test("uk_postcode: B3 3DH is valid postcode", () => {
  expect(postcode({ value: "B3 3DH" })).toBeTruthy();
});

test("uk_postcode: B33DH is valid postcode", () => {
  expect(postcode({ value: "B33DH" })).toBeTruthy();
});

test("uk_postcode: M21 0BN is valid postcode", () => {
  expect(postcode({ value: "M21 0BN" })).toBeTruthy();
});

test("uk_postcode: M210BN is valid postcode", () => {
  expect(postcode({ value: "M210BN" })).toBeTruthy();
});

test("uk_postcode: m210bn is valid postcode", () => {
  expect(postcode({ value: "m210bn" })).toBeTruthy();
});

test("uk_postcode: M21 0 is NOT valid postcode", () => {
  expect(postcode({ value: "M21 0" })).toBeFalsy();
});

test("uk_postcode: M21 0BNNN is NOT valid postcode", () => {
  expect(postcode({ value: "M21 0BNNN" })).toBeFalsy();
});
