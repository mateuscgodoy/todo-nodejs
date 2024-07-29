import assert from 'node:assert';
import { todoValidation } from '../src/core/index.js';
import { describe, test, it } from 'node:test';

describe('Input Validation Functions', () => {
  describe('To-Do text func', () => {
    test('Returns true with a valid input', () => {
      assert.strictEqual(
        todoValidation.validateToDoText('A valid to-do!'),
        true
      );
    });
  });
});
