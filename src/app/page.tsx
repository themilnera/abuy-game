"use client";

import SpecialOffer from "@/components/special-offer";
import { Button, Image, Paper, Text, Typography } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import Recommended from "@/components/recommended";
import { useState } from "react";

export default function Home() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");


  return (
    <div className="flex flex-col items-center">
      <SpecialOffer />
      <Recommended />
    </div>
  );
}
