"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";
import { Product } from "@/interfaces";
import { Image } from "@mantine/core";

export default function MyItemsAndSell() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [ownedItmesFetched, setOwnedItemsFetched] = useState(false);

  const [ownedItemIds, setOwnedItemIds] = useState<string>();
  const [ownedItems, setOwnedItems] = useState<Product[]>([]);

  const fetchOwnedItems = async () => {
    setOwnedItemsFetched(false);
    try {
      const result = await axios.post(`/api/user/owned`, { user_id: user?.id });
      const tempIds = result.data.rows[0].owned_items;
      setOwnedItemIds(tempIds);
      console.log(tempIds.trim().split(" "))
      if(result && tempIds){
        const batchResult = await axios.post(`/api/products/batch`, {ids: tempIds.trim().split(" "),  user_id: user?.id });
        if(batchResult){
            console.log(batchResult)
            setOwnedItems(batchResult.data.rows);
            setOwnedItemsFetched(true);
        }
      }
    } catch (error) {
      console.error("Failed to fetch owned items: ", error);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchOwnedItems();
    }
  }, [user]);

  if (isLoaded && user && ownedItmesFetched)
    return (
      <>
        <div className="flex flex-col items-center">
          <div className="w-[70%]">
            <div className="text-2xl font-semibold border-b-1 flex flex-col mb-5">Owned Items</div>
            {ownedItems?.map((product, index)=>{
                return (
                <div key={product.name+index} className="w-[100%] flex items-center gap-5">
                    <Image src={`/images/${product.path}`} radius={"lg"} className="w-70!"/>
                    <span className="font-semibold flex text-xl">{product.name}</span>
                </div>);
            })}
          </div>
        </div>
      </>
    );
  else {
    return (
      <div className="flex flex-col items-center h-[100vh]">
        <div className="loader"></div>
      </div>
    );
  }
}
