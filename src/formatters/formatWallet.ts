import {
  WalletProfile,
  TransactionPattern,
  DeFiPosition,
  Strategy,
  WalletActivity,
} from "../types/interfaces";
import { RISK_EMOJI, PROTOCOL_EMOJI, TYPE_EMOJI } from "../config/constants";

// Risk assessment thresholds
const THRESHOLDS = {
  DIVERSIFICATION: {
    LOW: 30,
    MEDIUM: 60,
  },
  ACTIVITY: {
    LOW: 50,
    MEDIUM: 100,
  },
};

// Risk level indicators with emoji
const RISK_INDICATORS = {
  HIGH: "⚠️ HIGH",
  MEDIUM: "⚡ MEDIUM",
  LOW: "✅ LOW",
};

// Activity level indicators with emoji
const ACTIVITY_INDICATORS = {
  HIGH: "🔄 HIGH",
  MEDIUM: "⚡ MEDIUM",
  LOW: "🐢 LOW",
};

/**
 * Formats a comprehensive wallet analysis report in markdown
 * @param profile Wallet profile information
 * @param patterns Detected transaction patterns
 * @param positions Current DeFi positions
 * @param recommendations Strategy recommendations
 * @param recentActivities Recent wallet activities
 * @returns Formatted markdown string
 */
export function formatWalletAnalysis(
  profile: WalletProfile,
  patterns: TransactionPattern[],
  positions: DeFiPosition[],
  recommendations: Strategy[],
  recentActivities: WalletActivity[]
): string {
  // Format each section using dedicated helper functions
  const sections = [
    formatHeader(profile),
    formatActivityOverview(profile, recentActivities),
    formatBehavioralPatterns(patterns),
    formatDeFiPositions(positions),
    formatRecommendations(recommendations),
    formatRiskAssessment(profile),
    formatSafetyTips(profile),
  ];

  // Join all sections with double newlines
  return sections.join("\n\n");
}

/**
 * Formats the header section with wallet address and risk profile
 */
function formatHeader(profile: WalletProfile): string {
  return `# Wallet Analysis Report ${RISK_EMOJI[profile.riskProfile]}

**Wallet Address:** \`${profile.address}\`
**Risk Profile:** ${profile.riskProfile.toUpperCase()}
**Portfolio Diversification Score:** ${profile.portfolioDiversification}/100`;
}

/**
 * Formats the activity overview section with transaction history and protocols
 */
function formatActivityOverview(
  profile: WalletProfile,
  recentActivities: WalletActivity[]
): string {
  // Get activity type distribution
  const activityTypeCount = countActivityTypes(recentActivities);

  // Format dates for better readability
  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const overview = `## Activity Overview
**Total Transactions:** ${profile.activityCount}
**First Activity:** ${formatDate(profile.firstActivityDate)}
**Last Activity:** ${formatDate(profile.lastActivityDate)}
**Transaction Volume:** ${profile.transactionVolume.toFixed(2)} SOL`;

  const favoriteProtocols = `### Favorite Protocols
${profile.favoriteProtocols
  .map((p) => {
    const emoji = getProtocolEmoji(p.name);
    return `- ${emoji} ${p.name}: ${p.count} interactions`;
  })
  .join("\n")}`;

  const activityDistribution = `### Recent Activity Distribution
${Object.entries(activityTypeCount)
  .sort((a, b) => b[1] - a[1])
  .map(([type, count]) => {
    const emoji = TYPE_EMOJI[type as keyof typeof TYPE_EMOJI] || "•";
    return `- ${emoji} ${type}: ${count} transactions`;
  })
  .join("\n")}`;

  return [overview, favoriteProtocols, activityDistribution].join("\n\n");
}

/**
 * Formats the behavioral patterns section
 */
function formatBehavioralPatterns(patterns: TransactionPattern[]): string {
  if (!patterns.length) {
    return `## Behavioral Patterns
No significant transaction patterns detected.`;
  }

  const patternsContent = patterns
    .map((pattern) => {
      const confidencePercentage = (pattern.confidence * 100).toFixed(1);
      const confidenceEmoji = getConfidenceEmoji(pattern.confidence);

      return `### ${pattern.patternType} ${confidenceEmoji} (${confidencePercentage}% confidence)
${pattern.description}`;
    })
    .join("\n\n");

  return `## Behavioral Patterns
${patternsContent}`;
}

/**
 * Formats the DeFi positions section
 */
