// src/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";

import userReducer from "./slices/userSlice";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "@reduxjs/toolkit";
import {adminProductApi} from "@/redux/services/adminProductapi"

const rootReducer = combineReducers({
  user: userReducer,
  [adminProductApi.reducerPath]: adminProductApi.reducer, // ✅ add api reducer
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(adminProductApi.middleware), // ✅ add api middleware
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
