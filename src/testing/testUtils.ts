export function asMock<T>(func: (...args: any[]) => any): jest.Mock<T> {
  return func as jest.Mock<T>;
}
