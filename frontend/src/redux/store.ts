import { configureStore, combineReducers } from "@reduxjs/toolkit";
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

import { adminProductApi } from "@/redux/services/admin/adminProductapi";
import { adminCategoryApi } from "./services/admin/adminCategoryapi";
import { userProductApi } from "@/redux/services/user/publicProductApi"; // ✅ IMPORT

const rootReducer = combineReducers({
  user: userReducer,
  [adminProductApi.reducerPath]: adminProductApi.reducer,
  [adminCategoryApi.reducerPath]: adminCategoryApi.reducer,
  [userProductApi.reducerPath]: userProductApi.reducer, // ✅ ADD HERE
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
    }).concat(
      adminProductApi.middleware,
      adminCategoryApi.middleware,
      userProductApi.middleware // ✅ ADD HERE
    ),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
