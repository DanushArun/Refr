jest.mock('react-native', () => ({
  Dimensions: {
    get: () => ({ height: 852 }),
  },
}));

import { DISCOVER_CARD_HEIGHT, discoverCardLayout } from './discoverCardLayout';
import { layout, spacing } from '../../../theme/spacing';

describe('discoverCardLayout', () => {
  it('test_card_inset_when_rendered_matches_screen_grid', (): void => {
    expect(discoverCardLayout.inset).toBe(layout.screenPaddingH);
  });

  it('test_overlay_padding_when_rendered_uses_shared_rhythm', (): void => {
    expect(discoverCardLayout.overlayPaddingHorizontal).toBe(spacing[6]);
  });

  it('test_card_height_when_rendered_stays_within_phone_viewport', (): void => {
    expect(DISCOVER_CARD_HEIGHT).toBeLessThanOrEqual(580);
  });
});
