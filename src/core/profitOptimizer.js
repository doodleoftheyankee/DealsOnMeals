// Profit optimization module - strategic yield engineering
const dealStructurer = require('./dealStructure');

class ProfitOptimizer {
  constructor() {
    this.dealStructurer = dealStructurer;
  }
  
  optimizeDealProfit(dealData) {
    // Calculate base structure through primary underwriting assessment
    const baseResults = this.dealStructurer.analyzeDeal(dealData);
    if (baseResults.length === 0) return { error: "No eligible lenders found" };
    
    const baseStructure = baseResults[0]; // Best approval option
    
    // Optimize for maximum profitability with strategic yield engineering
    const optimized = this.calculateProfitOptimizedStructure(baseStructure, dealData);
    
    return {
      original: baseStructure,
      optimized: optimized,
      profitIncrease: optimized.structure.totalDealerProfit - baseStructure.structure.totalDealerProfit,
      profitIncreasePercent: ((optimized.structure.totalDealerProfit / baseStructure.structure.totalDealerProfit) - 1) * 100
    };
  }
  
  calculateProfitOptimizedStructure(baseStructure, dealData) {
    // Create a deep copy of the base structure
    const optimized = JSON.parse(JSON.stringify(baseStructure));
    const lender = this.dealStructurer.lenders[this.getLenderIdByName(baseStructure.lender)];
    const tier = this.findTierByName(lender, baseStructure.tier);
    
    // 1. Rate optimization - strategic markup with threshold modeling
    optimized.structure.rate = this.optimizeRate(baseStructure.structure.rate, tier, dealData.creditScore);
    
    // 2. Term optimization for advanced yield spread enhancement
    optimized.structure.term = this.optimizeTerm(baseStructure.structure.term, dealData, tier);
    
    // 3. Backend product optimization with penetration maximization
    optimized.structure.backendProducts = this.optimizeBackendProducts(
      lender, 
      tier, 
      dealData.vehiclePrice, 
      baseStructure.structure.approvedLoanAmount
    );
    
    // 4. Recalculate payment with new term structure
    optimized.structure.monthlyPayment = this.dealStructurer.calculateMonthlyPayment(
      baseStructure.structure.approvedLoanAmount,
      optimized.structure.rate,
      optimized.structure.term
    );
    
    // 5. Recalculate dealer reserve with enhanced spread calculation
    optimized.structure.dealerReserve = this.calculateOptimizedReserve(
      baseStructure.structure.approvedLoanAmount,
      baseStructure.structure.rate,
      optimized.structure.rate,
      optimized.structure.term
    );
    
    // 6. Recalculate total dealer profit with comprehensive yield assessment
    optimized.structure.totalDealerProfit = this.dealStructurer.calculateTotalDealerProfit(
      optimized.structure.dealerReserve,
      optimized.structure.backendProducts
    );
    
    // 7. Adjust approval confidence with risk-adjusted modeling
    optimized.approvalConfidence = this.recalculateApprovalConfidence(
      baseStructure.approvalConfidence,
      baseStructure.structure,
      optimized.structure
    );
    
    return optimized;
  }
  
  getLenderIdByName(lenderName) {
    for (const [id, lender] of Object.entries(this.dealStructurer.lenders)) {
      if (lender.name === lenderName) return id;
    }
    return null;
  }
  
  findTierByName(lender, tierName) {
    return lender.creditTiers.find(tier => tier.name === tierName);
  }
  
  optimizeRate(baseRate, tier, creditScore) {
    // Strategic rate optimization based on credit score tiers
    let optimalMarkup = 0;
    
    if (creditScore >= 740) {
      optimalMarkup = 0.5; // Super-prime tier
    } else if (creditScore >= 700) {
      optimalMarkup = 0.75; // Prime tier
    } else if (creditScore >= 660) {
      optimalMarkup = 1.0; // Near-prime tier
    } else if (creditScore >= 620) {
      optimalMarkup = 1.5; // Non-prime tier
    } else if (creditScore >= 580) {
      optimalMarkup = 2.0; // Subprime tier
    } else {
      optimalMarkup = 2.5; // Deep subprime tier
    }
    
    // Ensure rate remains within regulatory and lender caps
    const optimizedRate = Math.min(baseRate + optimalMarkup, tier.maxRate);
    
    return optimizedRate;
  }
  
