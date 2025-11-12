"use client";
import { Product } from "@/interfaces";
import { useUser } from "@clerk/nextjs";
import { Button, Image } from "@mantine/core";
import axios from "axios";
import { use, useState, useEffect } from "react";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const { user } = useUser();

  const fetchProductWithId = async () => {
    try {
      const result = await axios.post(`/api/products/${id}`, { userId: user?.id });
      setProduct(result.data.product);
    } catch (error) {
      console.error("Failed to fetch product: ", error);
    }
  };

  const addProductToCartAndPushToCartPage = async () => {
    try {
    } catch (error) {}
  };

  useEffect(() => {
    if (user?.id) {
      fetchProductWithId();
    }
  }, [user]);

  return (
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
                  Buy Now
                </Button>
              ) : (
                <Button pt={3} pb={3} h={44} radius={"lg"} className="text-[18px]!">
                  Place Bid
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
  );
}
