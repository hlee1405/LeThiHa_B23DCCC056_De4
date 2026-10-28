import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dish, Order, OrderItem } from '../types';
import { INITIAL_DISHES, INITIAL_ORDERS } from '../utils/mockData';
import { formatDate, generateId } from '../utils/formatters';

const STORAGE_KEY_DISHES = '@restaurant_app_dishes_v1';
const STORAGE_KEY_ORDERS = '@restaurant_app_orders_v1';

interface RestaurantContextType {
  dishes: Dish[];
  orders: Order[];
  isLoading: boolean;
  totalDishesCount: number;
  occupiedTablesCount: number;
  addDish: (dish: Omit<Dish, 'id'>) => Promise<boolean>;
  updateDish: (dish: Dish) => Promise<boolean>;
  deleteDish: (dishId: string) => Promise<boolean>;
  toggleDishAvailability: (dishId: string) => Promise<void>;
  getActiveOrderForTable: (tableNumber: number) => Order | undefined;
  saveTableOrder: (tableNumber: number, items: OrderItem[]) => Promise<Order | null>;
  checkoutOrder: (orderId: string) => Promise<boolean>;
  resetToDefaultData: () => Promise<void>;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load data from AsyncStorage or initialize default data on first run
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const storedDishes = await AsyncStorage.getItem(STORAGE_KEY_DISHES);
      const storedOrders = await AsyncStorage.getItem(STORAGE_KEY_ORDERS);

