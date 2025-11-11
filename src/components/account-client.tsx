"use client";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Center, Image, Modal, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
export default function Account({
  availableImages,
}: {
  availableImages: string[];
}) {
  const { isLoaded, isSignedIn, userId, sessionId, getToken } = useAuth();
  const [sellerName, setSellerName] = useState<string | null>();
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const [profileimage, setProfileImage] = useState<string>();
  const fetchUserDbObject = async () => {
    try {
      const result = await axios.get(`/api/user/${userId}`);
      if (result.data.rows.length < 1) {
        console.log("No user db object");
        router.push("/new-day");
      }
      setSellerName(result.data.rows[0].seller_name);
      setProfileImage(result.data.rows[0].seller_image_url);
    } catch (error) {
      console.error("Failed to fetch userDbObject: ", error);
    }
  };

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/account/sign-in");
    } else if (isLoaded && isSignedIn) {
      fetchUserDbObject();
    }
  }, [isLoaded, isSignedIn, router]);

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
          <div className="border-2  w-[70%] h-150 rounded-2xl mt-10 border-gray-700 bg-gray-400 flex flex-col">
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
              </div>
              <div className="font-semibold m-5 h-[100%] p-5 flex flex-3 flex-col items-center gap-5 border-2 rounded-2xl border-gray-500 bg- bg-gray-500">
                <span className="text-2xl text-gray-200">
                  Current Game Stats
                </span>
                <span className="mr-auto w-[100%] border-b-1 bg-gray-400 p-2 rounded-md">Game Day: </span>
                <span className="mr-auto w-[100%] border-b-1 bg-gray-400 p-2 rounded-md">Current Cash: </span>
                <span className="mr-auto w-[100%] border-b-1 bg-gray-400 p-2 rounded-md">Items Sold: </span>
                <span className="mr-auto w-[100%] border-b-1 bg-gray-400 p-2 rounded-md">Items Purchased: </span>
                <span className="mr-auto w-[100%] border-b-1 bg-gray-400 p-2 rounded-md">Seller Rating: </span>
              </div>
            </div>
            <div className="mt-auto mb-5 self-center flex flex-col items-center gap-5">
                <span className="text-xl font-bold">Danger Zone</span>
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
