import {sum} from './jestExample';

test('sum', () => {
  expect(sum(2, 2)).toBe(4)
  expect(sum(2, -2)).toBe(0)
});