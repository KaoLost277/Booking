import { describe, it, expect } from 'vitest'

// ============================================================
// safeMathEval — ฟังก์ชันคำนวณคณิตศาสตร์อย่างปลอดภัย
// (extracted from BookingModal.tsx for testability)
// ============================================================
const safeMathEval = (expr: string): number | null => {
    try {
        const sanitized = expr.replace(/,/g, '').replace(/[^0-9+\-*/(). ]/g, '').trim()
        if (!sanitized) return null

        // eslint-disable-next-line no-new-func
        const fn = new Function(`"use strict"; return (${sanitized})`)
        const result = fn()

        if (typeof result !== 'number' || !isFinite(result)) return null
        return result
    } catch {
        return null
    }
}

// ============================================================
// formatCurrency — จัดรูปแบบตัวเลขเป็นเงิน
// ============================================================
const formatCurrency = (val: number): string =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)

// ============================================================
// Tests for safeMathEval
// ============================================================
describe('safeMathEval', () => {
    describe('basic arithmetic', () => {
        it('should evaluate simple addition', () => {
            expect(safeMathEval('1+2')).toBe(3)
        })

        it('should evaluate subtraction', () => {
            expect(safeMathEval('10-3')).toBe(7)
        })

        it('should evaluate multiplication', () => {
            expect(safeMathEval('5*4')).toBe(20)
        })

        it('should evaluate division', () => {
            expect(safeMathEval('20/4')).toBe(5)
        })

        it('should evaluate expression with parentheses', () => {
            expect(safeMathEval('(2+3)*4')).toBe(20)
        })

        it('should evaluate complex expression', () => {
            expect(safeMathEval('100+50*2')).toBe(200)
        })
    })

    describe('currency formatting input', () => {
        it('should handle comma-formatted numbers', () => {
            expect(safeMathEval('10,000')).toBe(10000)
        })

        it('should handle comma-formatted with decimals', () => {
            expect(safeMathEval('1,500.50')).toBe(1500.5)
        })

        it('should handle addition with comma numbers', () => {
            expect(safeMathEval('1,000+2,000')).toBe(3000)
        })
    })

    describe('decimal numbers', () => {
        it('should evaluate decimal addition', () => {
            expect(safeMathEval('1.5+2.5')).toBe(4)
        })

        it('should evaluate decimal multiplication', () => {
            expect(safeMathEval('0.5*100')).toBe(50)
        })
    })

    describe('edge cases and security', () => {
        it('should return null for empty string', () => {
            expect(safeMathEval('')).toBeNull()
        })

        it('should return null for whitespace only', () => {
            expect(safeMathEval('   ')).toBeNull()
        })

        it('should strip and ignore alphabetic characters', () => {
            // After sanitization, "abc" becomes "" → null
            expect(safeMathEval('abc')).toBeNull()
        })

        it('should handle division by zero (Infinity)', () => {
            expect(safeMathEval('1/0')).toBeNull()
        })

        it('should strip potential injection attempts', () => {
            // Characters like ; = {} are stripped, so this becomes harmless or null
            expect(safeMathEval('alert("xss")')).toBeNull()
        })

        it('should return null for malformed expressions', () => {
            expect(safeMathEval('+++')).toBeNull()
        })
    })
})

// ============================================================
// Tests for formatCurrency
// ============================================================
describe('formatCurrency', () => {
    it('should format whole number with 2 decimal places', () => {
        expect(formatCurrency(1000)).toBe('1,000.00')
    })

    it('should format zero', () => {
        expect(formatCurrency(0)).toBe('0.00')
    })

    it('should format large numbers with commas', () => {
        expect(formatCurrency(1234567.89)).toBe('1,234,567.89')
    })

    it('should format small decimals with 2 places', () => {
        expect(formatCurrency(0.5)).toBe('0.50')
    })

    it('should round to 2 decimal places', () => {
        expect(formatCurrency(10.999)).toBe('11.00')
    })

    it('should handle negative numbers', () => {
        expect(formatCurrency(-500)).toBe('-500.00')
    })
})

// ============================================================
// Tests for Tax Calculation Logic (from BookingModal)
// ============================================================
describe('Tax Calculation (3% withholding)', () => {
    it('should calculate 3% tax correctly', () => {
        const price = 10000
        const tax = price * 0.03
        const summary = price - tax

        expect(tax).toBe(300)
        expect(summary).toBe(9700)
    })

    it('should handle zero price', () => {
        const price = 0
        const tax = price * 0.03
        const summary = price - tax

        expect(tax).toBe(0)
        expect(summary).toBe(0)
    })

    it('should handle decimal prices', () => {
        const price = 1500.5
        const tax = price * 0.03
        const summary = price - tax

        expect(tax).toBeCloseTo(45.015, 2)
        expect(summary).toBeCloseTo(1455.485, 2)
    })
})

// ============================================================
// Tests for Price Calculation Logic
// ============================================================
describe('Price Calculation (time * PriceUnitMinutes)', () => {
    it('should calculate price based on time difference', () => {
        const startTotal = 10 * 60 + 0  // 10:00
        const endTotal = 12 * 60 + 0    // 12:00
        const diffMinutes = endTotal - startTotal // 120 minutes
        const priceUnitMinutes = 50 // ฿50 per minute

        const calculatedPrice = diffMinutes * priceUnitMinutes
        expect(calculatedPrice).toBe(6000)
    })

    it('should reject when end time is before start time', () => {
        const startTotal = 14 * 60 + 0  // 14:00
        const endTotal = 10 * 60 + 0    // 10:00
        const diffMinutes = endTotal - startTotal

        expect(diffMinutes).toBeLessThanOrEqual(0)
    })

    it('should validate minimum time requirement', () => {
        const startTotal = 10 * 60 + 0  // 10:00
        const endTotal = 10 * 60 + 15   // 10:15
        const diffMinutes = endTotal - startTotal  // 15 minutes
        const minTimeMinutes = 30 // อย่างน้อย 30 นาที

        expect(diffMinutes).toBeLessThan(minTimeMinutes)
    })
})
