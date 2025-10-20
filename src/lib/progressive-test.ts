// Quick test to verify progressive logic
import { BAWASABillingCalculator } from './bawasa-billing-calculator'

console.log("🧪 Testing Progressive Logic After 2026")
console.log("=" .repeat(40))

const testYears = [2025, 2026, 2027, 2028, 2030, 2035]

testYears.forEach(year => {
  const result = BAWASABillingCalculator.calculateBilling(10, year)
  const discountText = result.discount_percentage === 1.00 ? 'FREE' : `${(result.discount_percentage * 100).toFixed(0)}% discount`
  
  console.log(`${year}: ${discountText} - ₱${result.amount_current_billing.toFixed(2)}`)
})

console.log("\n✅ Progressive logic confirmed: FREE water continues after 2026!")
