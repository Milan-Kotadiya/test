import { Greeter, Model } from '../index';
test('My Greeter', () => {
  expect(Greeter('Carl')).toBe('Hello Carl');
});

test('check MINUS', () => {
  const model = new Model();
  expect(model.MINUS(30, 15)).toBe(15);
});
test('check SUM', () => {
  const model = new Model();
  expect(model.SUM(1, 2)).toBe(3);
});
test('check MUL', () => {
  const model = new Model();
  expect(model.MUL(15, 2)).toBe(30);
});
test('check DIV', () => {
  const model = new Model();
  expect(model.DIV(100, 10)).toBe(10);
});
