// app/ReduxProviders.tsx में:
"use client";
import React from "react";
import { Provider, useDispatch } from "react-redux";
import { store, persistor } from "@/redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "react-hot-toast";
import { setRehydrated } from "@/redux/slices/checkoutSlice";

function RehydrationHandler() {
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(setRehydrated());
  }, [dispatch]);

  return null;
}

export default function ReduxProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RehydrationHandler />
        <Toaster position="top-center" />
        {children}
      </PersistGate>
    </Provider>
  );
}
