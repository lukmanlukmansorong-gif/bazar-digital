import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { proofUrl } = body;
    
    const transaction = await prisma.transaction.findUnique({ where: { id: params.id } });
    if (!transaction) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (transaction.status !== "PENDING") return NextResponse.json({ error: "Already processed" }, { status: 400 });

    if (transaction.paymentMethod === "QRIS") {
      // Simulate auto-verification for QRIS
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
      return NextResponse.json({ success: true, status: "VERIFIED" });
    } else {
      // Bank Transfer - goes to manual verification
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { 
          status: "WAITING_VERIFICATION",
          paymentProofUrl: proofUrl || "dummy-proof-url" 
        }
      });
      return NextResponse.json({ success: true, status: "WAITING_VERIFICATION" });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
