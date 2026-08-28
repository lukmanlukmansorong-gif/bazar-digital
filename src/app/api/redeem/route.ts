import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { code, action } = body; // action: "CHECK" or "REDEEM"
    
    const ticket = await prisma.ticket.findUnique({ 
      where: { code },
      include: { transaction: true }
    });

    if (!ticket) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

    // Check if parent transaction is refunded
    if (ticket.transaction.status === "REFUNDED") {
      return NextResponse.json({
        ticket,
        status: "REFUNDED",
        buyerName: ticket.transaction.buyerName,
        error: "Kupon ini telah DIBATALKAN / DIBERIKAN REFUND oleh panitia dan tidak dapat digunakan."
      });
    }

    if (action === "CHECK") {
      return NextResponse.json({ 
        ticket,
        status: ticket.isRedeemed ? "ALREADY_REDEEMED" : "VALID",
        buyerName: ticket.transaction.buyerName
      });
    }

    if (action === "REDEEM") {
      if (ticket.isRedeemed) {
        return NextResponse.json({ error: "ALREADY_REDEEMED" }, { status: 400 });
      }

      await prisma.ticket.update({
        where: { code },
        data: { isRedeemed: true, redeemedAt: new Date() }
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid Action" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
