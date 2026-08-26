import prisma from "@/lib/db";
import { MessageCircle } from "lucide-react";

export default async function WhatsAppFloating() {
  const config = await prisma.config.findUnique({ where: { id: 1 } });
  if (!config) return null;

  return (
    <a 
      href={`https://wa.me/${config.csWhatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 p-4 bg-green-500 text-white rounded-full shadow-2xl hover:bg-green-600 hover:scale-110 transition-all z-50 flex items-center justify-center animate-bounce"
    >
      <MessageCircle className="w-8 h-8" />
    </a>
  );
}
