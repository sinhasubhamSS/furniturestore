"use client";

type Category = {
  _id: string;
  name: string;
  image: string;
};

type Props = {
  category: Category;
  onClick?: () => void;
  isCompact?: boolean;
};

const CategoryCard = ({ category, onClick, isCompact = false }: Props) => {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer p-4 rounded-xl shadow-md transition-all duration-300 ease-in-out transform hover:scale-[1.03] ${
        isCompact
          ? "bg-gray-800 text-white hover:bg-gray-700"
          : "bg-[var(--color-secondary)] hover:bg-[var(--color-accent-light)] text-[var(--text-light)]"
      }`}
    >
      <img
        src={category.image}
        alt={category.name}
        className="w-14 h-14 object-cover rounded-full mx-auto mb-3 border-2 border-[var(--color-accent)]"
      />
      <h3 className="text-center text-lg font-medium">{category.name}</h3>
    </div>
  );
};

export default CategoryCard;
