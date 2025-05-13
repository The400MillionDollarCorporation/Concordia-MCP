import { WalletActivity, WalletProfile, Strategy } from "../types/interfaces";
import { identifyProtocol } from "../services/transaction";

// Define risk level type to match Strategy interface
type RiskLevel = "low" | "medium" | "high";

// Define strategy constants
const STRATEGIES = {
  BEGINNER: {
    strategy: "Start DeFi",
    description: "Begin with small positions in established protocols.",
    riskLevel: "low" as RiskLevel,
    potentialReturn: "3-5% APY",
  },

  // Conservative strategies
  STAKING_SOL: {
    strategy: "Staking SOL",
    description: "Stake SOL with a validator for steady returns.",
    riskLevel: "low" as RiskLevel,
    potentialReturn: "5-7% APY",
  },
  LIQUID_STAKING: {
    strategy: "Liquid Staking",
    description:
      "Use Marinade Finance for liquid staking to earn staking rewards while maintaining liquidity.",
    riskLevel: "low" as RiskLevel,
    potentialReturn: "6-8% APY",
  },

  // Moderate strategies
  SUPPLY_STABLECOINS: {
    strategy: "Supply Stablecoins",
    description: "Supply USDC or USDT to Solend to earn lending interest.",
    riskLevel: "medium" as RiskLevel,
    potentialReturn: "8-12% APY",
  },
  DIVERSIFIED_LP: {
    strategy: "Diversified LP",
    description: "Provide liquidity to stable pairs on Raydium or Orca.",
    riskLevel: "medium" as RiskLevel,
    potentialReturn: "10-20% APY",
  },

  // Aggressive strategies
  LEVERAGED_FARMING: {
    strategy: "Leveraged Farming",
    description:
      "Use leverage on Solend or Mango Markets for amplified yields.",
    riskLevel: "high" as RiskLevel,
    potentialReturn: "20-40% APY with risk",
  },
  PERPETUAL_TRADING: {
    strategy: "Perpetual Trading",
    description: "Trade perpetual futures on Mango Markets or Drift Protocol.",
    riskLevel: "high" as RiskLevel,
    potentialReturn: "Variable",
  },
};

// Map protocols to their corresponding strategies for efficient checking
const PROTOCOL_STRATEGY_MAP = {
  MARINADE_STAKING: STRATEGIES.LIQUID_STAKING,
  SOLEND: STRATEGIES.SUPPLY_STABLECOINS,
  MANGO_MARKETS: STRATEGIES.PERPETUAL_TRADING,
};

// Risk profile type for better type safety
type RiskProfile = "conservative" | "moderate" | "aggressive";

// Risk profile to strategy collections mapping
const RISK_PROFILE_STRATEGIES: Record<RiskProfile, Strategy[]> = {
  conservative: [STRATEGIES.STAKING_SOL, STRATEGIES.LIQUID_STAKING],
  moderate: [STRATEGIES.SUPPLY_STABLECOINS, STRATEGIES.DIVERSIFIED_LP],
  aggressive: [STRATEGIES.LEVERAGED_FARMING, STRATEGIES.PERPETUAL_TRADING],
};

/**
 * Recommends DeFi strategies based on wallet activities and user profile
 * @param activities - List of wallet activities
 * @param profile - Optional wallet profile with user preferences
 * @returns Array of recommended strategies
 */
export function recommendStrategies(
  activities: WalletActivity[],
  profile?: WalletProfile
): Strategy[] {
  // Handle empty activity case with beginner recommendation
  if (!activities.length) {
    return [STRATEGIES.BEGINNER];
  }

  // Get risk profile from user profile or default to moderate
  const riskProfile = (profile?.riskProfile || "moderate") as RiskProfile;

  // Extract unique protocols used by the wallet
  const usedProtocols = extractUsedProtocols(activities);

  // Generate recommendations based on risk profile and used protocols
  return generateRecommendations(riskProfile, usedProtocols);
}

/**
 * Extracts unique protocols used in wallet activities
 * @param activities - List of wallet activities
 * @returns Set of protocol identifiers
 */
function extractUsedProtocols(activities: WalletActivity[]): Set<string> {
  const protocolSet = new Set<string>();

  for (const activity of activities) {
    if (activity.programId && activity.programId !== "Unknown") {
      protocolSet.add(identifyProtocol(activity.programId));
    }
  }

  return protocolSet;
}

/**
 * Generates strategy recommendations based on risk profile and used protocols
 * @param riskProfile - User's risk tolerance level
 * @param usedProtocols - Set of protocols already used by the wallet
 * @returns Array of recommended strategies
 */
function generateRecommendations(
  riskProfile: RiskProfile,
  usedProtocols: Set<string>
): Strategy[] {
  const recommendations: Strategy[] = [];

  // Get base strategies for the risk profile
  const baseStrategies =
    RISK_PROFILE_STRATEGIES[riskProfile] || RISK_PROFILE_STRATEGIES.moderate;

  // Add strategies based on risk profile, filtering out those for protocols the user already uses
  for (const strategy of baseStrategies) {
    // Check if strategy should be excluded based on protocol usage
    const shouldExclude = Object.entries(PROTOCOL_STRATEGY_MAP).some(
      ([protocol, mappedStrategy]) =>
        usedProtocols.has(protocol) && mappedStrategy === strategy
    );

    if (!shouldExclude) {
      recommendations.push(strategy);
    }
  }

  return recommendations;
}
