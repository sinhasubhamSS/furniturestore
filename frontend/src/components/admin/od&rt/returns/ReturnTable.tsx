// components/admin/returns/ReturnTable.tsx
import React from 'react';
import { ReturnStatus } from '@/types/return';
import { AdminReturn } from '@/redux/services/admin/adminReturnapi';
import StatusBadge from '@/components/admin/od&rt/common/StatusBadge';

interface ReturnTableProps {
  returns: AdminReturn[];
  onStatusUpdate: (returnId: string, status: ReturnStatus) => void;
  isUpdating: boolean;
}

const ReturnTable: React.FC<ReturnTableProps> = ({ 
  returns, 
  onStatusUpdate, 
  isUpdating 
}) => {
  const statusOptions: ReturnStatus[] = [
    ReturnStatus.Requested,
    ReturnStatus.Approved,
    ReturnStatus.Rejected,
    ReturnStatus.PickedUp,
    ReturnStatus.Received,
    ReturnStatus.Processed,
  ];

  const handleStatusChange = (returnId: string, newStatus: string) => {
    if (window.confirm(`Update return status to ${newStatus}?`)) {
      onStatusUpdate(returnId, newStatus as ReturnStatus);
    }
  };

  if (returns.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="text-gray-400 text-xl mb-2">🔄</div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No returns found</h3>
        <p className="text-gray-500">No returns match your current filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Return Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Refund Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {returns.map((returnItem) => (
            <tr key={returnItem._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {returnItem.returnId}
                  </div>
                  <div className="text-xs text-gray-500">
                    {returnItem.returnItems.length} item(s)
                  </div>
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {returnItem.user?.name || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {returnItem.user?.email}
                  </div>
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {returnItem.orderId}
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  ₹{returnItem.refundAmount?.toLocaleString('en-IN')}
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={returnItem.status} type="return" />
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(returnItem.requestedAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <select
                  value={returnItem.status}
                  onChange={(e) => handleStatusChange(returnItem.returnId, e.target.value)}
                  disabled={isUpdating}
                  className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReturnTable;
