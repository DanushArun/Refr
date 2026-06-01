import {
  BASE_TAB_SCREEN_OPTIONS,
  TAB_BAR_STYLE,
  TAB_SCENE_STYLE,
} from './tabBarOptions';
import { colors } from '../../theme/colors';

describe('tabBarOptions', () => {
  it('test_tab_scenes_when_rendered_keep_aurora_visible', (): void => {
    expect(BASE_TAB_SCREEN_OPTIONS.sceneStyle).toBe(TAB_SCENE_STYLE);
  });

  it('test_tab_scenes_when_configured_use_transparent_background', (): void => {
    expect(TAB_SCENE_STYLE.backgroundColor).toBe('transparent');
  });

  it('test_tab_bar_when_configured_uses_dark_background', (): void => {
    expect(TAB_BAR_STYLE.backgroundColor).toBe(colors.backgroundElevated);
  });
});
