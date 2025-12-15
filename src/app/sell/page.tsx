"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";
import { ListedItem, Product } from "@/interfaces";
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
  const [listedItems, setListedItems] = useState<ListedItem[]>([]);

  const [ownedPqs, setOwnedPqs] = useState<ProductQuantity[]>([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [chosenItem, setChosenItem] = useState<ProductQuantity>();

  const [listedItemName, setListedItemName] = useState("");
  const [listedItemPrice, setListedItemPrice] = useState(1);
  const [listedItemQuantity, setListedItemQuantity] = useState(1);
  const [listedItemDescription, setListedItemDescription] = useState("");

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

  const fetchOwnedItems = async () => {
    setOwnedItemsFetched(false);
    try {
      const result = await axios.post(`/api/user/owned`, { user_id: user?.id });
      const listedResult = await axios.get(`/api/listed-item/${user?.id}`);
      const tempListedItems: ListedItem[] = listedResult.data.rows;
      if (listedResult) {
        setListedItems(tempListedItems);
      }
      const tempIds: string[] = result.data.rows[0].owned_items.split(" ");
      console.log(result.data.rows[0].owned_items);
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
        }
      } else if (tempIds.length === 0 || tempIds[0].trim() === "" && tempListedItems.length === 0) {
        setNoItems(true);
      }
      setOwnedItemsFetched(true);
    } catch (error) {
      console.error("Failed to fetch owned items: ", error);
    }
  };

  const pushBackToOwnedItems = async (li: ListedItem) =>{
    try {
      setListedItems(listedItems.filter((it)=> it !== li));
      let newPqs: ProductQuantity[] = [];
      let prodFound = false;
      if(ownedPqs.length > 0){
        ownedPqs.forEach((pq)=>{
          if(pq.product.id == li.product_id){
            newPqs.push({ product: pq.product, quantity: pq.quantity + li.quantity});
            prodFound = true;
          }
          else{
            newPqs.push(pq);
          }
        });
      }
      if(!prodFound){
        const pResult = await axios.post(`/api/products/${li.product_id}`, { userId: user?.id });
        if(pResult){
          const pr: Product = pResult.data.product;
          newPqs.push({product: pr, quantity: li.quantity});
        }
      }
      setOwnedPqs(newPqs);
      const newString = newPqs.map((pq)=>`${pq.product.id}&q=${pq.quantity}`).join(" ");
      await axios.put(`/api/user/owned/remove`, { user_id: user?.id, owned_items: newString})
      await axios.delete(`/api/listed-item/delete/${li.id}`);
    } catch (error) {
      console.error("Failed to push back to owned items: ", error);
    }
  }

  const pushToListedItemsTable = async () => {
    try {
      if (user && chosenItem) {
        const userResult = await axios.get(`/api/user/${user.id}`);
        if (userResult) {
          const listedItem: ListedItem = {
            product_name: listedItemName,
            user_id: user.id,
            product_id: chosenItem.product.id,
            description: listedItemDescription,
            price: listedItemPrice,
            quantity: listedItemQuantity,
            gameday_listed: userResult.data.rows[0].current_day,
            path: chosenItem.product.path,
          };
          const lIResult = await axios.post(`/api/listed-item`, { listedItem: listedItem });
          if (lIResult.status === 200) {
            const returnedItem = lIResult.data.rows[0];
            console.log("ID RETURNED: "+returnedItem.id);
            listedItem.id = returnedItem.id;
            setListedItems([listedItem, ...listedItems]);

            let newPqs: ProductQuantity[] = [];
            let newOwnedString: string[] = [];
            ownedPqs.forEach((pq) => {
              console.log("PQ ID: ", pq.product.id);
              console.log("LIQ ID: ", chosenItem.product.id);
              if (Number(pq.product.id) === Number(chosenItem.product.id) && pq.quantity - listedItemQuantity > 0) {
                console.log("Testing true");
                newPqs.push({ quantity: pq.quantity - listedItemQuantity, product: pq.product });
                newOwnedString.push(`${pq.product.id}&q=${pq.quantity - listedItemQuantity}`);
              } else if (Number(pq.product.id) !== Number(chosenItem.product.id)) {
                newPqs.push({ quantity: pq.quantity, product: pq.product });
                newOwnedString.push(`${pq.product.id}&q=${pq.quantity}`);
              }
            });

            const newUserOwnedResult = await axios.put(`/api/user/owned/remove`, { user_id: user?.id, owned_items: newOwnedString.join(" ") });
            if (newUserOwnedResult) {
              console.log("Updating owned items");
              setOwnedPqs(newPqs);
              setOwnedItemIds(newOwnedString.map((s) => s.split("&q=")[0]));
              //fetchOwnedItems();
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to push to listed items table: ", error);
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
                    value={listedItemName}
                    onBlur={(e) => {
                      if (e.target.value.trim() == "") {
                        setListedItemName(chosenItem.product.name);
                      }
                    }}
                    onChange={(e) => {
                      setListedItemName(e.target.value);
                    }}></TextInput>
                  <div className="flex justify-end gap-7">
                    <NumberInput
                      radius={"md"}
                      className="text-center w-[40%]"
                      label={chosenItem.product.rarity > 2 ? "Starting Bid" : "Price"}
                      max={999999999}
                      min={1}
                      onChange={(e) => {
                        setListedItemPrice(Number(e));
                      }}
                      value={listedItemPrice}></NumberInput>
                    <NumberInput
                      radius={"md"}
                      className="text-center w-[30%]"
                      label="Quantity"
                      max={chosenItem.quantity}
                      min={1}
                      onChange={(e) => {
                        setListedItemQuantity(Number(e));
                      }}
                      value={listedItemQuantity}></NumberInput>
                  </div>
                </div>
              </div>
              <Tooltip label="Writing a strong description helps an item sell, keep your target audience in mind.">
                <span>Description (?)</span>
              </Tooltip>
              <Textarea
                maxLength={1000}
                rows={5}
                className="w-[80%]! mb-5"
                value={listedItemDescription}
                onChange={(e) => setListedItemDescription(e.target.value)}></Textarea>
              <Button
                radius={"lg"}
                size="md"
                className="bg-blue-900! disabled:bg-gray-600!"
                disabled={listedItemDescription.trim() == ""}
                onClick={() => {
                  //submit to db, remove from owned
                  //go below and add a Listed Items section that checks if an owned item is in the listed table
                  pushToListedItemsTable();
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

        <div className="flex flex-col items-center mb-10">
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
                      setListedItemPrice(Number(pq.product.current_price));
                      setListedItemQuantity(Number(pq.quantity));
                      open();
                    }}>
                    List This Item
                  </Button>
                </div>
              );
            })}
            {listedItems.length > 0 ? (
              <div>
                <div className="text-2xl font-semibold border-b-1 flex flex-col mb-5 mt-5">Listed Items</div>
                {listedItems.map((li, index) => {
                  return (
                    <div key={li.product_name + index} className="w-[100%] mt-3 flex md:flex-row flex-col items-center gap-10 bg-[#bdbcbc] p-7 rounded-2xl">
                      <Image src={`/images/${li.path}`} h={180} radius={"lg"} className="flex-2" />
                      <span className="font-semibold flex text-2xl">{li.product_name}</span>
                      <span className="font-semibold">Description: {li.description}</span>
                      <span className="font-semibold">List Price: ${li.price}</span>
                      <span className="font-semibold">Quantity: {li.quantity}</span>
                      <Button radius={"lg"} size="md" className="md:ml-auto bg-red-900!" onClick={()=>{
                        pushBackToOwnedItems(li);
                      }}>
                        Unlist
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <></>
            )}
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
