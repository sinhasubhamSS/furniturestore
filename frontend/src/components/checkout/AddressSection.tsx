"use client";

import {
  useGetAddressesQuery,
  useCreateAddressMutation,
} from "@/redux/services/user/addressApi";
import { useState } from "react";
import { Address } from "@/types/address";
import Input from "@/components/ui/Input";
import { useForm } from "react-hook-form";

const AddressSection = () => {
  const { data: addresses = [], isLoading } = useGetAddressesQuery();
  const [createAddress] = useCreateAddressMutation();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
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

  const onSubmit = async (data: Partial<Address>) => {
    try {
      await createAddress(data).unwrap();
      reset();
      setNewAddress(false);
    } catch (err) {
      console.error("Failed to create address", err);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-bold mb-2">Delivery Address</h2>

      {isLoading ? (
        <p>Loading addresses...</p>
      ) : addresses.length > 0 ? (
        addresses.map((addr) => (
          <label key={addr._id} className="block mb-2 cursor-pointer">
            <input
              type="radio"
              name="address"
              checked={selectedId === addr._id}
              onChange={() => setSelectedId(addr._id)}
            />
            <span className="ml-2">
              {addr.fullName}, {addr.addressLine1}, {addr.city}
            </span>
          </label>
        ))
      ) : (
        <p>No addresses found. Please add one.</p>
      )}

      <button
        onClick={() => setNewAddress(!newAddress)}
        className="mt-4 text-blue-600 underline"
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
            <input type="checkbox" id="isDefault" {...register("isDefault")} />
            <label htmlFor="isDefault">Make this my default address</label>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Save Address
          </button>
        </form>
      )}
    </div>
  );
};

export default AddressSection;