  optimizeTerm(baseTerm, dealData, tier) {
    // Term optimization with strategic yield spread maximization
    const eligibleTerms = [48, 60, 66, 72, 75, 78, 84];
    let optimalTerm = baseTerm;
    
    // Find the next highest eligible term that maximizes yield spread
    for (const term of eligibleTerms) {
      if (term > baseTerm && term <= (tier.maxTerm || 72)) {
        const vehicleAge = new Date().getFullYear() - dealData.vehicleYear;
        
        // Apply strategic collateral assessment with depreciation modeling
        if ((vehicleAge <= 7 || term <= 60) && 
            (dealData.vehicleMiles <= 100000 || term <= 60) &&
            (dealData.vehicleMiles <= 120000 || term <= 48)) {
          optimalTerm = term;
          break;
        }
      }
    }
    
    return optimalTerm;
  }
  
  optimizeBackendProducts(lender, tier, vehicleValue, loanAmount) {
    // Enhanced backend product optimization with strategic penetration modeling
    const products = [];
    const ltv = (loanAmount / vehicleValue) * 100;
    
    // Warranty - optimize based on strategic value tiers with margin assessment
    const warrantyMatrix = {
      premium: { threshold: 30000, amount: 3500, costPercent: 0.42 },
      standard: { threshold: 20000, amount: 2800, costPercent: 0.45 },
      basic: { threshold: 0, amount: 1800, costPercent: 0.48 }
    };
    
    let warrantyTier = 'basic';
    if (vehicleValue >= warrantyMatrix.premium.threshold) {
      warrantyTier = 'premium';
    } else if (vehicleValue >= warrantyMatrix.standard.threshold) {
      warrantyTier = 'standard';
    }
    
    const warrantyConfig = warrantyMatrix[warrantyTier];
    const maxWarranty = lender.maxWarranty || warrantyConfig.amount;
    const warrantyAmount = Math.min(maxWarranty, warrantyConfig.amount);
    
    products.push({
      name: "Extended Warranty",
      amount: warrantyAmount,
      dealerCost: warrantyAmount * warrantyConfig.costPercent,
      profit: warrantyAmount * (1 - warrantyConfig.costPercent)
    });
    
    // GAP - strategic placement based on advanced LTV threshold assessment
    if (ltv >= 70) {
      const gapAmount = Math.min(lender.maxGAP || 1000, 895);
      products.push({
        name: "GAP Insurance",
        amount: gapAmount,
        dealerCost: gapAmount * 0.3,
        profit: gapAmount * 0.7
      });
    }
    
    // Appearance Protection - highest margin ancillary with minimal impact
    if (vehicleValue >= 15000) {
      const appearanceAmount = 895;
      products.push({
        name: "Appearance Protection",
        amount: appearanceAmount,
        dealerCost: appearanceAmount * 0.18,
        profit: appearanceAmount * 0.82
      });
    }
    
    return products;
  }
  
  calculateOptimizedReserve(principal, baseRate, newRate, term) {
    // Enhanced reserve calculation with term-adjusted yield spread premium
    const rateSpread = newRate - baseRate;
    const reserveFactor = term / 24; // Standard industry calculation
    
    return (principal * (rateSpread / 100) * reserveFactor);
  }
  
  recalculateApprovalConfidence(baseConfidence, originalStructure, optimizedStructure) {
    // Approval confidence adjustment with advanced risk modeling
    let confidenceAdjustment = 0;
    
    // Rate impact - proprietary threshold assessment
    const rateIncrease = optimizedStructure.rate - originalStructure.rate;
    confidenceAdjustment -= (rateIncrease / 0.25) * 1.5;
    
    // Term impact - strategic duration assessment
    if (optimizedStructure.term > originalStructure.term) {
      confidenceAdjustment -= ((optimizedStructure.term - originalStructure.term) / 12) * 2;
    }
    
    // Backend impact - penetration threshold assessment
    const originalBackendTotal = originalStructure.backendProducts.reduce(
      (sum, product) => sum + product.amount, 0
    );
    
    const optimizedBackendTotal = optimizedStructure.backendProducts.reduce(
      (sum, product) => sum + product.amount, 0
    );
    
    if (optimizedBackendTotal > originalBackendTotal) {
      confidenceAdjustment -= ((optimizedBackendTotal - originalBackendTotal) / 1000) * 3;
    }
    
    // Ensure confidence remains within regulatory compliance thresholds
    return Math.max(Math.min(baseConfidence + confidenceAdjustment, 100), 0);
  }
}

// Export the class instance for use in the application
const profitOptimizer = new ProfitOptimizer();
module.exports = profitOptimizer;
