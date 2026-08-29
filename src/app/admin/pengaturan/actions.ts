"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/auth";

export async function updateSettings(formData: FormData) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    throw new Error("Unauthorized: Hanya Administrator yang berhak mengubah pengaturan.");
  }

  const bankName = formData.get("bankName") as string;
  const bankAccount = formData.get("bankAccount") as string;
  const bankAccountName = formData.get("bankAccountName") as string;
  const csWhatsapp = formData.get("csWhatsapp") as string;
  const qrisUrl = formData.get("qrisUrl") as string | null;
  const adminUsername = formData.get("adminUsername") as string | null;
  const adminPassword = formData.get("adminPassword") as string | null;
  const operatorUsername = formData.get("operatorUsername") as string | null;
  const operatorPassword = formData.get("operatorPassword") as string | null;

  const updateData: {
    bankName: string;
    bankAccount: string;
    bankAccountName: string;
    csWhatsapp: string;
    qrisUrl: string | null;
    adminUsername?: string;
    adminPassword?: string;
    operatorUsername?: string | null;
    operatorPassword?: string | null;
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

  // Handle Operator account settings
  if (operatorUsername !== null) {
    const trimmedOpUser = operatorUsername.trim();
    if (trimmedOpUser === "") {
      // If cleared, disable operator account
      updateData.operatorUsername = null;
      updateData.operatorPassword = null;
    } else {
      updateData.operatorUsername = trimmedOpUser;
      if (operatorPassword && operatorPassword.trim() !== "") {
        updateData.operatorPassword = operatorPassword.trim();
      }
    }
  }

  await prisma.config.update({
    where: { id: 1 },
    data: updateData,
  });

  revalidatePath("/");
  revalidatePath("/admin/pengaturan");
}

