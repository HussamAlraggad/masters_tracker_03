"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/plan";

  useEffect(() => {
    router.push(`/login?redirect=${redirectTo}`);
  }, [router, redirectTo]);

  return null;
}