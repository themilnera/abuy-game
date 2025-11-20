"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";
import { Product } from "@/interfaces";
import { Button, Image, Tooltip, Modal, TextInput, NumberInput, Textarea } from "@mantine/core";
import { ProductQuantity } from "@/interfaces";
import { useDisclosure } from "@mantine/hooks";
import Recommended from "@/components/recommended";

export default function MyItemsAndSell() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [noItems, setNoItems] = useState(false);
  const [ownedItmesFetched, setOwnedItemsFetched] = useState(false);

  const [ownedItemIds, setOwnedItemIds] = useState<string[]>();
  const [ownedPqs, setOwnedPqs] = useState<ProductQuantity[]>([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [chosenItem, setChosenItem] = useState<ProductQuantity>();

  const fetchOwnedItems = async () => {
    setOwnedItemsFetched(false);
    try {
      const result = await axios.post(`/api/user/owned`, { user_id: user?.id });

      const tempIds: string[] = result.data.rows[0].owned_items.split(" ");
      setOwnedItemIds(tempIds);

      let productIdsOnly = tempIds.map((id) => id.split("&q=")[0]);

      if (result && tempIds.length > 0 && tempIds[0].trim() != "") {
        const batchResult: Product[] = (await axios.post(`/api/products/batch`, { ids: productIdsOnly, user_id: user?.id })).data.rows;
        if (batchResult) {
          const tempPqs: ProductQuantity[] = [];
          tempIds.forEach((id) => {
            for (let i = 0; i < batchResult.length; i++) {
              console.log(id.split("&q="));
              if (id.split("&q=")[0] == batchResult[i].id) {
                tempPqs.push({ product: batchResult[i], quantity: Number(id.split("&q=")[1]) });
              }
            }
          });
          if (tempPqs.length > 0) setOwnedPqs(tempPqs);
          setOwnedItemsFetched(true);
        }
      } else if (tempIds.length === 0 || tempIds[0].trim() === "") {
        setNoItems(true);
      }
    } catch (error) {
      console.error("Failed to fetch owned items: ", error);
    }
  };

  const getRarityDescription = (rarity: Number) => {
    if (rarity == 0) {
      return "(most common)";
    } else if (rarity == 1) {
      return "(common)";
    } else if (rarity == 2) {
      return "(somewhat common)";
    } else if (rarity == 3) {
      return "(somewhat rare)";
    } else if (rarity == 4) {
      return "(rare)";
    } else if (rarity == 5) {
      return "(very rare)";
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchOwnedItems();
    }
  }, [user]);

  if (isLoaded && user && ownedItmesFetched && !noItems)
    return (
      <>
        <Modal
          size={"lg"}
          opened={opened}
          radius={"md"}
          onClose={() => {
            close();
            setChosenItem(undefined);
          }}
          withCloseButton={true}
          centered>
          {chosenItem ? (
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="text-2xl font-semibold">Selling Item:</span>
              <span className="text-xl mb-5">{chosenItem.product.name}</span>
              <div className="flex w-[80%] items-center justify-center p-2 mb-5">
                <Image src={`/images/${chosenItem.product.path}`} h={180} radius={"lg"} className="flex-2" />
                <div className="flex-3 flex flex-col gap-2 justify-center items-end">
                  <TextInput
                    radius={"md"}
                    className="text-center w-[80%]"
                    required
                    label="Product Name"
                    maxLength={50}
                    defaultValue={chosenItem.product.name}></TextInput>
                  <div className="flex justify-end gap-7">
                    <NumberInput
                      radius={"md"}
                      className="text-center w-[40%]"
                      label="Price"
                      max={999999999}
                      min={1}
                      defaultValue={Number(chosenItem.product.current_price)}></NumberInput>
                    <NumberInput
                      radius={"md"}
                      className="text-center w-[30%]"
                      label="Quantity"
                      max={chosenItem.quantity}
                      min={1}
                      defaultValue={Number(chosenItem.quantity)}></NumberInput>
                  </div>
                </div>
              </div>
              <Tooltip label="Writing a strong description helps an item sell, keep your target audience in mind.">
                <span>Description (?)</span>
              </Tooltip>
              <Textarea maxLength={1000} rows={5} className="w-[80%]! mb-5"></Textarea>
              <Button
                radius={"lg"}
                size="md"
                className="bg-blue-900!"
                onClick={() => {
                  //submit to db, remove from owned
                  //go below and add a Listed Items section that checks if an owned item is in the listed table
                  close();
                }}>
                List Item
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="loader"></div>
            </div>
          )}
        </Modal>
        <div className="flex flex-col items-center h-[90vh]">
          <div className="w-[70%]">
            <div className="text-2xl font-semibold border-b-1 flex flex-col mb-5">Owned Items</div>
            {ownedPqs?.map((pq, index) => {
              return (
                <div key={pq.product.name + index} className="w-[100%] mt-3 flex md:flex-row flex-col items-center gap-10 bg-[#bdbcbc] p-7 rounded-2xl">
                  <Image src={`/images/${pq.product.path}`} radius={"lg"} className="w-70! h-70!" />
                  <span className="font-semibold flex text-2xl">{pq.product.name}</span>
                  <span className="flex flex-col gap-2">
                    <span className="font-semibold">You own {pq.quantity} of these</span>
                    <Tooltip label="Common sell value range, items can still sell at higher prices." className="hover:font-bold">
                      <span>
                        Valued between ${pq.product.lowest_price} and ${pq.product.highest_price}
                      </span>
                    </Tooltip>
                    <Tooltip label="Rarer items sell quicker and for higher prices." className="hover:font-bold">
                      <span>
                        Rarity: {pq.product.rarity} {getRarityDescription(pq.product.rarity)}
                      </span>
                    </Tooltip>
                  </span>
                  <Button
                    radius={"lg"}
                    size="md"
                    className="md:ml-auto bg-blue-900!"
                    onClick={() => {
                      setChosenItem(pq);
                      open();
                    }}>
                    List This Item
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  else if (!noItems) {
    return (
      <div className="flex flex-col items-center h-[100vh]">
        <div className="loader"></div>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col items-center h-[90vh]">
        <div className="text-2xl">No Owned Items</div>
        <Recommended />
      </div>
    );
  }
}
