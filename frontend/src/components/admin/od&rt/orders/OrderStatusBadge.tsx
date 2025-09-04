// components/admin/OrderStatusBadge.tsx
import React from 'react';
import { OrderStatus } from '@/types/order';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (status: OrderStatus) => {
    const configs = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: '⏳'
      },
      confirmed: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: '✅'
      },
      shipped: {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        icon: '🚚'
      },
      delivered: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: '📦'
      },
      cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: '❌'
      },
      out_for_delivery: {
        bg: 'bg-indigo-100',
        text: 'text-indigo-800',
        icon: '🚛'
      },
      refunded: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: '💰'
      },
      failed: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: '⚠️'
      }
    };

    return configs[status] || configs.pending;
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      <span className="mr-1">{config.icon}</span>
      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
    </span>
  );
};

export default OrderStatusBadge;
