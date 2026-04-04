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
9. Only extract items that are explicitly written or printed - do NOT guess or infer items
10. If the input does not contain a clear order, material list, or purchase request, return an empty items array

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

export async function parseOrderTextWithGemini(
    rawText: string,
    file?: { base64: string; mimeType: string }
): Promise<ParsedOrderResult> {
    try {
        let textResult = '';

        if (file) {
            // Step 1: classify before extracting to prevent hallucination
            const { text: classification } = await generateText({
                model: google('gemini-2.0-flash'),
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'file', data: file.base64, mediaType: file.mimeType },
                            { type: 'text', text: 'Does this image or document contain a written or printed order, purchase list, material request, or invoice? Answer only YES or NO.' }
                        ]
                    }
                ],
            });

            if (!classification.trim().toUpperCase().startsWith('YES')) {
                return {
                    items: [],
                    delivery_location: null,
                    notes: null,
                    raw_text: rawText || '[Uploaded File]',
                };
            }

            // Step 2: extract only if classification confirmed order content
            let promptText = `${SYSTEM_PROMPT}\n\nRespond with ONLY the JSON object, no other text.`;
            if (rawText) {
                promptText += `\n\nINPUT TEXT TO PARSE:\n"${rawText}"`;
            } else {
                promptText += `\n\nExtract the order details from the attached file.`;
            }

            const { text } = await generateText({
                model: google('gemini-2.0-flash'),
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'file', data: file.base64, mediaType: file.mimeType },
                            { type: 'text', text: promptText }
                        ]
                    }
                ],
            });
            textResult = text;
        } else {
            const { text } = await generateText({
                model: google('gemini-2.0-flash'),
                prompt: `${SYSTEM_PROMPT}\n\nINPUT TEXT TO PARSE:\n"${rawText}"\n\nRespond with ONLY the JSON object, no other text.`,
            });
            textResult = text;
        }

        if (!textResult) {
            throw new Error('No response from Gemini');
        }

        // Extract JSON from response
        const jsonMatch = textResult.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Could not parse JSON from response');
        }

        const parsed = JSON.parse(jsonMatch[0]);

        return {
            items: parsed.items || [],
            delivery_location: parsed.delivery_location || null,
            notes: parsed.notes || null,
            raw_text: rawText || (file ? '[Uploaded File]' : ''),
        };

    } catch (error) {
        console.error('Error parsing order text with Gemini:', error);
        throw new Error('Failed to parse order text with Gemini');
    }
}
