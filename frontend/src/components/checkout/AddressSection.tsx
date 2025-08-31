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
  type?: string | null; //check hear type cannot be null it will wither cart or direct
}

const AddressSection = ({
  onSelectionChange,
  items,
  type,
}: AddressSectionProps) => {
  const { data: addresses = [], isLoading } = useGetAddressesQuery();
  const [createAddress] = useCreateAddressMutation();

  // ✅ FIXED: Use only pricing API for delivery check
  const [getCheckoutPricing] = useGetCheckoutPricingMutation();

  const selectedFromRedux = useSelector(
    (state: RootState) => state.checkout.selectedAddress
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState<{
    checking: boolean;
    deliverable: boolean | null;
    message: string;
    pricingData: any | null;
  }>({
    checking: false,
    deliverable: null,
    message: "",
    pricingData: null,
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

  // ✅ SYNC LOCAL STATE WITH REDUX
  useEffect(() => {
    if (selectedFromRedux?._id) {
      setSelectedId(selectedFromRedux._id);
    }
  }, [selectedFromRedux]);

  // ✅ UNIFIED: Single delivery + pricing check
  const checkDeliveryAndPricing = async (
    pincode: string,
    orderItems?: any[]
  ): Promise<{ deliverable: boolean; pricingData?: any }> => {
    if (!pincode || pincode.length !== 6) return { deliverable: false };
    if (!orderItems?.length) return { deliverable: false };

    setDeliveryStatus((prev) => ({
      ...prev,
      checking: true,
      deliverable: null,
      message: "Checking delivery and pricing...",
      pricingData: null,
    }));

    try {
      const mappedItems = orderItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId || "",
        quantity: item.quantity,
      }));

      const response = await getCheckoutPricing({
        items: mappedItems,
        pincode,
      }).unwrap();

      const isDeliverable = response.isServiceable !== false;

      setDeliveryStatus({
        checking: false,
        deliverable: isDeliverable,
        message: isDeliverable
          ? "Delivery available"
          : response.deliveryInfo?.message || "Delivery not available",
        pricingData: response,
      });

      return { deliverable: isDeliverable, pricingData: response };
    } catch (error: any) {
      console.error("❌ [ADDRESS] Delivery check failed:", error);

      setDeliveryStatus({
        checking: false,
        deliverable: false,
        message: "Unable to check delivery availability",
        pricingData: null,
      });

      return { deliverable: false };
    }
  };

  // ✅ DEBOUNCED: Watch pincode changes for form input
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (watchedPincode && /^\d{6}$/.test(watchedPincode) && items.length) {
        await checkDeliveryAndPricing(watchedPincode, items);
        // Don't call onSelectionChange here for form input
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [watchedPincode, items]);

  // ✅ HANDLE ADDRESS SELECTION
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
      alert(
        "This address is not deliverable. Please choose a different pincode."
      );
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
    <div className="p-6 border border-gray-200 rounded-xl bg-white">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Delivery Address
      </h2>

      {isLoading ? (
        <p className="text-gray-500 text-sm">Loading addresses...</p>
      ) : addresses.length > 0 ? (
        <div className="space-y-3 mb-6">
          {addresses.map((addr: Address) => (
            <label
              key={addr._id}
              className={`flex items-start gap-3 cursor-pointer p-4 border rounded-lg transition-colors ${
                selectedId === addr._id
                  ? "border-blue-500 bg-blue-50"
                  : "hover:bg-gray-50 border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="address"
                checked={selectedId === addr._id}
                onChange={() => handleAddressSelection(addr)}
                className="mt-1 accent-blue-600 scale-125"
              />
              <div className="flex-1">
                <p className="text-base font-medium">{addr.fullName}</p>
                <p className="text-sm text-gray-600 leading-snug">
                  {addr.addressLine1}
                  {addr.addressLine2 && `, ${addr.addressLine2}`}, {addr.city},{" "}
                  {addr.state} - {addr.pincode}
                </p>
                <p className="text-xs text-gray-500 mt-1">📱 {addr.mobile}</p>

                {/* ✅ ENHANCED DELIVERY STATUS */}
                {selectedId === addr._id && (
                  <div className="mt-2">
                    {deliveryStatus.checking ? (
                      <span className="text-sm text-blue-600 flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        Checking delivery and pricing...
                      </span>
                    ) : deliveryStatus.deliverable === true ? (
                      <div className="text-sm bg-green-50 border border-green-200 rounded p-2">
                        <div className="text-green-700 font-semibold">
                          ✅ Deliverable
                        </div>
                        {deliveryStatus.pricingData && (
                          <div className="text-green-600 text-xs mt-1">
                            Delivery: ₹
                            {deliveryStatus.pricingData.deliveryCharge || 0} •
                            Days:{" "}
                            {deliveryStatus.pricingData.deliveryInfo
                              ?.estimatedDays || 0}{" "}
                            • COD:{" "}
                            {deliveryStatus.pricingData.deliveryInfo
                              ?.codAvailable
                              ? "Yes"
                              : "No"}
                          </div>
                        )}
                      </div>
                    ) : deliveryStatus.deliverable === false ? (
                      <div className="text-sm bg-red-50 border border-red-200 rounded p-2">
                        <div className="text-red-700 font-semibold">
                          ❌ Not Deliverable
                        </div>
                        <div className="text-red-600 text-xs mt-1">
                          {deliveryStatus.message}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>
      ) : (
        <p className="text-red-600 text-sm mb-6">
          No addresses found. Please add one.
        </p>
      )}

      <button
        onClick={() => setNewAddress(!newAddress)}
        className="mb-6 text-blue-600 font-medium underline hover:no-underline text-sm"
      >
        {newAddress ? "❌ Cancel" : "➕ Add new address"}
      </button>

      {newAddress && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                name="fullName"
                label="Full Name *"
                placeholder="Enter full name"
                register={register("fullName", {
                  required: "Full name is required",
                })}
                error={errors.fullName?.message}
              />

              <Input
                name="mobile"
                label="Mobile Number *"
                placeholder="Enter mobile number"
                register={register("mobile", {
                  required: "Mobile is required",
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: "Invalid mobile number",
                  },
                })}
                error={errors.mobile?.message}
              />

              <div className="sm:col-span-2">
                <Input
                  name="addressLine1"
                  label="Address Line 1 *"
                  placeholder="House No, Street Name"
                  register={register("addressLine1", {
                    required: "Address is required",
                  })}
                  error={errors.addressLine1?.message}
                />
              </div>

              <Input
                name="addressLine2"
                label="Address Line 2"
                placeholder="Area, Locality"
                register={register("addressLine2")}
                error={errors.addressLine2?.message}
              />

              <Input
                name="landmark"
                label="Landmark"
                placeholder="Near landmark"
                register={register("landmark")}
                error={errors.landmark?.message}
              />

              <Input
                name="city"
                label="City *"
                placeholder="Enter city"
                register={register("city", { required: "City is required" })}
                error={errors.city?.message}
              />

              <Input
                name="state"
                label="State *"
                placeholder="Enter state"
                register={register("state", { required: "State is required" })}
                error={errors.state?.message}
              />

              <div className="relative">
                <Input
                  name="pincode"
                  label="Pincode *"
                  placeholder="Enter 6-digit pincode"
                  register={register("pincode", {
                    required: "Pincode is required",
                    pattern: { value: /^\d{6}$/, message: "Must be 6 digits" },
                  })}
                  error={errors.pincode?.message}
                />

                {/* ✅ ENHANCED REAL-TIME DELIVERY STATUS */}
                {watchedPincode && watchedPincode.length === 6 && (
                  <div className="mt-2">
                    {deliveryStatus.checking ? (
                      <div className="flex items-center gap-2 text-blue-600 text-sm">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        Checking delivery availability...
                      </div>
                    ) : deliveryStatus.deliverable === true ? (
                      <div className="text-sm bg-green-50 border border-green-200 rounded p-2 text-green-700">
                        <div className="font-semibold">
                          ✅ Delivery Available
                        </div>
                        {deliveryStatus.pricingData && (
                          <div className="text-xs mt-1">
                            Delivery: ₹
                            {deliveryStatus.pricingData.deliveryCharge || 0} |
                            Days:{" "}
                            {deliveryStatus.pricingData.deliveryInfo
                              ?.estimatedDays || 0}{" "}
                            | COD:{" "}
                            {deliveryStatus.pricingData.deliveryInfo
                              ?.codAvailable
                              ? "Available"
                              : "Not Available"}
                          </div>
                        )}
                      </div>
                    ) : deliveryStatus.deliverable === false ? (
                      <div className="text-sm bg-red-50 border border-red-200 rounded p-2 text-red-700">
                        <div className="font-semibold">❌ Not Deliverable</div>
                        <div className="text-xs mt-1">
                          {deliveryStatus.message}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                id="isDefault"
                {...register("isDefault")}
                className="w-4 h-4 accent-blue-600"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700">
                Make this my default address
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !deliveryStatus.deliverable}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                deliveryStatus.deliverable && !isSubmitting
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isSubmitting
                ? "Saving Address..."
                : !deliveryStatus.deliverable
                ? "Address Not Deliverable"
                : "Save Address"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddressSection;
