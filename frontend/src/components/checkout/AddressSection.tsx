"use client";

import {
  useGetAddressesQuery,
  useCreateAddressMutation,
} from "@/redux/services/user/addressApi";
import { useState, useEffect } from "react";
import { Address } from "@/types/address";
import Input from "@/components/ui/Input";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedAddress } from "@/redux/slices/checkoutSlice";
import { RootState } from "@/redux/store";

const AddressSection = ({
  onSelectionChange,
}: {
  onSelectionChange: (val: boolean) => void;
}) => {
  const { data: addresses = [], isLoading } = useGetAddressesQuery();
  const [createAddress] = useCreateAddressMutation();

  const selectedFromRedux = useSelector(
    (state: RootState) => state.checkout.selectedAddress
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState(false);
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    reset,
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

  useEffect(() => {
    if (selectedFromRedux?._id) {
      setSelectedId(selectedFromRedux._id);
    }
  }, [selectedFromRedux]);

  const onSubmit = async (data: Partial<Address>) => {
    try {
      const res = await createAddress(data).unwrap();
      reset();
      setNewAddress(false);

      if (res._id) {
        setSelectedId(res._id);
        dispatch(setSelectedAddress(res));
        onSelectionChange(true);
      }
    } catch (err) {
      console.error("Failed to create address", err);
    }
  };

  return (
    <div className="p-6 border border-[--color-border] rounded-xl bg-[--color-card] text-[--text-dark] dark:text-[--text-light]">
      <h2 className="text-2xl font-bold mb-4 text-[--text-accent]">
        Delivery Address
      </h2>

      {isLoading ? (
        <p className="text-[--color-muted-foreground] text-sm">
          Loading addresses...
        </p>
      ) : addresses.length > 0 ? (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <label
              key={addr._id}
              className={`flex items-start gap-3 cursor-pointer p-4 border rounded-lg transition-colors ${
                selectedId === addr._id
                  ? "border-[--color-accent] bg-[--secondary-light]/50"
                  : "hover:bg-[--secondary-light]/20"
              }`}
            >
              <input
                type="radio"
                name="address"
                checked={selectedId === addr._id}
                onChange={() => {
                  setSelectedId(addr._id);
                  dispatch(setSelectedAddress(addr));
                  onSelectionChange(true);
                }}
                className="mt-1 accent-[--color-accent] scale-125"
              />
              <div>
                <p className="text-base font-medium">{addr.fullName}</p>
                <p className="text-sm text-[--color-muted-foreground] leading-snug">
                  {addr.addressLine1},{" "}
                  {addr.addressLine2 && `${addr.addressLine2}, `}
                  {addr.city}, {addr.state}, {addr.pincode}
                </p>
                {selectedId === addr._id && (
                  <span className="text-sm font-semibold text-green-600">
                    ✔ Selected
                  </span>
                )}
              </div>
            </label>
          ))}
        </div>
      ) : (
        <p className="text-[--text-error] text-sm">
          No addresses found. Please add one.
        </p>
      )}

      <button
        onClick={() => setNewAddress(!newAddress)}
        className="mt-6 text-[--color-accent] font-medium underline hover:no-underline text-sm"
      >
        {newAddress ? "Cancel" : "+ Add new address"}
      </button>

      {newAddress && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="fullName"
              placeholder="Full Name"
              register={register("fullName", {
                required: "Full name is required",
              })}
              error={errors.fullName?.message}
            />
            <Input
              label="Mobile"
              name="mobile"
              placeholder="Mobile"
              register={register("mobile", { required: "Mobile is required" })}
              error={errors.mobile?.message}
            />
            <Input
              label="Address Line 1"
              name="addressLine1"
              placeholder="Address Line 1"
              register={register("addressLine1", {
                required: "Address is required",
              })}
              error={errors.addressLine1?.message}
            />
            <Input
              label="Address Line 2"
              name="addressLine2"
              placeholder="Address Line 2"
              register={register("addressLine2")}
              error={errors.addressLine2?.message}
            />
            <Input
              label="City"
              name="city"
              placeholder="City"
              register={register("city", { required: "City is required" })}
              error={errors.city?.message}
            />
            <Input
              label="State"
              name="state"
              placeholder="State"
              register={register("state", { required: "State is required" })}
              error={errors.state?.message}
            />
            <Input
              label="Pincode"
              name="pincode"
              placeholder="Pincode"
              register={register("pincode", {
                required: "Pincode is required",
              })}
              error={errors.pincode?.message}
            />
            <Input
              label="Landmark (optional)"
              name="landmark"
              placeholder="Landmark"
              register={register("landmark")}
              error={errors.landmark?.message}
            />
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="isDefault"
              {...register("isDefault")}
              className="accent-[--color-accent] w-5 h-5"
            />
            <label htmlFor="isDefault" className="text-sm">
              Make this my default address
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-[--color-accent] hover:bg-[--color-accent]/90 text-[--text-light] px-6 py-2 rounded-xl font-semibold text-base transition disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Address"}
          </button>
        </form>
      )}
    </div>
  );
};

export default AddressSection;
