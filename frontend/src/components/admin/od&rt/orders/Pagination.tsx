// components/admin/Pagination.tsx
import React from 'react';

interface PaginationProps {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => {
  const { page, total, pages, hasNext, hasPrev } = pagination;
  
  const startItem = (page - 1) * pagination.limit + 1;
  const endItem = Math.min(page * pagination.limit, total);

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-700">
        Showing <span className="font-medium">{startItem}</span> to{' '}
        <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{total}</span> orders
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <span className="px-3 py-2 text-sm text-gray-700">
          Page {page} of {pages}
        </span>
        
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
