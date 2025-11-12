import AccountClient from "@/components/account-client";
import fs from "fs/promises";
import path from "path";

export default async function Account() {
  const profileImages = path.join(process.cwd(), "public/images/profile-pics");
  const files = await fs.readdir(profileImages);
  return <AccountClient availableImages={files} />;
}
