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

  if (!selectedVariant) return null;

  return (
    <div
      className="m-auto
        fixed bottom-0 left-0 right-0 z-40 lg:hidden
        backdrop-blur-md

      "
    >
      {/* Content aligned */}
      <div className="mx-auto max-w-[1440px] px-8 py-2">
        <ActionButtons productId={productId} />
      </div>
    </div>
  );
};

export default MobileStickyCTA;
