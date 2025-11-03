import { Button, Image, Text, Typography } from "@mantine/core";
import { useEffect, useState } from "react";
import axios from "axios";
import { Product } from "@/interfaces";
import { useRouter } from "next/navigation";

//todo: need to find a better way to make the styling responsive

export default function SpecialOffer() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [product, setProduct] = useState<Product | null>();
  const blurbPhrases = ["Try this amazing #, you'll love it.*%", "Check out this #!", "You need this # in your life, immediately.*%", "Don't pass up the chance to get this #!"];
  const [blurbAddendum, setBlurbAddendum] = useState("");
  const [blurb, setBlurb] = useState<string | null>();

  const fetchProduct = async () => {
    try {
      console.log("fetching")
      const result = await axios.get("/api/products/random");
      const blurbChoice = Math.floor(Math.random() * blurbPhrases.length);
      const chosenBlurb = blurbPhrases[blurbChoice];
      
      if(chosenBlurb.match(/%/)){
        setBlurbAddendum("*Product satisfaction not guaranteed.");
        chosenBlurb.replace("%", "");
      }
      setProduct(result.data.rows[0]);
      setBlurb(chosenBlurb);
      
    } catch (error) {
      console.error("Failed to fetch random product: ", error);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);
  
  useEffect(()=>{
    console.log(blurb)
    console.log(product)
    if(blurb && product){
      setLoaded(true);
    }
  }, [blurb, product])

  if (!loaded) {
    return (
      <div className="flex flex-col">
        <div className="loader"></div>
      </div>
    );
  }
  else if(product && blurb) return (
    <>
      <div className="feat-daily-deal w-[70vw] h-[30vh] bg-green-950 rounded-3xl flex items-center justify-end p-5 lg:pl-30 lg:pr-40">
        <div className="self-start mr-auto break-words w-100 h-[100%] flex flex-col">
          <Text className="text-2xl! md:text-4xl!" c={"#8ecc77"} fw={900}>
            Special Offer
          </Text>

          <p className="text-1xl! mt-5! text-[#8ecc77] font-extrabold">
            {blurb.replace("#", product.name).replace("%", "")}
          </p>
          <Button
            radius="lg"
            w={105}
            className="mt-5 text-green-950! bg-[#8ecc77]!"
            onClick={()=>{
              router.push(`/product/${product.id}`)
            }}
          >
            See Offer
          </Button>
          <p className="text-sm text-[#8ecc77] mt-auto">
            {blurbAddendum}
            
          </p>
        </div>
        <Image
          className="ml-auto w-60! invisible md:visible"
          radius={"lg"}
          h={"100%"}
          src={
            `/images/${product?.path}`
          }
        ></Image>
      </div>
    </>
  );
}
