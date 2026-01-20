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
    // 🔥 lg:hidden YAHI lagna chahiye
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 lg:hidden">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <ActionButtons productId={productId} />
      </div>
    </div>
  );
};

export default MobileStickyCTA;
