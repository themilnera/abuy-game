"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";

import { Button, Image, Modal, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

export default function NewDayClient({
  availableImages,
}: {
  availableImages: string[];
}) {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [newUser, setNewUser] = useState(false);
  const [sellerName, setSellerName] = useState<string>("");
  const [conditionsMet, setCondidionsMet] = useState(false);
  const [dbError, setDbError] = useState(false);
  const [attemptingCreate, setAttemptingCreate] = useState(false);

  const [profileImage, setProfileImage] = useState<string>(
    "/images/profile-pics/raven.jpg"
  );

  const [opened, { open, close }] = useDisclosure(false);
  //database user object check
  useEffect(() => {
    const checkUserDbEntry = async () => {
      try {
        if (user) {
          const result = await axios.get(`/api/user/${user.id}`);
          if (result.data.rows.length > 0) {
            //check which day it is progress to the next day
          } else {
            setNewUser(true);
            if(user?.username){
              setSellerName(user?.username);
              setCondidionsMet(true);
            }
          }
        }
      } catch (error) {}
    };
    checkUserDbEntry();
  }, [user]);

  const addNewUserToDbAndStart = async ()=>{
    try {
      setDbError(false);
      const result = await axios.post("/api/user/", { user_id: user?.id, seller_name: sellerName, seller_image_url: profileImage, current_day: 1 });
      if(result.data){
        console.log("Success: ", result.data);
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to post user to the db: ", error);
      setDbError(true);
      setAttemptingCreate(false);
    }
  }

  if (isLoaded && !isSignedIn) {
    router.push("/account/sign-in");
    return <></>;
  }
  return (
    <>
      <Modal
        size={"lg"}
        opened={opened}
        onClose={() => {
          close();
        }}
        withCloseButton={true}
        centered
      >
        <div className="flex flex-wrap gap-5 items-center justify-center mb-10">
          {availableImages.map(name => (
            <Image className="hover:cursor-pointer" onClick={()=>{
              setProfileImage(`/images/profile-pics/${name}`)
              close();
            }} radius={'lg'} key={name} w={150} h={150} src={`/images/profile-pics/${name}`}/>
          ))}
        </div>
      </Modal>
      {newUser ? (
        <div className="flex flex-col items-center justify-center">
          <div className="w-[75%] min-h-200 border-2 tracking-tight border-blue-900 rounded-2xl mt-10 flex flex-col items-center  bg-[#c9e3e5]">
            <div className="flex flex-col items-center justify-center mt-10 p-5">
              <span className="text-3xl mt-5 font-semibold">
                Welcome to <span className="text-red-700">A</span>
                <span className="text-green-700">B</span>
                <span className="text-blue-700">U</span>
                <span className="text-yellow-600">Y</span>!
              </span>
              <span className="mt-5 font-semibold">
                This site is a satirical management simulator game.
              </span>
              <span>
                Since you're new here, let's create your user profile for the
                site:
              </span>

              <TextInput
                className="mt-10"
                radius={"md"}
                required
                label={"Your Seller Name"}
                maxLength={15}
                onChange={(e) => {
                  setSellerName(e.target.value);
                  if(e.target.value.trim() === ""){
                    setCondidionsMet(false);
                  }
                  else{
                    setCondidionsMet(true);
                  }
                }}
                value={sellerName}
              ></TextInput>
              <Button
                radius={"md"}
                className="mt-5 bg-blue-900!"
                onClick={open}
              >
                Choose Profile Image
              </Button>
              <Image
                radius={"lg"}
                src={profileImage}
                w={200}
                h={200}
                className="mt-5"
              ></Image>
              <span className="mt-5">
                Day: <span className="font-semibold">1</span>
              </span>
              <span className="mt-2">
                Starting Cash: <span className="font-semibold">$100</span>
              </span>
              { !attemptingCreate ?
                (<Button radius={"md"} className="mt-5 bg-green-700!" disabled={!conditionsMet} onClick={()=>{
                  setAttemptingCreate(true);
                  addNewUserToDbAndStart()
                }}>
                  Start Game
                </Button>)
              : 
              <div className="loader mt-5"></div>  
              }
              <div hidden={!dbError} className="mt-3 text-red-600">Database error, please try again</div>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

//then: Stock the store with the current day seed (that's an API route)
//Different puzzle, don't worry about this here
