import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { action } = body; // "VERIFY" or "REJECT"
    
    const transaction = await prisma.transaction.findUnique({ where: { id: params.id } });
    if (!transaction) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (transaction.status !== "WAITING_VERIFICATION") return NextResponse.json({ error: "Cannot process" }, { status: 400 });

    if (action === "VERIFY") {
      await prisma.$transaction(async (tx) => {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: "VERIFIED" }
        });

        const config = await tx.config.findUnique({ where: { id: 1 } });
        await tx.config.update({
          where: { id: 1 },
          data: { couponsSold: config!.couponsSold + transaction.quantity }
        });

        // Generate tickets
        for (let i = 0; i < transaction.quantity; i++) {
          const code = `BZR-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          await tx.ticket.create({
            data: {
              code,
              transactionId: transaction.id
            }
          });
        }
      });
    } else if (action === "REJECT") {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "REJECTED" }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
