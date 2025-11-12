"use client";
import { Button, Menu, NavLink, TextInput, Tooltip, UnstyledButton } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";

import { IconBell, IconCaretDownFilled, IconShoppingCart } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";

export default function Header() {
  const { isLoaded, isSignedIn, user } = useUser();
  const location = usePathname();
  const router = useRouter();
  const [sellerName, setSellerName] = useState<string | null>();
  const [currentCash, setCurrentCash] = useState<string | null>();
  const hiddenHeaderRoutes = ["/admin", "/account", "new-day"];
  const isHeaderHiddenRoute = hiddenHeaderRoutes.some((route) => location.match(route));

  const categories = ["Apparel", "Electronics", "Books", "Home & Garden", "Misc"];

  const [searchBarInFocus, setSearchBarInFocus] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("Category");
  const [sbcMw, setSbcMw] = useState(100); //search bar category minimum width

  useEffect(() => {
    if (location !== "/search" && !location.match(/product/)) {
      setSearchTerm("");
      setSearchCategory("Category");
    }
  }, [location]);

  useEffect(() => {
    const checkUserDbEntry = async () => {
      try {
        if (user) {
          const result = await axios.get(`/api/user/${user.id}`);
          if (result.data.rows.length < 1) {
            router.push("/new-day");
          } else {
            setSellerName(result.data.rows[0].seller_name);
            setCurrentCash("$" + result.data.rows[0].money.toString());
          }
        }
      } catch (error) {
        console.error("Failed to check if User db object exists: ", error);
      }
    };
    checkUserDbEntry();
  }, [user]);

  const pushToBrowseURL = (category: string) => {
    router.push(`/search?q=&category=${encodeURIComponent(category.replace(" & ", "").trim())}&page=1`);
  };

  const encodeURIAndPushToSearchPage = () => {
    const _st = searchTerm;
    const encodedSearchTerm = encodeURIComponent(searchTerm);
    if (searchCategory !== "Category") {
      const encodedCategory = encodeURIComponent(searchCategory.replace(" & ", "").toLowerCase());

      const url = `search?q=${encodedSearchTerm}&category=${encodedCategory}&page=1`;
      router.push(url);

      setSearchTerm(_st);
    } else {
      const url = `search?q=${encodedSearchTerm}&page=1`;
      router.push(url);

      setSearchTerm(_st);
    }
  };

  return (
    <>
      {!isHeaderHiddenRoute ? (
        <div className="flex flex-col items-center">
          <div className="header md:w-[70vw] h-60 text-sm flex flex-col">
            {/* Top of header (links) */}
            <div className="header-top w-[100%] h-12 pl-3 bg-white flex flex-row items-center justify-center gap-10 border-b border-b-stone-400">
              {!isSignedIn || !sellerName ? (
                <div className="flex gap-1.5">
                  <Link href="/account/sign-in" className="text-blue-800 underline ml-1">
                    Sign In
                  </Link>
                  <p>or</p>
                  <Link href="/account/sign-in" className="text-blue-800 underline">
                    Register
                  </Link>
                </div>
              ) : (
                <div className="flex gap-6 items-center">
                  <Link href={"/account"} className="text-blue-800 underline ml-1">
                    Welcome, {sellerName}
                  </Link>
                  <span className="font-bold text-lg">{currentCash}</span>
                </div>
              )}
              <div className="flex gap-10 ">
                <Button
                  size="xs"
                  color="#7a2020"
                  onClick={() => {
                    router.push("/new-day");
                  }}>
                  End Game Day
                </Button>
              </div>

              <div className="flex gap-5 ml-auto mr-5">
                <Link href="/sell">Sell</Link>
                <Link href="/my-bids">Bids</Link>
                <Tooltip label="Notifications" offset={1}>
                  <Link href="/notifications">
                    <IconBell />
                  </Link>
                </Tooltip>
                <Tooltip label="My shopping cart" offset={1}>
                  <Link href="/cart">
                    <IconShoppingCart />
                  </Link>
                </Tooltip>
              </div>
            </div>

            {/* Bottom of header */}
            <div className="header-bottom w-[100%] h-[100%] flex flex-col md:flex-row items-center">
              <div className="flex items-center">
                <Link href="/">
                  <Image src={`/ABUY_logo.png`} alt="ABUY logo" width={180} height={10}></Image>
                </Link>
                <Menu width={140} transitionProps={{ transition: "fade-down", duration: 150 }} closeOnItemClick={true}>
                  <Menu.Target>
                    <Button className="browse-button mr-2 " radius="sm">
                      <span className="text-lg flex items-center mr-5">
                        Browse
                        <IconCaretDownFilled width={"20px"} height={"20px"} />
                      </span>
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    {categories.map((category) => {
                      return (
                        <Menu.Item
                          key={category}
                          onClick={() => {
                            pushToBrowseURL(category.toLowerCase());
                          }}>
                          <span className="text-sm">{category}</span>
                        </Menu.Item>
                      );
                    })}
                  </Menu.Dropdown>
                </Menu>
              </div>
              <div className="flex md:w-[100%] items-center ml-20 md:ml-0">
                <TextInput
                  placeholder="Search"
                  aria-label="Search field"
                  size="md"
                  radius={"lg"}
                  className="flex-7 ml-1 border-gray-400"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                  }}
                  onFocus={() => {
                    setSearchBarInFocus(true);
                  }}
                  onBlur={() => {
                    setSearchBarInFocus(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchBarInFocus) {
                      encodeURIAndPushToSearchPage();
                    }
                  }}
                  rightSection={
                    <Menu
                      transitionProps={{
                        transition: "fade-down",
                        duration: 150,
                      }}>
                      <Menu.Target>
                        <UnstyledButton maw={180} miw={sbcMw} className="flex text-sm! border-l-1 pl-2 mr-8 text-gray-400 hover:cursor-pointer">
                          {searchCategory}
                        </UnstyledButton>
                      </Menu.Target>
                      <Menu.Dropdown>
                        {categories.map((category) => {
                          return (
                            <Menu.Item
                              key={category}
                              onClick={() => {
                                setSearchCategory(category);
                                category.length > 11 ? setSbcMw(180) : setSbcMw(category.length * 10);
                              }}
                              onLoad={() => {
                                setSbcMw(category.length * 10);
                              }}>
                              <span className="text-sm">{category}</span>
                            </Menu.Item>
                          );
                        })}
                      </Menu.Dropdown>
                    </Menu>
                  }
                />

                <Button size="md" radius={"xl"} className="md:flex-1 ml-3 mr-20 bg-green-800! hover:bg-green-900!" onClick={encodeURIAndPushToSearchPage}>
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
