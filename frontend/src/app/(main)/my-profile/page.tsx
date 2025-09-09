"use client";

import React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import Image from "next/image";

const MyProfile = () => {
  const user = useSelector((state: RootState) => state.user.activeUser);

  if (!user)
    return (
      <p className="text-center text-[var(--text-accent)] mt-16">
        Please log in to view your profile.
      </p>
    );

  return (
    <div className="max-w-lg mx-auto p-8 bg-[var(--color-card)] rounded-[var(--radius)] shadow-lg mt-16 mb-20">
      <h1 className="text-3xl font-bold text-center text-[var(--color-accent)] mb-10">
        My Profile
      </h1>

      <div className="flex flex-col md:flex-row md:items-center gap-6">
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt={`${user.name} avatar`}
            width={112}
            height={112}
            className="rounded-full object-cover border-4 border-[var(--color-primary)] shadow-md"
          />
        ) : (
          <div className="w-28 h-28 rounded-full bg-[var(--color-secondary)] flex items-center justify-center border-4 border-[var(--color-primary)] shadow-md text-4xl font-extrabold text-[var(--color-accent)]">
            {user.name[0].toUpperCase()}
          </div>
        )}

        <div className="text-center md:text-left">
          <h2 className="text-2xl font-semibold text-[var(--text-dark)]">
            {user.name}
          </h2>
          <p className="text-[var(--text-accent)] mt-1">{user.email}</p>
          <p className="capitalize mt-2 inline-block px-4 py-1 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] font-medium text-sm tracking-wide select-none">
            {user.role}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
