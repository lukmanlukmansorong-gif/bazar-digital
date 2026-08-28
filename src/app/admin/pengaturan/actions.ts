"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateSettings(formData: FormData) {
  const bankName = formData.get("bankName") as string;
  const bankAccount = formData.get("bankAccount") as string;
  const bankAccountName = formData.get("bankAccountName") as string;
  const csWhatsapp = formData.get("csWhatsapp") as string;
  const qrisUrl = formData.get("qrisUrl") as string | null;
  const adminUsername = formData.get("adminUsername") as string | null;
  const adminPassword = formData.get("adminPassword") as string | null;

  const updateData: {
    bankName: string;
    bankAccount: string;
    bankAccountName: string;
    csWhatsapp: string;
    qrisUrl: string | null;
    adminUsername?: string;
    adminPassword?: string;
  } = {
    bankName,
    bankAccount,
    bankAccountName,
    csWhatsapp,
    qrisUrl: qrisUrl || null,
  };

  if (adminUsername && adminUsername.trim() !== "") {
    updateData.adminUsername = adminUsername.trim();
  }

  if (adminPassword && adminPassword.trim() !== "") {
    updateData.adminPassword = adminPassword.trim();
  }

  await prisma.config.update({
    where: { id: 1 },
    data: updateData,
  });

  revalidatePath("/");
  revalidatePath("/admin/pengaturan");
}
