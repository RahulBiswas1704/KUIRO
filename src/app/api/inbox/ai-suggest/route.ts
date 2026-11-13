import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini } from '@/lib/ai/gemini';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName = 'Customer', lastMessage = '', channel = 'whatsapp', brandName = 'Apex Diagnostic & Wellness Clinic' } = body;

    const systemInstruction = `You are the AI Brand Assistant for ${brandName}, an Indian preventive healthcare and diagnostic clinic.
Your communication style is warm, empathetic, authoritative, and helpful.
Guidelines:
1. Always be respectful, polite, and reassuring.
2. Inquire about patient comfort or offer seamless booking steps.
3. Keep the response under 60 words for quick mobile/WhatsApp readability.
4. Do not offer unsolicited clinical diagnosis, but encourage consultation.`;

    const prompt = `Customer Name: ${customerName}
Channel: ${channel}
Latest Customer Message: "${lastMessage}"

Write a concise, caring, and professional reply from ${brandName} addressing the customer's request.`;

    let suggestion = '';
    try {
      suggestion = await generateWithGemini({
        prompt,
        systemInstruction,
        temperature: 0.6,
      });
    } catch (aiErr) {
      console.warn('[Gemini AI Suggest Fallback]', aiErr);
      suggestion = `Hello ${customerName}! Thank you for reaching out to ${brandName}. Yes, our Diwali preventive checkup package is available this Saturday. Would you like me to reserve a morning slot at 9:30 AM or 11:00 AM?`;
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

