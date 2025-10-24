"use client";
import { Paper, Image, Text, Pagination } from "@mantine/core";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CardProps, Product } from "@/interfaces";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Search() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const category = searchParams.get("category");

  const [page, setPage] = useState(Number(searchParams.get("page")));
  const [totalResults, setTotalResults] = useState(0);
  const [fetchedResults, setFetchedResults] = useState(false);

  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const router = useRouter();

  const fetchSearchResults = async () => {
    try {
      setFetchedResults(false);
      setSearchResults([]);
      console.log("Category: ", category);
      const result = await axios.post("/api/search", {
        query: query,
        category: category,
        page: page,
      });
      console.log("RESULTS:", result.data.products);
      setSearchResults(result.data.products);
      setTotalResults(result.data.count);
      setFetchedResults(true);
    } catch (error) {
      console.error("Failed to fetch search results: ", error);
    }
  };

  useEffect(() => {
    fetchSearchResults();
  }, [query, category]);

  useEffect(() => {

      const _st = query;
      const encodedSearchTerm = encodeURIComponent(query ? query : "");
      if (category) {
        const encodedCategory = encodeURIComponent(category);

        const url = `search?q=${encodedSearchTerm}&category=${category}&page=${page}`;
        router.push(url);
        fetchSearchResults();
      } else {
        const url = `search?q=${encodedSearchTerm}&page=${page}`;
        router.push(url);
        fetchSearchResults();
      }
    
  }, [page]);

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
      {searchResults?.length > 0 ? (
        <div className="flex flex-col items-center">
          <div className="w-[70%] flex flex-wrap gap-10">
            {searchResults?.map((product) => {
              return Card({
                name: product.name,
                price: product.lowest_price,
                imageUrl: product.path,
                id: product.id,
              });
            })}
          </div>
          <Pagination
            className="mt-5 mb-3 "
            color="#246d24"
            value={Number(page)}
            total={Math.ceil(totalResults / 12)}
            onChange={setPage}
          />
        </div>
      ) : (
        <>
          {
            fetchedResults ? 
            (<div>
              <div className="flex flex-col items-center">
              <span className="text-xl mt-10 font-bold">No Results</span>
            </div>
            </div>)
            :
            <div className="flex flex-col items-center">
              <div className="loader"></div>
            </div>
          }
        </>
      )}
    </>
  );
}
