"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  useGetAddressesQuery,
  useCreateAddressMutation,
} from "@/redux/services/user/addressApi";
import { useGetCheckoutPricingMutation } from "@/redux/services/user/orderApi";
import { setSelectedAddress } from "@/redux/slices/checkoutSlice";
import { RootState } from "@/redux/store";
import { Address } from "@/types/address";
import Input from "@/components/ui/Input";

interface AddressSectionProps {
  onSelectionChange: (deliverable: boolean, pricingData?: any) => void;
  items: any[];
  type?: string | null;
}

const AddressSection = ({ onSelectionChange, items }: AddressSectionProps) => {
  const { data: addresses = [], isLoading } = useGetAddressesQuery();
  const [createAddress] = useCreateAddressMutation();
  const [getCheckoutPricing] = useGetCheckoutPricingMutation();

  const selectedFromRedux = useSelector((state: RootState) => state.checkout.selectedAddress);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState({
    checking: false,
    deliverable: null as boolean | null,
    message: "",
    pricingData: null as any | null,
  });

  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Partial<Address>>({
    defaultValues: {
      fullName: "",
      mobile: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
      isDefault: false,
      country: "India",
    },
  });

  const watchedPincode = watch("pincode");

  useEffect(() => {
    if (selectedFromRedux?._id) {
      setSelectedId(selectedFromRedux._id);
    }
  }, [selectedFromRedux]);

  const checkDeliveryAndPricing = async (pincode: string, orderItems?: any[]) => {
    if (!pincode || pincode.length !== 6) return { deliverable: false };
    if (!orderItems?.length) return { deliverable: false };

    setDeliveryStatus(prev => ({ ...prev, checking: true, deliverable: null, message: "Checking..." }));

    try {
      const mappedItems = orderItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId || "",
        quantity: item.quantity,
      }));

      const response = await getCheckoutPricing({ items: mappedItems, pincode }).unwrap();
      const isDeliverable = response.isServiceable !== false;

      setDeliveryStatus({
        checking: false,
        deliverable: isDeliverable,
        message: isDeliverable ? "Delivery available" : response.deliveryInfo?.message || "Not deliverable",
        pricingData: response,
      });

      return { deliverable: isDeliverable, pricingData: response };
    } catch (error) {
      console.error("[ADDRESS] Delivery check failed:", error);
      setDeliveryStatus({
        checking: false,
        deliverable: false,
        message: "Unable to check delivery",
        pricingData: null,
      });
      return { deliverable: false };
    }
  };

  // debounce pincode
  useEffect(() => {
    const t = setTimeout(async () => {
      if (watchedPincode && /^\d{6}$/.test(watchedPincode) && items.length) {
        await checkDeliveryAndPricing(watchedPincode, items);
      }
    }, 700);
    return () => clearTimeout(t);
  }, [watchedPincode, items]);

  const handleAddressSelection = async (address: Address) => {
    setSelectedId(address._id);
    dispatch(setSelectedAddress(address));

    if (address.pincode && items.length) {
      const result = await checkDeliveryAndPricing(address.pincode, items);
      onSelectionChange(result.deliverable, result.pricingData);
    } else {
      onSelectionChange(false);
    }
  };

  const onSubmit = async (data: Partial<Address>) => {
    if (!deliveryStatus.deliverable) {
      alert("This address is not deliverable. Please choose a different pincode.");
      return;
    }

    try {
      const res = await createAddress(data).unwrap();
      reset();
      setNewAddress(false);

      if (res._id) {
        setSelectedId(res._id);
        dispatch(setSelectedAddress(res));
        onSelectionChange(true, deliveryStatus.pricingData);
      }
    } catch (err) {
      console.error("Failed to create address", err);
      alert("Failed to save address. Please try again.");
    }
  };

  return (
    <section aria-labelledby="delivery-address" style={{ background: "var(--color-card)", padding: 16, borderRadius: 10, boxShadow: "var(--elevation-1)" }}>
      <h2 id="delivery-address" style={{ color: "var(--color-foreground)", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Delivery Address</h2>

      {isLoading ? (
        <p style={{ color: "var(--text-accent)" }}>Loading addresses...</p>
      ) : addresses.length > 0 ? (
        <div style={{ display: "grid", gap: 8 }}>
          {addresses.map((addr: Address) => (
            <label
              key={addr._id}
              style={{
                display: "flex",
                gap: 12,
                cursor: "pointer",
                padding: 12,
                borderRadius: 10,
                alignItems: "flex-start",
                background: selectedId === addr._id ? "var(--color-card-secondary)" : "transparent",
                boxShadow: selectedId === addr._id ? "0 0 0 4px rgba(107,60,26,0.06)" : "none"
              }}
            >
              <input
                type="radio"
                name="address"
                checked={selectedId === addr._id}
                onChange={() => handleAddressSelection(addr)}
                style={{ accentColor: "var(--color-accent)", transform: "scale(1.04)", marginTop: 2 }}
                aria-label={`Select address ${addr.fullName}`}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "var(--color-foreground)" }}>{addr.fullName}</div>
                <div style={{ color: "var(--text-accent)", fontSize: 13, marginTop: 4 }}>{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}, {addr.city}, {addr.state} - {addr.pincode}</div>
                <div style={{ color: "var(--text-accent)", fontSize: 12, marginTop: 6 }}>📱 {addr.mobile}</div>

                {selectedId === addr._id && (
                  <div style={{ marginTop: 8 }}>
                    {deliveryStatus.checking ? (
                      <div style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--color-accent)" }}>
                        <div style={{ width: 14, height: 14, border: "2px solid var(--color-accent)", borderTopColor: "transparent", borderRadius: 999, animation: "spin 1s linear infinite" }} />
                        <div style={{ fontSize: 13 }}>Checking delivery and pricing...</div>
                      </div>
                    ) : deliveryStatus.deliverable === true ? (
                      <div style={{ background: "#ecf9f0", padding: 8, borderRadius: 8 }}>
                        <div style={{ fontWeight: 700, color: "#256c3f" }}>✅ Deliverable</div>
                        {deliveryStatus.pricingData && <div style={{ fontSize: 13, color: "#2d6b3f", marginTop: 6 }}>Delivery: ₹{deliveryStatus.pricingData.deliveryCharge || 0} • Days: {deliveryStatus.pricingData.deliveryInfo?.estimatedDays || "-"} • COD: {deliveryStatus.pricingData.deliveryInfo?.codAvailable ? "Yes" : "No"}</div>}
                      </div>
                    ) : deliveryStatus.deliverable === false ? (
                      <div style={{ background: "#fff4f4", padding: 8, borderRadius: 8 }}>
                        <div style={{ fontWeight: 700, color: "var(--text-error)" }}>❌ Not Deliverable</div>
                        <div style={{ fontSize: 13, color: "var(--text-error)", marginTop: 6 }}>{deliveryStatus.message}</div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>
      ) : (
        <div style={{ color: "var(--text-error)" }}>No addresses found. Please add one.</div>
      )}

      <div style={{ marginTop: 12 }}>
        <button onClick={() => setNewAddress(!newAddress)} style={{ background: "transparent", border: "none", color: "var(--color-accent)", fontWeight: 700 }}>
          {newAddress ? "Cancel" : "➕ Add new address"}
        </button>
      </div>

      {newAddress && (
        <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
            <Input name="fullName" label="Full Name *" placeholder="Enter full name" register={register("fullName", { required: "Full name is required" })} error={errors.fullName?.message} />
            <Input name="mobile" label="Mobile *" placeholder="Enter mobile number" register={register("mobile", { required: "Mobile required", pattern: { value: /^[6-9]\d{9}$/, message: "Invalid mobile" } })} error={errors.mobile?.message} />
            <div style={{ gridColumn: "1 / -1" }}>
              <Input name="addressLine1" label="Address Line 1 *" placeholder="House No, Street" register={register("addressLine1", { required: true })} error={errors.addressLine1?.message} />
            </div>
            <Input name="addressLine2" label="Address Line 2" placeholder="Area, Locality" register={register("addressLine2")} error={errors.addressLine2?.message} />
            <Input name="landmark" label="Landmark" placeholder="Near landmark" register={register("landmark")} error={errors.landmark?.message} />
            <Input name="city" label="City *" placeholder="Enter city" register={register("city", { required: true })} error={errors.city?.message} />
            <Input name="state" label="State *" placeholder="Enter state" register={register("state", { required: true })} error={errors.state?.message} />
            <Input name="pincode" label="Pincode *" placeholder="6-digit pincode" register={register("pincode", { required: true, pattern: { value: /^\d{6}$/, message: "Must be 6 digits" } })} error={errors.pincode?.message} />
          </div>

          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <input id="isDefault" type="checkbox" {...register("isDefault")} style={{ accentColor: "var(--color-accent)" }} />
            <label htmlFor="isDefault" style={{ color: "var(--text-accent)" }}>Make default</label>
          </div>

          <div style={{ marginTop: 12 }}>
            <button type="submit" disabled={isSubmitting || deliveryStatus.deliverable === false} style={{ background: deliveryStatus.deliverable ? "var(--color-accent)" : "var(--color-hover-card)", color: "var(--text-light)", padding: "10px 14px", borderRadius: 8, fontWeight: 700 }}>
              {isSubmitting ? "Saving..." : deliveryStatus.deliverable === false ? "Address Not Deliverable" : "Save Address"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

export default AddressSection;
