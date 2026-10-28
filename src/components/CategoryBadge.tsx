import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DishCategory } from '../types';
import { typography } from '../theme/typography';

interface CategoryBadgeProps {
  category: DishCategory;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  const getBadgeStyle = () => {
    switch (category) {
      case 'Khai vị':
        return {
          bg: '#FEF3C7',
          text: '#B45309',
        };
      case 'Món chính':
        return {
          bg: '#FEE2E2',
          text: '#B91C1C',
        };
      case 'Tráng miệng':
        return {
          bg: '#F3E8FF',
          text: '#7E22CE',
        };
      case 'Đồ uống':
        return {
          bg: '#E0F2FE',
          text: '#0369A1',
        };
      default:
        return {
          bg: '#F1F5F9',
          text: '#475569',
        };
    }
  };

  const styleConfig = getBadgeStyle();

  return (
    <View style={[styles.badge, { backgroundColor: styleConfig.bg }]}>
      <Text style={[styles.text, { color: styleConfig.text }]}>{category}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semiBold,
  },
});
