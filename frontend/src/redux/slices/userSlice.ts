import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type LoggedInUser = {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "buyer" | "admin";
};
type UserState = {
  activeUser: LoggedInUser | null;
};
const initialState: UserState = {
  activeUser: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setActiveUser: (state, action: PayloadAction<LoggedInUser | null>) => {
      state.activeUser = action.payload;
    },
    clearActiveUser: (state) => {
      state.activeUser = null;
    },
  },
});
export const { setActiveUser, clearActiveUser } = userSlice.actions;
export default userSlice.reducer;
export type { LoggedInUser };
