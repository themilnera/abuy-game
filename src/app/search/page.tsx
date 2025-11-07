"use client";
import { Paper, Image, Text, Pagination } from "@mantine/core";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CardProps, Product } from "@/interfaces";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/search-card";

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
    const pg = searchParams.get("page");
      setPage(Number(pg));
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



  return (
    <div className="h-[120vh]">
      {searchResults?.length > 0 ? (
        <div className="flex flex-col items-center h-[100%]">
          <div className="w-[70%] flex flex-wrap gap-10">
            {searchResults?.map((product) => {
              return Card({
                name: product.name,
                price: product.lowest_price,
                path: product.path,
                id: product.id,
              });
            })}
          </div>
          <Pagination
            className="mb-3 mt-auto!"
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
    </div>
  );
}
