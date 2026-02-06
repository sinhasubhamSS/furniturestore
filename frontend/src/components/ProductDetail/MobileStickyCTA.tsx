"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import ActionButtons from "./ActionButtons";

type Props = {
  productId: string;
};

const MobileStickyCTA: React.FC<Props> = ({ productId }) => {
  const selectedVariant = useSelector(
    (state: RootState) => state.productDetail.selectedVariant,
  );

  // ❌ Variant select nahi hua → kuch bhi mat dikhao
  if (!selectedVariant) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-black/10 lg:hidden">
      {/* ✅ CONTENT-ALIGNED CONTAINER */}
      <div className="mx-auto max-w-[1440px] px-3">
        <div className="py-3">
          <ActionButtons productId={productId} />
        </div>
      </div>
    </div>
  );
};

export default MobileStickyCTA;
