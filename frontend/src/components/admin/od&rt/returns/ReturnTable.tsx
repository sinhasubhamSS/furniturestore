import React from "react";
import { ReturnStatus } from "@/types/return";
import { AdminReturn } from "@/redux/services/admin/adminReturnapi";
import StatusBadge from "@/components/admin/od&rt/common/StatusBadge";

interface Props {
  returns: AdminReturn[];
  onStatusUpdate: (returnId: string, status: ReturnStatus) => void;
  isUpdating: boolean;
}

const ReturnTable: React.FC<Props> = ({
  returns,
  onStatusUpdate,
  isUpdating,
}) => {
  const statusOptions: ReturnStatus[] = [
    ReturnStatus.Requested,
    ReturnStatus.Approved,
    ReturnStatus.Rejected,
    ReturnStatus.PickedUp,
    ReturnStatus.Received,
    ReturnStatus.Processed,
  ];

  const handleChange = (id: string, status: string) => {
    if (confirm(`Update return status to ${status}?`)) {
      onStatusUpdate(id, status as ReturnStatus);
    }
  };

  /* ================= MOBILE VIEW ================= */
  return (
    <>
      <div className="block md:hidden space-y-4 p-4">
        {returns.map((ret) => (
          <div
            key={ret._id}
            className="border rounded-xl p-4 shadow-sm bg-white space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold text-sm">#{ret.returnId}</span>
              <StatusBadge status={ret.status} type="return" />
            </div>

            <div className="text-sm">
              <p className="font-medium">{ret.user?.name || "N/A"}</p>
              <p className="text-xs text-gray-500">{ret.user?.email}</p>
            </div>

            <div className="flex justify-between text-sm">
              <span className="font-semibold">
                ₹{ret.refundAmount?.toLocaleString("en-IN")}
              </span>
              <span className="text-gray-500">
                {new Date(ret.requestedAt).toLocaleDateString()}
              </span>
            </div>

            <select
              value={ret.status}
              disabled={isUpdating}
              onChange={(e) => handleChange(ret.returnId, e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm cursor-pointer"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ").toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Return",
                "Customer",
                "Order ID",
                "Refund",
                "Status",
                "Date",
                "Action",
              ].map((h) => (
                <th
                  key={h}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y">
            {returns.map((ret) => (
              <tr key={ret._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{ret.returnId}</td>

                <td className="px-6 py-4">
                  <div className="text-sm font-medium">
                    {ret.user?.name || "N/A"}
                  </div>
                  <div className="text-xs text-gray-500">{ret.user?.email}</div>
                </td>

                <td className="px-6 py-4">{ret.orderId}</td>

                <td className="px-6 py-4 font-medium">
                  ₹{ret.refundAmount?.toLocaleString("en-IN")}
                </td>

                <td className="px-6 py-4">
                  <StatusBadge status={ret.status} type="return" />
                </td>

                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(ret.requestedAt).toLocaleDateString()}
                </td>

                <td className="px-6 py-4">
                  <select
                    value={ret.status}
                    disabled={isUpdating}
                    onChange={(e) => handleChange(ret.returnId, e.target.value)}
                    className="text-xs border rounded px-2 py-1 cursor-pointer"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, " ").toUpperCase()}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ReturnTable;
