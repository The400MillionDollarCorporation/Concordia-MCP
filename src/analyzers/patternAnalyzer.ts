import { WalletActivity, TransactionPattern } from "../types/interfaces";

// Define constants
const MINIMUM_TRANSACTIONS = 5;
const MINIMUM_SWAPS = 3;
const MINIMUM_STAKING_ACTIONS = 3;
const DCA_DEVIATION_THRESHOLD = 0.3;

// Pattern confidence levels
const CONFIDENCE = {
  LOW: 0.5,
  MEDIUM: 0.7,
  HIGH: 0.8,
  VERY_HIGH: 0.9,
};

// Pre-defined patterns
const PATTERNS = {
  INSUFFICIENT_DATA: {
    patternType: "insufficient_data",
    confidence: 0,
    description: "Not enough transaction history to establish patterns.",
  },
  GENERAL: {
    patternType: "general",
    confidence: CONFIDENCE.LOW,
    description: "No specific pattern detected in transaction history.",
  },
  DCA: {
    patternType: "dca",
    confidence: CONFIDENCE.MEDIUM,
    description:
      "Regular token purchases suggest a dollar-cost averaging strategy.",
  },
  LENDING: {
    patternType: "lending_active",
    confidence: CONFIDENCE.VERY_HIGH,
    description:
      "Active lending positions detected. Monitor collateral ratios to avoid liquidation.",
  },
  YIELD_FARMING: {
    patternType: "yield_farming",
    confidence: CONFIDENCE.HIGH,
    description:
      "Multiple staking activities suggest active yield farming strategy.",
  },
};

/**
 * Analyzes transaction activities to identify user behavior patterns
 * @param activities - List of wallet activities
 * @returns Array of identified transaction patterns
 */
export function analyzeTransactionPatterns(
  activities: WalletActivity[]
): TransactionPattern[] {
  // Early return if insufficient data
  if (activities.length < MINIMUM_TRANSACTIONS) {
    return [PATTERNS.INSUFFICIENT_DATA];
  }

  // Group activities by type for efficiency
  const activityGroups = groupActivitiesByType(activities);
  const patterns: TransactionPattern[] = [];

  // Analyze for DCA pattern
  detectDCAPattern(activityGroups.Swap || [], patterns);

  // Check for lending activity
  if (hasActivities(activityGroups.Lending)) {
    patterns.push(PATTERNS.LENDING);
  }

  // Check for yield farming pattern
  if (hasMinimumActivities(activityGroups.Staking, MINIMUM_STAKING_ACTIONS)) {
    patterns.push(PATTERNS.YIELD_FARMING);
  }

  // Return patterns or default if none detected
  return patterns.length > 0 ? patterns : [PATTERNS.GENERAL];
}

/**
 * Groups activities by their type for more efficient processing
 */
function groupActivitiesByType(
  activities: WalletActivity[]
): Record<string, WalletActivity[]> {
  return activities.reduce((groups, activity) => {
    const type = activity.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(activity);
    return groups;
  }, {} as Record<string, WalletActivity[]>);
}

/**
 * Checks if activities of a certain type exist
 */
function hasActivities(activities?: WalletActivity[]): boolean {
  return Boolean(activities && activities.length > 0);
}

/**
 * Checks if there are at least the minimum number of activities
 */
function hasMinimumActivities(
  activities?: WalletActivity[],
  minimum: number = 1
): boolean {
  return Boolean(activities && activities.length >= minimum);
}

/**
 * Detects Dollar-Cost Averaging pattern based on swap timing regularity
 */
function detectDCAPattern(
  swaps: WalletActivity[],
  patterns: TransactionPattern[]
): void {
  if (swaps.length < MINIMUM_SWAPS) {
    return;
  }

  // Sort by timestamp descending (newest first)
  const sortedSwaps = [...swaps].sort((a, b) => b.timestamp - a.timestamp);

  // Calculate time gaps between consecutive swaps
  const timeGaps = [];
  for (let i = 1; i < sortedSwaps.length; i++) {
    timeGaps.push(sortedSwaps[i - 1].timestamp - sortedSwaps[i].timestamp);
  }

  // Statistical analysis to detect regularity
  const { mean, standardDeviation } = calculateStats(timeGaps);

  // DCA is identified by consistent time intervals (low deviation relative to average)
  const variationCoefficient = standardDeviation / mean;
  if (variationCoefficient < DCA_DEVIATION_THRESHOLD) {
    patterns.push(PATTERNS.DCA);
  }
}

/**
 * Calculates mean and standard deviation for an array of numbers
 */
function calculateStats(values: number[]): {
  mean: number;
  standardDeviation: number;
} {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;

  const variance =
    values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
    values.length;

  return {
    mean,
    standardDeviation: Math.sqrt(variance),
  };
}
