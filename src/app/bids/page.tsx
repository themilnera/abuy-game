"use client";
import Recommended from "@/components/recommended";
import { Product, ProductQuantity } from "@/interfaces";
import { useUser } from "@clerk/nextjs";
import { Button, Image, NumberInput } from "@mantine/core";
import { IconCancel, IconTrash } from "@tabler/icons-react";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Bid {
  product: Product;
  amount: number;
}

export default function Bids() {
  const { user, isLoaded } = useUser();
  const [emptyBidsList, setEmptyBidsList] = useState(false);
  const [bidsFetched, setBidsFetched] = useState(false);
  const [bidIds, setBidIds] = useState<string[]>();
  const [bids, setBids] = useState<Bid[]>([]);

  const removeUserBid = async (bid: Bid) => {
    try {
      const filteredBidIds = bidIds?.filter((id) => {
        return id.split("&bid=")[0] !== bid.product.id && id.split("&bid=")[1] !== bid.amount.toString();
      });
      if (filteredBidIds?.length === 0) {
        setEmptyBidsList(true);
      }
      setBidIds(filteredBidIds);
      const filteredBidProducts = bids.filter((b) => b != bid);
      setBids(filteredBidProducts);
      const newBidString = filteredBidIds?.join(" ");
      await axios.put(`/api/user/bid/remove`, { user_id: user?.id, cart_items: newBidString });
    } catch (error) {
      console.error("Failed to remove bid: ", error);
    }
  };

  const fetchUserBids = async () => {
    try {
      const result = await axios.post(`api/user/bid`, { user_id: user?.id });
      const fetchedBidIds: string[] = result.data.rows[0].bid_items?.trim().split(" ");
      setBidIds(fetchedBidIds);

      if (fetchedBidIds && fetchedBidIds.length > 0 && fetchedBidIds[0].trim() !== "") {
        let productIds: string[] = [];
        let bidAmounts: number[] = [];
        fetchedBidIds.forEach((bid) => {
          const productIdBid = bid.split("&bid=");
          productIds.push(productIdBid[0]);
          bidAmounts.push(Number(productIdBid[1]));
        });

        const batchResult = await axios.post(`/api/products/batch`, { ids: productIds, user_id: user?.id });
        
        if (batchResult) {
          let tempBids: Bid[] = [];
          for(let i = 0; i < productIds.length; i++){
            tempBids.push({ product: batchResult.data.rows.find(p => p.id == productIds[i]), amount: bidAmounts[i]})
          }
          setBids(tempBids);
        }
      } else {
        setEmptyBidsList(true);
      }
    } catch (error) {
      console.error("Failed to fetch user bids: ", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserBids();
    }
  }, [user]);

  if (bids.length !== 0) {
    return (
      <>
        <div className="flex flex-col items-center">
          <div className="text-2xl font-bold">My Bids</div>
          <div className="w-[70%] min-h-140 rounded-2xl mt-10 flex md:flex-row flex-col gap-5">
            <div className="flex-5 flex flex-col rounded-2xl   h-[100%]">
              {bids.map((bid, index) => {
                return (
                  <div key={bid.product.name + index} className="bg-[#c5c5c5] border-1 rounded-2xl mb-2 border-[#888888]">
                    <div className="flex md:flex-row flex-col items-center p-5 justify-between ">
                      <div className="flex items-center gap-5">
                        <Image src={`/images/${bid.product.path}`} w={120} h={120} radius={"lg"}></Image>
                        <span className="font-semibold md:text-xl text-md text-center p-3 ">
                          <Link className="hover:underline underline-offset-5" href={`/product/${bid.product.id}`}>
                            {bid.product.name}
                          </Link>
                        </span>
                      </div>
                      <div className="flex items-center gap-5 md:mt-0 mt-5">
                        <span className="flex items-center font-semibold md:text-xl text-md text-center tracking-tight mr-4 border-b-1 gap-5">
                          <span className="font-medium">Current Bid:</span> <span className="font-bold">${bid.amount}</span>
                        </span>
                        <span
                          className="hover:cursor-pointer"
                          onClick={() => {
                            //removeProductFromCart(product);
                          }}>
                          <Button
                            radius={"lg"}
                            bg={"#661919"}
                            onClick={() => {
                              removeUserBid(bid);
                            }}>
                            Cancel Bid
                          </Button>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-md">
            Note: If you don't have the funds needed to pay out your bid when it sells, the item will be sold to the next highest bidder.
          </div>
        </div>
      </>
    );
  } else if (!emptyBidsList) {
    return (
      <div className="flex flex-col items-center h-[90vh]">
        <div className="loader"></div>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col items-center h-[70vh]">
        <div className="text-2xl font-semibold">You have no active bids!</div>
        <Recommended />
      </div>
    );
  }
}
