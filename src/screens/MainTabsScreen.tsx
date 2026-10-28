import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Dish, DishCategory } from '../types';
import { useRestaurant } from '../context/RestaurantContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { formatCurrency } from '../utils/formatters';
import { HeaderSummary } from '../components/HeaderSummary';
import { DishListItem } from '../components/DishListItem';
import { EmptyState } from '../components/EmptyState';
import { AppButton } from '../components/AppButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>;

const ALL_CATEGORIES: DishCategory[] = [
  'Khai vị',
  'Món chính',
  'Tráng miệng',
  'Đồ uống',
];

export const MainTabsScreen: React.FC<Props> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'tables' | 'history'>('menu');

  const {
    dishes,
    orders,
    totalDishesCount,
    occupiedTablesCount,
    deleteDish,
    toggleDishAvailability,
    getActiveOrderForTable,
  } = useRestaurant();

  // Nhóm thực đơn theo SectionList (Câu 1: nhóm theo loại món, có tiêu đề nhóm)
  const menuSections = useMemo(() => {
    return ALL_CATEGORIES.map(category => {
      const items = dishes.filter(d => d.category === category);
      return {
        title: category,
        data: items,
        count: items.length,
      };
    }).filter(section => section.data.length > 0);
  }, [dishes]);

  // Danh sách 10 bàn cố định từ 1 đến 10 (Câu 4)
  const tables = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => i + 1);
  }, []);

  // Xoá món ăn (Câu 3)
  const handleDeleteDish = async (dish: Dish) => {
    await deleteDish(dish.id);
  };

  // Mở màn hình chỉnh sửa món (Câu 2)
  const handleEditDish = (dish: Dish) => {
    navigation.navigate('DishForm', { dish });
  };

  // Mở màn hình thêm món (Câu 2)
  const handleAddNewDish = () => {
    navigation.navigate('DishForm', undefined);
  };

  // Mở màn hình gọi món cho 1 bàn (Câu 4)
  const handleSelectTable = (tableNumber: number) => {
    navigation.navigate('Order', { tableNumber });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Header & Brand */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.brandTitle}>Quản Lý Nhà Hàng</Text>
          <Text style={styles.brandSubtitle}>Hệ thống phục vụ & gọi món</Text>
        </View>
      </View>

      {/* Segmented Control chuyển đổi giữa Thực đơn & Sơ đồ bàn */}
      <View style={styles.segmentedContainer}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveTab('menu')}
          style={[styles.segmentTab, activeTab === 'menu' && styles.segmentTabActive]}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === 'menu' && styles.segmentTextActive,
            ]}
          >
            Thực đơn ({totalDishesCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveTab('tables')}
          style={[
            styles.segmentTab,
            activeTab === 'tables' && styles.segmentTabActive,
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === 'tables' && styles.segmentTextActive,
            ]}
          >
            Sơ đồ bàn ({occupiedTablesCount}/10)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveTab('history')}
          style={[
            styles.segmentTab,
            activeTab === 'history' && styles.segmentTabActive,
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === 'history' && styles.segmentTextActive,
            ]}
          >
            Lịch sử
          </Text>
        </TouchableOpacity>
      </View>

      {/* ======================= TAB 1: THỰC ĐƠN ======================= */}
      {activeTab === 'menu' && (
        <View style={styles.tabContent}>
          {/* Đầu màn hình hiển thị tổng số món và số bàn đang có khách (Câu 1) */}
          <HeaderSummary
            totalDishes={totalDishesCount}
            occupiedTables={occupiedTablesCount}
            maxTables={10}
          />

          {/* Thanh công cụ với nút "+ Thêm món" (Câu 2) */}
          <View style={styles.menuActionBar}>
            <Text style={styles.hintText}>
              Nhấn để sửa món · Nhấn giữ để xoá
            </Text>
            <AppButton
              title="+ Thêm món"
              onPress={handleAddNewDish}
              variant="primary"
              style={styles.addDishButton}
              textStyle={styles.addDishButtonText}
            />
          </View>

          {/* Hiển thị thực đơn bằng SectionList nhóm theo loại món (Câu 1) */}
          <SectionList
            sections={menuSections}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <EmptyState
                title="Thực đơn đang trống"
                description="Chưa có món ăn nào trong thực đơn. Nhấn nút bên dưới để tạo món đầu tiên."
                actionTitle="+ Thêm món mới"
                onAction={handleAddNewDish}
              />
            }
            renderSectionHeader={({ section: { title, count } }) => (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <View style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>{count} món</Text>
                </View>
              </View>
            )}
            renderItem={({ item }) => (
              <DishListItem
                dish={item}
                onPress={handleEditDish}
                onDelete={handleDeleteDish}
                onToggleAvailable={toggleDishAvailability}
              />
            )}
          />
        </View>
      )}

      {/* ======================= TAB 2: SƠ ĐỒ 10 BÀN (Câu 4) ======================= */}
      {activeTab === 'tables' && (
        <View style={styles.tabContent}>
          <View style={styles.tablesHeader}>
            <View>
              <Text style={styles.tablesTitle}>Sơ đồ 10 bàn phục vụ</Text>
              <Text style={styles.tablesSubtitle}>
                Chạm vào bàn để gọi món hoặc tiến hành thanh toán
              </Text>
            </View>

            {/* Chú thích màu sắc */}
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.tableEmpty }]} />
                <Text style={styles.legendText}>Bàn trống</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: colors.tableOccupied }]}
                />
                <Text style={styles.legendText}>Có khách</Text>
              </View>
            </View>
          </View>

          {/* FlatList với numColumns={2} theo yêu cầu Câu 4 */}
          <FlatList
            data={tables}
            keyExtractor={item => `table_${item}`}
            numColumns={2}
            contentContainerStyle={styles.gridContent}
            columnWrapperStyle={styles.gridColumnWrapper}
            renderItem={({ item: tableNumber }) => {
              const activeOrder = getActiveOrderForTable(tableNumber);
              const isOccupied = Boolean(activeOrder && activeOrder.items.length > 0);

              // Tính tạm tính của bàn nếu đang có khách
              const tableSubtotal = isOccupied
                ? activeOrder!.items.reduce((sum, orderItem) => {
                    const dish = dishes.find(d => d.id === orderItem.dishId);
                    return sum + (dish ? dish.price * orderItem.quantity : 0);
                  }, 0)
                : 0;

              const totalDishCount = isOccupied
                ? activeOrder!.items.reduce((acc, it) => acc + it.quantity, 0)
                : 0;

              return (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleSelectTable(tableNumber)}
                  style={[
                    styles.tableCard,
                    isOccupied ? styles.tableCardOccupied : styles.tableCardEmpty,
                  ]}
                >
                  <View style={styles.tableCardHeader}>
                    <Text
                      style={[
                        styles.tableNumberText,
                        isOccupied
                          ? styles.tableNumberTextOccupied
                          : styles.tableNumberTextEmpty,
                      ]}
                    >
                      Bàn {tableNumber}
                    </Text>

                    <View
                      style={[
                        styles.statusPill,
                        isOccupied
                          ? styles.statusPillOccupied
                          : styles.statusPillEmpty,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          isOccupied
                            ? styles.statusPillTextOccupied
                            : styles.statusPillTextEmpty,
                        ]}
                      >
                        {isOccupied ? 'Có khách' : 'Trống'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.tableCardBody}>
                    {isOccupied ? (
                      <View style={styles.occupiedInfo}>
                        <Text style={styles.itemCountText}>
                          {totalDishCount} món đang phục vụ
                        </Text>
                        <Text style={styles.tableTotalText}>
                          {formatCurrency(tableSubtotal)}
                        </Text>
                        <Text style={styles.tableCreatedAt}>
                          {activeOrder?.createdAt}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.emptyInfo}>
                        <Text style={styles.emptyPromptText}>
                          Nhấn để mở bàn mới
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}

      {/* ======================= TAB 3: LỊCH SỬ HOÁ ĐƠN ======================= */}
      {activeTab === 'history' && (
        <View style={styles.tabContent}>
          <FlatList
            data={orders.filter(o => o.status === 'Đã thanh toán')}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <EmptyState
                title="Chưa có hoá đơn nào đã thanh toán"
                description="Khi thanh toán xong cho các bàn, lịch sử hoá đơn sẽ hiển thị tại đây."
              />
            }
            renderItem={({ item: order }) => {
              const orderSubtotal = order.items.reduce((sum, it) => {
                const dish = dishes.find(d => d.id === it.dishId);
                return sum + (dish ? dish.price * it.quantity : 0);
              }, 0);
              const orderVat = Math.round(orderSubtotal * 0.08);
              const orderTotal = orderSubtotal + orderVat;

              return (
                <View style={styles.historyCard}>
                  <View style={styles.historyCardHeader}>
                    <View>
                      <Text style={styles.historyTableText}>
                        Bàn {order.tableNumber}
                      </Text>
                      <Text style={styles.historyDateText}>{order.createdAt}</Text>
                    </View>
                    <View style={styles.paidBadge}>
                      <Text style={styles.paidBadgeText}>Đã thanh toán</Text>
                    </View>
                  </View>

                  <View style={styles.historyItemList}>
                    {order.items.map((it, idx) => {
                      const dish = dishes.find(d => d.id === it.dishId);
                      return (
                        <View key={idx} style={styles.historyItemRow}>
                          <Text style={styles.historyItemName}>
                            - {dish?.name || 'Món'}
                          </Text>
                          <Text style={styles.historyItemQty}>x{it.quantity}</Text>
                        </View>
                      );
                    })}
                  </View>

                  <View style={styles.historyTotalRow}>
                    <Text style={styles.historyTotalLabel}>Tổng thanh toán:</Text>
                    <Text style={styles.historyTotalValue}>
                      {formatCurrency(orderTotal)}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brandTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  brandSubtitle: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 10,
    padding: 3,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  segmentTabActive: {
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.primary,
    fontWeight: typography.weight.bold,
  },
  tabContent: {
    flex: 1,
  },
  menuActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 6,
  },
  hintText: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  addDishButton: {
    minHeight: 36,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  addDishButtonText: {
    fontSize: typography.size.sm,
  },
  listContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  sectionTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  sectionBadgeText: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    fontWeight: typography.weight.semiBold,
  },
  tablesHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  tablesTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text,
  },
  tablesSubtitle: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
  },
  gridContent: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  gridColumnWrapper: {
    justifyContent: 'space-between',
  },
  tableCard: {
    flex: 1,
    margin: 5,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  tableCardEmpty: {
    backgroundColor: colors.surface,
    borderColor: colors.tableEmptyBorder,
  },
  tableCardOccupied: {
    backgroundColor: colors.tableOccupiedBg,
    borderColor: colors.tableOccupied,
  },
  tableCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tableNumberText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
  },
  tableNumberTextEmpty: {
    color: colors.text,
  },
  tableNumberTextOccupied: {
    color: colors.primaryDark,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillEmpty: {
    backgroundColor: colors.tableEmptyBg,
  },
  statusPillOccupied: {
    backgroundColor: colors.primary,
  },
  statusPillText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  statusPillTextEmpty: {
    color: colors.tableEmpty,
  },
  statusPillTextOccupied: {
    color: colors.textWhite,
  },
  tableCardBody: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  occupiedInfo: {
    alignItems: 'center',
  },
  itemCountText: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
  },
  tableTotalText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.primary,
    marginTop: 2,
  },
  tableCreatedAt: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  emptyInfo: {
    alignItems: 'center',
  },
  emptyPromptText: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  historyCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
    marginBottom: 8,
  },
  historyTableText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.text,
  },
  historyDateText: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
  },
  paidBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  paidBadgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.success,
  },
  historyItemList: {
    marginVertical: 4,
  },
  historyItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  historyItemName: {
    fontSize: typography.size.sm,
    color: colors.text,
  },
  historyItemQty: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
  },
  historyTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    marginTop: 6,
  },
  historyTotalLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
  },
  historyTotalValue: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
});
