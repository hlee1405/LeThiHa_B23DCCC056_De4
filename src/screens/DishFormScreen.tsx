import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, DishCategory } from '../types';
import { useRestaurant } from '../context/RestaurantContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { AppInput } from '../components/AppInput';
import { AppButton } from '../components/AppButton';

type Props = NativeStackScreenProps<RootStackParamList, 'DishForm'>;

const CATEGORIES: DishCategory[] = ['Khai vị', 'Món chính', 'Tráng miệng', 'Đồ uống'];

export const DishFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const editingDish = route.params?.dish;
  const isEditing = Boolean(editingDish);

  const { dishes, addDish, updateDish } = useRestaurant();

  // Form states
  const [name, setName] = useState<string>('');
  const [priceStr, setPriceStr] = useState<string>('');
  const [category, setCategory] = useState<DishCategory>('Khai vị');
  const [available, setAvailable] = useState<boolean>(true);

  // Error states
  const [nameError, setNameError] = useState<string>('');
  const [priceError, setPriceError] = useState<string>('');
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  // Điền dữ liệu cũ khi ở chế độ sửa
  useEffect(() => {
    if (editingDish) {
      setName(editingDish.name);
      setPriceStr(editingDish.price.toString());
      setCategory(editingDish.category);
      setAvailable(editingDish.available);
      navigation.setOptions({ title: 'Sửa món ăn' });
    } else {
      navigation.setOptions({ title: 'Thêm món mới' });
    }
  }, [editingDish, navigation]);

  // Validation function
  const validateForm = React.useCallback((): boolean => {
    let isValid = true;
    const trimmedName = name.trim();

    // 1. Kiểm tra Tên món: không trống và không trùng tên món khác (không phân biệt hoa/thường)
    if (!trimmedName) {
      setNameError('Tên món ăn không được để trống.');
      isValid = false;
    } else {
      const isDuplicate = dishes.some(
        d =>
          d.id !== editingDish?.id &&
          d.name.trim().toLowerCase() === trimmedName.toLowerCase()
      );
      if (isDuplicate) {
        setNameError('Tên món ăn đã tồn tại (không phân biệt hoa/thường).');
        isValid = false;
      } else {
        setNameError('');
      }
    }

    // 2. Kiểm tra Giá món: là số > 0 và chia hết cho 1.000
    const priceNum = parseInt(priceStr, 10);
    if (!priceStr.trim() || isNaN(priceNum)) {
      setPriceError('Vui lòng nhập giá bán là số.');
      isValid = false;
    } else if (priceNum <= 0) {
      setPriceError('Giá bán phải lớn hơn 0 VNĐ.');
      isValid = false;
    } else if (priceNum % 1000 !== 0) {
      setPriceError('Giá bán phải là bội số của 1.000 VNĐ.');
      isValid = false;
    } else {
      setPriceError('');
    }

    return isValid;
  }, [name, priceStr, dishes, editingDish]);

  // Re-validate dynamically after first submit attempt
  useEffect(() => {
    if (hasSubmitted) {
      validateForm();
    }
  }, [hasSubmitted, validateForm]);

  const handleSave = async () => {
    setHasSubmitted(true);
    if (!validateForm()) {
      return;
    }

    const priceNum = parseInt(priceStr, 10);

    try {
      if (isEditing && editingDish) {
        await updateDish({
          ...editingDish,
          name: name.trim(),
          category,
          price: priceNum,
          available,
        });
        Alert.alert('Thành công', 'Cập nhật món ăn thành công!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await addDish({
          name: name.trim(),
          category,
          price: priceNum,
          available,
        });
        Alert.alert('Thành công', 'Thêm món mới thành công!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error('Lỗi khi lưu món:', error);
      Alert.alert('Lỗi', 'Không thể lưu món ăn. Vui lòng thử lại.');
    }
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
          <View style={styles.headerInfo}>
            <Text style={styles.screenTitle}>
              {isEditing ? 'Chỉnh sửa thông tin món ăn' : 'Tạo món ăn mới'}
            </Text>
            <Text style={styles.screenSubtitle}>
              Vui lòng nhập đầy đủ và chính xác thông tin thực đơn bên dưới
            </Text>
          </View>

          {/* Ô nhập Tên món (Câu 2) */}
          <AppInput
            label="Tên món ăn"
            required
            placeholder="Ví dụ: Nem rán Hà Nội"
            value={name}
            onChangeText={setName}
            errorMessage={nameError}
            autoCapitalize="sentences"
          />

          {/* Chọn Loại món bằng nút bấm (Câu 2) */}
          <View style={styles.categorySection}>
            <View style={styles.categoryLabelRow}>
              <Text style={styles.fieldLabel}>Loại món ăn</Text>
              <Text style={styles.requiredMark}> *</Text>
            </View>
            <View style={styles.categoryButtonsGrid}>
              {CATEGORIES.map(cat => {
                const isSelected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    activeOpacity={0.7}
                    onPress={() => setCategory(cat)}
                    style={[
                      styles.categoryButton,
                      isSelected && styles.categoryButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        isSelected && styles.categoryButtonTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Ô nhập Giá món (Câu 2: bàn phím numeric, > 0 và chia hết cho 1.000) */}
          <AppInput
            label="Giá bán (VNĐ)"
            required
            placeholder="Ví dụ: 45000"
            value={priceStr}
            onChangeText={setPriceStr}
            errorMessage={priceError}
            keyboardType="numeric"
            suffix="VNĐ"
          />

          {/* Công tắc trạng thái Còn phục vụ */}
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchTitle}>Trạng thái phục vụ</Text>
              <Text style={styles.switchSubtitle}>
                {available ? 'Món đang sẵn sàng phục vụ' : 'Món hiện đang hết'}
              </Text>
            </View>
            <Switch
              value={available}
              onValueChange={setAvailable}
              trackColor={{ false: colors.borderDark, true: colors.primaryLight }}
              thumbColor={available ? colors.primary : '#94A3B8'}
            />
          </View>

          {/* Nút lưu món */}
          <View style={styles.buttonContainer}>
            <AppButton
              title={isEditing ? 'Lưu thay đổi' : '+ Thêm món vào thực đơn'}
              onPress={handleSave}
              variant="primary"
            />
            <AppButton
              title="Quay lại"
              onPress={() => navigation.goBack()}
              variant="outline"
              style={styles.cancelButton}
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
    paddingBottom: 32,
  },
  headerInfo: {
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.text,
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  fieldLabel: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.text,
  },
  requiredMark: {
    color: colors.danger,
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minWidth: '47%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryButtonActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
  },
  categoryButtonTextActive: {
    color: colors.primaryDark,
    fontWeight: typography.weight.bold,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 12,
  },
  switchTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.text,
  },
  switchSubtitle: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  buttonContainer: {
    marginTop: 24,
    gap: 10,
  },
  cancelButton: {
    marginTop: 4,
  },
});
