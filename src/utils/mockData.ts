import { Dish, Order } from '../types';

export const INITIAL_DISHES: Dish[] = [
  // Khai vị
  {
    id: 'dish_1',
    name: 'Salad cá hồi sốt mè rang',
    category: 'Khai vị',
    price: 55000,
    available: true,
  },
  {
    id: 'dish_2',
    name: 'Nem rán hải sản Hà Nội',
    category: 'Khai vị',
    price: 60000,
    available: true,
  },

  // Món chính
  {
    id: 'dish_3',
    name: 'Bò lúc lắc sốt tiêu đen',
    category: 'Món chính',
    price: 120000,
    available: true,
  },
  {
    id: 'dish_4',
    name: 'Gà hấp lá chanh truyền thống',
    category: 'Món chính',
    price: 95000,
    available: true,
  },
  {
    id: 'dish_5',
    name: 'Cơm chiên hải sản hoàng kim',
    category: 'Món chính',
    price: 75000,
    available: true,
  },

  // Tráng miệng
  {
    id: 'dish_6',
    name: 'Chè hạt sen long nhãn',
    category: 'Tráng miệng',
    price: 30000,
    available: true,
  },
  {
    id: 'dish_7',
    name: 'Panna Cotta xoài chanh leo',
    category: 'Tráng miệng',
    price: 35000,
    available: true,
  },

  // Đồ uống
  {
    id: 'dish_8',
    name: 'Trà đào cam sả trân châu',
    category: 'Đồ uống',
    price: 35000,
    available: true,
  },
  {
    id: 'dish_9',
    name: 'Nước ép dưa hấu bạc hà',
    category: 'Đồ uống',
    price: 30000,
    available: true,
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'order_table_3',
    tableNumber: 3,
    items: [
      { dishId: 'dish_2', quantity: 2 },
      { dishId: 'dish_3', quantity: 1 },
      { dishId: 'dish_8', quantity: 2 },
    ],
    status: 'Đang phục vụ',
    createdAt: '10:15 28/10/2026',
  },
];
