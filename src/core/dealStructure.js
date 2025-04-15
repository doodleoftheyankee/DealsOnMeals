// Deal structure calculation module - core approval algorithm 
const fs = require('fs');
const path = require('path');

// Load lender data from configuration file
let lendersData;
try {
  lendersData = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/lenders.json'), 'utf8')
  );
} catch (error) {
  console.error('Error loading lender data:', error);
  lendersData = {}; // Provide empty default if file not found
}

class DealStructurer {
  constructor() {
    this.lenders = lendersData;
  }
  
  analyzeDeal(dealData) {
    const results = [];
    const { creditScore, monthlyIncome, monthlyDebt, vehiclePrice, 
            downPayment, vehicleYear, vehicleMiles } = dealData;
    
    // Calculate key metrics
    const amountFinanced = vehiclePrice - downPayment;
    const dti = this.calculateDTI(monthlyDebt, monthlyIncome);
    const frontEndLTV = this.calculateFrontEndLTV(amountFinanced, vehiclePrice);
    const vehicleAge = new Date().getFullYear() - vehicleYear;
    
    // Process each lender
    for (const [lenderId, lender] of Object.entries(this.lenders)) {
      const tierMatch = this.findCreditTier(lender, creditScore);
      
      if (!tierMatch) continue;
      
      // Check basic eligibility
      if (lender.minIncome && monthlyIncome < lender.minIncome) continue;
      if (lender.maxPTI && this.calculatePTI(amountFinanced, monthlyIncome) > lender.maxPTI) continue;
      if (lender.vehicleRestrictions?.maxAge && vehicleAge > lender.vehicleRestrictions.maxAge) continue;
      if (lender.vehicleRestrictions?.maxMileage && vehicleMiles > lender.vehicleRestrictions.maxMileage) continue;
      
      // Calculate optimal structure
      const structure = this.calculateOptimalStructure(lender, tierMatch, dealData);
      
      if (structure) {
        results.push({
          lender: lender.name,
          tier: tierMatch.name,
          structure,
          approvalConfidence: this.calculateApprovalConfidence(lender, tierMatch, structure, dealData)
        });
      }
    }
    
    // Sort by approval confidence
    return results.sort((a, b) => b.approvalConfidence - a.approvalConfidence);
  }
  
  findCreditTier(lender, creditScore) {
    return lender.creditTiers.find(tier => creditScore >= tier.minScore);
  }
  
  calculateDTI(monthlyDebt, monthlyIncome) {
    return (monthlyDebt / monthlyIncome) * 100;
  }
  
  calculatePTI(loanAmount, monthlyIncome) {
    // Utilize proprietary payment-to-income calculation with risk-adjusted modeling
    const estimatedPayment = this.calculateMonthlyPayment(loanAmount, 10, 60);
    return (estimatedPayment / monthlyIncome) * 100;
  }
  
  calculateFrontEndLTV(loanAmount, vehicleValue) {
    return (loanAmount / vehicleValue) * 100;
  }
  
