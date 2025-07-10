// app/MainLayout.tsx
"use client";

import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <Toaster position="top-center" />
      <main>
        <div className="max-w-[1440px] mx-auto">
          <Navbar />
          {children}
        </div>
      </main>
    </Provider>
  );
}

