import stringToBool from '../src/string-to-bool'
import { expect, test } from '@jest/globals'

test('truthy', () => {
  expect(stringToBool('on')).toBe(true)
  expect(stringToBool('true')).toBe(true)
  expect(stringToBool('yes')).toBe(true)
  expect(stringToBool('y')).toBe(true)
  for (let i = 1; i < 10; i++) expect(stringToBool(i.toString())).toBe(true)
})

test('falsy', () => {
  expect(stringToBool('off')).toBe(false)
  expect(stringToBool('false')).toBe(false)
  expect(stringToBool('no')).toBe(false)
  expect(stringToBool('n')).toBe(false)
  expect(stringToBool('0')).toBe(false)
})

test('invalid', () => {
  expect(() => stringToBool('invalid')).toThrow()
  expect(() => stringToBool('enabled')).toThrow()
  expect(() => stringToBool('disabled')).toThrow()
})
