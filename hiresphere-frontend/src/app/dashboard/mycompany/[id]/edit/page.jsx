"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacyEditRedirect({ params }) {
  const { id } = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/dashboard/mycompany/${id}/update`);
  }, [id, router]);

  return null;
}
