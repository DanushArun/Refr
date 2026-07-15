import React, { useMemo } from 'react';
import { Image, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Avatar } from '../../../components/common/Avatar';
import { BrandPhotoGrade } from '../../../components/common/BrandPhotoGrade';
import { officeImageFor } from '../../../components/activity/companyOffices';
import { endorserActivityLine } from './endorserCardPresentation';
import type { EndorserCard } from './endorserCardData';
import { getCompanyBrand } from './companyBrand';
import { styles } from './EndorserCard.styles';

export function EndorserCardContent({ card }: { card: EndorserCard }): React.ReactElement {
  const brand = getCompanyBrand(card.companyId);
  const officeImage = useMemo(() => officeImageFor(card.companyName), [card.companyName]);
  const metaLine = endorserActivityLine(card);

  return (
    <View style={styles.fullMediaCard}>
      <View style={[styles.officeFallback, { backgroundColor: brand.tint }]} />
      {officeImage && <Image source={officeImage} style={styles.officeImage} resizeMode="cover" />}
      <BrandPhotoGrade />
      <LinearGradient
        colors={[
          'rgba(12, 31, 25, 0)',
          'rgba(12, 31, 25, 0.52)',
          'rgba(12, 31, 25, 0.86)',
          'rgba(12, 31, 25, 0.98)',
        ]}
        locations={[0.44, 0.58, 0.76, 1]}
        style={styles.bottomScrim}
        pointerEvents="none"
      />
      <View style={styles.overlayContent}>
        <View style={styles.overlayTitleRow}>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.84}
            numberOfLines={1}
            style={styles.companyTitle}
          >
            {card.companyName}
          </Text>
          <View style={styles.verifiedChip}>
            <Text style={styles.verifiedChipText}>VERIFIED</Text>
          </View>
        </View>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.82}
          numberOfLines={2}
          style={styles.companyRole}
        >
          {card.jobTitle}
        </Text>
        <View style={styles.endorserProofRow}>
          <Avatar
            displayName={card.name}
            size="sm"
            uri={card.avatarUrl}
            verificationRing
          />
          <Text numberOfLines={2} style={styles.endorserProofText}>
            {card.name} can endorse this role.
          </Text>
        </View>
        {metaLine && (
          <Text numberOfLines={1} style={styles.endorserMetaLine}>
            {metaLine}
          </Text>
        )}
      </View>
    </View>
  );
}

export function EndorserStackPreview(): React.ReactElement {
  return <View style={styles.stackPlate} />;
}
