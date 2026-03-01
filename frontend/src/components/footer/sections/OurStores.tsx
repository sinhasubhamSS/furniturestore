import Link from "next/link";

const stores = [
  { name: "Gumla", slug: "gumla" },
  { name: "Ranchi", slug: "ranchi" },
];

const OurStores = () => {
  return (
    <div className="space-y-5">
      <h4 className="text-lg font-semibold text-[--color-accent]">
        Our Stores
      </h4>

      <ul className="space-y-2 text-sm">
        {stores.map((store) => (
          <li key={store.slug}>
            <Link
              href={`/stores/${store.slug}`}
              className="hover:text-[var(--color-accent)] transition"
            >
              {store.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OurStores;
