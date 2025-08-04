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
      className={`cursor-pointer rounded-2xl bg-[var(--color-primary)] shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center select-none
        ${isCompact ? "p-2" : "p-6"}`}
      title={category.name}
    >
      <div
        className={`rounded-full border-4 border-[var(--color-accent)] overflow-hidden mb-2 ${
          isCompact ? "w-14 h-14" : "w-24 h-24 mb-5"
        }`}
      >
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "/images/placeholder.jpg";
          }}
        />
      </div>
      <h3
        className={`text-center font-semibold text-[var(--color-foreground)] truncate w-full ${
          isCompact ? "text-sm" : "text-xl"
        }`}
      >
        {category.name}
      </h3>
    </div>
  );
};

export default CategoryCard;
