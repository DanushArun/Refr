import { otpDigits } from './otpEntry';

describe('OTP entry', () => {
  it('renders the six verification digits in order', () => {
    expect(otpDigits('286417')).toEqual(['2', '8', '6', '4', '1', '7']);
  });

  it('pads incomplete codes with empty slots', () => {
    expect(otpDigits('28')).toEqual(['2', '8', '', '', '', '']);
  });
});
