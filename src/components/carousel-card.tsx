import { Text, Paper, Image } from "@mantine/core";
import { CardProps } from "@/interfaces";
import Link from "next/link";

function cashFormatter(cash: string) {
  return Number(cash).toLocaleString('en-US');
}

export default function CarouselCard({ name, price, path, id }: CardProps) {
  return (
    <Paper
      radius="lg"
      bg={"#cfcece"}
      className="h-60 md:h-80! flex! flex-col! items-center"
      component={Link}
      href={`/product/${id}`}
    >
      <div className="h-[80%] w-full overflow-hidden rounded-lg flex-shrink-0">
        <Image
          className="h-[100%]"
          src={`/images/${path}`}
          w="100%"
          fit="cover"
          alt={name}
        />
      </div>
      <div className="mt-auto p-2 self-start">
        <Text>{name}</Text>
        <Text fw={700}>${cashFormatter(price)}</Text>
      </div>
    </Paper>
  );
}
