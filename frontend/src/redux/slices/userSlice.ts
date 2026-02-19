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
  isLoginModalOpen: boolean; // ✅ NEW
};

const initialState: UserState = {
  activeUser: null,
  isLoginModalOpen: false, // ✅ NEW
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

    openLoginModal: (state) => {
      state.isLoginModalOpen = true;
    },

    closeLoginModal: (state) => {
      state.isLoginModalOpen = false;
    },
  },
});

export const {
  setActiveUser,
  clearActiveUser,
  openLoginModal,
  closeLoginModal,
} = userSlice.actions;

export default userSlice.reducer;
export type { LoggedInUser };
