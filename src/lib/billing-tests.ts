/**
 * Test file to verify BAWASA billing logic correctness
 * Run this to validate calculations against official BAWASA standards
 */

import { BAWASABillingCalculator } from './bawasa-billing-calculator'

// Test cases based on BAWASA official form and payment scheme
const testCases = [
  {
    name: "10 cubic meters - 2023 (25% discount)",
    consumption: 10,
    year: 2023,
    expectedPayment: 225.00, // P300 * (1 - 0.25) = P225
    description: "Should match BAWASA scheme: P225 for 10 cu.m in 2023"
  },
  {
    name: "10 cubic meters - 2024 (50% discount)",
    consumption: 10,
    year: 2024,
    expectedPayment: 150.00, // P300 * (1 - 0.50) = P150
    description: "Should match BAWASA scheme: P150 for 10 cu.m in 2024"
  },
  {
    name: "10 cubic meters - 2025 (75% discount)",
    consumption: 10,
    year: 2025,
    expectedPayment: 75.00, // P300 * (1 - 0.75) = P75
    description: "Should match BAWASA scheme: P75 for 10 cu.m in 2025"
  },
  {
    name: "10 cubic meters - 2026 (100% discount - FREE)",
    consumption: 10,
    year: 2026,
    expectedPayment: 0.00, // P300 * (1 - 1.00) = P0 (FREE)
    description: "Should match BAWASA scheme: FREE for 10 cu.m in 2026"
  },
  {
    name: "15 cubic meters - 2023 (25% discount on first 10)",
    consumption: 15,
    year: 2023,
    expectedPayment: 375.00, // (10 * 30 * 0.75) + (5 * 30) = 225 + 150 = 375
    description: "First 10 cu.m with 25% discount + 5 cu.m at full rate"
  },
  {
    name: "5 cubic meters - 2023 (25% discount)",
    consumption: 5,
    year: 2023,
    expectedPayment: 112.50, // 5 * 30 * 0.75 = 112.50
    description: "Partial consumption with discount applied"
  }
]

export function runBillingTests() {
  console.log("🧪 Running BAWASA Billing Logic Tests")
  console.log("=" .repeat(50))
  
  let passedTests = 0
  let totalTests = testCases.length
  
  testCases.forEach((testCase, index) => {
    const result = BAWASABillingCalculator.calculateBilling(testCase.consumption, testCase.year)
    const actualPayment = result.amount_current_billing
    const isCorrect = Math.abs(actualPayment - testCase.expectedPayment) < 0.01
    
    console.log(`\nTest ${index + 1}: ${testCase.name}`)
    console.log(`Description: ${testCase.description}`)
    console.log(`Expected: ₱${testCase.expectedPayment.toFixed(2)}`)
    console.log(`Actual: ₱${actualPayment.toFixed(2)}`)
    console.log(`Discount Applied: ${(result.discount_percentage * 100).toFixed(0)}%`)
    console.log(`Status: ${isCorrect ? '✅ PASS' : '❌ FAIL'}`)
    
    if (isCorrect) {
      passedTests++
    } else {
      console.log(`❌ Calculation breakdown:`)
      console.log(`  - Consumption 10 or below: ${result.consumption_10_or_below} cu.m`)
      console.log(`  - Amount 10 or below: ₱${result.amount_10_or_below.toFixed(2)}`)
      console.log(`  - Amount with discount: ₱${result.amount_10_or_below_with_discount.toFixed(2)}`)
      console.log(`  - Consumption over 10: ${result.consumption_over_10} cu.m`)
      console.log(`  - Amount over 10: ₱${result.amount_over_10.toFixed(2)}`)
    }
  })
  
  console.log("\n" + "=" .repeat(50))
  console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`)
  
  if (passedTests === totalTests) {
    console.log("🎉 All tests passed! Billing logic is correct.")
  } else {
    console.log("⚠️  Some tests failed. Please review the billing logic.")
  }
  
  return passedTests === totalTests
}

// Additional validation tests
export function validateAgainstBAWASAForm() {
  console.log("\n🔍 Validating against BAWASA Official Form Structure")
  console.log("=" .repeat(50))
  
  // Test the exact scenario from the BAWASA form
  const formTest = BAWASABillingCalculator.calculateBilling(10, 2023)
  
  console.log("BAWASA Form Validation (10 cu.m, 2023):")
  console.log(`✅ Rate per cubic meter: ₱30.00`)
  console.log(`✅ Base amount (10 cu.m): ₱${formTest.amount_10_or_below.toFixed(2)}`)
  console.log(`✅ Discount applied: ${(formTest.discount_percentage * 100).toFixed(0)}%`)
  console.log(`✅ Final amount: ₱${formTest.amount_current_billing.toFixed(2)}`)
  console.log(`✅ Expected from form: ₱225.00`)
  
  const isFormCorrect = Math.abs(formTest.amount_current_billing - 225.00) < 0.01
  console.log(`Status: ${isFormCorrect ? '✅ MATCHES FORM' : '❌ DOES NOT MATCH FORM'}`)
  
  return isFormCorrect
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  runBillingTests()
  validateAgainstBAWASAForm()
}
