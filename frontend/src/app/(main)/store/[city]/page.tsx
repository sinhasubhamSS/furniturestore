// import { notFound } from "next/navigation";
// import { Metadata } from "next";

// type Props = {
//   params: { city: string };
// };

// const storesData: Record<string, any> = {
//   gumla: {
//     name: "Gumla",
//     address: "Main Road, Gumla, Jharkhand – 835207",
//     phone: "+91 9876543210",
//     lat: 23.1334,
//     lng: 84.5336,
//   },
//   ranchi: {
//     name: "Ranchi",
//     address: "101 Main Road, Ranchi, Jharkhand – 834001",
//     phone: "+91 9876543211",
//     lat: 23.3441,
//     lng: 85.3096,
//   },
// };

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const city = params.city.toLowerCase();
//   const store = storesData[city];

//   if (!store) return {};

//   return {
//     title: `Furniture Store in ${store.name}, Jharkhand | Suvidhawood`,
//     description: `Visit Suvidhawood furniture store in ${store.name}, Jharkhand. Buy premium wooden beds, sofas, wardrobes and custom furniture with factory pricing.`,
//     alternates: {
//       canonical: `https://suvidhawood.com/stores/${city}`,
//     },
//   };
// }

// export default function StorePage({ params }: Props) {
//   const city = params.city.toLowerCase();
//   const store = storesData[city];

//   if (!store) return notFound();

//   return (
//     <div className="min-h-screen bg-[var(--color-primary)] py-16 px-6">
//       <div className="max-w-[1000px] mx-auto space-y-12">

//         {/* Heading */}
//         <div className="space-y-4">
//           <h1 className="text-4xl font-semibold text-[var(--color-accent)]">
//             Suvidhawood Furniture Store in {store.name}
//           </h1>
//           <p className="text-sm opacity-80">
//             Visit our physical furniture store in {store.name}, Jharkhand.
//             Explore premium wooden beds, sofas, wardrobes and custom-made
//             furniture at factory-direct pricing.
//           </p>
//         </div>

//         {/* Store Details */}
//         <div className="bg-[var(--color-card)] p-8 rounded-2xl shadow-sm space-y-4">
//           <h2 className="text-2xl font-semibold">
//             Store Details
//           </h2>

//           <p>📍 {store.address}</p>
//           <p>📞 {store.phone}</p>
//         </div>

//         {/* Google Map */}
//         <div className="rounded-2xl overflow-hidden shadow-sm">
//           <iframe
//             src={`https://www.google.com/maps?q=${store.lat},${store.lng}&z=15&output=embed`}
//             width="100%"
//             height="400"
//             loading="lazy"
//           />
//         </div>

//         {/* Internal Links */}
//         <div className="space-y-3">
//           <h2 className="text-xl font-semibold">
//             Popular Categories in {store.name}
//           </h2>

//           <div className="flex gap-6 text-sm">
//             <a href={`/category/bed`} className="hover:text-[var(--color-accent)]">
//               Beds
//             </a>
//             <a href={`/category/sofa`} className="hover:text-[var(--color-accent)]">
//               Sofas
//             </a>
//             <a href={`/category/wardrobe`} className="hover:text-[var(--color-accent)]">
//               Wardrobes
//             </a>
//           </div>
//         </div>

//       </div>

//       {/* Local Business Schema */}
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{
//           __html: JSON.stringify({
//             "@context": "https://schema.org",
//             "@type": "FurnitureStore",
//             name: `Suvidhawood - ${store.name}`,
//             address: {
//               "@type": "PostalAddress",
//               streetAddress: store.address,
//               addressLocality: store.name,
//               addressRegion: "Jharkhand",
//               addressCountry: "IN",
//             },
//             telephone: store.phone,
//           }),
//         }}
//       />
//     </div>
//   );
// }

import React from 'react'

function page() {
  return (
    <div>working</div>
  )
}

export default page