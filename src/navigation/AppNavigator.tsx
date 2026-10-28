import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { MainTabsScreen } from '../screens/MainTabsScreen';
import { DishFormScreen } from '../screens/DishFormScreen';
import { OrderScreen } from '../screens/OrderScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontWeight: typography.weight.bold,
            fontSize: typography.size.lg,
            color: colors.text,
          },
          headerShadowVisible: true,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="Main"
          component={MainTabsScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="DishForm"
          component={DishFormScreen}
          options={({ route }) => ({
            title: route.params?.dish ? 'Sửa món ăn' : 'Thêm món mới',
            headerBackTitle: 'Trở lại',
          })}
        />

        <Stack.Screen
          name="Order"
          component={OrderScreen}
          options={({ route }) => ({
            title: `Gọi món - Bàn ${route.params.tableNumber}`,
            headerBackTitle: 'Sơ đồ',
          })}
        />

        <Stack.Screen
          name="Checkout"
          component={CheckoutScreen}
          options={({ route }) => ({
            title: `Thanh toán - Bàn ${route.params.tableNumber}`,
            headerBackTitle: 'Gọi món',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
