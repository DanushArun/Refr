const OTP_LENGTH = 6;

export function otpDigits(value: string): string[] {
  const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
  return [...digits, ...Array<string>(OTP_LENGTH - digits.length).fill('')];
}
