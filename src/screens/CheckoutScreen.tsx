import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useRestaurant } from '../context/RestaurantContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { formatCurrency } from '../utils/formatters';
import { AppInput } from '../components/AppInput';
import { AppButton } from '../components/AppButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export const CheckoutScreen: React.FC<Props> = ({ navigation, route }) => {
  const { tableNumber, orderId } = route.params;
  const { orders, dishes, checkoutOrder } = useRestaurant();

  // Tìm hoá đơn tương ứng
  const currentOrder = useMemo(() => {
    if (orderId) {
      return orders.find(o => o.id === orderId);
    }
    return orders.find(
      o => o.tableNumber === tableNumber && o.status === 'Đang phục vụ'
    );
  }, [orders, orderId, tableNumber]);

  // Danh sách chi tiết các món trong hoá đơn
  const billItems = useMemo(() => {
    if (!currentOrder || !currentOrder.items) return [];

    return currentOrder.items.map(item => {
      const dish = dishes.find(d => d.id === item.dishId);
      const dishName = dish ? dish.name : 'Món không xác định';
      const unitPrice = dish ? dish.price : 0;
      const itemTotal = unitPrice * item.quantity;

      return {
        dishId: item.dishId,
        name: dishName,
        quantity: item.quantity,
        unitPrice,
        itemTotal,
      };
    });
  }, [currentOrder, dishes]);

  // Tính Tạm tính, VAT 8%, Tổng cộng (Câu 5)
  const subtotal = useMemo(() => {
    return billItems.reduce((acc, item) => acc + item.itemTotal, 0);
  }, [billItems]);

  const vatAmount = useMemo(() => {
    // VAT 8% theo đề bài
    return Math.round(subtotal * 0.08);
  }, [subtotal]);

  const totalAmount = useMemo(() => {
    return subtotal + vatAmount;
  }, [subtotal, vatAmount]);

  // State tiền khách đưa
  const [customerMoneyStr, setCustomerMoneyStr] = useState<string>('');

  const customerMoney = useMemo(() => {
    const parsed = parseInt(customerMoneyStr.replace(/\D/g, ''), 10);
    return isNaN(parsed) ? 0 : parsed;
  }, [customerMoneyStr]);

  // Hiển thị tiền thừa ngay khi nhập (Câu 5)
  const changeAmount = customerMoney - totalAmount;
  const isEnoughMoney = customerMoney >= totalAmount && totalAmount > 0;
  const hasItems = billItems.length > 0;

  // Xử lý xác nhận thanh toán
  const handleConfirmCheckout = () => {
    if (!currentOrder) {
      Alert.alert('Lỗi', 'Không tìm thấy hoá đơn để thanh toán.');
      return;
    }

    if (!hasItems) {
      Alert.alert('Không thể thanh toán', 'Hoá đơn không có món nào để thanh toán.');
      return;
    }

    if (!isEnoughMoney) {
      Alert.alert(
        'Số tiền không đủ',
        `Khách đưa ${formatCurrency(customerMoney)}, còn thiếu ${formatCurrency(
          Math.abs(changeAmount)
        )}. Vui lòng thu đủ tiền trước khi thanh toán.`
      );
      return;
    }

    Alert.alert(
      'Xác nhận thanh toán',
      `Thanh toán Bàn ${tableNumber}\nTổng hoá đơn: ${formatCurrency(
        totalAmount
      )}\nTiền khách đưa: ${formatCurrency(customerMoney)}\nTiền thừa trả khách: ${formatCurrency(
        changeAmount
      )}`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Thanh toán ngay',
          onPress: async () => {
            const success = await checkoutOrder(currentOrder.id);
            if (success) {
              Alert.alert(
                'Thanh toán thành công',
                `Đã thanh toán xong Bàn ${tableNumber}. Bàn đã chuyển về trạng thái trống.`,
                [
                  {
                    text: 'Về Sơ đồ bàn',
                    onPress: () => navigation.navigate('Main'),
                  },
                ]
              );
            }
          },
        },
      ]
    );
  };

  // Nhanh chóng gợi ý số tiền tròn
  const handleQuickMoney = (amount: number) => {
    setCustomerMoneyStr(amount.toString());
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header hoá đơn */}
          <View style={styles.receiptHeader}>
            <Text style={styles.receiptTitle}>HOÁ ĐƠN THANH TOÁN</Text>
            <View style={styles.receiptMetaRow}>
              <Text style={styles.receiptMetaText}>Bàn: {tableNumber}</Text>
              <Text style={styles.receiptMetaText}>
                {currentOrder?.createdAt || 'Hôm nay'}
              </Text>
            </View>
            <View style={styles.dividerDashed} />
          </View>

          {/* Chi tiết từng món trong hoá đơn (Câu 5) */}
          <View style={styles.cardSection}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.columnHeader, styles.colName]}>Tên món</Text>
              <Text style={[styles.columnHeader, styles.colQty]}>SL</Text>
              <Text style={[styles.columnHeader, styles.colPrice]}>Đơn giá</Text>
              <Text style={[styles.columnHeader, styles.colTotal]}>T.Tiền</Text>
            </View>

            {billItems.length === 0 ? (
              <Text style={styles.emptyText}>Hoá đơn hiện chưa có món nào</Text>
            ) : (
              billItems.map((item, index) => (
                <View key={`${item.dishId}_${index}`} style={styles.billItemRow}>
                  <Text style={[styles.cellText, styles.colName]} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={[styles.cellText, styles.colQty]}>
                    x{item.quantity}
                  </Text>
                  <Text style={[styles.cellText, styles.colPrice]}>
                    {formatCurrency(item.unitPrice)}
                  </Text>
                  <Text style={[styles.cellTotalText, styles.colTotal]}>
                    {formatCurrency(item.itemTotal)}
                  </Text>
                </View>
              ))
            )}
          </View>

          {/* Tổng kết tiền: Tạm tính, VAT 8%, Tổng cộng (Câu 5) */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Thuế VAT (8%):</Text>
              <Text style={styles.summaryValue}>{formatCurrency(vatAmount)}</Text>
            </View>

            <View style={styles.dividerSolid} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>TỔNG CỘNG:</Text>
              <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
            </View>
          </View>

          {/* Phần Nhập tiền khách đưa & Hiển thị tiền thừa ngay (Câu 5) */}
          <View style={styles.paymentCard}>
            <Text style={styles.paymentSectionTitle}>Tiền thanh toán</Text>

            <AppInput
              label="Số tiền khách đưa (VNĐ)"
              required
              placeholder="Nhập số tiền khách đưa..."
              value={customerMoneyStr}
              onChangeText={setCustomerMoneyStr}
              keyboardType="numeric"
              suffix="VNĐ"
            />

            {/* Gợi ý tiền nhanh */}
            <View style={styles.quickMoneyContainer}>
              <Text style={styles.quickLabel}>Gợi ý nhanh:</Text>
              <View style={styles.quickButtonsRow}>
                <AppButton
                  title="Vừa đủ"
                  onPress={() => handleQuickMoney(totalAmount)}
                  variant="outline"
                  style={styles.quickBtn}
                  textStyle={styles.quickBtnText}
                />
                {totalAmount > 0 ? (
                  <>
                    <AppButton
                      title={formatCurrency(Math.ceil(totalAmount / 50000) * 50000)}
                      onPress={() =>
                        handleQuickMoney(Math.ceil(totalAmount / 50000) * 50000)
                      }
                      variant="outline"
                      style={styles.quickBtn}
                      textStyle={styles.quickBtnText}
                    />
                    <AppButton
                      title={formatCurrency(Math.ceil(totalAmount / 100000) * 100000)}
                      onPress={() =>
                        handleQuickMoney(Math.ceil(totalAmount / 100000) * 100000)
                      }
                      variant="outline"
                      style={styles.quickBtn}
                      textStyle={styles.quickBtnText}
                    />
                  </>
                ) : null}
              </View>
            </View>

            {/* Hiển thị tiền thừa / còn thiếu ngay khi nhập (Câu 5) */}
            <View
              style={[
                styles.changeCard,
                isEnoughMoney ? styles.changeCardSuccess : styles.changeCardWarning,
              ]}
            >
              <Text style={styles.changeLabel}>
                {customerMoney === 0
                  ? 'Vui lòng nhập tiền khách đưa'
                  : isEnoughMoney
                  ? 'Tiền thừa trả lại khách:'
                  : 'Còn thiếu:'}
              </Text>
              <Text
                style={[
                  styles.changeValue,
                  isEnoughMoney ? styles.changeSuccessText : styles.changeWarningText,
                ]}
              >
                {customerMoney === 0
                  ? '0 đ'
                  : isEnoughMoney
                  ? formatCurrency(changeAmount)
                  : formatCurrency(Math.abs(changeAmount))}
              </Text>
            </View>
          </View>

          {/* Nút hành động */}
          <View style={styles.actionContainer}>
            {/* Không cho xác nhận thanh toán nếu tiền khách đưa nhỏ hơn tổng cộng hoặc hoá đơn không có món nào (Câu 5) */}
            <AppButton
              title="Xác nhận thanh toán"
              onPress={handleConfirmCheckout}
              variant="success"
              disabled={!isEnoughMoney || !hasItems}
            />

            <AppButton
              title="Quay lại gọi món"
              onPress={() => navigation.goBack()}
              variant="outline"
              style={styles.backButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  receiptTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.text,
    letterSpacing: 1,
    marginBottom: 4,
  },
  receiptMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    marginVertical: 4,
  },
  receiptMetaText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
  },
  dividerDashed: {
    width: '100%',
    height: 1,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  cardSection: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
    marginBottom: 8,
  },
  columnHeader: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  billItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
  },
  colName: {
    flex: 4,
  },
  colQty: {
    flex: 1.2,
    textAlign: 'center',
  },
  colPrice: {
    flex: 2.4,
    textAlign: 'right',
  },
  colTotal: {
    flex: 2.8,
    textAlign: 'right',
  },
  cellText: {
    fontSize: typography.size.sm,
    color: colors.text,
  },
  cellTotalText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.text,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    paddingVertical: 16,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  summaryLabel: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    color: colors.text,
  },
  dividerSolid: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text,
  },
  totalValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  paymentCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paymentSectionTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.text,
    marginBottom: 12,
  },
  quickMoneyContainer: {
    marginBottom: 12,
  },
  quickLabel: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: typography.weight.medium,
  },
  quickButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickBtn: {
    minHeight: 34,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  quickBtnText: {
    fontSize: typography.size.xs,
  },
  changeCard: {
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  changeCardSuccess: {
    backgroundColor: colors.successLight,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  changeCardWarning: {
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  changeLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.text,
  },
  changeValue: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
  },
  changeSuccessText: {
    color: colors.success,
  },
  changeWarningText: {
    color: colors.danger,
  },
  actionContainer: {
    gap: 10,
  },
  backButton: {
    marginTop: 4,
  },
});
