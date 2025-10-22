"use client"
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Search(){
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const [searchResults, setSearchResults] = useState([]);
    
    console.log("QUERY: ", query);
    console.log("Category: ", category);
    
    const fetchSearchResults = async () =>{
        try{
            const result = await axios.post("/api/search", {
                query: query,
                category: category,
            });
            console.log("DATA: ", result.data);
            setSearchResults(result.data);
        }
        catch(error){
            console.error("Failed to fetch search results: ", error);
        }
    }

    useEffect(()=>{
        fetchSearchResults();
    },[])

}