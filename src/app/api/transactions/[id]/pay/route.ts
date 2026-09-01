import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    let body;
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    const { proofUrl } = body;
    
    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (!transaction) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
    }
    if (transaction.status !== "PENDING") {
      return NextResponse.json({ error: `Transaksi sudah diproses (status: ${transaction.status})` }, { status: 400 });
    }

    if (transaction.paymentMethod === "QRIS") {
      // Simulate auto-verification for QRIS
      // Use sequential queries instead of $transaction to avoid Neon pooler issues
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "VERIFIED" }
      });

      const config = await prisma.config.findUnique({ where: { id: 1 } });
      if (config) {
        await prisma.config.update({
          where: { id: 1 },
          data: { couponsSold: config.couponsSold + transaction.quantity }
        });
      }

      // Generate tickets
      const ticketData = [];
      for (let i = 0; i < transaction.quantity; i++) {
        const code = `BZR-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        ticketData.push({
          code,
          transactionId: transaction.id
        });
      }
      
      // Use createMany for better performance with large quantities
      await prisma.ticket.createMany({ data: ticketData });

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
    console.error("Pay route error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
