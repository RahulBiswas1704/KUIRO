import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini } from '@/lib/ai/gemini';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      customerName = 'Customer', 
      lastMessage = '', 
      channel = 'whatsapp', 
      brandName = 'Our Business',
      industry = 'Small & Medium Business / Retail / Services' 
    } = body;

    const systemInstruction = `You are the AI Brand Assistant for "${brandName}", operating in the "${industry}" sector in India.
Your communication style is warm, polite, brand-aligned, authoritative, and helpful.
Guidelines:
1. Always be respectful, polite, and reassuring.
2. Inquire about the customer's needs or offer seamless next steps (e.g. WhatsApp booking, order confirmation, catalog preview, or direct phone call).
3. Keep the response under 60 words for quick mobile/WhatsApp readability.
4. Align with the business sector and maintain a welcoming, customer-first tone.`;

    const prompt = `Customer Name: ${customerName}
Channel: ${channel}
Latest Customer Message: "${lastMessage}"

Write a concise, welcoming, and brand-aligned reply from ${brandName} addressing the customer's request.`;

    let suggestion = '';
    try {
      suggestion = await generateWithGemini({
        prompt,
        systemInstruction,
        temperature: 0.6,
      });
    } catch (aiErr) {
      console.warn('[Gemini AI Suggest Fallback]', aiErr);
      const indLower = (industry || '').toLowerCase();
      if (indLower.includes('retail') || indLower.includes('store') || indLower.includes('cloth') || indLower.includes('jewel')) {
        suggestion = `Hello ${customerName}! Thank you for reaching out to ${brandName}. Yes, this item is available! Would you like us to reserve it for in-store pickup, or share photos directly here on WhatsApp?`;
      } else if (indLower.includes('consult') || indLower.includes('coach') || indLower.includes('tech') || indLower.includes('agency')) {
        suggestion = `Hello ${customerName}! Thank you for getting in touch with ${brandName}. We would be delighted to discuss this. Would you prefer a quick phone call, or should we send the briefing deck directly here?`;
      } else {
        suggestion = `Hello ${customerName}! Thank you for reaching out to ${brandName}. We would love to assist you with this right away. What day or time works best for you to connect?`;
      }
    }

    return NextResponse.json({
      success: true,
      suggestion: suggestion.trim(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate AI suggestion' },
      { status: 500 }
    );
  }
}
