jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
  StyleSheet: {
    create: <T>(styles: T): T => styles,
    hairlineWidth: 0.5,
  },
}));

import { colors } from '../../theme/colors';
import { chatStyles } from './chatStyles';

describe('chatStyles', () => {
  test('test_safe_background_when_rendered_directly_expected_app_background', () => {
    expect(chatStyles.safe.backgroundColor).toBe(colors.background);
  });
});
