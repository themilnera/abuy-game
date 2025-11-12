import { CardProps } from "@/interfaces";
import { Paper, Image, Text } from "@mantine/core";
import Link from "next/link";

function cashFormatter(cash: string) {
  return Number(cash).toLocaleString("en-US");
}

export default function Card({ name, price, path, id }: CardProps) {
  let formattedPrice;
  if (price) {
    formattedPrice = cashFormatter(price);
  }

  return (
    <Paper
      radius="lg"
      bg={"#cfcece"}
      w={300}
      className="h-60 md:h-80!  flex! flex-col! items-center  border-transparent border-2 hover:border-0"
      key={name}
      component={Link}
      href={`/product/${id}`}>
      <div className="h-[80%] w-full overflow-hidden rounded-lg flex-shrink-0">
        <Image className="h-[100%] w-[100%]!" src={`/images/` + path} w="15%" fit="cover" alt={name} />
      </div>
      <div className="mt-auto p-2 self-start ">
        <Text className="hover:underline!">{name}</Text>
        <Text className="font-bold!" w={700}>
          ${formattedPrice}
        </Text>
      </div>
    </Paper>
  );
}
