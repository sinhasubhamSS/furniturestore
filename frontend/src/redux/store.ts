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
import { addressApi } from "./services/user/addressApi";
import checkoutReducer from "./slices/checkoutSlice";
import { orderApi } from "./services/user/orderApi"; 
import { cartApi } from "./services/user/cartApi";
import { wishlistApi } from "./services/user/wishlistApi";
import { adminDashboardApi } from "./services/admin/adminDashboard";

const rootReducer = combineReducers({
  user: userReducer,
   checkout: checkoutReducer,
  [adminProductApi.reducerPath]: adminProductApi.reducer,
  [adminCategoryApi.reducerPath]: adminCategoryApi.reducer,
  [userProductApi.reducerPath]: userProductApi.reducer, // ✅ ADD HERE
  [addressApi.reducerPath]: addressApi.reducer,
  [orderApi.reducerPath]: orderApi.reducer, 
  [cartApi.reducerPath]: cartApi.reducer,
  [wishlistApi.reducerPath]: wishlistApi.reducer,
  [adminDashboardApi.reducerPath]: adminDashboardApi.reducer,
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
      userProductApi.middleware, // ✅ ADD HERE
      addressApi.middleware,
      orderApi.middleware,
      cartApi.middleware,
      wishlistApi.middleware,
      adminDashboardApi.middleware,
    ),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
