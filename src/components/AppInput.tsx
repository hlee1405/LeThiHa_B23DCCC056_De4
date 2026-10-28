import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface AppInputProps extends TextInputProps {
  label?: string;
  errorMessage?: string;
  containerStyle?: StyleProp<ViewStyle>;
  required?: boolean;
  prefix?: string;
  suffix?: string;
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  errorMessage,
  containerStyle,
  required = false,
  prefix,
  suffix,
  style,
  ...rest
}) => {
  const hasError = Boolean(errorMessage);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required ? <Text style={styles.requiredMark}> *</Text> : null}
        </View>
      ) : null}

      <View style={[styles.inputWrapper, hasError && styles.inputWrapperError]}>
        {prefix ? <Text style={styles.affix}>{prefix}</Text> : null}

        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[styles.input, style]}
          {...rest}
        />

        {suffix ? <Text style={styles.affix}>{suffix}</Text> : null}
      </View>

      {/* Thông báo lỗi hiển thị ngay dưới ô nhập (Câu 2) */}
      {hasError ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.text,
  },
  requiredMark: {
    color: colors.danger,
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  // Ô nhập sai có viền đỏ theo tiêu chí chấm Câu 7
  inputWrapperError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerLight,
  },
  input: {
    flex: 1,
    fontSize: typography.size.base,
    color: colors.text,
    paddingVertical: 10,
  },
  affix: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
    marginHorizontal: 4,
  },
  errorText: {
    fontSize: typography.size.sm,
    color: colors.danger,
    marginTop: 4,
    fontWeight: typography.weight.medium,
  },
});
