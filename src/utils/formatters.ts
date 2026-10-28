/**
 * Format số tiền sang định dạng tiền tệ VNĐ theo yêu cầu đề bài: ví dụ 45.000 đ
 */
export const formatCurrency = (amount: number): string => {
  if (isNaN(amount) || amount == null) {
    return '0 đ';
  }
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted} đ`;
};

/**
 * Format thời gian theo yêu cầu đề bài: hh:mm dd/mm/yyyy
 */
export const formatDate = (dateInput?: Date | string | number): string => {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) {
    return '00:00 01/01/2026';
  }
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${hours}:${minutes} ${day}/${month}/${year}`;
};

/**
 * Tạo id ngẫu nhiên duy nhất
 */
export const generateId = (prefix: string = 'item'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
};
