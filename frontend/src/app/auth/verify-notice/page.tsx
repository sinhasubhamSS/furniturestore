"use client";

import Link from "next/link";

const VerifyNoticePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <h2 className="text-2xl font-bold mb-4">📩 Check Your Email</h2>
        <p className="mb-4">
          We've sent a verification link to your email. Please verify your
          account before logging in.
        </p>

        <Link href="/auth/login" className="text-blue-500 underline">
          Go to Login
        </Link>
      </div>
    </div>
  );
};

export default VerifyNoticePage;
