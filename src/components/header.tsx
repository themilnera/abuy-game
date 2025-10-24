"use client";

import { Button, Menu, NavLink, TextInput, Tooltip } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";

import {
  IconBell,
  IconCaretDownFilled,
  IconShoppingCart,
} from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const hiddenHeaderRoutes = ["/admin/create-product"];
  const [searchBarInFocus, setSearchBarInFocus] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("Category");
  const location = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (location !== "/search" && !location.match(/product/)) {
      setSearchTerm("");
      setSearchCategory("Category");
    }
  }, [location]);

  const encodeURIAndPushToSearchPage = () => {
    const _st = searchTerm;
    const encodedSearchTerm = encodeURIComponent(searchTerm);
    if (searchCategory !== "Category") {
      const encodedCategory = encodeURIComponent(searchCategory.toLowerCase());

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
      {!hiddenHeaderRoutes.includes(location) ? (
        <div className="flex flex-col items-center">
          <div className="header md:w-[70vw] h-60 text-sm flex flex-col">
            {/* Top of header (links) */}
            <div className="header-top w-[100%] h-9 pl-3 pt-1 pb-1 bg-white flex flex-row gap-10 border-b border-b-stone-400">
              <div className="flex gap-1.5">
                <Link href="/" className="text-blue-800 underline ml-1">
                  Sign In
                </Link>
                <p>or</p>
                <Link href="/" className="text-blue-800 underline">
                  Register
                </Link>
              </div>

              <div className="flex gap-10 collapse md:visible">
                <Link
                  href="/deals"
                  className="hover:underline hover:underline-offset-3"
                >
                  Deals of the Day
                </Link>
                <Link
                  href="/help"
                  className="hover:underline hover:underline-offset-3"
                >
                  Need Help?
                </Link>
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
                  <Image
                    src={`/ABUY_logo.png`}
                    alt="ABUY logo"
                    width={180}
                    height={10}
                  ></Image>
                </Link>
                <Menu
                  width={110}
                  transitionProps={{ transition: "fade-down", duration: 150 }}
                >
                  <Menu.Target>
                    <Button className="browse-button mr-2 " radius="sm">
                      <span className="text-lg flex items-center mr-5">
                        Browse
                        <IconCaretDownFilled width={"20px"} height={"20px"} />
                      </span>
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item>
                      <Link href="/browse/apparel" className="text-sm">
                        Apparel
                      </Link>
                    </Menu.Item>
                    <Menu.Item>
                      <Link href="/browse/electronics" className="text-sm">
                        Electronics
                      </Link>
                    </Menu.Item>
                    <Menu.Item>
                      <Link href="/browse/books" className="text-sm">
                        Books
                      </Link>
                    </Menu.Item>
                    <Menu.Item>
                      <Link href="/browse/misc" className="text-sm">
                        Misc
                      </Link>
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </div>
              <div className="flex md:w-[100%] items-center ml-20 md:ml-0">
                <TextInput
                  placeholder="Search for something"
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
                      }}
                    >
                      <Menu.Target>
                        <span className="w-[200px] text-sm! mr-13 border-l-1 p-2 text-gray-400 hover:cursor-pointer">
                          {searchCategory}
                        </span>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item onClick={() => setSearchCategory("Apparel")}>
                          <span className="text-sm">Apparel</span>
                        </Menu.Item>
                        <Menu.Item
                          onClick={() => setSearchCategory("Electronics")}
                        >
                          <span className="text-sm">Electronics</span>
                        </Menu.Item>
                        <Menu.Item onClick={() => setSearchCategory("Books")}>
                          <span className="text-sm">Books</span>
                        </Menu.Item>
                        <Menu.Item
                          onClick={() => {
                            setSearchCategory("Misc");
                          }}
                        >
                          <span className="text-sm">Misc</span>
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  }
                />

                <Button
                  size="md"
                  radius={"xl"}
                  className="md:flex-1 ml-3 mr-20 bg-green-800! hover:bg-green-900!"
                  onClick={encodeURIAndPushToSearchPage}
                >
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
