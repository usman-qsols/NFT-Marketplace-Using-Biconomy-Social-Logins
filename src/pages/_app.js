// import Navbar from "@/components/Navbar";
import dynamic from "next/dynamic";
import "@/styles/globals.css";
import "../components/navbar.css";
import "./mint.module.css";
import "@biconomy/web3-auth/dist/src/style.css";
import { store } from "../redux/store";
import { Provider } from "react-redux";

// const Navbar = dynamic(
//   () => import("../components/Navbar").then((res) => res.default),
//   { ssr: false }
// );

export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}
