import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
// import LoadingModal from "./LoadingModal";
import { parseEther } from "ethers/lib/utils";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PaymasterMode } from "@biconomy/paymaster";

import {
  MARKETPLACE_CONTRACT_ABI,
  MARKETPLACE_CONTRACT_ADDRESS,
} from "@/components/constants";
import { useSelector } from "react-redux";
import { ethers } from "ethers";

const NftDetailPage = () => {
  const [data, setData] = useState({});
  const [ownerAddress, setOwnerAddress] = useState();
  const [contractAddress, setContractAddress] = useState();
  const [tokenId, setTokenId] = useState();
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState();
  const [ipfsHash, setIpfsHash] = useState();
  const [title, setTitle] = useState();
  const [openInputModal, setOpenInputModal] = useState(false);
  const [smartAccount, setSmartAccount] = useState({});
  // const [openLoader, setOpenLoader] = useState(true);

  const SmartAccount = useSelector(
    (state) => state.smartAccount.value.smartAccount
  );
  console.log("Smart Account", SmartAccount);

  const sellerAddress = "0xCDeD68e89f67d6262F82482C2710Ddd52492808a";

  const router = useRouter();

  async function fetchData() {
    try {
      await axios
        .get(
          `http://localhost:5004/nfts/getsinglenft/${router.query.NftDetails}`
        )
        .then((res) => {
          console.log("Res", res.data);
          setData(res.data);
          setContractAddress(res.data.contractAddress);
          setTokenId(res.data.tokenId);
          setPrice(res.data.price.toString());
          setOwnerAddress(res.data.ownerAddress);
        });
    } catch (error) {
      console.log({ error });
    }
  }
  useEffect(() => {
    console.log("check", data);
    console.log("router query", router.query.NftDetails);
    // console.log(
    //   "conditiobns ",
    //   SmartAccount.address.toLowerCase() ===
    //     ownerAddress.toString().toLowerCase()
    // );
    console.log(SmartAccount.address);
    console.log(ownerAddress);
    console.log(tokenId);
    fetchData();
    // setOwnerAddress(localStorage.getItem("address"));
    // setSmartAccount(JSON.parse(localStorage.getItem("smartAccount")));
    // console.log("Smart Account", SmartAccount);

    // console.log("smart Account ", smartAccount);
    // listingSuccess && window.location.reload();
  }, []);

  // ------------------------------------------------
  // ------------- Buying Nft -----------------------
  // ------------------------------------------------

  const buyNft = async (e) => {
    e.preventDefault();
    if (localStorage.getItem("address") === "undefined") {
      return alert("Please login first");
    }
    const MarketplaceContract = new ethers.Contract(
      MARKETPLACE_CONTRACT_ADDRESS,
      MARKETPLACE_CONTRACT_ABI,
      SmartAccount.provider
    );
    try {
      toast.info("Transferring Nft to your address...", {
        position: "top-right",
        autoClose: 15000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      const buyTx = await MarketplaceContract.populateTransaction.purchaseNft(
        tokenId,
        contractAddress
      );
      console.log("Purchasing tx", buyTx.data);

      const tx1 = {
        to: MARKETPLACE_CONTRACT_ADDRESS,
        data: buyTx.data,
        value: parseEther(price),
      };

      console.log("here before userop");
      let userOp = await SmartAccount.buildUserOp([tx1]);
      console.log({ userOp });
      const biconomyPaymaster = SmartAccount.paymaster;
      console.log(biconomyPaymaster);
      console.log(SmartAccount);
      let paymasterServiceData = {
        mode: PaymasterMode.SPONSORED,
        // calculateGasLimits: true,
      };
      console.log("Hello");
      const paymasterAndDataResponse =
        await biconomyPaymaster.getPaymasterAndData(
          userOp,
          paymasterServiceData
        );
      console.log("Hello2");

      userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;
      console.log("Hello3");
      const userOpResponse = await SmartAccount.sendUserOp(userOp);
      console.log("Hello4");
      console.log("userOpHash", userOpResponse);
      const { receipt } = await userOpResponse.wait(1);
      console.log("txHash", receipt.transactionHash);
      toast.success(
        await axios
          .put(
            `http://localhost:5004/nfts/updatenft/${router.query.NftDetails}`,
            {
              ownerAddress,
              active: false,
            }
          )
          .then((result) => console.log(result.data)),
        `Success! Here is your transaction:${receipt.transactionHash} `,
        {
          position: "top-right",
          autoClose: 18000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        },
        console.log("Before api")
      );

      // window.location.reload();
    } catch (err) {
      console.error(err);
      console.log(err);
    }
  };

  const listingNft = async (e) => {
    e.preventDefault();
    const contract = new ethers.Contract(
      MARKETPLACE_CONTRACT_ADDRESS,
      MARKETPLACE_CONTRACT_ABI,
      SmartAccount.provider
    );
    try {
      toast.info("Listing your NFT to our Marketplace...", {
        position: "top-right",
        autoClose: 15000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      const listTx = await contract.populateTransaction.listNft(
        contractAddress,
        tokenId,
        price
      );
      console.log("listing data", listTx.data);
      console.log("Token Id = ", tokenId);
      console.log("Price", parseEther(price.toString()));
      console.log("Contract Address", contractAddress);

      const tx1 = {
        to: MARKETPLACE_CONTRACT_ADDRESS,
        data: listTx.data,
        value: parseEther("0.0025"),
      };
      console.log("here before userop");
      let userOp = await SmartAccount.buildUserOp([tx1]);
      console.log({ userOp });
      const biconomyPaymaster = SmartAccount.paymaster;
      console.log("biconomy paymaster ", biconomyPaymaster);
      console.log("Smart Account ", SmartAccount);
      let paymasterServiceData = {
        mode: PaymasterMode.SPONSORED,
        // calculateGasLimits: true,
      };
      console.log("Hello");
      const paymasterAndDataResponse =
        await biconomyPaymaster.getPaymasterAndData(
          userOp,
          paymasterServiceData
        );
      console.log("Hello2");

      userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;
      console.log("Hello3");
      const userOpResponse = await SmartAccount.sendUserOp(userOp);
      console.log("Hello4");
      console.log("userOpHash", userOpResponse);
      const { receipt } = await userOpResponse.wait(1);
      console.log("txHash", receipt.transactionHash);
      console.log("Contract run");
      toast.success(
        `Success Listing! Here is your transaction:${receipt.transactionHash} `,
        {
          position: "top-right",
          autoClose: 18000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        },
        await axios
          .put(
            `http://localhost:5004/nfts/updatenft/${router.query.NftDetails}`,
            {
              price,
              active: true,
            }
          )
          .then((result) => console.log(result)),
        setOpenApproveModal(!openApproveModal)
      );
    } catch (err) {
      console.error(err);
      console.log(err);
    }
  };

  return (
    <>
      <section className="text-gray-700 body-font overflow-hidden bg-white">
        <div className="container px-5 py-24 mx-auto">
          <div className="lg:w-4/5 mx-auto flex flex-wrap">
            <img
              alt="ecommerce"
              className="lg:w-1/2 w-full object-cover object-center rounded border border-gray-200"
              src={data.ipfsHash}
            />
            <div className="lg:w-1/2 w-full lg:pl-10 lg:py-6 mt-6 lg:mt-0">
              <h1 className="text-gray-900 text-3xl title-font font-medium mb-1">
                {data.title}
              </h1>

              <p className="leading-relaxed">{data.description}</p>
              <p className="leading-relaxed">
                Owner Address: {data.ownerAddress}
              </p>
              <p className="leading-relaxed">
                Contract Address : {data.contractAddress}
              </p>
              <p className="leading-relaxed">Token Id : {data.tokenId}</p>
              {/* <p className="leading-relaxed">
                  IpfsHash : {data.ipfsHash.slice(0, 36)}...
                </p> */}

              <div className="flex">
                <span className="title-font font-medium text-2xl text-gray-900">
                  Eth {data.price}
                </span>
                {SmartAccount.address === ownerAddress ? (
                  ""
                ) : (
                  <button
                    className="flex ml-auto text-white bg-red-500 border-0 py-2 px-6 focus:outline-none hover:bg-red-600 rounded"
                    onClick={buyNft}
                  >
                    Buy Nft
                  </button>
                )}
                {!data.active && SmartAccount.address === ownerAddress ? (
                  <button
                    className="flex ml-auto text-white bg-red-500 border-0 py-2 px-6 focus:outline-none hover:bg-red-600 rounded"
                    onClick={() => setOpenInputModal(!openInputModal)}
                  >
                    Re-sell
                  </button>
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>
          {/* {openLoader && <LoadingModal />} */}
        </div>
      </section>
      <ToastContainer />
      {openInputModal && (
        <div className="flex flex-wrap min-h-screen w-full content-center justify-center py-10 modal fixed">
          <div className="flex shadow-md">
            <div className="flex flex-wrap content-center justify-center rounded-md bg-white w-[24rem] h-[24rem] border border-red-500 border-dashed">
              <div className="w-72">
                <h1 className="text-xl font-semibold">Welcome back</h1>
                <small className="text-gray-400">
                  Welcome back! Please enter the price on which you want to
                  re-sell your nft
                </small>

                <form className="mt-4">
                  <div className="mb-3">
                    <label className="mb-2 block text-xs font-semibold">
                      Price
                    </label>
                    <input
                      placeholder="Enter Price"
                      class="block w-full rounded-md border border-gray-300 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 py-1 px-1.5 text-gray-500"
                      onChange={(e) => {
                        if (isNaN(e.target.value)) {
                          alert("You can only write price in numbers");
                          e.target.value = ""; // Clear the input field
                        } else {
                          setPrice(e.target.value);
                        }
                      }}
                      required={true}
                    />
                  </div>

                  <div className="mb-3">
                    <button
                      className="mb-1.5 block w-full text-center text-white bg-red-500 hover:bg-red-600 px-2 py-1.5 rounded-md"
                      onClick={listingNft}
                    >
                      {listIsLoading ? "Waiting for the approval.." : "List"}
                    </button>
                    <button
                      className="mb-1.5 block w-[30px] text-center text-white bg-red-500 hover:bg-red-600 px-2 py-1.5 rounded-md"
                      onClick={() => setOpenInputModal(!openInputModal)}
                    >
                      X
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NftDetailPage;
