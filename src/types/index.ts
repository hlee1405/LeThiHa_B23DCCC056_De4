export type DishCategory = 'Khai vị' | 'Món chính' | 'Tráng miệng' | 'Đồ uống';

export interface Dish {
  id: string;
  name: string;
  category: DishCategory;
  price: number;
  available: boolean;
}

export interface OrderItem {
  dishId: string;
  quantity: number;
}

export type OrderStatus = 'Đang phục vụ' | 'Đã thanh toán';

export interface Order {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string; // Định dạng: hh:mm dd/mm/yyyy
}

export type RootStackParamList = {
  Main: undefined;
  DishForm: { dish?: Dish } | undefined;
  Order: { tableNumber: number };
  Checkout: { tableNumber: number; orderId?: string };
};
