import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { code, action } = body; // action: "CHECK" or "REDEEM"
    
    const ticket = await prisma.ticket.findUnique({ 
      where: { code },
      include: { transaction: true }
    });

    if (!ticket) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

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
