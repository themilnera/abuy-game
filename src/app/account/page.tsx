"use client";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Account() {
  const { isLoaded, isSignedIn, userId, sessionId, getToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/account/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center">
        <span className="loader mt-100"></span>
      </div>
    );
  }
  if ((isLoaded && isSignedIn)) {
    return <>Account {userId}</>;
  }
}
