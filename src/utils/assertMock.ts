const assertMock: any = (value: any, message?: string | Error) => {
  if (!value) throw new Error(message ? String(message) : "Assertion failed");
};
assertMock.ok = assertMock;
assertMock.equal = (a: any, b: any, m?: string) => {
  if (a != b) throw new Error(m || `Expected ${a} to equal ${b}`);
};
assertMock.strictEqual = (a: any, b: any, m?: string) => {
  if (a !== b) throw new Error(m || `Expected ${a} to strictly equal ${b}`);
};

export const strict = assertMock;
export default assertMock;
