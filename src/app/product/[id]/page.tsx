"use client";
import { Product } from "@/interfaces";
import { useUser } from "@clerk/nextjs";
import { Button, Image, Modal, NumberInput } from "@mantine/core";
import axios from "axios";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
import { IconCurrencyDollar } from "@tabler/icons-react";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [cartButtonText, setCartButtonText] = useState("Add To Cart");
  const [bidButtonText, setBidButtonText] = useState("Place Bid");
  const [productInCart, setProductInCart] = useState(false);
  const [bidInList, setBidInList] = useState(false);
  const [bidAmount, setBidAmount] = useState(0);
  const { user } = useUser();
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);

  const fetchProductWithId = async () => {
    try {
      const result = await axios.post(`/api/products/${id}`, { userId: user?.id });

      if (result.data.product) {
        if (result.data.product.rarity < 3) {
          const sResult = await axios.post(`/api/user/cart`, { user_id: user?.id });
          const fetchedCartIds: string[] = sResult.data.rows[0].cart_items.trim().split(" ");
          if (fetchedCartIds) {
            fetchedCartIds.forEach((id) => {
              if (id == result.data.product.id) {
                setCartButtonText("View In Cart");
                setProductInCart(true);
              }
            });
          }
        } else {
          const sResult = await axios.post(`/api/user/bid`, { user_id: user?.id });
          const fetchedBidIds: string[] = sResult.data.rows[0].bid_items?.trim().split(" ");
          if (fetchedBidIds) {
            fetchedBidIds.forEach((bidId) => {
              const splitIds = bidId.split("&bid=");

              if (Number(splitIds[0]) == result.data.product.id) {
                console.log("True");
                setBidButtonText("View Bid");
                setBidInList(true);
              }
            });
          }
        }
        setProduct(result.data.product);
        setBidAmount(Number(result.data.product.current_price));
      }
    } catch (error) {
      console.error("Failed to fetch product: ", error);
    }
  };

  const addProductToCartAndPushToCartPage = async () => {
    try {
      if (!productInCart) {
        const result = await axios.put(`/api/user/cart`, { user_id: user?.id, cart_item_id: product?.id });
      }
      router.push("/cart");
    } catch (error) {
      console.error("Failed to add to cart: ", error);
    }
  };

  const addProductToBidsAndPushToBidPage = async () => {
    try {
      if (!bidInList) {
        const result = await axios.put(`/api/user/bid`, { user_id: user?.id, bid_item_id: product?.id + `&bid=${bidAmount}` });
      }
      router.push("/bids");
    } catch (error) {
      console.error("Failed to add item to bids: ", error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchProductWithId();
    }
  }, [user]);

  return (
    <>
      <Modal
        size={"lg"}
        opened={opened}
        radius={"lg"}
        onClose={() => {
          close();
        }}
        withCloseButton={true}
        centered>
        <div className="flex flex-col items-center gap-4">
          <span className="font-semibold text-xl border-b-1">{product?.name}</span>
          <div className="flex mb-20 mt-10 ml-5">
            <Image radius={"lg"} className="flex-2" src={`/images/${product?.path}`}></Image>
            <div className="flex-5 flex flex-col items-center">
              <span className="flex mt-5 items-center border-1 p-5 bg-gray-100 border-gray-300 rounded-2xl">
                <span className="flex-5 font-semibold">Your Bid: </span>
                <NumberInput
                  leftSection={<IconCurrencyDollar />}
                  className="flex-2 font-semibold"
                  min={Number(product?.current_price)}
                  defaultValue={Number(product?.current_price)}
                  value={bidAmount}
                  onChange={(e) => {
                    setBidAmount(Number(e));
                  }}
                />
              </span>
              <Button onClick={addProductToBidsAndPushToBidPage} size="md" className="mt-5 rounded-2xl!">
                Place Bid
              </Button>
            </div>
          </div>
        </div>
      </Modal>
      <div className="min-h-170">
        {product ? (
          <div className="flex flex-col items-center">
            <div className="w-[70%] flex md:flex-row flex-col gap-5">
              <Image radius={"lg"} mah={700} className="flex-10" src={`/images/${product.path}`}></Image>
              <div className="md:ml-3 flex-7 flex flex-col gap-3">
                <span className="font-bold text-2xl">{product.name}</span>
                <span className="font-bold text-xl border-gray-400 border-t-1 pt-4">${product.current_price}</span>
                <span className="border-gray-400 border-t-1 p-2 pt-4 pb-4">{product.description}</span>
                {product.rarity < 3 ? (
                  <Button pt={3} pb={3} h={44} radius={"lg"} className="text-[18px]!" onClick={addProductToCartAndPushToCartPage}>
                    {cartButtonText}
                  </Button>
                ) : (
                  <Button
                    pt={3}
                    pb={3}
                    h={44}
                    radius={"lg"}
                    className="text-[18px]!"
                    onClick={() => {
                      if (bidInList) {
                        addProductToBidsAndPushToBidPage();
                      } else {
                        open();
                      }
                    }}>
                    {bidButtonText}
                  </Button>
                )}
                <Button variant="outline" pt={3} pb={3} h={44} radius={"lg"} className="text-[18px]! text-[#20598d]!">
                  Add to My Watchlist
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="loader"></div>
          </div>
        )}
      </div>
    </>
  );
}
