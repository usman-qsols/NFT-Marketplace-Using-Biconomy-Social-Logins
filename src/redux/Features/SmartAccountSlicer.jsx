import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: {
    smartAccount: {},
  },
};

export const smartAccountSlice = createSlice({
  name: "smartAccount",
  initialState,
  reducers: {
    removeSmartAccount: () => {
      return initialState;
    },
    SetSmartAccount: (state, action) => {
      //   return {
      //     value: {
      //       smartAccount: action.payload,
      //     },
      //   };

      state.value.smartAccount = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { removeSmartAccount, SetSmartAccount } =
  smartAccountSlice.actions;

export default smartAccountSlice.reducer;
