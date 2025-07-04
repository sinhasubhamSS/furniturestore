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

// ✅ 1. Combine reducers (in case you add more later)
const rootReducer = combineReducers({
  user: userReducer,
});

// ✅ 2. Use key: 'root', not 'user'
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user"], // only user will be persisted
};

// ✅ 3. Wrap the entire combined reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// ✅ 4. Configure the store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// ✅ 5. Persistor export
export const persistor = persistStore(store);

// ✅ 6. Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
