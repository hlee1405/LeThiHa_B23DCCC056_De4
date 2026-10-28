import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface HeaderSummaryProps {
  totalDishes: number;
  occupiedTables: number;
  maxTables?: number;
}

export const HeaderSummary: React.FC<HeaderSummaryProps> = ({
  totalDishes,
  occupiedTables,
  maxTables = 10,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.contentRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Tổng thực đơn</Text>
          <Text style={styles.statValue}>{totalDishes} món</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Bàn phục vụ</Text>
          <Text style={styles.statValue}>
            {occupiedTables}/{maxTables} bàn có khách
          </Text>
        </View>
      </View>

      {/* Dòng tóm tắt theo format chính xác của đề bài */}
      <View style={styles.pillBadge}>
        <Text style={styles.pillText}>
          {totalDishes} món · {occupiedTables}/{maxTables} bàn có khách
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
    marginBottom: 2,
  },
  statValue: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.text,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  pillBadge: {
    backgroundColor: colors.primaryMuted,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  pillText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
});
