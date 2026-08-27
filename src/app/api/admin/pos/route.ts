import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { buyerName, buyerWa, quantity, notes } = body;

    const qty = parseInt(quantity, 10);
    if (!qty || qty < 1) {
      return NextResponse.json({ error: "Jumlah kupon tidak valid" }, { status: 400 });
    }

    const config = await prisma.config.findUnique({ where: { id: 1 } });
    if (!config) {
      return NextResponse.json({ error: "Config tidak ditemukan" }, { status: 404 });
    }

    const stockLeft = config.totalCoupons - config.couponsSold;
    if (qty > stockLeft) {
      return NextResponse.json({ error: `Stok tidak cukup (Sisa: ${stockLeft})` }, { status: 400 });
    }

    const totalAmount = qty * config.couponPrice;
    const name = buyerName?.trim() || "Pembeli Tunai (On the Spot)";
    const wa = buyerWa?.trim() || "-";

    // Create transaction & tickets atomically
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          buyerName: name,
          buyerWa: wa,
          quantity: qty,
          totalAmount,
          paymentMethod: "CASH",
          notes: notes || "Pembelian langsung di lokasi (Kasir)",
          status: "VERIFIED",
        },
      });

      // Update config sold count
      await tx.config.update({
        where: { id: 1 },
        data: {
          couponsSold: config.couponsSold + qty,
        },
      });

      // Create tickets
      const createdTickets = [];
      for (let i = 0; i < qty; i++) {
        const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
        const code = `BZR-2026-${randomStr}`;
        const ticket = await tx.ticket.create({
          data: {
            code,
            transactionId: transaction.id,
          },
        });
        createdTickets.push({
          id: ticket.id,
          code: ticket.code,
          isRedeemed: ticket.isRedeemed,
        });
      }

      return {
        ...transaction,
        tickets: createdTickets,
      };
    });

    return NextResponse.json({ success: true, transaction: result });
  } catch (error) {
    console.error("POS Error:", error);
    return NextResponse.json({ error: "Gagal memproses transaksi kasir" }, { status: 500 });
  }
}
