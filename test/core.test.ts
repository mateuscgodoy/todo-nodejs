import { todoValidation } from '../src/core/index.js';

describe('Input Validation Functions', () => {
  describe('To-Do text func', () => {
    test('Returns true with a valid input', () => {
      expect(todoValidation.validateToDoText('A valid to-do!')).toBe(true);
    });
    test('Returns an error message with an empty string', () => {
      expect(todoValidation.validateToDoText('')).toBe(
        'Error: a To-Do must have some text information.'
      );
    });
  });
});