      if (storedDishes) {
        setDishes(JSON.parse(storedDishes));
      } else {
        // Lần đầu tiên chạy: khởi tạo sẵn ít nhất 8 món (đủ 4 loại)
        setDishes(INITIAL_DISHES);
        await AsyncStorage.setItem(STORAGE_KEY_DISHES, JSON.stringify(INITIAL_DISHES));
      }

      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      } else {
        // Lần đầu tiên chạy: khởi tạo sẵn 1 hoá đơn đang phục vụ
        setOrders(INITIAL_ORDERS);
        await AsyncStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(INITIAL_ORDERS));
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu từ AsyncStorage:', error);
      Alert.alert('Lỗi', 'Không thể đọc dữ liệu từ bộ nhớ thiết bị.');
    } finally {
      setIsLoading(false);
    }
  };

  // Lưu danh sách món vào AsyncStorage
  const persistDishes = async (newDishes: Dish[]) => {
    setDishes(newDishes);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_DISHES, JSON.stringify(newDishes));
    } catch (error) {
      console.error('Lỗi lưu món ăn:', error);
      Alert.alert('Lỗi', 'Không thể lưu danh sách món ăn vào bộ nhớ.');
    }
  };

  // Lưu danh sách hoá đơn vào AsyncStorage
  const persistOrders = async (newOrders: Order[]) => {
    setOrders(newOrders);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(newOrders));
    } catch (error) {
      console.error('Lỗi lưu hoá đơn:', error);
      Alert.alert('Lỗi', 'Không thể lưu danh sách hoá đơn vào bộ nhớ.');
    }
  };

  // Thêm món mới
  const addDish = async (dishData: Omit<Dish, 'id'>): Promise<boolean> => {
    const newDish: Dish = {
      ...dishData,
      id: generateId('dish'),
    };
    const updated = [newDish, ...dishes];
    await persistDishes(updated);
    return true;
  };

  // Cập nhật món
  const updateDish = async (dishToUpdate: Dish): Promise<boolean> => {
    const updated = dishes.map(d => (d.id === dishToUpdate.id ? dishToUpdate : d));
    await persistDishes(updated);
    return true;
  };

  // Xoá món ăn (Câu 3)
  const deleteDish = async (dishId: string): Promise<boolean> => {
    // Kiểm tra món có trong hoá đơn "Đang phục vụ" hay không
    const activeOrderWithDish = orders.find(
      order =>
        order.status === 'Đang phục vụ' &&
        order.items.some(item => item.dishId === dishId && item.quantity > 0)
    );

    if (activeOrderWithDish) {
      Alert.alert(
        'Không thể xoá món',
        `Món này đang có trong hoá đơn Bàn ${activeOrderWithDish.tableNumber} ("Đang phục vụ"). Không thể xoá!`
      );
      return false;
    }

    const updated = dishes.filter(d => d.id !== dishId);
    await persistDishes(updated);
    return true;
  };

  // Bật/tắt trạng thái còn món (Câu 1)
  const toggleDishAvailability = async (dishId: string): Promise<void> => {
    const updated = dishes.map(d =>
      d.id === dishId ? { ...d, available: !d.available } : d
    );
    await persistDishes(updated);
  };

  // Lấy hoá đơn đang phục vụ của 1 bàn
  const getActiveOrderForTable = (tableNumber: number): Order | undefined => {
    return orders.find(
      o => o.tableNumber === tableNumber && o.status === 'Đang phục vụ'
    );
  };

  // Lưu hoá đơn gọi món cho bàn (Câu 4)
  const saveTableOrder = async (
    tableNumber: number,
    items: OrderItem[]
  ): Promise<Order | null> => {
    const validItems = items.filter(item => item.quantity > 0);
    const existingOrderIndex = orders.findIndex(
      o => o.tableNumber === tableNumber && o.status === 'Đang phục vụ'
    );

    let updatedOrders = [...orders];
    let resultOrder: Order | null = null;

    if (validItems.length === 0) {
      // Nếu không còn món nào trong đơn, bàn trở về trống
      if (existingOrderIndex >= 0) {
        updatedOrders.splice(existingOrderIndex, 1);
        await persistOrders(updatedOrders);
      }
      return null;
    }

    if (existingOrderIndex >= 0) {
      // Đã có hoá đơn đang phục vụ -> cập nhật thêm/bớt món
      const current = updatedOrders[existingOrderIndex];
      const updatedOrder: Order = {
        ...current,
        items: validItems,
      };
      updatedOrders[existingOrderIndex] = updatedOrder;
      resultOrder = updatedOrder;
    } else {
      // Bàn mới -> tạo hoá đơn mới
      const newOrder: Order = {
        id: generateId('order'),
        tableNumber,
        items: validItems,
        status: 'Đang phục vụ',
        createdAt: formatDate(),
      };
      updatedOrders.unshift(newOrder);
      resultOrder = newOrder;
    }

    await persistOrders(updatedOrders);
    return resultOrder;
  };

  // Thanh toán hoá đơn (Câu 5)
  const checkoutOrder = async (orderId: string): Promise<boolean> => {
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      Alert.alert('Lỗi', 'Không tìm thấy hoá đơn để thanh toán.');
      return false;
    }

    const updatedOrders = [...orders];
    updatedOrders[orderIndex] = {
      ...updatedOrders[orderIndex],
      status: 'Đã thanh toán',
    };

    await persistOrders(updatedOrders);
    return true;
  };

  // Khôi phục dữ liệu ban đầu nếu cần
  const resetToDefaultData = async () => {
    await persistDishes(INITIAL_DISHES);
    await persistOrders(INITIAL_ORDERS);
  };

  // Tính toán số lượng cho HeaderSummary (Câu 1)
  const totalDishesCount = dishes.length;
  const occupiedTables = new Set(
    orders
      .filter(o => o.status === 'Đang phục vụ' && o.items.length > 0)
      .map(o => o.tableNumber)
  );
  const occupiedTablesCount = occupiedTables.size;

  return (
    <RestaurantContext.Provider
      value={{
        dishes,
        orders,
        isLoading,
        totalDishesCount,
        occupiedTablesCount,
        addDish,
        updateDish,
        deleteDish,
        toggleDishAvailability,
        getActiveOrderForTable,
        saveTableOrder,
        checkoutOrder,
        resetToDefaultData,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = (): RestaurantContextType => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant phải được sử dụng bên trong RestaurantProvider');
  }
  return context;
};
