import NewDayClient from "@/components/newday-client";
import fs from "fs/promises";
import path from "path";

export default async function NewDay() {
  const profileImages = path.join(process.cwd(), "public/images/profile-pics");
  const files = await fs.readdir(profileImages);
  return <NewDayClient availableImages={files} />;
}
