import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import checkoutReducer from "./slices/checkoutSlice";
import wishlistReducer from "./slices/wishlistSlice";
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
import { orderadminApi } from "./services/admin/adminOrderapi";
import { adminReturnApi } from "./services/admin/adminReturnapi";

// Manually define PersistPartial to fix missing import error
type PersistPartial = {
  _persist?: {
    version: number;
    rehydrated: boolean;
  };
};

const rootReducer = combineReducers({
  user: userReducer,
  checkout: checkoutReducer,
  productDetail: productDetailReducer,
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
  [orderadminApi.reducerPath]: orderadminApi.reducer,
  [adminReturnApi.reducerPath]: adminReturnApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer> & PersistPartial;

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user", "checkout"],
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
      deliveryApi.middleware,
      orderadminApi.middleware,
      adminReturnApi.middleware
    ),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
