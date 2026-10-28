import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  leftIcon,
}) => {
  const getButtonStyles = (): ViewStyle[] => {
    const list: ViewStyle[] = [styles.baseButton];

    switch (variant) {
      case 'secondary':
        list.push(styles.secondaryButton);
        break;
      case 'outline':
        list.push(styles.outlineButton);
        break;
      case 'danger':
        list.push(styles.dangerButton);
        break;
      case 'success':
        list.push(styles.successButton);
        break;
      case 'primary':
      default:
        list.push(styles.primaryButton);
        break;
    }

    if (disabled || loading) {
      list.push(styles.disabledButton);
    }

    return list;
  };

  const getTextStyle = (): TextStyle[] => {
    const list: TextStyle[] = [styles.baseText];

    switch (variant) {
      case 'outline':
        list.push(styles.outlineText);
        break;
      case 'primary':
      case 'secondary':
      case 'danger':
      case 'success':
      default:
        list.push(styles.solidText);
        break;
    }

    if (disabled) {
      list.push(styles.disabledText);
    }

    return list;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled || loading}
      style={[getButtonStyles(), style]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? colors.primary : colors.textWhite}
        />
      ) : (
        <>
          {leftIcon}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  dangerButton: {
    backgroundColor: colors.danger,
  },
  successButton: {
    backgroundColor: colors.success,
  },
  disabledButton: {
    opacity: 0.45,
    backgroundColor: colors.borderDark,
    borderColor: colors.borderDark,
    elevation: 0,
    shadowOpacity: 0,
  },
  baseText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semiBold,
    textAlign: 'center',
  },
  solidText: {
    color: colors.textWhite,
  },
  outlineText: {
    color: colors.primary,
  },
  disabledText: {
    color: colors.textMuted,
  },
});
