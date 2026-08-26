import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    
    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Search by Transaction ID or Buyer WA
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { id: query },
          { buyerWa: query }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
