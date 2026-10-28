import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Dish } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { formatCurrency } from '../utils/formatters';
import { CategoryBadge } from './CategoryBadge';

interface DishListItemProps {
  dish: Dish;
  onPress: (dish: Dish) => void;
  onDelete: (dish: Dish) => void;
  onToggleAvailable: (dishId: string) => void;
}

export const DishListItem: React.FC<DishListItemProps> = ({
  dish,
  onPress,
  onDelete,
  onToggleAvailable,
}) => {
  const isOutOfStock = !dish.available;

  const handleLongPress = () => {
    // Câu 3: Nhấn giữ một dòng (onLongPress) để xoá, có hỏi xác nhận bằng Alert
    Alert.alert(
      'Xác nhận xoá món',
      `Bạn có chắc chắn muốn xoá món "${dish.name}" khỏi thực đơn không?`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá món',
          style: 'destructive',
          onPress: () => onDelete(dish),
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(dish)}
      onLongPress={handleLongPress}
      delayLongPress={500}
      style={[styles.card, isOutOfStock && styles.cardUnavailable]}
    >
      <View style={styles.contentLeft}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.dishName, isOutOfStock && styles.textMuted]}
            numberOfLines={1}
          >
            {dish.name}
          </Text>

          {/* Nhãn "Hết món" khi dish.available === false */}
          {isOutOfStock ? (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>Hết món</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.subRow}>
          <CategoryBadge category={dish.category} />
          <Text style={[styles.price, isOutOfStock && styles.textMuted]}>
            {formatCurrency(dish.price)}
          </Text>
        </View>
      </View>

      {/* Công tắc (Switch) trên mỗi dòng để bật/tắt trạng thái còn món */}
      <View style={styles.switchWrapper}>
        <Text style={styles.switchLabel}>
          {dish.available ? 'Còn món' : 'Hết'}
        </Text>
        <Switch
          value={dish.available}
          onValueChange={() => onToggleAvailable(dish.id)}
          trackColor={{ false: colors.borderDark, true: colors.primaryLight }}
          thumbColor={dish.available ? colors.primary : '#94A3B8'}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginVertical: 5,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  // Món đã hết hiển thị mờ đi
  cardUnavailable: {
    opacity: 0.65,
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  contentLeft: {
    flex: 1,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dishName: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.text,
    flexShrink: 1,
  },
  outOfStockBadge: {
    backgroundColor: colors.dangerLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  outOfStockText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.danger,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  price: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  textMuted: {
    color: colors.textMuted,
  },
  switchWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchLabel: {
    fontSize: 10,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
    marginBottom: 2,
  },
});