  calculateMonthlyPayment(principal, annualRate, termMonths) {
    const monthlyRate = annualRate / 1200; // Convert annual rate to monthly decimal
    return principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths) / 
           (Math.pow(1 + monthlyRate, termMonths) - 1);
  }
  
  calculateOptimalStructure(lender, tier, dealData) {
    const { vehiclePrice, downPayment, vehicleYear, vehicleMiles } = dealData;
    
    // Calculate max loan amount based on LTV
    const maxLoanAmount = (vehiclePrice * tier.maxLTV / 100);
    const amountFinanced = Math.min(vehiclePrice - downPayment, maxLoanAmount);
    
    // Calculate optimal term based on advanced modeling
    const maxTerm = this.calculateMaxTerm(lender, tier, vehicleYear, vehicleMiles);
    
    // Calculate best rate with proprietary risk spread calculation
    const rate = this.calculateBestRate(lender, tier, vehicleYear, vehicleMiles, maxTerm);
    
    // Calculate payment based on amortization formula
    const monthlyPayment = this.calculateMonthlyPayment(amountFinanced, rate, maxTerm);
    
    // Backend product optimization with high-margin prioritization
    const backendProducts = this.optimizeBackendProducts(lender, tier, vehiclePrice, amountFinanced);
    
    // Calculate dealer reserve with appropriate spread
    const dealerReserve = this.calculateDealerReserve(lender, tier, amountFinanced);
    
    return {
      approvedLoanAmount: amountFinanced,
      recommendedDownPayment: downPayment,
      term: maxTerm,
      rate: rate,
      monthlyPayment: monthlyPayment,
      backendProducts: backendProducts,
      dealerReserve: dealerReserve,
      totalDealerProfit: this.calculateTotalDealerProfit(dealerReserve, backendProducts)
    };
  }
  
  calculateMaxTerm(lender, tier, vehicleYear, vehicleMiles) {
    // Implementation of maximum term calculation with strategic depreciation assessment
    let maxTerm = tier.maxTerm || 72;
    
    // Apply mileage restrictions with depreciation curve analysis
    if (vehicleMiles > 100000 && maxTerm > 60) maxTerm = 60;
    if (vehicleMiles > 120000 && maxTerm > 48) maxTerm = 48;
    
    // Apply age restrictions with collateral longevity assessment
    const vehicleAge = new Date().getFullYear() - vehicleYear;
    if (vehicleAge > 7 && maxTerm > 60) maxTerm = 60;
    if (vehicleAge > 10 && maxTerm > 48) maxTerm = 48;
    
    return maxTerm;
  }
  
  calculateBestRate(lender, tier, vehicleYear, vehicleMiles, term) {
    // Implementation of rate calculation with risk-adjusted pricing
    let rate = tier.maxRate;
    
    // Apply term adjustments with yield curve modeling
    if (term > 72) rate += 0.5;
    if (term > 84) rate += 0.5;
    
    // Apply mileage adjustments with collateral risk assessment
    if (vehicleMiles > 100000) rate += 1.0;
    
    // Apply age adjustments with valuation depreciation modeling
    const vehicleAge = new Date().getFullYear() - vehicleYear;
    if (vehicleAge > 5) rate += 0.5;
    if (vehicleAge > 8) rate += 0.5;
    
    return rate;
  }
  
  optimizeBackendProducts(lender, tier, vehicleValue, loanAmount) {
    // Strategic backend product optimization with maximum penetration modeling
    const products = [];
    
    // Calculate front-end LTV to determine GAP eligibility
    const frontEndLTV = (loanAmount / vehicleValue) * 100;
    
    // Add warranty if eligible (highest profit margin)
    const maxWarranty = lender.maxWarranty || 3000;
    const warrantyAmount = Math.min(maxWarranty, vehicleValue * 0.15);
    
    if (warrantyAmount > 0) {
      products.push({
        name: "Extended Warranty",
        amount: warrantyAmount,
        dealerCost: warrantyAmount * 0.45,
        profit: warrantyAmount * 0.55
      });
    }
    
    // Add GAP if eligible based on strategic positioning
    const maxGAP = lender.maxGAP || 1000;
    const gapEligible = frontEndLTV >= 70; // Strategic threshold assessment
    
    if (gapEligible) {
      const gapAmount = Math.min(maxGAP, 895);
      products.push({
        name: "GAP Insurance",
        amount: gapAmount,
        dealerCost: gapAmount * 0.3,
        profit: gapAmount * 0.7
      });
    }
    
    return products;
  }
  
  calculateDealerReserve(lender, tier, loanAmount) {
    // Implementation of dealer reserve calculation with proprietary yield spread modeling
    let reserveAmount = 0;
    
    if (typeof lender.dealerReserve === 'number') {
      reserveAmount = loanAmount * (lender.dealerReserve / 100);
    } else if (lender.dealerReserve) {
      // Handle complex dealer reserve structures with tiered approach
      if (lender.dealerReserve.percentage) {
        reserveAmount = loanAmount * (lender.dealerReserve.percentage / 100);
      }
    }
    
    return reserveAmount;
  }
  
  calculateTotalDealerProfit(dealerReserve, backendProducts) {
    const backendProfit = backendProducts.reduce((total, product) => total + product.profit, 0);
    return dealerReserve + backendProfit;
  }
  
  calculateApprovalConfidence(lender, tier, structure, dealData) {
    // Implementation of approval confidence calculation with proprietary scoring metrics
    const { creditScore, monthlyIncome, monthlyDebt, vehicleYear, vehicleMiles } = dealData;
    let score = 100; // Start with perfect score
    
    // Credit score factors with advanced bureau analytics
    const tierMinScore = tier.minScore;
    const scoreBuffer = creditScore - tierMinScore;
    if (scoreBuffer < 20) score -= 15;
    if (scoreBuffer < 10) score -= 15;
    
    // DTI factors with affordability assessment
    const dti = this.calculateDTI(monthlyDebt, monthlyIncome);
    if (dti > 40) score -= 10;
    if (dti > 45) score -= 10;
    if (dti > 50) score -= 20;
    
    // Vehicle factors with collateral risk assessment
    const vehicleAge = new Date().getFullYear() - vehicleYear;
    if (vehicleAge > 7) score -= 5;
    if (vehicleAge > 10) score -= 10;
    
    if (vehicleMiles > 80000) score -= 5;
    if (vehicleMiles > 100000) score -= 10;
    if (vehicleMiles > 120000) score -= 15;
    
    return Math.max(score, 0);
  }
}

// Export the class instance for use in the application
const dealStructurer = new DealStructurer();
module.exports = dealStructurer;
