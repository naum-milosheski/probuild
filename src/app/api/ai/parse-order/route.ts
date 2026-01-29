import { NextRequest, NextResponse } from 'next/server'
import { parseOrderTextWithGemini } from '@/lib/ai/parse-order'
import { matchProductsToItems } from '@/lib/ai/match-products'
import { createClient } from '@supabase/supabase-js'
import type { Product, MagicImportResult } from '@/types'

// Default org ID (matches seed data)
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001'

// Fetch products from Supabase
async function getProductsFromDatabase(): Promise<Product[]> {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('organization_id', DEFAULT_ORG_ID)
        .eq('is_active', true)

    if (error) {
        console.error('Error fetching products:', error)
        return []
    }

    return data || []
}

export async function POST(request: NextRequest) {
    const startTime = Date.now()

    try {
        const body = await request.json()
        const { rawText } = body

        if (!rawText || typeof rawText !== 'string') {
            return NextResponse.json(
                { error: 'Missing or invalid rawText' },
                { status: 400 }
            )
        }

        // Fetch real products from database
        const products = await getProductsFromDatabase()

        if (products.length === 0) {
            return NextResponse.json(
                { error: 'No products found in database. Please run the seed script first.' },
                { status: 400 }
            )
        }

        let parsed;
        let method = 'mock';

        if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            // Priority 1: Google Gemini
            console.log('Using Google Gemini 1.5 Flash for parsing')
            try {
                parsed = await parseOrderTextWithGemini(rawText)
                method = 'gemini'
            } catch (err) {
                console.error('Gemini parsing failed, falling back to mock:', err)
                console.log('Fallback: Using mock AI parsing')
                parsed = mockParseOrder(rawText)
                method = 'mock (fallback from gemini)'
            }
        } else {
            // Priority 3: Mock Parser (Demo Mode)
            console.log('Demo mode: Using mock AI parsing')
            parsed = mockParseOrder(rawText)
        }

        const { matched, unmatched } = matchProductsToItems(parsed.items, products)

        const result: MagicImportResult = {
            matched,
            unmatched,
            delivery_location: parsed.delivery_location,
            notes: parsed.notes,
            processing_ms: Date.now() - startTime,
            debug_method: method
        }

        return NextResponse.json(result)

    } catch (error) {
        console.error('Magic Import error:', error)
        return NextResponse.json(
            { error: 'Failed to process order' },
            { status: 500 }
        )
    }
}