function formatDeFiPositions(positions: DeFiPosition[]): string {
  if (!positions.length) {
    return `## Active DeFi Positions
No active DeFi positions detected.`;
  }

  // Format token value display
  const formatValue = (value: number | undefined): string => {
    if (!value) return "Unknown";
    return value.toFixed(value < 0.01 ? 4 : 2) + " SOL";
  };

  // Format APY display
  const formatApy = (apy: number | undefined): string => {
    if (!apy) return "N/A";
    return apy.toFixed(2) + "%";
  };

  // Format date for better readability
  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const positionsContent = positions
    .sort((a, b) => {
      // Sort by protocol name, then by type
      if (a.protocol !== b.protocol)
        return a.protocol.localeCompare(b.protocol);
      return a.type.localeCompare(b.type);
    })
    .map((pos) => {
      const protocolEmoji = getProtocolEmoji(pos.protocol);

      return `### ${protocolEmoji} ${pos.protocol} - ${pos.type}
- Token: ${pos.tokenA || "Multiple"}
- Value: ${formatValue(pos.value)}
- APY: ${formatApy(pos.apy)}
- Last Updated: ${formatDate(pos.timestamp)}`;
    })
    .join("\n\n");

  return `## Active DeFi Positions
${positionsContent}`;
}

/**
 * Formats the strategy recommendations section
 */
function formatRecommendations(recommendations: Strategy[]): string {
  if (!recommendations.length) {
    return `## Strategy Recommendations
No strategy recommendations available.`;
  }

  const recommendationsContent = recommendations
    .map((rec) => {
      const riskLevelEmoji = getRiskLevelEmoji(rec.riskLevel);

      return `### ${rec.strategy} ${riskLevelEmoji}
- ${rec.description}
- Expected Return: ${rec.potentialReturn}`;
    })
    .join("\n\n");

  return `## Strategy Recommendations
${recommendationsContent}`;
}

/**
 * Formats the risk assessment section
 */
function formatRiskAssessment(profile: WalletProfile): string {
  // Determine portfolio concentration risk
  const concentrationRisk =
    profile.portfolioDiversification < THRESHOLDS.DIVERSIFICATION.LOW
      ? RISK_INDICATORS.HIGH
      : profile.portfolioDiversification < THRESHOLDS.DIVERSIFICATION.MEDIUM
      ? RISK_INDICATORS.MEDIUM
      : RISK_INDICATORS.LOW;

  // Determine trading frequency risk
  const tradingFrequency =
    profile.activityCount > THRESHOLDS.ACTIVITY.MEDIUM
      ? ACTIVITY_INDICATORS.HIGH
      : profile.activityCount > THRESHOLDS.ACTIVITY.LOW
      ? ACTIVITY_INDICATORS.MEDIUM
      : ACTIVITY_INDICATORS.LOW;

  return `## Risk Assessment
- Portfolio Concentration: ${concentrationRisk}
- Trading Frequency: ${tradingFrequency}
- Protocol Diversity: ${profile.favoriteProtocols.length} different protocols used`;
}

/**
 * Formats the safety tips section with personalized recommendations
 */
function formatSafetyTips(profile: WalletProfile): string {
  const commonTips = [
    "Always verify transaction details before signing",
    "Consider using hardware wallet for large holdings",
    "Maintain a diversified portfolio across different protocols",
    "Monitor position health regularly",
  ];

  // Add risk-profile specific tips
  const riskSpecificTips = [];
  if (profile.riskProfile === "aggressive") {
    riskSpecificTips.push(
      "Consider setting stop-loss orders for trading positions"
    );
  }

  // Add diversification-specific tips
  if (profile.portfolioDiversification < THRESHOLDS.DIVERSIFICATION.LOW) {
    riskSpecificTips.push(
      "Consider diversifying across more protocols to reduce risk"
    );
  }

  const allTips = [...commonTips, ...riskSpecificTips];

  return `## Safety Tips
${allTips.map((tip) => `- ${tip}`).join("\n")}

*This analysis is based on on-chain activity and is provided for informational purposes only.*`;
}

// ===== Helper functions =====

/**
 * Counts activity types from recent activities
 */
function countActivityTypes(
  activities: WalletActivity[]
): Record<string, number> {
  return activities.reduce((acc, activity) => {
    acc[activity.type] = (acc[activity.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Gets an appropriate emoji for a protocol
 */
function getProtocolEmoji(protocolName: string): string {
  // Try to match the protocol name with the keys in PROTOCOL_EMOJI
  const key = Object.keys(PROTOCOL_EMOJI).find((k) =>
    protocolName.toUpperCase().includes(k.replace("_", " "))
  );

  if (key && key in PROTOCOL_EMOJI) {
    return PROTOCOL_EMOJI[key as keyof typeof PROTOCOL_EMOJI];
  }

  return "🔹"; // Default emoji if no match found
}

/**
 * Gets an appropriate emoji for a confidence level
 */
function getConfidenceEmoji(confidence: number): string {
  if (confidence > 0.8) return "🔍";
  if (confidence > 0.5) return "🔎";
  return "❓";
}

/**
 * Gets an appropriate emoji for a risk level
 */
function getRiskLevelEmoji(riskLevel: string): string {
  switch (riskLevel) {
    case "low":
      return "🟢";
    case "medium":
      return "🟠";
    case "high":
      return "🔴";
    default:
      return "⚪";
  }
}
