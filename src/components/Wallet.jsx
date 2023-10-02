import { useEffect, useRef, useState, Fragment } from "react";
import SocialLogin from "@biconomy/web3-auth";
import { ethers } from "ethers";
import { ChainId } from "@biconomy/core-types";
import { bundler, paymaster } from "./constants";
import Transfer from "./Transfer";
import { useRouter } from "next/router";
import Image from "next/image";
import Logo from "../utilities/logoImage.png";

import {
  BiconomySmartAccount,
  BiconomySmartAccountConfig,
} from "@biconomy/account";
import MintNft from "../pages/Mint";
import Introduction from "./Introduction";

export default function Wallet() {
  const sdkRef = useRef(null);
  const [interval, enableInterval] = useState(false);
  const [loading, setLoading] = useState(false);
  const [, setProvider] = useState();
  const [smartAccount, setSmartAccount] = useState();

  const router = useRouter();

  // login() function
  async function login() {
    console.log("Interval", interval);
    console.log("sdk", sdkRef);
    if (!sdkRef.current) {
      const socialLoginSDK = new SocialLogin();
      const signature1 = await socialLoginSDK.whitelistUrl(
        "https://biconomy-social-logins-git-master-usman-2000.vercel.app"
      );
      await socialLoginSDK.init({
        chainId: ethers.utils.hexValue(ChainId.POLYGON_MUMBAI).toString(),
        network: "testnet",
        whitelistUrls: {
          "https://biconomy-social-logins-git-master-usman-2000.vercel.app":
            signature1,
        },
      });
      sdkRef.current = socialLoginSDK;
    }
    if (!sdkRef.current?.provider) {
      sdkRef.current?.showWallet();
      enableInterval(true);
    } else {
      console.log("hello");
      setupSmartAccount();
    }
  }
  // setupSmartAccount() function
  async function setupSmartAccount() {
    try {
      // If the SDK hasn't fully initialized, return early
      if (!sdkRef.current?.provider) return;

      // Hide the wallet if currently open
      sdkRef.current.hideWallet();

      // Start the loading indicator
      setLoading(true);

      // Initialize the smart account
      let web3Provider = new ethers.providers.Web3Provider(
        sdkRef.current?.provider
      );
      setProvider(web3Provider);
      const config = {
        signer: web3Provider.getSigner(),
        chainId: ChainId.POLYGON_MUMBAI,
        bundler: bundler,
        paymaster: paymaster,
      };
      const smartAccount = new BiconomySmartAccount(config);
      await smartAccount.init();

      // Save the smart account to a state variable
      setSmartAccount(smartAccount);
      localStorage.setItem("address", smartAccount.address);
      localStorage.setItem("smartAccount", smartAccount);
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  }

  async function logOut() {
    // Log out of the smart account
    await sdkRef.current?.logout();

    // Hide the wallet
    sdkRef.current?.hideWallet();

    // Reset state and stop the interval if it was started
    setSmartAccount(undefined);
    localStorage.setItem("address", undefined);

    enableInterval(false);
  }

  useEffect(() => {
    let configureLogin;
    if (interval) {
      configureLogin = setInterval(() => {
        if (!!sdkRef.current?.provider) {
          setupSmartAccount();
          clearInterval(configureLogin);
        }
      }, 1000);
    }
  }, [interval]);
  return (
    <Fragment>
      {/* Logout Button */}
      {smartAccount && (
        <div>
          <p className="absolute right-30 m-3 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 px-4 py-2 font-medium transition-all ">
            {smartAccount.address}
          </p>
          <button
            onClick={() => router.push("/TopNfts")}
            className="absolute right-40 m-3 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 px-4 py-2 font-medium transition-all hover:from-green-500 hover:to-blue-600 "
          >
            Top Nfts
          </button>
          <button
            onClick={logOut}
            className="absolute right-0 m-3 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 px-4 py-2 font-medium transition-all hover:from-green-500 hover:to-blue-600 "
          >
            Logout
          </button>
        </div>
      )}

      <div className="m-auto flex h-screen flex-col items-center justify-center gap-10 bg-gray-950">
        {/* Login Button */}
        {!smartAccount && !loading && (
          <div className="m-auto flex h-screen flex-col items-center justify-center gap-10 bg-gray-950">
            <Image src={Logo} width={400} height={200} />
            <h1 className=" text-4xl text-gray-50 font-bold tracking-tight lg:text-5xl">
              Welcome to CryptoCrafters NFT Marketplace
            </h1>

            <p>Please login, to enter in the Marketplace</p>
            <button
              onClick={login}
              className="mt-10 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 px-4 py-2 font-medium  transition-colors hover:from-green-500 hover:to-blue-600"
            >
              Login
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && <p>Loading account details...</p>}

        {smartAccount && (
          <div className="flex flex-col h-[100%]">
            <Fragment>
              {/* <MintNft smartAccount={smartAccount} /> */}
              <Introduction />
              <MintNft smartAccount={smartAccount} />
            </Fragment>
          </div>
        )}
      </div>
    </Fragment>
  );
}
