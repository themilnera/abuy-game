"use client";
import Recommended from "@/components/recommended";
import { Product, ProductQuantity } from "@/interfaces";
import { useUser } from "@clerk/nextjs";
import { Button, Image, NumberInput } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Cart() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [emptyCart, setEmptyCart] = useState(false);

  const [cartFetched, setCartFetched] = useState(false);
  const [cartIds, setCartIds] = useState<string[]>();
  const [userCart, setUserCart] = useState<Product[]>([]);
  const [ownedItemIds, setOwnedItemIds] = useState<string[]>();

  const [cash, setCash] = useState(0);
  const [currentDay, setCurrentDay] = useState(1);
  const [currentDaySeed, setCurrentDaySeed] = useState(0);

  const [quantities, setQuantities] = useState<ProductQuantity[]>();
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [fees, setFees] = useState(0);
  const [taxes, setTaxes] = useState(0);
  const [total, setTotal] = useState<number>(0);

  const parseQuantitiesIntoString = (pq: ProductQuantity[]) => {
    let stringArray: string[] = [];
    pq.forEach((productQuantity) => {
      stringArray.push(productQuantity.product.id + "&q=" + productQuantity.quantity);
    });
    return stringArray;
  };

  const removeProductFromCart = async (product: Product) => {
    try {
      const filteredCartIds = cartIds?.filter((id) => id.split("&q=")[0] != product.id);
      if (filteredCartIds?.length === 0) {
        setEmptyCart(true);
      }
      setCartIds(filteredCartIds);
      const filteredCartProducts = userCart.filter((p) => p != product);
      setUserCart(filteredCartProducts);
      const filteredQuantities = quantities?.filter((q) => q.product != product);
      setQuantities(filteredQuantities);

      const newCartString = filteredCartIds?.join(" ");
      await axios.put(`/api/user/cart/remove`, { user_id: user?.id, cart_items: newCartString });
    } catch (error) {
      console.error("Failed to remove from cart: ", error);
    }
  };

  const fetchUserCart = async () => {
    try {
      const result = await axios.post(`api/user/cart`, { user_id: user?.id });
      const fetchedCartIds: string[] = result.data.rows[0].cart_items.trim().split(" ");
      const userResult = await axios.get(`/api/user/${user?.id}`);

      if (userResult) {
        setCash(Number(userResult.data.rows[0].money));
        setCurrentDay(Number(userResult.data.rows[0].current_day));
        setCurrentDaySeed(userResult.data.rows[0].current_day_seed);
        setOwnedItemIds(userResult.data.rows[0].owned_items.trim().split(" "));
      }

      let justProductIds: string[] = [];
      if (fetchedCartIds) {
        fetchedCartIds.forEach((id) => {
          const idQ = id.split("&q=");
          justProductIds.push(idQ[0]);
        });
      }

      setCartIds(fetchedCartIds);
      if (justProductIds && justProductIds.length > 0 && justProductIds[0].trim() !== "") {
        const batchResult = await axios.post(`/api/products/batch`, { ids: justProductIds, user_id: user?.id });
        if (batchResult) {
          const fetchedCart: Product[] = batchResult.data.rows;
          setUserCart(fetchedCart);

          let tQuantities: ProductQuantity[] = Array(userCart.length);
          fetchedCart.forEach((product, index) => {
            tQuantities[index] = { product: product, quantity: 0 };
            for (let i = 0; i < fetchedCartIds.length; i++) {
              if (fetchedCartIds[i].split("&q=")[0] == product.id) {
                tQuantities[index].quantity = Number(fetchedCartIds[i].split("&q=")[1]);
              }
            }
            console.log("Quantities: ", tQuantities);
          });

          setQuantities(tQuantities);
        }
      } else {
        setEmptyCart(true);
      }
    } catch (error) {
      console.error("Failed to fetch user cart: ", error);
    }
  };

  const calculateTotals = () => {
    if (cartIds && quantities) {
      let tSubtotal = 0,
        tTaxes = 0,
        tFees = 0;
      let index = 0;
      quantities.forEach((pq) => {
        if (pq.product.category === "electronics") {
          tTaxes += Math.floor(Number(pq.product.current_price) * 0.07) * pq.quantity; //7% electronics tax
          tFees += 7 * pq.quantity;
        }
        tSubtotal += Number(pq.product.current_price) * pq.quantity;
      });
      setTaxes(tTaxes);
      setFees(tFees);
      setSubtotal(tSubtotal);
      setTotal(tTaxes + tFees + tSubtotal);
      if (!cartFetched) setCartFetched(true);
      console.log("Calculated Totals");
    }
  };

  const checkOutAndPushToOwnedPage = async () => {
    try {
      const joinedIds = cartIds?.join(" ");
      if (joinedIds?.trim() != "") {
        if (cash >= total) {
          const newCashAmount = cash - total;
          const userResult = await axios.put(`/api/user/`, {
            user_id: user?.id,
            current_day: currentDay,
            current_day_seed: currentDaySeed,
            money: newCashAmount,
          });
          if (userResult) {
            let tCartIds: string[] = [];
            let foundIds: string[] = [];
            let finalIds: string[] = [];
            if (cartIds) tCartIds = cartIds;
            ownedItemIds?.forEach((oId) => {
              cartIds?.forEach((cId, index) => {
                const splitOid = oId.trim().split("&q=");
                const splitCid = cId.trim().split("&q=");
                if (splitOid[0] == splitCid[0]) {
                  const fQuantity = Number(splitOid[1]) + Number(splitCid[1]);
                  foundIds.push(`${splitOid[0]}&q=${fQuantity}`);
                  tCartIds.splice(index, 1);
                }
              });
            });
            finalIds = [...foundIds, ...tCartIds];
            console.log(finalIds)
            if (finalIds.length > 0) {
              await axios.put(`/api/user/owned`, { user_id: user?.id, owned_item_ids: finalIds.join(" ") });
              await axios.put(`/api/user/cart/remove`, { user_id: user?.id, cart_items: "" });
              setCartIds([]);
              setUserCart([]);
              setEmptyCart(true);
              router.push("/sell");
            }
          }
        } else {
          console.log("Not enough money, total cash: ", cash);
        }
      }
    } catch (error) {
      console.log("Failed to checkout: ", error);
    }
  };

  useEffect(() => {
    calculateTotals();
  }, [quantities]);

  useEffect(() => {
    if (user) {
      fetchUserCart();
    }
  }, [user]);

  useEffect(() => {
    console.log(total);
  }, [total]);

  if (cartFetched && !emptyCart) {
    return (
      <div className="flex flex-col items-center">
        <div className="text-2xl font-bold">My Cart</div>
        <div className="w-[70%] min-h-140 rounded-2xl mt-10 flex md:flex-row flex-col gap-5">
          <div className="flex-5 flex flex-col border-1 rounded-2xl border-[#888888] bg-[#c5c5c5] h-[100%]">
            {userCart.map((product, index) => {
              return (
                <div key={product.name + index} className="flex items-center p-5 justify-between">
                  <Image src={`/images/${product.path}`} w={120} h={120} radius={"lg"}></Image>
                  <span className="font-semibold underline text-xl">
                    <Link href={`/product/${product.id}`}>{product.name}</Link>
                  </span>

                  <span className="text-lg tracking-tight flex items-center gap-5">
                    <span className="flex-5 text-right">Quantity:</span>
                    <NumberInput
                      className="flex-2 font-semibold"
                      min={1}
                      max={99}
                      fw={"bold"}
                      disabled={product.rarity > 3 || false}
                      onChange={(e) => {
                        if (quantities) {
                          const newQuantities: ProductQuantity[] = quantities.map((pq: ProductQuantity, i: number) => {
                            return i === index ? { product: pq.product, quantity: Number(e) } : pq;
                          });
                          setCartIds(parseQuantitiesIntoString(newQuantities));
                          setQuantities(newQuantities);
                        }
                      }}
                      value={quantities && !isNaN(quantities[index].quantity) ? quantities[index].quantity : 1}
                    />
                  </span>

                  <span className="font-semibold text-xl tracking-tight mr-4">${product.current_price} each</span>
                  <span
                    className="hover:cursor-pointer"
                    onClick={() => {
                      removeProductFromCart(product);
                    }}>
                    <IconTrash />
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex-2 flex flex-col p-7 gap-5 bg-[#c5c5c5] rounded-2xl h-[30%] font-semibold">
            <span className="flex justify-between items-center border-b-1 border-[#a7a7a7]">
              Subtotal<span>${subtotal}</span>
            </span>
            {taxes !== 0 ? (
              <span className="flex justify-between ">
                Taxes: <span>${taxes}</span>
              </span>
            ) : (
              <></>
            )}
            {fees !== 0 ? (
              <span className="flex justify-between">
                Fees: <span>${fees}</span>
              </span>
            ) : (
              <></>
            )}
            <span className="border-b-1 border-gray-500"></span>
            <span className="text-2xl flex justify-between ">
              Total: <span className="">${total}</span>
            </span>
            <Button disabled={cash <= total} onClick={checkOutAndPushToOwnedPage} size="md" radius={"lg"} className="text-lg! bg-blue-800!">
              Checkout
            </Button>
            {cash <= total ? <span className="self-center text-red-800 underline underline-offset-4">You don't have enough money!</span> : <></>}
          </div>
        </div>
      </div>
    );
  } else if (!cartFetched && !emptyCart) {
    return (
      <div className="flex flex-col items-center mt-20 min-h-[500]">
        <div className="loader"></div>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col items-center h-[70vh]">
        <div className="text-2xl font-semibold">Your cart is empty!</div>
        <Recommended />
      </div>
    );
  }
}
