"use client";

import SpecialOffer from "@/components/special-offer";
import { Button, Image, Paper, Text, Typography } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import { CardProps, Product } from "@/interfaces";
import Card from "./carousel-card";
import { useEffect, useState } from "react";
import axios from "axios";
import { UserResource } from "@clerk/types";
import { useUser } from "@clerk/nextjs";

export default function Recommended() {
    const { isLoaded, isSignedIn, user } = useUser();
  const [slides, setSlides] = useState();
  const [loaded, setLoaded] = useState(false);

  const fetchRecommendedItems = async () => {
    try {
      const results = await axios.post("/api/products/random", {
        amount: 8,
        userId: user?.id,
      });
      const definedSlides = results.data.rows.map((product: Product) => {
        return (
          <Carousel.Slide key={product.name}>
            <Card {...product} price={product.current_price} />
          </Carousel.Slide>
        );
      });
      setSlides(definedSlides);
      if (definedSlides) {
        setLoaded(true);
      }
    } catch (error) {
      console.error("Failed to fetch recommended items: ", error);
    }
  };

  useEffect(() => {
    console.log("Effect: ", {isLoaded, isSignedIn, userId: user?.id});
    if (isLoaded && isSignedIn && user) {
      fetchRecommendedItems();
    }
  }, [isLoaded, isSignedIn, user]);

  if (!loaded) {
    return (
      <div className="flex flex-col">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-10">
        <Text fw={700} ml={30} mb={10} fz={20}>
          Recommended for you
        </Text>
        <Carousel
          slideSize={{ sm: `25%`, base: "50%" }}
          height={350}
          w={`70vw`}
          slideGap="md"
          emblaOptions={{ align: "start", slidesToScroll: 2, loop: false }}
          withIndicators={false}
        >
          {slides}
        </Carousel>
      </div>
    </>
  );
}
