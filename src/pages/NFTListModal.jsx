import React from "react";

const NFTListModal = () => {
  return (
    <div className="flex flex-wrap min-h-screen w-full content-center justify-center py-10 modal fixed">
      <div className="flex shadow-md">
        <div className="flex flex-wrap content-center justify-center rounded-md bg-white w-[24rem] h-[24rem] border border-red-500 border-dashed">
          <div className="w-72">
            <h1 className="text-xl font-semibold">Welcome back</h1>
            <small className="text-gray-400">
              Welcome back! Please enter the price on which you want to re-sell
              your nft
            </small>

            <form className="mt-4">
              <div className="mb-3">
                <label className="mb-2 block text-xs font-semibold">
                  Price
                </label>
                <input
                  placeholder="Enter Price"
                  className="block w-full rounded-md border border-gray-300 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 py-1 px-1.5 text-gray-500"
                  //   onChange={(e) => {
                  //     if (isNaN(e.target.value)) {
                  //       alert("You can only write price in numbers");
                  //       e.target.value = ""; // Clear the input field
                  //     } else {
                  //       setPrice(e.target.value);
                  //     }
                  //   }}
                  required={true}
                />
              </div>

              <div className="mb-3">
                <button
                  className="mb-1.5 block w-full text-center text-white bg-red-500 hover:bg-red-600 px-2 py-1.5 rounded-md"
                  onClick={"listingNft"}
                >
                  List Your Nft
                </button>
                <button
                  className="mb-1.5 block w-[30px] text-center text-white bg-red-500 hover:bg-red-600 px-2 py-1.5 rounded-md"
                  //   onClick={() => setOpenInputModal(!openInputModal)}
                >
                  X
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTListModal;
