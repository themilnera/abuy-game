"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";
import { Product } from "@/interfaces";
import { Button, Image } from "@mantine/core";
import { ProductQuantity } from "@/interfaces";

export default function MyItemsAndSell() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [ownedItmesFetched, setOwnedItemsFetched] = useState(false);

  const [ownedItemIds, setOwnedItemIds] = useState<string[]>();
  const [ownedPqs, setOwnedPqs] = useState<ProductQuantity[]>([]);

  const fetchOwnedItems = async () => {
    setOwnedItemsFetched(false);
    try {
      const result = await axios.post(`/api/user/owned`, { user_id: user?.id });

      const tempIds: string[] = result.data.rows[0].owned_items.trim().split(" ");
      setOwnedItemIds(tempIds);

      let productIdsOnly = tempIds.map((id) => id.split("&q=")[0]);

      if (result && tempIds) {
        const batchResult: Product[] = (await axios.post(`/api/products/batch`, { ids: productIdsOnly, user_id: user?.id })).data.rows;
        if (batchResult) {
          const tempPqs: ProductQuantity[] = []; 
          tempIds.forEach((id) => {
            for(let i = 0; i < batchResult.length; i++){
              console.log(id.split("&q="))
              if (id.split("&q=")[0] == batchResult[i].id) {
                tempPqs.push({ product: batchResult[i], quantity: Number(id.split("&q=")[1]) })
              }
            }
          });
          if(tempPqs.length > 0) setOwnedPqs(tempPqs);
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
        <div className="flex flex-col items-center h-[90vh]">
          <div className="w-[70%]">
            <div className="text-2xl font-semibold border-b-1 flex flex-col mb-5">Owned Items</div>
            {ownedPqs?.map((pq, index) => {
              return (
                <div key={pq.product.name + index} className="w-[100%] flex md:flex-row flex-col items-center gap-10 bg-[#bdbcbc] p-7 rounded-2xl">
                  <Image src={`/images/${pq.product.path}`} radius={"lg"} className="w-70!" />
                  <span className="font-semibold flex text-2xl">{pq.product.name}</span>
                  <span className="flex flex-col gap-2">
                    <span className="font-semibold">You own {pq.quantity} of these</span>
                    <span>Valued between ${pq.product.lowest_price} and ${pq.product.highest_price}</span>
                  </span>
                  <Button radius={"lg"} size="md" className="md:ml-auto">List This Item</Button>
                </div>
              );
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