// Mock parser for demo without AI keys
function mockParseOrder(rawText: string) {
    const items: { description: string; quantity: number | null; unit: string | null }[] = []
    const lowerText = rawText.toLowerCase()

    // Extract copper pipe mentions
    if (lowerText.includes('copper') || lowerText.includes('cop')) {
        const ftMatch = rawText.match(/(\d+)\s*(?:ft|feet|')/i)
        const sizeMatch = lowerText.match(/(1\/2|3\/4|1)(?:\s*inch|\s*")?/)
        items.push({
            description: sizeMatch ? `${sizeMatch[1]} inch copper pipe` : 'copper pipe',
            quantity: ftMatch ? parseInt(ftMatch[1]) : null,
            unit: 'ft'
        })
    }

    // Extract wire nuts
    if (lowerText.includes('wire nut') || lowerText.includes('red cap') || lowerText.includes('yellow') && lowerText.includes('nut')) {
        const boxMatch = rawText.match(/(\d+)\s+box/i)
        const colorMatch = lowerText.includes('yellow') ? 'yellow' : 'red'
        items.push({
            description: `${colorMatch} wire nuts`,
            quantity: boxMatch ? parseInt(boxMatch[1]) : null,
            unit: 'box'
        })
    }

    // Extract romex/wire
    if (lowerText.includes('romex') || lowerText.includes('nm-b') || lowerText.match(/\d+\/\d+\s*wire/)) {
        const sizeMatch = lowerText.match(/(12\/2|14\/2|12-2|14-2)/)
        const ftMatch = rawText.match(/(\d+)\s*(?:ft|feet|')/i)
        items.push({
            description: sizeMatch ? `romex ${sizeMatch[1].replace('-', '/')}` : 'romex wire',
            quantity: ftMatch ? parseInt(ftMatch[1]) : null,
            unit: 'ft'
        })
    }

    // Extract PVC fittings
    if (lowerText.includes('pvc') && (lowerText.includes('elbow') || lowerText.includes('tee'))) {
        const numMatch = rawText.match(/(\d+)\s+(?:pvc|elbow|tee)/i)
        const type = lowerText.includes('tee') ? 'tee' : 'elbow'
        items.push({
            description: `PVC ${type}`,
            quantity: numMatch ? parseInt(numMatch[1]) : null,
            unit: 'each'
        })
    }

    // Extract thermostat
    if (lowerText.includes('thermostat') || lowerText.includes('honeywell') || lowerText.includes('nest')) {
        items.push({
            description: lowerText.includes('nest') ? 'nest thermostat' : 'honeywell thermostat',
            quantity: 1,
            unit: 'each'
        })
    }

    // Extract HVAC filters
    if (lowerText.includes('filter') || lowerText.includes('hvac filter') || lowerText.includes('air filter')) {
        const sizeMatch = lowerText.match(/(\d+x\d+)/)
        const qtyMatch = rawText.match(/(\d+)\s*(?:filter|hvac|air)/i)
        items.push({
            description: sizeMatch ? `${sizeMatch[1]} HVAC filter` : 'HVAC air filter',
            quantity: qtyMatch ? parseInt(qtyMatch[1]) : null,
            unit: 'each'
        })
    }

    // Extract flex duct
    if (lowerText.includes('flex') && lowerText.includes('duct')) {
        const sizeMatch = lowerText.match(/(\d+)(?:\s*inch|\s*")?/)
        items.push({
            description: sizeMatch ? `${sizeMatch[1]}" flex duct` : 'flexible duct',
            quantity: 1,
            unit: 'roll'
        })
    }

    // Extract refrigerant
    if (lowerText.includes('r-410') || lowerText.includes('r410') || lowerText.includes('refrigerant') || lowerText.includes('freon')) {
        items.push({
            description: 'R-410A refrigerant',
            quantity: 1,
            unit: 'tank'
        })
    }

    // Extract sharkbite fittings
    if (lowerText.includes('sharkbite') || lowerText.includes('shark bite') || lowerText.includes('push fit')) {
        const numMatch = rawText.match(/(\d+)\s+(?:shark|push)/i)
        items.push({
            description: 'SharkBite coupling',
            quantity: numMatch ? parseInt(numMatch[1]) : null,
            unit: 'each'
        })
    }

    // Extract electrical tape
    if (lowerText.includes('electrical tape') || lowerText.includes('e-tape') || lowerText.includes('black tape')) {
        items.push({
            description: 'electrical tape',
            quantity: 1,
            unit: 'pack'
        })
    }

    // Extract water heater
    if (lowerText.includes('water heater') || lowerText.includes('hot water')) {
        items.push({
            description: 'water heater',
            quantity: 1,
            unit: 'each'
        })
    }

    // Fallback: if nothing matched, return the raw text as a single item
    if (items.length === 0) {
        items.push({ description: rawText, quantity: null, unit: null })
    }

    // Extract delivery location
    let delivery_location: string | null = null
    const sitePatterns = [
        /(?:to|at|for)\s+(?:the\s+)?(.+?(?:site|job|project|residence|house|building|tower|mall|hospital|center).+?)(?:\.|,|$)/i,
        /(?:deliver|send|drop).+?(?:to|at)\s+(.+?)(?:\.|,|$)/i
    ]

    for (const pattern of sitePatterns) {
        const match = rawText.match(pattern)
        if (match) {
            delivery_location = match[1].trim()
            break
        }
    }

    return {
        items,
        delivery_location,
        notes: null,
        raw_text: rawText
    }
}
