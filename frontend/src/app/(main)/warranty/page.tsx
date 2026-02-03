import React from "react";

const WarrantyPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 text-gray-800">
      <h1 className="text-2xl font-bold mb-6">Warranty Policy</h1>

      {/* INTRO */}
      <section className="mb-6">
        <p className="text-sm leading-relaxed">
          All products are covered under a <strong>repair-only warranty</strong>
          against manufacturing defects under normal residential use. During the
          warranty period, eligible issues will be repaired.
          <strong> Replacement or refund is not included.</strong>
        </p>
      </section>

      {/* WHAT IS COVERED */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">
          What Is Covered Under Warranty
        </h2>
        <ul className="list-disc pl-5 text-sm space-y-2">
          <li>Manufacturing defects affecting product usability</li>
          <li>Structural failure under normal household usage</li>
          <li>
            Joint loosening or frame instability due to manufacturing issues
          </li>
          <li>
            Internal structural defects in:
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Solid wood furniture</li>
              <li>Engineered wood / plywood furniture</li>
              <li>Beds, wardrobes, tables, cabinets, chairs & dining chairs</li>
            </ul>
          </li>
        </ul>
      </section>

      {/* MATERIAL CLARIFICATION */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">
          Material Coverage Clarification
        </h2>
        <p className="text-sm leading-relaxed">
          Warranty applies to the <strong>main structural frame</strong>
          of the product. The type of material (solid wood, engineered wood,
          plywood, or mixed materials) does not change warranty eligibility as
          long as the defect is structural and manufacturing-related.
        </p>
      </section>

      {/* SEATING */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">
          Seating Products (Chairs & Dining Chairs)
        </h2>
        <ul className="list-disc pl-5 text-sm space-y-2">
          <li>Manufacturing defects in frame or legs</li>
          <li>Structural instability during normal sitting use</li>
          <li>
            Upholstery, cushions, foam softening, fabric wear, or color fading
            are <strong>not covered</strong>
          </li>
        </ul>
      </section>

      {/* WHAT IS NOT COVERED */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">
          What Is Not Covered Under Warranty
        </h2>
        <ul className="list-disc pl-5 text-sm space-y-2">
          <li>Damage caused by water, moisture, or humidity</li>
          <li>Swelling, warping, or peeling due to liquid contact</li>
          <li>Normal wear and tear over time</li>
          <li>Scratches, dents, cracks, or chips caused after delivery</li>
          <li>Glass, mirrors, marble, stone, or fragile components</li>
          <li>Damage caused by misuse, abuse, overloading, or negligence</li>
          <li>Commercial use or rental usage</li>
          <li>Unauthorized repairs or modifications</li>
        </ul>
      </section>

      {/* CARE NOTE */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">
          Important Care Guidelines
        </h2>
        <p className="text-sm leading-relaxed">
          Furniture should be kept away from direct water contact, excessive
          moisture, and prolonged sunlight exposure. Proper care ensures longer
          product life and warranty validity.
        </p>
      </section>

      {/* FOOTER */}
      <section className="border-t pt-4 text-sm text-gray-600 leading-relaxed">
        <p>
          Warranty is valid only for the original purchaser with proof of
          purchase. The company reserves the right to inspect the product and
          decide the nature of repair.
        </p>
      </section>
    </div>
  );
};

export default WarrantyPage;
