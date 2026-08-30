import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { type OCRResult, type Category } from '@/types';
import { CATEGORIES } from '@/lib/utils/categories';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not configured');
      return NextResponse.json(fallbackResult('API key not configured'));
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type || 'image/jpeg';

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash for OCR Vision extraction
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are reading a receipt, invoice, or bill photo from Bangladesh (e.g. Meena Bazar, Shwapno, DESCO, Pathao, Uber, bKash, etc.).
Extract the fields and return ONLY a JSON object:
{
  "amount": <number or null>,
  "date": "<YYYY-MM-DD string or null>",
  "shop": "<merchant or shop name or null>",
  "category": "<one of: ${CATEGORIES.join(', ')} or null>",
  "confidence": {
    "amount": <number 0.0 to 1.0>,
    "date": <number 0.0 to 1.0>,
    "shop": <number 0.0 to 1.0>,
    "category": <number 0.0 to 1.0>
  }
}

Rules:
- amount: total amount paid in BDT (numbers only)
- date: transaction date formatted as YYYY-MM-DD
- shop: merchant / payee name
- category: closest matching category from the list
- confidence: score between 0.0 (uncertain) and 1.0 (certain)
- If the amount is unclear or not visible, set amount to null and confidence.amount to 0.0`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: base64,
        },
      },
    ]);

    const rawResponse = result.response.text().trim();

    // Extract JSON substring from markdown blocks or raw text
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(fallbackResult('Could not parse JSON from model output'));
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const ocrResult: OCRResult = {
      amount: typeof parsed.amount === 'number' && !isNaN(parsed.amount) ? parsed.amount : null,
      date: typeof parsed.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date) ? parsed.date : null,
      shop: typeof parsed.shop === 'string' ? parsed.shop.trim() : null,
      category: CATEGORIES.includes(parsed.category as Category)
        ? (parsed.category as Category)
        : null,
      confidence: {
        amount: typeof parsed.confidence?.amount === 'number' ? Math.max(0, Math.min(1, parsed.confidence.amount)) : 0,
        date: typeof parsed.confidence?.date === 'number' ? Math.max(0, Math.min(1, parsed.confidence.date)) : 0,
        shop: typeof parsed.confidence?.shop === 'number' ? Math.max(0, Math.min(1, parsed.confidence.shop)) : 0,
        category: typeof parsed.confidence?.category === 'number' ? Math.max(0, Math.min(1, parsed.confidence.category)) : 0,
      },
      raw_text: rawResponse,
    };

    return NextResponse.json(ocrResult);
  } catch (error: any) {
    console.error('OCR processing error:', error);
    return NextResponse.json(fallbackResult(error?.message || 'Error processing receipt'));
  }
}

function fallbackResult(reason?: string): OCRResult {
  return {
    amount: null,
    date: null,
    shop: null,
    category: null,
    confidence: {
      amount: 0,
      date: 0,
      shop: 0,
      category: 0,
    },
    raw_text: reason || 'Fallback',
  };
}
