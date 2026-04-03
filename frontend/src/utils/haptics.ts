import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const hapticSelection = async () => {
  if (isWeb) return;
  await Haptics.selectionAsync();
};

export const hapticImpact = async (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
  if (isWeb) return;
  await Haptics.impactAsync(style);
};

export const hapticNotification = async (type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success) => {
  if (isWeb) return;
  await Haptics.notificationAsync(type);
};
