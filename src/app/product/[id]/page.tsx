"use client";
import { Product } from "@/interfaces";
import { Image } from "@mantine/core";
import axios from "axios";
import { use, useState, useEffect } from "react";

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);

  const fetchProductWithId = async () => {
    try {
      const result = await axios.get(`/api/products/${id}`);
      console.log(result.data);
      setProduct(result.data.product);
    } catch (error) {
      console.error("Failed to fetch product: ", error);
    }
  };

  useEffect(() => {
    fetchProductWithId();
  }, []);

  return (
    <>
      {product ? (
        <div className="flex flex-col items-center">
          <div className="w-[70%] flex flex-col gap-5">
            <span>{product.name}</span>
            <span>{product.description}</span>
            <Image src={`/images/${product.path}`}></Image>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="loader"></div>
        </div>
      )}
    </>
  );
}
