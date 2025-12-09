"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";
import { ListedItem, Product, ProductQuantity, Bid, UserObj } from "@/interfaces";
import { Button, Image, Modal, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconMoonStars } from "@tabler/icons-react";

export default function NewDayClient({ availableImages }: { availableImages: string[] }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [newUser, setNewUser] = useState(false);
  const [userObj, setUserObj] = useState<UserObj|null>(null);
  const [sellerName, setSellerName] = useState<string>();
  const [conditionsMet, setCondidionsMet] = useState(false);
  const [dbError, setDbError] = useState(false);
  const [attemptingCreate, setAttemptingCreate] = useState(false);

  const [profileImage, setProfileImage] = useState<string>("/images/profile-pics/raven.jpg");

  const [opened, { open, close }] = useDisclosure(false);
  const [noItems, setNoItems] = useState(false);
  const [ownedItmesFetched, setOwnedItemsFetched] = useState(false);

  const [ownedItemIds, setOwnedItemIds] = useState<string[]>();
  const [listedItems, setListedItems] = useState<ListedItem[]>([]);

  const [ownedPqs, setOwnedPqs] = useState<ProductQuantity[]>([]);
  const [chosenItem, setChosenItem] = useState<ProductQuantity>();

  const [listedItemName, setListedItemName] = useState("");
  const [listedItemPrice, setListedItemPrice] = useState(1);
  const [listedItemQuantity, setListedItemQuantity] = useState(1);
  const [listedItemDescription, setListedItemDescription] = useState("");

  const [emptyBidsList, setEmptyBidsList] = useState(false);
  const [bidIds, setBidIds] = useState<string[]>();
  const [bids, setBids] = useState<Bid[]>([]);

  useEffect(() => {
    const checkUserDbEntry = async () => {
      try {
        if (user) {
          const result = await axios.get(`/api/user/${user.id}`);
          if (result.data.rows.length > 0) setUserObj(result.data.rows[0]);

          if (result.data.rows.length > 0 && result.data.rows[0].current_day && result.data.rows[0].current_day_seed) {
            //check which day it is progress to the next day
          } else {
            setNewUser(true);
            if (user?.username) {
              setSellerName(user?.username);
              setCondidionsMet(true);
            }
          }
        }
      } catch (error) {}
    };
    checkUserDbEntry();
  }, [user]);

  useEffect(() => {
    if (userObj) {
      fetchOwnedItems();
      fetchUserBids();
    }
  }, [userObj]);

  const addNewUserToDbAndStart = async () => {
    try {
      setDbError(false);
      let result;
      if (userObj) {
        console.log("delete");
        const deleteResult = await axios.delete(`/api/user/${user?.id}`);
        if (deleteResult)
          result = await axios.post("/api/user/", { user_id: user?.id, seller_name: sellerName, seller_image_url: profileImage, current_day: 1, money: 100 });
      } else {
        result = await axios.post("/api/user/", { user_id: user?.id, seller_name: sellerName, seller_image_url: profileImage, current_day: 1, money: 100 });
      }
      if (result?.data) {
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to post user to the db: ", error);
      setDbError(true);
      setAttemptingCreate(false);
    }
  };

  const fetchOwnedItems = async () => {
    setOwnedItemsFetched(false);
    try {
      const result = await axios.post(`/api/user/owned`, { user_id: user?.id });
      const listedResult = await axios.get(`/api/listed-item/${user?.id}`);
      const tempListedItems: ListedItem[] = listedResult.data.rows;
      console.log(tempListedItems);
      if (listedResult) {
        setListedItems(tempListedItems);
      }
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
        }
      } else if (tempIds.length === 0 || (tempIds[0].trim() === "" && tempListedItems.length === 0)) {
        setNoItems(true);
      }
      setOwnedItemsFetched(true);
    } catch (error) {
      console.error("Failed to fetch owned items: ", error);
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

  if (isLoaded && !isSignedIn) {
    router.push("/account/sign-in");
    return <></>;
  }
  return (
    <>
      <Modal
        size={"lg"}
        opened={opened}
        onClose={() => {
          close();
        }}
        withCloseButton={true}
        centered>
        <div className="flex flex-wrap gap-5 items-center justify-center mb-10">
          {availableImages.map((name) => (
            <Image
              className="hover:cursor-pointer"
              onClick={() => {
                setProfileImage(`/images/profile-pics/${name}`);
                close();
              }}
              radius={"lg"}
              key={name}
              w={150}
              h={150}
              src={`/images/profile-pics/${name}`}
            />
          ))}
        </div>
      </Modal>

      {newUser ? (
        <div className="flex flex-col items-center justify-center">
          <div className="w-[75%] min-h-200 border-2 tracking-tight border-blue-900 rounded-2xl mt-10 flex flex-col items-center  bg-[#c9e3e5]">
            <div className="flex flex-col items-center justify-center mt-10 p-5">
              <span className="text-3xl mt-5 font-semibold">
                Welcome to <span className="text-red-700">A</span>
                <span className="text-green-700">B</span>
                <span className="text-blue-700">U</span>
                <span className="text-yellow-600">Y</span>!
              </span>
              <span className="mt-5 font-semibold">This site is a satirical management simulator game.</span>
              <span>Since you're new here, let's create your user profile for the site:</span>

              <TextInput
                className="mt-10"
                radius={"md"}
                required
                label={"Your Seller Name"}
                maxLength={15}
                onChange={(e) => {
                  setSellerName(e.target.value);
                  if (e.target.value.trim() === "") {
                    setCondidionsMet(false);
                  } else {
                    setCondidionsMet(true);
                  }
                }}
                value={sellerName}></TextInput>
              <Button radius={"md"} className="mt-5 bg-blue-900!" onClick={open}>
                Choose Profile Image
              </Button>
              <Image radius={"lg"} src={profileImage} w={200} h={200} className="mt-5"></Image>
              <span className="mt-5">
                Day: <span className="font-semibold">1</span>
              </span>
              <span className="mt-2">
                Starting Cash: <span className="font-semibold">$100</span>
              </span>
              {!attemptingCreate ? (
                <Button
                  radius={"md"}
                  className="mt-5 bg-green-700!"
                  disabled={!conditionsMet}
                  onClick={() => {
                    setAttemptingCreate(true);
                    addNewUserToDbAndStart();
                  }}>
                  Start Game
                </Button>
              ) : (
                <div className="loader mt-5"></div>
              )}
              <div hidden={!dbError} className="mt-3 text-red-600">
                Database error, please try again
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="h-[100vh] bg-[#151529]">
            <div className="flex flex-col items-center">
              <div className="text-3xl font-semibold mt-20 flex items-center gap-3 justify-center w-[100%]! text-white">
                End Of Day <IconMoonStars />
              </div>
              <Image src={profileImage} className="w-[400]! rounded-2xl! mt-5"></Image>
              <div className="text-white text-2xl mt-5">{user?.username}</div>
              
              {userObj ? (<>
                <span className="text-[#0c6a00] text-2xl">${userObj.money}</span>
                <span className="border-b-1 w-[70%] mt-5 border-gray-300"></span>
                <div className="flex flex-row gap-10 mt-5">
                  <div>
                    <div className="text-white text-xl underline flex flex-col items-center">You Listed:</div>
                      {listedItems?.map((p, index) => {
                        return (
                          <div key={p.product_name + index} className="text-white text-lg">
                            {p.product_name} ({p.quantity})
                          </div>
                        );
                      })}
                  </div>
                  <div>
                    <div className="text-white text-xl underline flex flex-col items-center">You Own:</div>
                    {ownedPqs?.map((pq, index) => {
                        return (
                          <div key={pq.product.name + index} className="text-white text-lg">
                            {pq.product.name} ({pq.quantity})
                          </div>
                        );
                      })}
                  </div>
                  <div>
                    <div className="text-white text-xl underline flex flex-col items-center">You Bid On:</div>
                    {bids?.map((bid, index) => {
                        return (
                          <div key={bid.product.name + index} className="text-white text-lg">
                            {bid.product.name} (${bid.amount})
                          </div>
                        );
                      })}
                  </div>
                </div>
                <Button className="bg-red-900! mt-10 hover:bg-[#6e0e0e]!" size="md" radius={"lg"} fz={"lg"}>Progress To Next Day</Button>
                <Button onClick={()=>router.push("/")} className="bg-[#106b3b]! mt-5 hover:bg-[#084a27]!" size="md" radius={"lg"} fz={"lg"}>Go Back</Button>
              </>) : (
                <></>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

//then: Stock the store with the current day seed (that's an API route)
//Different puzzle, don't worry about this here
