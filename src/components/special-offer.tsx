import { Button, Image, Text, Typography } from "@mantine/core";

export default function SpecialOffer(){
    return (
        <>
          <div className="feat-daily-deal w-[70vw] h-[30vh] bg-green-950 rounded-3xl flex items-center justify-end pt-5 pb-5 pl-30 pr-30">
            <div className="self-start mr-auto break-words w-100 h-[100%] flex flex-col">
              <Text className="text-4xl!" c={"#8ecc77"} fw={900}>
                Special Offer
              </Text>
    
              <p className="text-1xl! mt-5! text-[#8ecc77] font-extrabold">
                  Get the all new Hackbook Pro for only $999 when you order by 10/17.*
              </p>
              <Button radius="lg" w={105} className="mt-5 text-green-950! bg-[#8ecc77]!">See Offer</Button>
              <p className="text-sm text-[#8ecc77] mt-auto">
                *Terms and conditions apply
              </p>
            </div>
            <Image
              className="mr-5"
              radius={"lg"}
              w={"30%"}
              h="100%"
              src={
                "https://images.pexels.com/photos/34317747/pexels-photo-34317747.jpeg"
              }
            ></Image>
          </div>
        </>
      );
}