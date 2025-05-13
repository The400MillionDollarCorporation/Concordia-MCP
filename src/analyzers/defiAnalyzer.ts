import { WalletActivity, DeFiPosition } from "../types/interfaces";
import { walletCache } from "../utils/cache";
import { identifyProtocol } from "../services/transaction";

const APY_RANGES = {
  STAKING: { min: 5.0, max: 8.0 },
  LENDING: { min: 3.0, max: 7.0 },
  LIQUIDITY: { min: 8.0, max: 12.0 },
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export async function analyzeDeFiPositions(
  publicKey: string
): Promise<DeFiPosition[]> {
  // Check cache first
  const cachedData = walletCache.get(publicKey);
  if (cachedData?.defiPositions) {
    return cachedData.defiPositions;
  }

  const activities = cachedData?.activities || [];

  // Only process successful activities
  const successfulActivities = activities.filter(
    (activity) => activity.success
  );

  if (successfulActivities.length === 0) {
    return [];
  }

  const positions: DeFiPosition[] = [
    ...processStakingPositions(successfulActivities),
    ...processTradingPositions(successfulActivities),
    ...processLendingPositions(successfulActivities),
    ...processLiquidityPositions(successfulActivities),
  ];

  // Add aggregate statistics if we have trading activity
  const swapActivities = getActivitiesByType(successfulActivities, "Swap");
  if (swapActivities.length > 0) {
    const totalVolume = calculateTotalValue(swapActivities);
    positions.push(createAggregatePosition(totalVolume));
  }

  // Update cache
  if (cachedData) {
    walletCache.set(publicKey, {
      ...cachedData,
      defiPositions: positions,
    });
  }

  return positions;
}

function processStakingPositions(activities: WalletActivity[]): DeFiPosition[] {
  return getActivitiesByType(activities, "Staking").map((activity) => ({
    protocol: identifyProtocol(activity.programId),
    type: "Staking",
    tokenA: activity.token,
    value: activity.value,
    apy: generateRandomApy(APY_RANGES.STAKING),
    timestamp: activity.timestamp,
  }));
}

function processTradingPositions(activities: WalletActivity[]): DeFiPosition[] {
  const positions: DeFiPosition[] = [];

  // Get all swap activities or FLUXBEAM activities
  const swapActivities = activities.filter(
    (activity) =>
      activity.type === "Swap" ||
      identifyProtocol(activity.programId) === "FLUXBEAM"
  );

  if (swapActivities.length === 0) {
    return positions;
  }

  // Create a position for recent trading activity (last 24 hours)
  const now = Date.now();
  const recentSwaps = swapActivities.filter(
    (activity) => now - activity.timestamp < ONE_DAY_MS
  );

  if (recentSwaps.length > 0) {
    positions.push({
      protocol: "FLUXBEAM",
      type: "Trading",
      value: calculateTotalValue(recentSwaps),
      timestamp: Math.max(...recentSwaps.map((a) => a.timestamp)),
    });
  }

  return positions;
}

function processLendingPositions(activities: WalletActivity[]): DeFiPosition[] {
  return getActivitiesByType(activities, "Lending").map((activity) => ({
    protocol: identifyProtocol(activity.programId),
    type: "Lending",
    tokenA: activity.token,
    value: activity.value,
    apy: generateRandomApy(APY_RANGES.LENDING),
    timestamp: activity.timestamp,
  }));
}

function processLiquidityPositions(
  activities: WalletActivity[]
): DeFiPosition[] {
  const lpProtocols = ["RAYDIUM_SWAP", "ORCA_SWAP"];

  return activities
    .filter(
      (activity) =>
        activity.type === "Account Creation" &&
        lpProtocols.includes(identifyProtocol(activity.programId))
    )
    .map((activity) => ({
      protocol: identifyProtocol(activity.programId),
      type: "Liquidity",
      value: activity.value,
      timestamp: activity.timestamp,
      apy: generateRandomApy(APY_RANGES.LIQUIDITY),
    }));
}

function createAggregatePosition(totalVolume: number): DeFiPosition {
  return {
    protocol: "Aggregate",
    type: "Trading Statistics",
    value: totalVolume,
    tokenA: "Multiple",
    timestamp: Date.now(),
  };
}

function getActivitiesByType(
  activities: WalletActivity[],
  type: string
): WalletActivity[] {
  return activities.filter((activity) => activity.type === type);
}

function calculateTotalValue(activities: WalletActivity[]): number {
  return activities.reduce((sum, activity) => sum + (activity.value || 0), 0);
}

function generateRandomApy(range: { min: number; max: number }): number {
  return range.min + Math.random() * (range.max - range.min);
}
