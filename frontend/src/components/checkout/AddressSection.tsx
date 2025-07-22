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
import { setSelectedAddressId } from "@/redux/slices/checkoutSlice";
import { RootState } from "@/redux/store"; // adjust if needed

const AddressSection = ({
  onSelectionChange,
}: {
  onSelectionChange: (val: boolean) => void;
}) => {
  const { data: addresses = [], isLoading } = useGetAddressesQuery();
  const [createAddress] = useCreateAddressMutation();

  const selectedFromRedux = useSelector(
    (state: RootState) => state.checkout.selectedAddressId
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
    if (selectedFromRedux) {
      setSelectedId(selectedFromRedux);
    }
  }, [selectedFromRedux]);

  const onSubmit = async (data: Partial<Address>) => {
    try {
      const res = await createAddress(data).unwrap();
      reset();
      setNewAddress(false);

      if (res._id) {
        setSelectedId(res._id);
        dispatch(setSelectedAddressId(res._id));
        onSelectionChange(true);
      }
    } catch (err) {
      console.error("Failed to create address", err);
    }
  };

  return (
    <div className="p-4 border border-[--color-border] rounded-lg bg-[--color-card] text-[--text-dark] dark:text-[--text-light]">
      <h2 className="text-lg font-bold mb-2">Delivery Address</h2>

      {isLoading ? (
        <p className="text-[--color-muted-foreground]">Loading addresses...</p>
      ) : addresses.length > 0 ? (
        addresses.map((addr) => (
          <label
            key={addr._id}
            className="block mb-2 cursor-pointer hover:bg-[--secondary-light] dark:hover:bg-[--secondary-light]/10 p-2 rounded"
          >
            <input
              type="radio"
              name="address"
              checked={selectedId === addr._id}
              onChange={() => {
                setSelectedId(addr._id);
                dispatch(setSelectedAddressId(addr._id));
                onSelectionChange(true);
              }}
              className="accent-[--color-accent]"
            />
            <span className="ml-2">
              {addr.fullName}, {addr.addressLine1}, {addr.city}
              {selectedId === addr._id && (
                <span className="ml-2 text-green-500 font-semibold">✔</span>
              )}
            </span>
          </label>
        ))
      ) : (
        <p className="text-[--text-error]">
          No addresses found. Please add one.
        </p>
      )}

      <button
        onClick={() => setNewAddress(!newAddress)}
        className="mt-4 text-[--color-accent] underline"
      >
        {newAddress ? "Cancel" : "+ Add new address"}
      </button>

      {newAddress && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-2">
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
            register={register("pincode", { required: "Pincode is required" })}
            error={errors.pincode?.message}
          />
          <Input
            label="Landmark (optional)"
            name="landmark"
            placeholder="Landmark"
            register={register("landmark")}
            error={errors.landmark?.message}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              {...register("isDefault")}
              className="accent-[--color-accent]"
            />
            <label htmlFor="isDefault">Make this my default address</label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[--color-accent] text-[--text-light] px-4 py-2 rounded disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Address"}
          </button>
        </form>
      )}
    </div>
  );
};

export default AddressSection;
