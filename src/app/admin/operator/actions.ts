"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/auth";

export async function createOperator(formData: FormData) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return { success: false, error: "Unauthorized: Hanya Administrator yang berhak menambah operator." };
  }

  const name = (formData.get("name") as string)?.trim();
  const username = (formData.get("username") as string)?.trim().toLowerCase();
  const password = (formData.get("password") as string)?.trim();

  if (!name || !username || !password) {
    return { success: false, error: "Nama, username, dan password wajib diisi." };
  }

  if (username.length < 3) {
    return { success: false, error: "Username minimal 3 karakter." };
  }

  // Check if username conflicts with admin username
  const config = await prisma.config.findUnique({ where: { id: 1 } });
  if (config?.adminUsername?.toLowerCase() === username || username === "admin") {
    return { success: false, error: "Username ini sudah digunakan sebagai Administrator." };
  }

  // Check if username already exists in Operator table
  const existing = await prisma.operator.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
  });

  if (existing) {
    return { success: false, error: `Username '${username}' sudah digunakan oleh operator lain.` };
  }

  try {
    await prisma.operator.create({
      data: {
        name,
        username,
        password,
        isActive: true,
      },
    });

    revalidatePath("/admin/operator");
    return { success: true };
  } catch (error) {
    console.error("Create operator error:", error);
    return { success: false, error: "Gagal menambahkan operator ke database." };
  }
}

export async function updateOperator(formData: FormData) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return { success: false, error: "Unauthorized: Hanya Administrator yang berhak mengubah operator." };
  }

  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();

  if (!id || !name) {
    return { success: false, error: "Data operator tidak valid." };
  }

  try {
    const updateData: { name: string; password?: string } = { name };
    if (password && password !== "") {
      updateData.password = password;
    }

    await prisma.operator.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/operator");
    return { success: true };
  } catch (error) {
    console.error("Update operator error:", error);
    return { success: false, error: "Gagal memperbarui data operator." };
  }
}

export async function toggleOperatorStatus(id: string, currentStatus: boolean) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return { success: false, error: "Unauthorized: Hanya Administrator yang berhak mengubah status operator." };
  }

  try {
    await prisma.operator.update({
      where: { id },
      data: { isActive: !currentStatus },
    });

    revalidatePath("/admin/operator");
    return { success: true };
  } catch (error) {
    console.error("Toggle operator error:", error);
    return { success: false, error: "Gagal mengubah status operator." };
  }
}

export async function deleteOperator(id: string) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return { success: false, error: "Unauthorized: Hanya Administrator yang berhak menghapus operator." };
  }

  try {
    await prisma.operator.delete({
      where: { id },
    });

    revalidatePath("/admin/operator");
    return { success: true };
  } catch (error) {
    console.error("Delete operator error:", error);
    return { success: false, error: "Gagal menghapus operator." };
  }
}
