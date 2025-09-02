import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
// import cartReducer from "./slices/cartSlice";
import checkoutReducer from "./slices/checkoutSlice"; // ✅ Import checkout reducer
import wishlistReducer from "./slices/wishlistSlice"
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
import { userProductApi } from "@/redux/services/user/publicProductApi";
import { addressApi } from "./services/user/addressApi";
import { orderApi } from "./services/user/orderApi";
import { cartApi } from "./services/user/cartApi";
import { wishlistApi } from "./services/user/wishlistApi";
import { adminDashboardApi } from "./services/admin/adminDashboard";
import productDetailReducer from "./slices/ProductDetailSlice";
import { reviewsApi } from "./services/user/reviewApi";
import { returnApi } from "./services/user/returnApi";
import { deliveryApi } from "./services/user/deliveryApi";

const rootReducer = combineReducers({
  user: userReducer,
  checkout: checkoutReducer,
  productDetail: productDetailReducer,
  // cart: cartReducer,
  wishlist: wishlistReducer,
  [adminProductApi.reducerPath]: adminProductApi.reducer,
  [adminCategoryApi.reducerPath]: adminCategoryApi.reducer,
  [userProductApi.reducerPath]: userProductApi.reducer,
  [addressApi.reducerPath]: addressApi.reducer,
  [orderApi.reducerPath]: orderApi.reducer,
  [cartApi.reducerPath]: cartApi.reducer,
  [wishlistApi.reducerPath]: wishlistApi.reducer,
  [adminDashboardApi.reducerPath]: adminDashboardApi.reducer,
  [reviewsApi.reducerPath]: reviewsApi.reducer,
  [returnApi.reducerPath]: returnApi.reducer,
  [deliveryApi.reducerPath]: deliveryApi.reducer,
});

// ✅ Updated persist config to include checkout
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user", "checkout"], // ✅ Add checkout to whitelist
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
      userProductApi.middleware,
      addressApi.middleware,
      orderApi.middleware,
      cartApi.middleware,
      wishlistApi.middleware,
      adminDashboardApi.middleware,
      reviewsApi.middleware,
      returnApi.middleware,
      deliveryApi.middleware
    ),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
