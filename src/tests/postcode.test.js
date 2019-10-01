import hooks from './../_inc/_validationMethods'
const postcode = hooks.uk_postcode

const validField1 = {
    value: 'B3 3DH'
}

const validField2 = {
    value: 'M21 0BN'
}

const validField3 = {
    value: 'B33DH'
}

const validField4 = {
    value: 'M210BN'
}

const validField5 = {
    value: 'm210bn'
}

const invalidField1 = {
    value: 'M21 0'
}

const invalidField2 = {
    value: 'M21 0BNNN'
}

test('validate postcode', () => {
    expect(postcode(validField1)).toBeTruthy()
})

test('validate postcode 2', () => {
    expect(postcode(validField2)).toBeTruthy()
})

test('validate postcode 3', () => {
    expect(postcode(validField3)).toBeTruthy()
})

test('validate postcode 4', () => {
    expect(postcode(validField4)).toBeTruthy()
})

test('validate postcode 5', () => {
    expect(postcode(validField5)).toBeTruthy()
})

test('validate postcode 5', () => {
    expect(postcode(invalidField1)).toBeFalsy()
})

test('validate postcode 6', () => {
    expect(postcode(invalidField2)).toBeFalsy()
})