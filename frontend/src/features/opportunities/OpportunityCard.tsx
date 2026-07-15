import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '../../components/common/PressableScale';
import type { Opportunity } from '../../services/api/opportunities';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import {
  formatEmploymentType,
  formatExperience,
  formatExpiry,
  formatFreshness,
  formatSource,
  formatWorkplace,
} from './opportunityPresentation';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export interface OpportunityCardProps {
  opportunity: Opportunity;
  onOpen: (opportunity: Opportunity) => void;
}

interface MetaItemProps {
  icon: IconName;
  label: string;
}

interface SkillSectionProps {
  label: string;
  skills: string[];
  limit: number;
}

function companyInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function CompanyMark({ uri, name }: { uri: string | null; name: string }): React.ReactElement {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [uri]);

  if (uri && !failed) {
    return (
      <Image
        accessible={false}
        onError={() => setFailed(true)}
        resizeMode="contain"
        source={{ uri }}
        style={styles.companyMark}
      />
    );
  }

  return (
    <View accessible={false} style={[styles.companyMark, styles.companyMarkFallback]}>
      <Text style={styles.companyInitials}>{companyInitials(name)}</Text>
    </View>
  );
}

function MetaItem({ icon, label }: MetaItemProps): React.ReactElement {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={17} color={colors.cardSurfaceTextMuted} />
      <Text numberOfLines={2} style={styles.metaText}>
        {label}
      </Text>
    </View>
  );
}

function CardHeader({ opportunity }: { opportunity: Opportunity }): React.ReactElement {
  return (
    <View style={styles.header}>
      <CompanyMark uri={opportunity.companyLogo} name={opportunity.companyName} />
      <View style={styles.headerText}>
        <Text numberOfLines={1} style={styles.companyName}>
          {opportunity.companyName}
        </Text>
        <Text numberOfLines={3} style={styles.title}>
          {opportunity.title}
        </Text>
      </View>
    </View>
  );
}

function RoleDetails({ opportunity }: { opportunity: Opportunity }): React.ReactElement {
  const roleType = `${opportunity.department} · ${formatEmploymentType(
    opportunity.employmentType,
  )}`;

  return (
    <View style={styles.metaList}>
      <MetaItem icon="business-outline" label={roleType} />
      <MetaItem
        icon="location-outline"
        label={formatWorkplace(opportunity.remotePolicy, opportunity.location)}
      />
      <MetaItem
        icon="time-outline"
        label={formatExperience(
          opportunity.minYearsExperience,
          opportunity.maxYearsExperience,
        )}
      />
    </View>
  );
}

function SkillSection({ label, skills, limit }: SkillSectionProps): React.ReactElement | null {
  if (skills.length === 0) return null;
  const visibleSkills = skills.slice(0, limit);
  const hiddenCount = skills.length - visibleSkills.length;

  return (
    <View style={styles.skillSection}>
      <Text style={styles.skillLabel}>{label}</Text>
      <View style={styles.skillList}>
        {visibleSkills.map((skill) => (
          <View key={skill} style={styles.skillChip}>
            <Text numberOfLines={1} style={styles.skillText}>
              {skill}
            </Text>
          </View>
        ))}
        {hiddenCount > 0 ? (
          <Text style={styles.moreSkills}>+{hiddenCount} more</Text>
        ) : null}
      </View>
    </View>
  );
}

function CardFooter({
  opportunity,
  onOpen,
}: OpportunityCardProps): React.ReactElement {
  const expiry = formatExpiry(opportunity.expiresAt);
  const availability = opportunity.available
    ? 'Referral path available'
    : 'Referral path unavailable';

  return (
    <View style={styles.footer}>
      <View style={styles.footerText}>
        <Text style={styles.freshness}>
          {formatFreshness(opportunity.postedAt)}{expiry ? ` · ${expiry}` : ''}
        </Text>
        <Text style={styles.provenance}>
          {formatSource(opportunity.source)} · {availability}
        </Text>
      </View>
      <PressableScale
        accessibilityHint="Opens the complete opportunity"
        accessibilityLabel={`View ${opportunity.title} at ${opportunity.companyName}`}
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => onOpen(opportunity)}
        pressedScale={0.92}
        style={styles.openButton}
      >
        <Ionicons name="arrow-forward" size={22} color={colors.cream} />
      </PressableScale>
    </View>
  );
}

export function OpportunityCard({
  opportunity,
  onOpen,
}: OpportunityCardProps): React.ReactElement {
  return (
    <View style={styles.card}>
      <CardHeader opportunity={opportunity} />
      <RoleDetails opportunity={opportunity} />
      <View style={styles.divider} />
      <View style={styles.skills}>
        <SkillSection label="Required" skills={opportunity.requiredSkills} limit={4} />
        <SkillSection label="Preferred" skills={opportunity.preferredSkills} limit={3} />
      </View>
      <CardFooter opportunity={opportunity} onOpen={onOpen} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.cardSurface,
    borderColor: colors.cardSurfaceDivider,
    borderRadius: 8,
    borderWidth: 1,
    padding: spacing[5],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  companyMark: {
    width: 52,
    height: 52,
    borderRadius: 8,
  },
  companyMarkFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.navy,
  },
  companyInitials: {
    ...typography.rowTitle,
    color: colors.cream,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  companyName: {
    ...typography.rowTitle,
    color: colors.cardSurfaceTextMuted,
    marginBottom: spacing[1],
  },
  title: {
    ...typography.h2,
    color: colors.cardSurfaceText,
  },
  metaList: {
    gap: spacing[2],
    marginTop: spacing[5],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    minHeight: 22,
  },
  metaText: {
    ...typography.bodySmall,
    color: colors.cardSurfaceTextMuted,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardSurfaceDivider,
    marginVertical: spacing[4],
  },
  skills: {
    flex: 1,
    gap: spacing[3],
  },
  skillSection: {
    gap: spacing[1.5],
  },
  skillLabel: {
    ...typography.sectionEyebrow,
    color: colors.cardSurfaceTextSubtle,
  },
  skillList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing[1.5],
  },
  skillChip: {
    maxWidth: 164,
    backgroundColor: 'rgba(7, 20, 15, 0.07)',
    borderColor: colors.cardSurfaceDivider,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  skillText: {
    ...typography.caption,
    color: colors.cardSurfaceText,
  },
  moreSkills: {
    ...typography.caption,
    color: colors.cardSurfaceTextMuted,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[3],
    marginTop: spacing[4],
  },
  footerText: {
    flex: 1,
    minWidth: 0,
    gap: spacing[1],
  },
  freshness: {
    ...typography.rowCaption,
    color: colors.cardSurfaceText,
  },
  provenance: {
    ...typography.caption,
    color: colors.cardSurfaceTextMuted,
  },
  openButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.navy,
  },
});
