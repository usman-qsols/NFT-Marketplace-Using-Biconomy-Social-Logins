import React from "react";
import styleIntro from "./introduction.module.css";
import Image from "next/image";
// import { useNavigate } from "react-router-dom";
import bulb from "../utilities/bulb.png";
import { useRouter } from "next/router";
import MintNft from "@/pages/Mint";

const Introduction = ({ smartAccount }) => {
  const router = useRouter();
  //   const navigate = useNavigate();
  // const SmartAccount = smartAccount;
  function isWalletConnected(endpoint) {
    if (localStorage.getItem("address") === "undefined") {
      alert("Please Connect your wallet");
    } else {
      console.log(smartAccount);
      router.push({
        pathname: endpoint,
      });
    }
  }
  return (
    <>
      <div className="w-[100vw] flex flex-col">
        <div className={styleIntro.intro_comp}>
          <div className={styleIntro.intro_detail_cont}>
            <h1>
              Unlock a world of digital treasures, where your dreams become
              tokens of reality.
            </h1>
            <h3>
              Welcome to our NFT marketplace, where art, culture, and innovation
              converge in the digital realm. Explore a diverse collection of
              unique and rare digital assets, each a masterpiece waiting to be
              discovered and owned. Join the NFT revolution today and start
              collecting, creating, and connecting with the future of digital
              ownership.
            </h3>

            <button
              className="mt-10 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 px-4 py-2 font-medium  transition-colors hover:from-green-500 hover:to-blue-600"
              onClick={() => isWalletConnected("/listnft")}
            >
              List your NFT
            </button>

            {/* <button
              className="mt-10 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 px-4 py-2 font-medium  transition-colors hover:from-green-500 hover:to-blue-600"
              onClick={() => isWalletConnected("/Mint")}
            >
              Mint your NFT
            </button> */}
          </div>
          <div className={styleIntro.intro_image_cont}>
            {/* <img src="../utilities/bulb.png" alt="sadasda" /> */}
            <Image src={bulb} alt="Image " width={300} height={400} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Introduction;
