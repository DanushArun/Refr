import {
  BASE_TAB_SCREEN_OPTIONS,
  LIQUID_TAB_BAR_HEIGHT,
  TAB_BAR_STYLE,
  TAB_SCENE_STYLE,
} from './tabBarOptions';
import { colors } from '../../theme/colors';
import { rhythm, spacing } from '../../theme/spacing';

describe('tabBarOptions', () => {
  it('test_tab_scenes_when_rendered_keep_aurora_visible', (): void => {
    expect(BASE_TAB_SCREEN_OPTIONS.sceneStyle).toBe(TAB_SCENE_STYLE);
  });

  it('test_tab_scenes_when_configured_use_transparent_background', (): void => {
    expect(TAB_SCENE_STYLE.backgroundColor).toBe('transparent');
  });

  it('test_tab_switching_when_configured_keeps_scene_visible', (): void => {
    expect(BASE_TAB_SCREEN_OPTIONS.animation).toBe('none');
  });

  it('test_tab_bar_when_configured_overlays_scene_content', (): void => {
    expect(TAB_BAR_STYLE.position).toBe('absolute');
  });

  it('test_liquid_tab_bar_when_configured_preserves_touch_target', (): void => {
    expect(LIQUID_TAB_BAR_HEIGHT - spacing[4]).toBeGreaterThanOrEqual(spacing[11]);
  });

  it('test_tab_bar_when_configured_keeps_gold_active_tint', (): void => {
    expect(BASE_TAB_SCREEN_OPTIONS.tabBarActiveTintColor).toBe(colors.gold);
  });

  it('test_scroll_content_when_at_end_clears_liquid_tab_bar', (): void => {
    expect(rhythm.tabClearance).toBeGreaterThanOrEqual(
      LIQUID_TAB_BAR_HEIGHT + spacing[8],
    );
  });
});
