import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import type { ParsedOrderResult } from '@/types';

const SYSTEM_PROMPT = `You are a supply order parser for a construction trade supplier (HVAC, Electrical, Plumbing).

Your job is to extract structured order information from messy contractor text messages.

RULES:
1. Extract each distinct product request as a separate item
2. Extract: product description, quantity (number), unit (if mentioned: ft, box, each, roll, etc.)
3. Do NOT invent SKUs or product codes - only extract what the contractor described
4. If quantity is unclear or not mentioned, set quantity to null
5. If unit is not mentioned, set unit to null
6. Look for delivery location mentions (job site names, addresses)
7. Extract any special notes or instructions
8. Be generous in interpretation - contractors use informal language

EXAMPLES:
- "30ft of half-inch copper pipe" → description: "half-inch copper pipe", quantity: 30, unit: "ft"
- "2 boxes of those red wire nuts" → description: "red wire nuts", quantity: 2, unit: "box"
- "some 3/4 PVC elbows" → description: "3/4 PVC elbows", quantity: null, unit: null
- "need romex 12/2 about 500 feet" → description: "romex 12/2", quantity: 500, unit: "ft"

OUTPUT FORMAT (JSON only, no markdown):
{
  "items": [
    { "description": "string", "quantity": number | null, "unit": "string" | null }
  ],
  "delivery_location": "string" | null,
  "notes": "string" | null
}`;

// Gemini implementation using Vercel AI SDK (same as AI Real Estate)
export async function parseOrderTextWithGemini(rawText: string): Promise<ParsedOrderResult> {
    try {
        const { text } = await generateText({
            model: google('gemini-2.0-flash'),
            prompt: `${SYSTEM_PROMPT}\n\nINPUT TEXT TO PARSE:\n"${rawText}"\n\nRespond with ONLY the JSON object, no other text.`,
        });

        if (!text) {
            throw new Error('No response from Gemini');
        }

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Could not parse JSON from response');
        }

        const parsed = JSON.parse(jsonMatch[0]);

        return {
            items: parsed.items || [],
            delivery_location: parsed.delivery_location || null,
            notes: parsed.notes || null,
            raw_text: rawText,
        };

    } catch (error) {
        console.error('Error parsing order text with Gemini:', error);
        throw new Error('Failed to parse order text with Gemini');
    }
}
