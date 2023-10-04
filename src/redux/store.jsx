// "use client";
// import { configureStore } from "@reduxjs/toolkit";
// import smartAccountReducer from "./Features/smart-Account-slice";
// import { useSelector } from "react-redux";

// export const store = configureStore({
//   reducer: {
//     smartAccount: smartAccountReducer,
//   },
// });

// export const RootState = store.getState;
// export const AppDispatch = store.dispatch;
// export const useAppSelector = useSelector;

import { configureStore } from "@reduxjs/toolkit";
import smartAccountReducer from "./Features/SmartAccountSlicer";

export const store = configureStore({
  reducer: {
    smartAccount: smartAccountReducer,
  },
});
