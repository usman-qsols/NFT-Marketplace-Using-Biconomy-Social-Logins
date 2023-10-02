// import Navbar from "@/components/Navbar";
import dynamic from "next/dynamic";
import "@/styles/globals.css";
import "../components/navbar.css";
import "./mint.module.css";
import "@biconomy/web3-auth/dist/src/style.css";

// const Navbar = dynamic(
//   () => import("../components/Navbar").then((res) => res.default),
//   { ssr: false }
// );

export default function App({ Component, pageProps }) {
  return (
    <>
      {/* <Navbar /> */}
      <Component {...pageProps} />
    </>
  );
}
