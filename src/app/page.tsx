"use client";

import SpecialOffer from "@/components/special-offer";
import { Button, Image, Paper, Text, Typography } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import Recommended from "@/components/recommended";

export default function Home() {
  return (
    <>
      <SpecialOffer />
      <Recommended />
    </>
  );
}
