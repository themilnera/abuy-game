"use client";
import { Product } from "@/interfaces";
import { useUser } from "@clerk/nextjs";
import { Button, Image, NumberInput } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ProductQuantity {
  product: Product;
  quantity: number;
}

export default function Cart() {
  const { user, isLoaded } = useUser();
  const [emptyCart, setEmptyCart] = useState(false);

  const [cartFetched, setCartFetched] = useState(false);
  const [cartIds, setCartIds] = useState<string[]>();
  const [userCart, setUserCart] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<ProductQuantity[]>();
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [fees, setFees] = useState(0);
  const [taxes, setTaxes] = useState(0);
  const [total, setTotal] = useState<number>(0);

  const removeProductFromCart = async (product: Product) => {
    try {
      const filteredCartIds = cartIds?.filter((id)=> id != product.id );
      if(filteredCartIds?.length === 0){
        setEmptyCart(true);
      }
      setCartIds(filteredCartIds);
      const filteredCartProducts = userCart.filter((p) => p != product);
      setUserCart(filteredCartProducts)
      const filteredQuantities = quantities?.filter((q) => q.product != product);
      setQuantities(filteredQuantities);

      console.log("Filtered cart: ", filteredCartIds);
      const newCartString = filteredCartIds?.join(" ");
      await axios.put(`/api/user/cart/remove`, { user_id: user?.id, cart_items: newCartString});

    } catch (error) {
      console.error("Failed to add to cart: ", error);
    }
  };

  const calculateFees = (product: Product) => {
    if (product.category === "electronics") {
      setTaxes(taxes + Math.floor(Number(product.current_price) * 0.07)); //7% electronics tax
      setFees(fees + 7);
    }
  };

  const fetchUserCart = async () => {
    try {
      const result = await axios.post(`api/user/cart`, { user_id: user?.id });
      const fetchedCartIds = result.data.rows[0].cart_items.trim().split(" ");
      setCartIds(fetchedCartIds);
      if (fetchedCartIds && fetchedCartIds.length > 0 && fetchedCartIds[0].trim() !== "") {
        const batchResult = await axios.post(`/api/products/batch`, { ids: fetchedCartIds, user_id: user?.id });
        if (batchResult) {
          const fetchedCart: Product[] = batchResult.data.rows;
          setUserCart(fetchedCart);
          console.log(fetchedCart);

          let tQuantities: ProductQuantity[] = Array(userCart.length);
          fetchedCart.forEach((product, index) => {
            tQuantities[index] = { product: product, quantity: 0 };
            for (let i = 0; i < fetchedCartIds.length; i++) {
              if (fetchedCartIds[i] == product.id) {
                tQuantities[index].quantity++;
              }
            }
            console.log("Quantities: ", tQuantities);
          });

          setQuantities(tQuantities);
        }
      }
      else{
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
                    <Link href={`/products/${product.id}`}>{product.name}</Link>
                  </span>

                  <span className="text-lg tracking-tight">
                    Quantity:
                    <NumberInput
                      min={1}
                      max={99}
                      disabled={product.rarity > 3 || false}
                      onChange={(e) => {
                        let filteredQuantities = quantities?.filter((pq) => pq.product.id != product.id) || [];
                        let newPrQuantity: ProductQuantity = { product, quantity: Number(e) };
                        let newQuantities: ProductQuantity[] = [newPrQuantity, ...filteredQuantities];
                        setQuantities(newQuantities);
                      }}
                      value={quantities && !isNaN(quantities[index].quantity) ? quantities[index].quantity : 1}
                    />
                  </span>

                  <span className="font-semibold text-xl tracking-tight mr-4">${product.current_price} each</span>
                  <span className="hover:cursor-pointer" onClick={()=>{
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
            <Button size="md" radius={"lg"} className="text-lg! bg-blue-800!">
              Checkout
            </Button>
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
  }
  else{
    return(
      <div>Empty Cart</div>
    );
  }
}
