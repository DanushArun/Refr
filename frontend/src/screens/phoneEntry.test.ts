import { formatIndianPhone } from './phoneEntry';

describe('phone entry formatting', () => {
  it('groups an Indian mobile number into the screen format', () => {
    expect(formatIndianPhone('9876543210')).toBe('98765 43210');
  });

  it('drops non-numeric characters while formatting', () => {
    expect(formatIndianPhone('98765-43210')).toBe('98765 43210');
  });
});
