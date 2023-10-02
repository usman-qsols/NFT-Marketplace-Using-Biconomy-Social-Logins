import { useEffect, useState } from "react";
import React from "react";
// import "../styles/mintnft.css";
import styleMint from "./mint.module.css";
import { ethers } from "ethers";
import {
  NFT_CONTRACT_ABI,
  NFT_CONTRACT_ADDRESS,
  MARKETPLACE_CONTRACT_ADDRESS,
  MARKETPLACE_CONTRACT_ABI,
} from "../components/constants";
import {
  IHybridPaymaster,
  SponsorUserOperationDto,
  PaymasterMode,
} from "@biconomy/paymaster";
import { BiconomySmartAccount } from "@biconomy/account";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";

import { uploadFileToIPFS, uploadJSONToIPFS } from "../components/pinata";
import axios from "axios";
import { parseEther } from "ethers/lib/utils";

const MintNft = ({ smartAccount }) => {
  const [title, setTitle] = useState();
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState();
  const [ipfsHash, setIpfsHash] = useState();
  const [ownerAddress, setOwnerAddress] = useState(); // wallet address
  const [fileURL, setFileURL] = useState();
  const [message, updateMessage] = useState("");
  const [tokenId, setTokenId] = useState(null);
  const [tokenIdForListing, setTokenIdForListing] = useState(null);
  const [openListingModal, setOpenListingModal] = useState(false);
  const [openAnimation, setOpenAnimation] = useState(false);
  const [minted, setMinted] = useState(false);
  const [listed, setListed] = useState(false);

  const active = true;
  const sellerAddress = "0xCDeD68e89f67d6262F82482C2710Ddd52492808a";
  const contractAddress = "0x43c99947D6E25497Dc69351FaBb3025F7ACC2A6b";

  useEffect(() => {
    setOwnerAddress(localStorage.getItem("address"));
    // setTokenIdForListing(tokenId - 1);
  });

  const handleMint = async (e) => {
    e.preventDefault();
    const contract = new ethers.Contract(
      NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      smartAccount.provider
    );
    const MarketplaceContract = new ethers.Contract(
      MARKETPLACE_CONTRACT_ADDRESS,
      MARKETPLACE_CONTRACT_ABI,
      smartAccount.provider
    );
    try {
      toast.info("Minting your NFT...", {
        position: "top-right",
        autoClose: 15000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      const minTx = await contract.populateTransaction.safeMint(
        ownerAddress,
        ipfsHash
      );
      console.log("minting tx", minTx.data);

      const tx1 = {
        to: NFT_CONTRACT_ADDRESS,
        data: minTx.data,
      };

      const approveContract =
        await contract.populateTransaction.setApprovalForAll(
          "0x43c99947D6E25497Dc69351FaBb3025F7ACC2A6b",
          true
        );

      console.log("Approved data ", approveContract.data);

      const tx2 = {
        to: NFT_CONTRACT_ADDRESS,
        data: approveContract.data,
      };

      // const lisTx = await MarketplaceContract.populateTransaction.listNft(
      //   contractAddress,
      //   40,
      //   parseEther(price)
      // );
      // console.log("Listing data ", lisTx.data);

      // const tx3 = {
      //   to: MARKETPLACE_CONTRACT_ADDRESS,
      //   data: lisTx.data,
      //   value: parseEther("0.0026"),
      // };

      // const approveMarketplaceContract =
      //   await contract.populateTransaction.setApprovalForAll(
      //     "0xCDeD68e89f67d6262F82482C2710Ddd52492808a",
      //     true
      //   );

      // console.log(approveMarketplaceContract.data);

      // const tx3 = {
      //   to: NFT_CONTRACT_ADDRESS,
      //   data: approveMarketplaceContract.data,
      // };

      const getTokenId = await contract.getTokenId();
      // setTokenId(getTokenId.toString());
      // console.log("Token Id is : ", tokenId);

      console.log("here before userop");
      let userOp = await smartAccount.buildUserOp([tx1, tx2]);
      console.log({ userOp });
      const biconomyPaymaster = smartAccount.paymaster;
      console.log(biconomyPaymaster);
      console.log(smartAccount);
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
      const userOpResponse = await smartAccount.sendUserOp(userOp);
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
        }
      );
      setTokenId(getTokenId.toString());
      // console.log("Token Id is : ", Number(tokenId) + 1);
      setTokenIdForListing(Number(tokenId) + 1);

      // toast.success
      //   ? async (data) => {
      //       console.log("function before on success");
      //       await axios
      //         .post("http://localhost:5004/nfts/createnft", {
      //           title,
      //           price,
      //           description,
      //           ipfsHash,
      //           ownerAddress,
      //           contractAddress,
      //           sellerAddress,
      //           tokenId,
      //           active,
      //         })
      //         .then((result) => console.log(result));
      //       console.log("Function on success completed");
      //       setListed(true);
      //       setOpenListingModal(!openListingModal);
      //     }
      //   : console.log("Not listed on DB");

      // window.location.reload();
      setOpenListingModal(!openListingModal);
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
      smartAccount.provider
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
        parseEther(price)
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
      let userOp = await smartAccount.buildUserOp([tx1]);
      console.log({ userOp });
      const biconomyPaymaster = smartAccount.paymaster;
      console.log("biconomy paymaster ", biconomyPaymaster);
      console.log("Smart Account ", smartAccount);
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
      const userOpResponse = await smartAccount.sendUserOp(userOp);
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
          .then((result) => console.log(result))
      );

      setOpenListingModal(!openListingModal);
    } catch (err) {
      console.error(err);
      console.log(err);
    }
  };

  async function OnChangeFile(e) {
    var file = e.target.files[0];
    try {
      //upload the file to IPFS

      updateMessage("Uploading image.. please dont click anything!");
      const response = await uploadFileToIPFS(file);
      if (response.success === true) {
        updateMessage("");
        console.log("Uploaded image to Pinata: ", response.pinataURL);
        setIpfsHash(response.pinataURL);
        setFileURL(response.pinataURL);
      }
    } catch (e) {
      console.log("Error during file upload", e);
    }
  }

  async function uploadMetadataToIPFS() {
    //Make sure that none of the fields are empty
    if (!title || !description || !price || !fileURL) {
      updateMessage("Please fill all the fields!");
      return -1;
    }

    const nftJSON = {
      title,
      description,
      price,
      image: fileURL,
    };

    try {
      //upload the metadata JSON to IPFS
      const response = await uploadJSONToIPFS(nftJSON);
      if (response.success === true) {
        console.log("Uploaded JSON to Pinata: ", response);
        return response.pinataURL;
      }
    } catch (e) {
      console.log("error uploading JSON metadata:", e);
    }
  }

  // const modalsOpen = () => {
  //   setOpenAnimation(true);

  //   setTimeout(() => {
  //     setOpenAnimation(false);
  //     setOpenListingModal(!openListingModal);
  //   }, 5000); // 60000 milliseconds = 1 minute
  // };

  return (
    <div className={styleMint.mint_comp}>
      <h1>Mint Your Own Token</h1>
      <div className={styleMint.mint_form}>
        {/* <p>"{tokenIdForListing}" Nfts Minted</p> */}
        <p>The Contract address is :</p>
        <p>{contractAddress}</p>
        <p>Seller Address is : </p>
        <p>{sellerAddress}</p>
        <p>Listing price : 0.0025 ethers</p>

        <form className={styleMint.mint_form_inputs}>
          <label htmlFor="">Title</label>
          <input
            type="text"
            placeholder="Enter your nft title"
            onChange={(e) => setTitle(e.target.value)}
            required={true}
          />
          <label htmlFor="">Price (in ETH)</label>
          <input
            placeholder="Min 0.01 ETH"
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
          <label htmlFor="">Description</label>
          <input
            type="text"
            placeholder="Enter the description of your nft"
            onChange={(e) => setDescription(e.target.value)}
            required={true}
          />

          <label>Upload Image</label>
          <input
            className={styleMint.uploadImage}
            type={"file"}
            onChange={OnChangeFile}
          ></input>
          <p>{message}</p>
          <button
            type="submit"
            className="mt-10 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 px-4 py-2 font-medium  transition-colors hover:from-green-500 hover:to-blue-600"
            onClick={handleMint}
          >
            Mint
          </button>
        </form>
        <ToastContainer />
      </div>
      {toast.success && openListingModal && (
        <div className="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-50 py-10">
          <div className="max-h-full w-full max-w-xl overflow-y-auto sm:rounded-2xl bg-white">
            <div className="w-full">
              <div className="m-8 my-20 max-w-[400px] mx-auto">
                <div className="mb-8">
                  <h1 className="mb-4 text-3xl font-extrabold text-black">
                    List your Nft to our Marketplace
                  </h1>
                  <p className="text-gray-600">
                    You are about to listing your nft to our marketplace. Hope
                    you will like our marketplace policies. By clicking the
                    below button you can list your NFT.
                  </p>
                </div>
                <div className="space-y-4">
                  <button
                    className="p-3 bg-black rounded-full text-white w-full font-semibold"
                    onClick={handleList}
                  >
                    List My Nft
                  </button>
                  {/* {listingSuccess ? (
                    <Link to={"/"}>
                      <button className="p-3 bg-white border rounded-full w-full font-semibold">
                        Go to main page
                      </button>
                    </Link>
                  ) : (
                    <p
                      className="flex border rounded-full w-[25px] justify-center bg-red p-3 cursor-pointer font-bold"
                      onClick={() => setOpenListingModal(!openListingModal)}
                    >
                      X
                    </p>
                  )} */}
                  <p
                    className="flex border rounded-full w-[25px] justify-center bg-red p-3 cursor-pointer font-bold text-black"
                    onClick={() => setOpenListingModal(!openListingModal)}
                  >
                    X
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* {openAnimation && <MintingNftModal h2={"Please wait for some time..."} />} */}
    </div>
  );
};

export default MintNft;
