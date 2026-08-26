import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { buyerName, buyerWa, buyerEmail, notes, quantity, paymentMethod } = body;

    if (!buyerName || !buyerWa || !quantity || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const config = await prisma.config.findUnique({ where: { id: 1 } });
    if (!config || !config.isOpen) {
      return NextResponse.json({ error: "Bazar is closed" }, { status: 400 });
    }

    const stockLeft = config.totalCoupons - config.couponsSold;
    if (quantity > stockLeft) {
      return NextResponse.json({ error: "Not enough stock" }, { status: 400 });
    }

    const totalAmount = quantity * config.couponPrice;

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        buyerName,
        buyerWa,
        buyerEmail,
        notes,
        quantity,
        totalAmount,
        paymentMethod,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, transactionId: transaction.id });
  } catch (error) {
    console.error("Transaction Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
