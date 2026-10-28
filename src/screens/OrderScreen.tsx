import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Dish, OrderItem, DishCategory } from '../types';
import { useRestaurant } from '../context/RestaurantContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { formatCurrency } from '../utils/formatters';
import { AppButton } from '../components/AppButton';
import { CategoryBadge } from '../components/CategoryBadge';
import { EmptyState } from '../components/EmptyState';

type Props = NativeStackScreenProps<RootStackParamList, 'Order'>;

const FILTER_TABS: ('Tất cả' | DishCategory)[] = [
  'Tất cả',
  'Khai vị',
  'Món chính',
  'Tráng miệng',
  'Đồ uống',
];

export const OrderScreen: React.FC<Props> = ({ navigation, route }) => {
  const { tableNumber } = route.params;
  const { dishes, getActiveOrderForTable, saveTableOrder } = useRestaurant();

  const [selectedCategory, setSelectedCategory] = useState<'Tất cả' | DishCategory>('Tất cả');

  // Lấy hoá đơn đang phục vụ hiện tại của bàn (nếu có)
  const existingOrder = getActiveOrderForTable(tableNumber);

  // Map dishId -> quantity
  const [itemQuantities, setItemQuantities] = useState<{ [dishId: string]: number }>({});

  // Khởi tạo số lượng từ hoá đơn đang phục vụ cũ
  useEffect(() => {
    if (existingOrder && existingOrder.items) {
      const qMap: { [dishId: string]: number } = {};
      existingOrder.items.forEach(item => {
        qMap[item.dishId] = item.quantity;
      });
      setItemQuantities(qMap);
    } else {
      setItemQuantities({});
    }
  }, [existingOrder]);

  // Tăng số lượng món
  const handleIncrease = (dish: Dish) => {
    if (!dish.available) {
      Alert.alert('Hết món', `Món "${dish.name}" hiện đã hết, không thể gọi thêm.`);
      return;
    }

    setItemQuantities(prev => ({
      ...prev,
      [dish.id]: (prev[dish.id] || 0) + 1,
    }));
  };

  // Giảm số lượng món (giảm về 0 thì bỏ món khỏi hoá đơn theo yêu cầu Câu 4)
  const handleDecrease = (dishId: string) => {
    setItemQuantities(prev => {
      const current = prev[dishId] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[dishId];
        return next;
      }
      return {
        ...prev,
        [dishId]: current - 1,
      };
    });
  };

  // Tính Tạm tính ngay khi thay đổi món hoặc số lượng (Câu 4)
  const subtotal = useMemo(() => {
    return Object.entries(itemQuantities).reduce((sum, [dishId, qty]) => {
      const dish = dishes.find(d => d.id === dishId);
      if (dish && qty > 0) {
        return sum + dish.price * qty;
      }
      return sum;
    }, 0);
  }, [itemQuantities, dishes]);

  // Tổng số lượng đĩa đã gọi
  const totalItemCount = useMemo(() => {
    return Object.values(itemQuantities).reduce((acc, qty) => acc + qty, 0);
  }, [itemQuantities]);

  // Lọc danh sách món hiển thị
  const filteredDishes = useMemo(() => {
    if (selectedCategory === 'Tất cả') {
      return dishes;
    }
    return dishes.filter(d => d.category === selectedCategory);
  }, [dishes, selectedCategory]);

  // Tạo mảng OrderItem từ state
  const getOrderItemsArray = (): OrderItem[] => {
    return Object.entries(itemQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([dishId, quantity]) => ({ dishId, quantity }));
  };

  // Lưu hoá đơn gọi món
  const handleSave = async (showNotification: boolean = true) => {
    const items = getOrderItemsArray();
    await saveTableOrder(tableNumber, items);
    if (showNotification) {
      Alert.alert(
        'Đã lưu hoá đơn',
        `Hoá đơn Bàn ${tableNumber} đã được cập nhật thành công!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  // Chuyển sang thanh toán
  const handleGoToCheckout = async () => {
    const items = getOrderItemsArray();
    if (items.length === 0) {
      Alert.alert(
        'Chưa có món',
        'Bàn này chưa chọn món nào. Vui lòng chọn ít nhất một món trước khi thanh toán.'
      );
      return;
    }

    const savedOrder = await saveTableOrder(tableNumber, items);
    if (savedOrder) {
      navigation.navigate('Checkout', {
        tableNumber,
        orderId: savedOrder.id,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      {/* Header tóm tắt thông tin bàn và tạm tính */}
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.tableTitle}>Bàn số {tableNumber}</Text>
            <Text style={styles.tableStatusText}>
              {existingOrder ? 'Đang phục vụ (Có khách)' : 'Bàn mới (Chưa có khách)'}
            </Text>
          </View>
          <View style={styles.itemBadge}>
            <Text style={styles.itemBadgeText}>{totalItemCount} món đã chọn</Text>
          </View>
        </View>

        {/* Tạm tính được cập nhật ngay khi thay đổi món hoặc số lượng (Câu 4) */}
        <View style={styles.subtotalRow}>
          <Text style={styles.subtotalLabel}>Tạm tính hiện tại:</Text>
          <Text style={styles.subtotalValue}>{formatCurrency(subtotal)}</Text>
        </View>
      </View>

      {/* Tabs lọc theo loại món */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_TABS}
          keyExtractor={item => item}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const isActive = selectedCategory === item;
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setSelectedCategory(item)}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Danh sách món ăn để chọn */}
      <FlatList
        data={filteredDishes}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.dishListContent}
        ListEmptyComponent={
          <EmptyState
            title="Không có món ăn"
            description="Chưa có món ăn nào trong danh mục này."
          />
        }
        renderItem={({ item: dish }) => {
          const qty = itemQuantities[dish.id] || 0;
          const isOutOfStock = !dish.available;

          return (
            <View
              style={[
                styles.dishItemCard,
                isOutOfStock && styles.dishItemUnavailable,
                qty > 0 && styles.dishItemSelected,
              ]}
            >
              <View style={styles.dishInfo}>
                <View style={styles.nameRow}>
                  <Text
                    style={[
                      styles.dishName,
                      isOutOfStock && styles.textDisabled,
                    ]}
                  >
                    {dish.name}
                  </Text>
                  {isOutOfStock ? (
                    <View style={styles.outOfStockBadge}>
                      <Text style={styles.outOfStockText}>Hết món</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.metaRow}>
                  <CategoryBadge category={dish.category} />
                  <Text
                    style={[
                      styles.dishPrice,
                      isOutOfStock && styles.textDisabled,
                    ]}
                  >
                    {formatCurrency(dish.price)}
                  </Text>
                </View>
              </View>

              {/* Nút tăng giảm số lượng (+ / -) */}
              <View style={styles.quantityControls}>
                {qty > 0 ? (
                  <>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleDecrease(dish.id)}
                      style={styles.qtyButton}
                    >
                      <Text style={styles.qtyButtonText}>−</Text>
                    </TouchableOpacity>

                    <Text style={styles.quantityDisplay}>{qty}</Text>
                  </>
                ) : null}

                {/* Món đã hết không được chọn (Câu 4) */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleIncrease(dish)}
                  disabled={isOutOfStock}
                  style={[
                    styles.qtyButton,
                    styles.qtyAddButton,
                    isOutOfStock && styles.qtyButtonDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.qtyButtonText,
                      styles.qtyAddButtonText,
                      isOutOfStock && styles.textDisabled,
                    ]}
                  >
                    +
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* Thanh hành động dưới cùng */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarInfo}>
          <Text style={styles.bottomBarLabel}>Tạm tính:</Text>
          <Text style={styles.bottomBarTotal}>{formatCurrency(subtotal)}</Text>
        </View>

        <View style={styles.actionButtonsRow}>
          <AppButton
            title="Lưu gọi món"
            onPress={() => handleSave(true)}
            variant="outline"
            style={styles.saveButton}
          />
          <AppButton
            title="Thanh toán"
            onPress={handleGoToCheckout}
            variant="primary"
            disabled={totalItemCount === 0}
            style={styles.checkoutButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerCard: {
    backgroundColor: colors.surface,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tableTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.text,
  },
  tableStatusText: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  itemBadgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.primaryDark,
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  subtotalLabel: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
  },
  subtotalValue: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  filterContainer: {
    marginVertical: 6,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.textWhite,
    fontWeight: typography.weight.bold,
  },
  dishListContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  dishItemCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dishItemSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FFFAF5',
  },
  dishItemUnavailable: {
    opacity: 0.55,
    backgroundColor: '#F1F5F9',
  },
  dishInfo: {
    flex: 1,
    marginRight: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dishName: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.text,
    flexShrink: 1,
  },
  outOfStockBadge: {
    backgroundColor: colors.dangerLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  outOfStockText: {
    fontSize: typography.size.xs,
    color: colors.danger,
    fontWeight: typography.weight.bold,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dishPrice: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  textDisabled: {
    color: colors.textMuted,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  qtyAddButton: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  qtyButtonDisabled: {
    borderColor: colors.border,
    backgroundColor: colors.border,
    opacity: 0.5,
  },
  qtyButtonText: {
    fontSize: 18,
    fontWeight: typography.weight.bold,
    color: colors.text,
    lineHeight: 20,
  },
  qtyAddButtonText: {
    color: colors.textWhite,
  },
  quantityDisplay: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.text,
    minWidth: 20,
    textAlign: 'center',
  },
  bottomBar: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  bottomBarInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bottomBarLabel: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
  },
  bottomBarTotal: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  saveButton: {
    flex: 1,
  },
  checkoutButton: {
    flex: 1,
  },
});
