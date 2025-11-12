"use client";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Center, Image, Modal, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { SignOutButton } from "@clerk/nextjs";
export default function Account({
  availableImages,
}: {
  availableImages: string[];
}) {
  const { isLoaded, isSignedIn, user } = useUser();
  const auth = useAuth();
  const [sellerName, setSellerName] = useState<string | null>();
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const [profileimage, setProfileImage] = useState<string>();
  const [gameDay, setGameDay] = useState();
  const [cash, setCash] = useState();

  const [updateDisabled, setUpdateDisabled] = useState(false);

  //These are not in the db yet, add them
  const [itemsSold, setItemsSold] = useState(0);
  const [itemsPurchased, setItemsPurchased] = useState(0);
  

  const fetchUserDbObject = async () => {
    try {
      const result = await axios.get(`/api/user/${user?.id}`);
      if (result.data.rows.length < 1) {
        console.log("No user db object");
        router.push("/new-day");
      }
      const userObject = result.data.rows[0];
      console.log(userObject);
      setSellerName(userObject.seller_name);
      setProfileImage(userObject.seller_image_url);
      setGameDay(userObject.current_day);
      setCash(userObject.money);
    } catch (error) {
      console.error("Failed to fetch userDbObject: ", error);
    }
  };

  const updateUserDbObject = async () => {
    try {
      setUpdateDisabled(true);
      const result = await axios.put(`api/user/${user?.id}`, {
        seller_name: sellerName,
        seller_image_url: profileimage,
      });
    } catch (error) {
      console.error("Failed to push user account updates to database: ", error);
    }
    setUpdateDisabled(false);
  };

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/account/sign-in");
    } else if (isLoaded && isSignedIn && !sellerName) {
      fetchUserDbObject();
    }
  }, [isLoaded, isSignedIn, router, user]);

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center">
        <span className="loader mt-100"></span>
      </div>
    );
  }
  if (isLoaded && isSignedIn && sellerName) {
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
            {availableImages.map((name) => (
              <Image
                className="hover:cursor-pointer"
                onClick={() => {
                  setProfileImage(`/images/profile-pics/${name}`);
                  close();
                }}
                radius={"lg"}
                key={name}
                w={150}
                h={150}
                src={`/images/profile-pics/${name}`}
              />
            ))}
          </div>
        </Modal>

        <div className="flex flex-col items-center">
          <Image
            src="ABUY_logo.png"
            w={150}
            h={50}
            className="mt-10 hover:cursor-pointer"
            onClick={() => {
              router.push("/");
            }}
          />
          <span className="mt-10 font-semibold text-2xl">
            Account Dashboard
          </span>
          <div className="border-2  w-[70%] h-[100%] rounded-2xl mt-10 border-gray-700 bg-gray-400 flex flex-col">
            <div className="flex md:flex-row flex-col">
              <div className="m-10 flex flex-1 flex-col gap-5">
                <span className="flex items-center">
                  <span className="font-semibold flex-3">
                    Change Seller Name:
                  </span>
                  <TextInput
                    className="flex-2"
                    value={sellerName}
                    radius={"md"}
                    onChange={(e) => {
                      setSellerName(e.target.value);
                    }}
                  ></TextInput>
                </span>

                <span className="flex items-center gap-5 font-semibold">
                  Change Profile Image:{" "}
                  <Image
                    src={profileimage}
                    w={150}
                    h={150}
                    radius={"lg"}
                    className="hover:cursor-pointer"
                    onClick={open}
                  ></Image>{" "}
                </span>

                <div className="flex justify-around mt-10 gap-3">
                  {!updateDisabled ? (
                    <Button
                      onClick={() => {
                        updateUserDbObject();
                      }}
                      className="bg-green-600! flex-2"
                      radius={"md"}
                    >
                      Update
                    </Button>
                  ) : (
                    <div className="loader"></div>
                  )}

                  <Button
                    onClick={() => {
                      auth.signOut();
                    }}
                    className="bg-blue-700! flex-1"
                    radius={"md"}
                  >
                    Log Out
                  </Button>
                </div>
              </div>
              <div className="font-semibold m-5 h-[100%] p-5 flex flex-3 flex-col items-center gap-5 border-2 rounded-2xl border-gray-500 bg- bg-gray-500">
                <span className="text-2xl text-gray-200">
                  Current Game Stats
                </span>
                <span className="w-[100%] border-b-1 bg-gray-400 p-2 rounded-md flex items-center justify-between">
                  <span>Game Day:</span> <span className="text-xl mr-3">{gameDay}</span>
                </span>
                <span className="w-[100%] border-b-1 bg-gray-400 p-2 rounded-md flex items-center justify-between">
                  <span>Current Cash:</span> <span className="text-xl mr-3">${cash}</span>
                </span>
                <span className="w-[100%] border-b-1 bg-gray-400 p-2 rounded-md flex items-center justify-between">
                  <span>Items Sold:</span> <span className="text-xl mr-3">{itemsSold}</span>
                </span>
                <span className="w-[100%] border-b-1 bg-gray-400 p-2 rounded-md flex items-center justify-between">
                  <span>Items Purchased:</span> <span className="text-xl mr-3">{itemsPurchased}</span>
                </span>
              </div>
            </div>
            <div className="mt-auto mb-5 self-center flex flex-col items-center gap-5">
              <span className="text-xl font-bold underline underline-offset-7">
                Danger Zone
              </span>
              <div className="self-center flex gap-5 mb-5">
                <Button className="bg-violet-900!">Reset All Stats</Button>
                <Button className=" bg-red-900!">Delete Account</Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
