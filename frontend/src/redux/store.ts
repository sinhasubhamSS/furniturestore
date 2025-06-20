import { configureStore } from "@reduxjs/toolkit";
import { Storage } from "redux-persist";
import userReducer from "./slices/userSlice"
export const store=configureStore({
    reducer:{
        user:userReducer,

    }
})
export type RootState= ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
