/**
 * BAWASA Billing Logic Utility
 * Based on official BAWASA water bill form and payment scheme
 */

export interface BillingCalculation {
  consumption_10_or_below: number
  amount_10_or_below: number
  amount_10_or_below_with_discount: number
  consumption_over_10: number
  amount_over_10: number
  amount_current_billing: number
  discount_percentage: number
  fiscal_year: number
}

export class BAWASABillingCalculator {
  // BAWASA Pricing Structure (based on official form)
  private static readonly RATE_PER_CUBIC_METER = 30 // 30 pesos per cubic meter (P300 for 10 cu.m)
  
  // Progressive discount scheme (2022-2026)
  private static readonly DISCOUNT_SCHEME = {
    2022: 0.00,    // 0% discount
    2023: 0.25,    // 25% discount
    2024: 0.50,    // 50% discount
    2025: 0.75,    // 75% discount
    2026: 1.00     // 100% discount (FREE)
  }

  /**
   * Calculate billing based on consumption and current fiscal year
   */
  static calculateBilling(consumption: number, fiscalYear?: number): BillingCalculation {
    const currentYear = fiscalYear || new Date().getFullYear()
    const discountPercentage = this.getDiscountPercentage(currentYear)
    
    // Calculate consumption breakdown
    const consumption_10_or_below = Math.min(consumption, 10)
    const consumption_over_10 = Math.max(consumption - 10, 0)
    
    // Calculate amounts without discount
    const amount_10_or_below = consumption_10_or_below * this.RATE_PER_CUBIC_METER
    
    // Apply discount for first 10 cubic meters
    const amount_10_or_below_with_discount = amount_10_or_below * (1 - discountPercentage)
    
    // Amount for consumption over 10 cu.m (no discount)
    const amount_over_10 = consumption_over_10 * this.RATE_PER_CUBIC_METER
    
    // Total current billing (a + b from the form)
    const amount_current_billing = amount_10_or_below_with_discount + amount_over_10
    
    return {
      consumption_10_or_below,
      amount_10_or_below,
      amount_10_or_below_with_discount,
      consumption_over_10,
      amount_over_10,
      amount_current_billing,
      discount_percentage: discountPercentage,
      fiscal_year: currentYear
    }
  }

  /**
   * Get discount percentage for a given fiscal year
   */
  private static getDiscountPercentage(year: number): number {
    if (year < 2022) return 0.00
    if (year > 2026) return 1.00 // After 2026, maintain 100% discount
    return this.DISCOUNT_SCHEME[year as keyof typeof this.DISCOUNT_SCHEME] || 0.00
  }

  /**
   * Get the expected payment for 10 cubic meters in a given year
   */
  static getExpectedPaymentFor10CuM(year?: number): number {
    const currentYear = year || new Date().getFullYear()
    const discountPercentage = this.getDiscountPercentage(currentYear)
    const baseAmount = 10 * this.RATE_PER_CUBIC_METER // P300
    return baseAmount * (1 - discountPercentage)
  }

  /**
   * Validate billing calculation against BAWASA standards
   */
  static validateCalculation(calculation: BillingCalculation): boolean {
    const expected = this.calculateBilling(
      calculation.consumption_10_or_below + calculation.consumption_over_10,
      calculation.fiscal_year
    )
    
    return (
      Math.abs(calculation.amount_current_billing - expected.amount_current_billing) < 0.01 &&
      Math.abs(calculation.discount_percentage - expected.discount_percentage) < 0.01
    )
  }

  /**
   * Format billing summary for display
   */
  static formatBillingSummary(calculation: BillingCalculation): string {
    const { fiscal_year, discount_percentage, amount_current_billing } = calculation
    const discountText = discount_percentage === 1.00 ? 'FREE' : `${(discount_percentage * 100).toFixed(0)}% discount`
    
    return `Fiscal Year ${fiscal_year}: ${discountText} - Total: ₱${amount_current_billing.toFixed(2)}`
  }
}
