import { apiRequest } from '@/services/http';
import type { Order, OrderLine, OrderStatus } from '@/types/marketplace';

const MINOR_UNITS = 100;

const STATUSES: readonly OrderStatus[] = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export const COD_PAYMENT_LABEL = 'Оплата при получении';

interface OrderLinePayload {
  id: number;
  product_id: number | null;
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface OrderPayload {
  id: number;
  reference: string;
  status: string;
  payment: string;
  phone: string | null;
  address: string | null;
  total: number;
  lines: OrderLinePayload[];
}

interface OrderResponse {
  status_code: number;
  data: OrderPayload;
}

interface OrderListResponse {
  status_code: number;
  data: OrderPayload[];
}

function rubles(minor: number): number {
  return minor / MINOR_UNITS;
}

function mapStatus(value: string): OrderStatus {
  return STATUSES.find((status) => status === value) ?? 'new';
}

function mapLine(line: OrderLinePayload): OrderLine {
  return {
    id: line.id,
    productId: line.product_id === null ? null : String(line.product_id),
    name: line.name,
    quantity: line.quantity,
    unitPrice: rubles(line.unit_price),
    total: rubles(line.total),
  };
}

function mapOrder(payload: OrderPayload): Order {
  return {
    id: payload.id,
    reference: payload.reference,
    status: mapStatus(payload.status),
    payment: payload.payment,
    phone: payload.phone,
    address: payload.address,
    total: rubles(payload.total),
    lines: payload.lines.map(mapLine),
  };
}

export function orderStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    new: 'Новый',
    confirmed: 'Подтверждён',
    shipped: 'В пути',
    delivered: 'Доставлен',
    cancelled: 'Отменён',
  };

  return labels[status];
}

export function orderStatusColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    new: 'info',
    confirmed: 'primary',
    shipped: 'primary',
    delivered: 'positive',
    cancelled: 'grey',
  };

  return colors[status];
}

export async function placeOrder(token: string): Promise<Order> {
  const response = await apiRequest<OrderResponse>('/v1/orders', {
    method: 'POST',
    token,
  });

  return mapOrder(response.data);
}

export async function fetchOrders(token: string): Promise<Order[]> {
  const response = await apiRequest<OrderListResponse>('/v1/orders', { token });

  return response.data.map(mapOrder);
}

export async function fetchOrder(token: string, id: number): Promise<Order> {
  const response = await apiRequest<OrderResponse>(`/v1/orders/${id}`, { token });

  return mapOrder(response.data);
}
