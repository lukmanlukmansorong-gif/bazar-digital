import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: { tickets: true },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    if (transaction.status === "REFUNDED") {
      return NextResponse.json({ error: "Transaksi sudah berstatus Refund" }, { status: 400 });
    }

    // Process refund inside transaction
    await prisma.$transaction(async (tx) => {
      // If transaction was previously VERIFIED, return the stock
      if (transaction.status === "VERIFIED") {
        const config = await tx.config.findUnique({ where: { id: 1 } });
        if (config) {
          await tx.config.update({
            where: { id: 1 },
            data: {
              couponsSold: Math.max(0, config.couponsSold - transaction.quantity),
            },
          });
        }
      }

      // Update transaction status to REFUNDED
      await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "REFUNDED",
        },
      });
    });

    return NextResponse.json({ success: true, message: "Transaksi berhasil di-refund dan stok dikembalikan." });
  } catch (error) {
    console.error("Refund error:", error);
    return NextResponse.json({ error: "Gagal memproses refund" }, { status: 500 });
  }
}
