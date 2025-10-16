"use client";

import SpecialOffer from "@/components/special-offer";
import { Button, Image, Paper, Text, Typography } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
const dummyData = [
  {
    name: "Magic laptop",
    description: "laptop with actual magical ability",
    price: 200,
    imageUrl:
      "https://images.pexels.com/photos/33829025/pexels-photo-33829025.jpeg",
  },
  {
    name: "Deer (doe)",
    description: "A doe, a female deer",
    price: 20,
    imageUrl:
      "https://images.pexels.com/photos/33820045/pexels-photo-33820045.jpeg",
  },
  {
    name: "Some flower",
    description: "Some kind of flower",
    price: 19,
    imageUrl:
      "https://images.pexels.com/photos/33618756/pexels-photo-33618756.jpeg",
  },
  {
    name: "YouTube.com",
    description: "the website YouTube.com",
    price: 20000000000,
    imageUrl:
      "https://images.pexels.com/photos/33440278/pexels-photo-33440278.jpeg",
  },
  {
    name: "Airplane",
    description: "An airplane",
    price: 200,
    imageUrl:
      "https://images.pexels.com/photos/34303415/pexels-photo-34303415.jpeg",
  },
];

interface CardProps {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

function Card({ name, description, price, imageUrl }: CardProps) {
  return (
    <Paper radius="lg" bg={"#cfcece"} className="h-80! flex! flex-col! items-center">
      <div className="h-[80%] w-full overflow-hidden rounded-lg flex-shrink-0">
        <Image 
          src={imageUrl} 
          h="100%" 
          w="100%" 
          fit="cover" 
          alt={name}
        />
      </div>
      <div className="mt-auto p-2 self-start">
        <Text>{name}</Text>
        <Text fw={700}>${price}</Text>
      </div>
    </Paper>
  );
}

export default function Recommended() {
  const slides = dummyData.map((item) => {
    return (
      <Carousel.Slide key={item.name}>
        <Card {...item} />
      </Carousel.Slide>
    );
  });

  return (
    <>
      <div className="mt-10">
        <Text fw={700} ml={30} mb={10} fz={20}>Recommended for you</Text>
        <Carousel
          slideSize="25%"
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
