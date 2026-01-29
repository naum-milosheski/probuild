import type {
    ExtractedItem,
    Product,
    ProductMatch,
    MatchedItem,
    UnmatchedItem
} from '@/types'

// Confidence thresholds
const HIGH_CONFIDENCE = 0.9
const MEDIUM_CONFIDENCE = 0.7
const LOW_CONFIDENCE = 0.5

/**
 * Calculate string similarity using Levenshtein distance
 */
function levenshteinSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase()
    const s2 = str2.toLowerCase()

    if (s1 === s2) return 1
    if (s1.length === 0) return 0
    if (s2.length === 0) return 0

    const matrix: number[][] = []

    for (let i = 0; i <= s1.length; i++) {
        matrix[i] = [i]
    }
    for (let j = 0; j <= s2.length; j++) {
        matrix[0][j] = j
    }

    for (let i = 1; i <= s1.length; i++) {
        for (let j = 1; j <= s2.length; j++) {
            const cost = s1[i - 1] === s2[j - 1] ? 0 : 1
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            )
        }
    }

    const maxLen = Math.max(s1.length, s2.length)
    return 1 - matrix[s1.length][s2.length] / maxLen
}

/**
 * Tokenize a string into searchable words
 */
function tokenize(str: string): string[] {
    return str
        .toLowerCase()
        .replace(/[^\w\s\/\-]/g, ' ')
        .split(/\s+/)
        .filter(token => token.length > 1)
}

/**
 * Calculate how many tokens from the query appear in the target
 */
function tokenOverlap(query: string, target: string): number {
    const queryTokens = new Set(tokenize(query))
    const targetTokens = new Set(tokenize(target))

    let matches = 0
    queryTokens.forEach(token => {
        if (targetTokens.has(token)) {
            matches++
        } else {
            // Check for partial matches
            targetTokens.forEach(targetToken => {
                if (targetToken.includes(token) || token.includes(targetToken)) {
                    matches += 0.5
                }
            })
        }
    })

    return queryTokens.size > 0 ? matches / queryTokens.size : 0
}

/**
 * Calculate match confidence between extracted description and product
 */
function calculateConfidence(extracted: ExtractedItem, product: Product): number {
    const description = extracted.description.toLowerCase()
    const productName = product.name.toLowerCase()
    const productSku = product.sku.toLowerCase()
    const productDesc = (product.description || '').toLowerCase()
    const aliases = product.aliases.map(a => a.toLowerCase())

    let maxScore = 0

    // Exact SKU match = highest confidence
    if (productSku === description || description.includes(productSku)) {
        return 1.0
    }

    // Check against product name
    const nameSimilarity = levenshteinSimilarity(description, productName)
    const nameOverlap = tokenOverlap(description, productName)
    maxScore = Math.max(maxScore, (nameSimilarity * 0.4) + (nameOverlap * 0.6))

    // Check against aliases
    for (const alias of aliases) {
        const aliasSimilarity = levenshteinSimilarity(description, alias)
        const aliasOverlap = tokenOverlap(description, alias)
        const aliasScore = (aliasSimilarity * 0.4) + (aliasOverlap * 0.6)
        if (aliasScore > maxScore) {
            maxScore = aliasScore
        }
        // Exact alias match
        if (alias === description) {
            return 0.95
        }
    }

    // Check description if name match is weak
    if (maxScore < 0.5 && productDesc) {
        const descOverlap = tokenOverlap(description, productDesc)
        maxScore = Math.max(maxScore, descOverlap * 0.7)
    }

    // Unit matching bonus
    if (extracted.unit && product.unit) {
        const unitMatch = extracted.unit.toLowerCase() === product.unit.toLowerCase()
        if (unitMatch && maxScore > 0.3) {
            maxScore = Math.min(1, maxScore + 0.1)
        }
    }

    return Math.round(maxScore * 100) / 100
}

/**
 * Find matching products for extracted items
 * This is the deterministic matching phase - no AI involved
 */
export function matchProductsToItems(
    extractedItems: ExtractedItem[],
    products: Product[]
): { matched: MatchedItem[], unmatched: UnmatchedItem[] } {
    const matched: MatchedItem[] = []
    const unmatched: UnmatchedItem[] = []

    for (const extracted of extractedItems) {
        // Score all products
        const scoredProducts: ProductMatch[] = products
            .map(product => ({
                product,
                similarity: calculateConfidence(extracted, product)
            }))
            .filter(pm => pm.similarity > 0.2) // Filter out very low matches
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 5) // Top 5 suggestions

        const bestMatch = scoredProducts[0]

        if (bestMatch && bestMatch.similarity >= LOW_CONFIDENCE) {
            // Good enough match found
            matched.push({
                extracted,
                product: bestMatch.product,
                confidence: bestMatch.similarity,
                quantity: extracted.quantity || 1,
                unit: extracted.unit || bestMatch.product.unit
            })
        } else {
            // No confident match
            unmatched.push({
                extracted,
                suggestions: scoredProducts,
                reason: bestMatch
                    ? `Best match "${bestMatch.product.name}" has low confidence (${Math.round(bestMatch.similarity * 100)}%)`
                    : 'No similar products found in inventory'
            })
        }
    }

    return { matched, unmatched }
}

/**
 * Get confidence level category
 */
export function getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' | 'none' {
    if (confidence >= HIGH_CONFIDENCE) return 'high'
    if (confidence >= MEDIUM_CONFIDENCE) return 'medium'
    if (confidence >= LOW_CONFIDENCE) return 'low'
    return 'none'
}

/**
 * Format confidence as percentage string
 */
export function formatConfidence(confidence: number): string {
    return `${Math.round(confidence * 100)}%`
}
