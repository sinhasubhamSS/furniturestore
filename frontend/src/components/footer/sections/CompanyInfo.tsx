import React from "react";

interface CompanyStats {
  rating: number;
  reviews: number;
  customers: string;
}

const CompanyInfo: React.FC = () => {
  const stats: CompanyStats = {
    rating: 4.8,
    reviews: 2547,
    customers: "10,000+",
  };

  const renderStars = (rating: number): React.ReactElement[] => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`${
          index < Math.floor(rating) ? "text-[--color-accent]" : "text-gray-400"
        }`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="space-y-4">
      {/* Logo & Brand */}
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-[--color-accent] rounded-lg flex items-center justify-center">
          <span className="text-[--text-light] font-bold text-xl">SF</span>
        </div>
        <h3 className="text-2xl font-bold text-[--color-accent]">
          Suvidhawood <span className="text-sm">(by Suvidha Furniture)</span>
        </h3>
      </div>

      {/* Description */}
      <p className="text-[--text-accent] leading-relaxed">
        Premium quality products delivered to your doorstep. Your trusted
        e-commerce partner since 1995 with over {stats.customers} satisfied
        customers.
      </p>

      {/* Trust Badges */}
      <div className="flex items-center space-x-4 pt-4">
        <div className="bg-[--color-secondary] px-3 py-2 rounded-lg border border-[--color-border-custom]">
          <span className="text-xs font-medium text-[--text-accent]">
            🔒 SSL Secured
          </span>
        </div>
        <div className="bg-[--color-secondary] px-3 py-2 rounded-lg border border-[--color-border-custom]">
          <span className="text-xs font-medium text-[--text-accent]">
            💳 Secure Payments
          </span>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center space-x-2 pt-2">
        <div className="flex space-x-1">{renderStars(stats.rating)}</div>
        <span className="text-sm text-[--text-accent]">
          {stats.rating}/5 ({stats.reviews.toLocaleString()} reviews)
        </span>
      </div>
    </div>
  );
};

export default CompanyInfo;
