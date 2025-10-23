"use client";
import { Paper, Image, Text } from "@mantine/core";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CardProps, Product } from "@/interfaces";
import Link from "next/link";

export default function Search() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const category = searchParams.get("category");
  const [searchResults, setSearchResults] = useState<Product[]>([]);

  const fetchSearchResults = async () => {
    try {
      const result = await axios.post("/api/search", {
        query: query,
        category: category,
      });
      console.log("DATA: ", result.data);
      setSearchResults(result.data);
    } catch (error) {
      console.error("Failed to fetch search results: ", error);
    }
  };

  useEffect(() => {
    fetchSearchResults();
  }, [query]);

  function Card({ name, price, imageUrl, id }: CardProps) {
    return (
      <Paper
        radius="lg"
        bg={"#cfcece"}
        w={300}
        className="h-60 md:h-80!  flex! flex-col! items-center  border-transparent border-2 hover:border-0"
        key={name}
        component={Link}
        href={`/product/${id}`}
      >
        <div className="h-[80%] w-full overflow-hidden rounded-lg flex-shrink-0">
          <Image
            className="h-[100%] w-[100%]!"
            src={`/images/` + imageUrl}
            w="15%"
            fit="cover"
            alt={name}
          />
        </div>
        <div className="mt-auto p-2 self-start ">
          <Text className="hover:underline!">{name}</Text>
          <Text w={700}>${price}</Text>
        </div>
      </Paper>
    );
  }

  return (
    <>
      {searchResults.length > 0 ? (
        <div className="flex flex-col items-center">
          <div className="w-[70%] flex flex-wrap gap-10">
            {searchResults?.map((product) => {
              return Card({
                name: product.name,
                price: product.lowest_price,
                imageUrl: product.path,
                id: product.id
              });
            })}
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
