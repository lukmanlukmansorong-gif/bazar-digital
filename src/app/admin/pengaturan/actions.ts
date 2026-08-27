"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateSettings(formData: FormData) {
  const bankName = formData.get("bankName") as string;
  const bankAccount = formData.get("bankAccount") as string;
  const bankAccountName = formData.get("bankAccountName") as string;
  const csWhatsapp = formData.get("csWhatsapp") as string;
  const qrisUrl = formData.get("qrisUrl") as string | null;

  await prisma.config.update({
    where: { id: 1 },
    data: {
      bankName,
      bankAccount,
      bankAccountName,
      csWhatsapp,
      qrisUrl: qrisUrl || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/pengaturan");
}
