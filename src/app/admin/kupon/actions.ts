"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateConfig(formData: FormData) {
  const eventName = formData.get("eventName") as string;
  const couponPrice = Number(formData.get("couponPrice"));
  const totalCoupons = Number(formData.get("totalCoupons"));
  const isOpen = formData.get("isOpen") === "on";

  await prisma.config.update({
    where: { id: 1 },
    data: {
      eventName,
      couponPrice,
      totalCoupons,
      isOpen,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/kupon");
}
