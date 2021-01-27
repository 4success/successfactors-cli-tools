import SuccessFactors from '../lib/successFactors';

jest.mock('../lib/successFactors');

beforeAll(() => {});

test('testCredentials', async () => {
  const sf = new SuccessFactors();

  await sf.login();
  expect(await sf.checkLogin()).toBe(true);
});
