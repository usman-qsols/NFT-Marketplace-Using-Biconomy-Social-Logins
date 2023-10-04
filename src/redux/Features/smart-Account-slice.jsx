"use client";

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: {
    smartAccount: {},
  },
};

export const smartAccountReducer = createSlice({
  name: "smartAccount",
  initialState,
  reducers: {
    removeSmartAccount: () => {
      return initialState;
    },
    SetSmartAccount: (state, action) => {
      return {
        value: {
          smartAccount: action.payload,
        },
      };
    },
  },
});

export const { removeSmartAccount, SetSmartAccount } =
  smartAccountReducer.actions;
export default smartAccountReducer.reducer;
