/*
 * MATCHES Test
 * */

import hooks from "./../_inc/_validationMethods";
import defaults from "./../_inc/_defaults";

const matches = hooks.matches;

const testCases = [
  {
    name: "matches1",
    value: "Hello"
  },
  {
    name: "matches2",
    value: " HELLO  "
  },
  {
    name: "matches3",
    value: 7
  },
  {
    name: "matches4",
    value: true
  }
];

testCases.forEach(testCase => {
  defaults.formFields.push(testCase);
});

test('matches: "Hello" -> matches1 to be true', () => {
  expect(matches({ value: "Hello" }, "matches1")).toBeTruthy();
});

test('matches: "Hello" -> matches2 to be false', () => {
  expect(matches({ value: "Hello" }, "matches2")).toBeFalsy();
});

test('matches: "HELLO" -> matches2 to be false', () => {
  expect(matches({ value: "HELLO" }, "matches2")).toBeFalsy();
});

test('matches: " HELLO  " -> matches2 to be true', () => {
  expect(matches({ value: " HELLO  " }, "matches2")).toBeTruthy();
});

test('matches: " hello  " -> matches2 to be false', () => {
  expect(matches({ value: " hello  " }, "matches2")).toBeFalsy();
});

test('matches: "7" (as number) -> matches3 to be true', () => {
  expect(matches({ value: 7 }, "matches3")).toBeTruthy();
});

test('matches: "7" (as string) -> matches3 to be false', () => {
  expect(matches({ value: "7" }, "matches3")).toBeFalsy();
});

test('matches: "true" (as boolean) -> matches4 to be true', () => {
  expect(matches({ value: true }, "matches4")).toBeTruthy();
});

test('matches: "true" (as string) -> matches4 to be false', () => {
  expect(matches({ value: "true" }, "matches4")).toBeFalsy();
});

test('matches: "false" (as boolean) -> matches4 to be false', () => {
  expect(matches({ value: false }, "matches4")).toBeFalsy();
});
