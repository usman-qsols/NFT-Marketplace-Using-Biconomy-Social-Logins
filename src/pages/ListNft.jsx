import React, { useState } from "react";
import axios from "axios";
import listStyle from "./listnft.module.css";
import { useAppSelector } from "@/redux/store";
import { useSelector } from "react-redux";
import { ethers } from "ethers";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { parseEther } from "ethers/lib/utils";
import { PaymasterMode } from "@biconomy/paymaster";

import {
  NFT_CONTRACT_ABI,
  NFT_CONTRACT_ADDRESS,
  MARKETPLACE_CONTRACT_ADDRESS,
  MARKETPLACE_CONTRACT_ABI,
} from "@/components/constants";

const ListNft = () => {
  const [title, setTitle] = useState();
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState();
  const [ipfsHash, setIpfsHash] = useState();
  const [ownerAddress, setOwnerAddress] = useState();
  const [contractAddress, setContractAddress] = useState();
  const [tokenId, setTokenId] = useState();
  const [active, setActive] = useState(false);
  const [approve, setApprove] = useState(false);
  const [openApproveModal, setOpenApproveModal] = useState(false);

  const sellerAddress = MARKETPLACE_CONTRACT_ADDRESS;
  const SmartAccount = useSelector(
    (state) => state.smartAccount.value.smartAccount
  );
  console.log("Smart Account", SmartAccount);

  // ------------ ///////////////////////----------------
  //          Listing Nft Functionality here
  // ------------ ///////////////////////----------------

  const approveContracts = async (e) => {
    e.preventDefault();
    setApprove(true);
    const nftContract = new ethers.Contract(
      NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      SmartAccount.provider
    );

    try {
      toast.info("Approving Marketplace to sell your Nft on your behalf...", {
        position: "top-right",
        autoClose: 15000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      const approveMarketplaceTx =
        await nftContract.populateTransaction.setApprovalForAll(
          "0xcded68e89f67d6262f82482c2710ddd52492808a",
          true
        );
      console.log("approving tx", approveMarketplaceTx.data);

      const tx1 = {
        to: NFT_CONTRACT_ADDRESS,
        data: approveMarketplaceTx.data,
      };

      const approveNftContract =
        await nftContract.populateTransaction.setApprovalForAll(
          "0x43c99947D6E25497Dc69351FaBb3025F7ACC2A6b",
          true
        );

      console.log("approveNftContract data ", approveNftContract.data);

      const tx2 = {
        to: NFT_CONTRACT_ADDRESS,
        data: approveNftContract.data,
      };

      console.log("here before userop");
      let userOp = await SmartAccount.buildUserOp([tx1, tx2]);
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
      setMinted(true);
      toast.success(
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
        setApprove(false)
      );
    } catch (err) {
      console.error(err);
      console.log(err);
    }
  };

  const handleList = async (e) => {
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
          .post("http://localhost:5004/nfts/createnft", {
            title,
            price,
            description,
            ipfsHash,
            ownerAddress,
            contractAddress,
            sellerAddress,
            tokenId,
            active,
          })
          .then((result) => console.log(result)),
        setOpenApproveModal(!openApproveModal)
      );
    } catch (err) {
      console.error(err);
      console.log(err);
    }
  };

  return (
    <div className={listStyle.createnft_comp}>
      <h1>List your NFT on our Marketplace</h1>

      <div className={listStyle.createnft_form}>
        <form>
          <label htmlFor="">Title</label>
          <input
            type="text"
            placeholder="Enter your nft title"
            onChange={(e) => setTitle(e.target.value)}
            required={true}
          />
          <label htmlFor="">Price</label>
          <input
            type="number"
            placeholder="Enter your listing price"
            onChange={(e) => setPrice(e.target.value)}
            required={true}
          />
          <label htmlFor="">Description</label>
          <input
            type="text"
            placeholder="Enter the description of your nft"
            onChange={(e) => setDescription(e.target.value)}
            required={true}
          />
          <label htmlFor="">IPFS Hash</label>
          <input
            type="text"
            placeholder="Enter ipfs hash"
            onChange={(e) => setIpfsHash(e.target.value)}
            required={true}
          />
          <label htmlFor="">Owner Address</label>
          <input
            type="text"
            placeholder="Enter your address"
            onChange={(e) => setOwnerAddress(e.target.value)}
            required={true}
          />
          <label htmlFor="">Contract Address</label>
          <input
            type="text"
            placeholder="Enter contract address where you minted nft"
            onChange={(e) => setContractAddress(e.target.value)}
            required={true}
          />
          <label htmlFor="">Token Id</label>
          <input
            type="text"
            placeholder="Enter token id of your nft"
            onChange={(e) => setTokenId(e.target.value)}
            required={true}
          />

          <div className={listStyle.checkbox_cont}>
            <input
              className={listStyle.checkbox}
              type="checkbox"
              onChange={(e) => setActive(e.target.checked)}
              required={true}
            />
            <label htmlFor="">Active for listing?</label>
          </div>

          <button
            type="submit"
            className="mt-10 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 px-4 py-2 font-medium  transition-colors hover:from-green-500 hover:to-blue-600"
            onClick={handleList}
          >
            List
          </button>
          {/* <button onClick={() => setApprove(true)}>
            {listingSuccess ? "Approve Marketplace" : ""}
          </button> */}
        </form>
      </div>
      <ToastContainer />
      {openApproveModal && (
        <div className="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-50 py-10">
          <div className="max-h-full w-full max-w-xl overflow-y-auto sm:rounded-2xl bg-white">
            <div className="w-full">
              <div className="m-8 my-20 max-w-[400px] mx-auto">
                <div className="mb-8">
                  <h1 className="mb-4 text-3xl font-extrabold text-black">
                    Approve Marketplace to transfer Nft
                  </h1>
                  <p className="text-gray-600">
                    You are going to approve CryptoCrafters to transfer your
                    NFTs to the buyer address. It will make the process smooth.
                    You should not to worry about your Nft.
                  </p>
                </div>
                <div className="space-y-4">
                  <button
                    className="p-3 bg-black rounded-full text-white w-full font-semibold"
                    onClick={approveContracts}
                  >
                    {approve
                      ? "Approving Marketplace.."
                      : "Approve Marketplace"}
                  </button>

                  <p
                    className="flex border rounded-full w-[25px] justify-center bg-red p-3 cursor-pointer font-bold text-black"
                    onClick={() => setOpenApproveModal(!openApproveModal)}
                  >
                    X
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListNft;
