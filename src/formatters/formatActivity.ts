import { WalletActivity } from "../types/interfaces";
import { identifyProtocol } from "../services/transaction";
import { TYPE_EMOJI, TIME_PERIODS } from "../config/constants";

/**
 * Formats wallet activity data into a comprehensive markdown report
 * @param activities List of wallet activities to analyze and format
 * @param walletAddress The address of the wallet being analyzed
 * @returns Formatted markdown string with activity report
 */
export function formatActivityHistory(
  activities: WalletActivity[],
  walletAddress: string
): string {
  // Early return for empty activities
  if (!activities.length) {
    return `# Wallet Activity Report\n\n**Wallet Address:** \`${walletAddress}\`\n\nNo transaction history found for this wallet.`;
  }

  // Perform a single pass through activities to collect all necessary data
  const {
    activityTypes,
    totalVolume,
    oldestTimestamp,
    newestTimestamp,
    programInteractions,
  } = analyzeActivities(activities);

  // Create date objects for display
  const oldestDate = new Date(oldestTimestamp);
  const newestDate = new Date(newestTimestamp);

  // Calculate time difference in days for activity frequency
  const daysDifference =
    (newestTimestamp - oldestTimestamp) / TIME_PERIODS.ONE_DAY;
  const transactionsPerDay =
    daysDifference > 0
      ? (activities.length / daysDifference).toFixed(2)
      : activities.length.toString();

  // Find most common activity type
  const mostCommonActivity = Object.entries(activityTypes).sort(
    (a, b) => b[1].length - a[1].length
  )[0][0];

  // Calculate average transaction value
  const avgTransactionValue = totalVolume / activities.length;

  return buildMarkdownReport({
    walletAddress,
    oldestDate,
    newestDate,
    activities,
    activityTypes,
    totalVolume,
    mostCommonActivity,
    avgTransactionValue,
    transactionsPerDay,
    programInteractions,
  });
}

/**
 * Analyzes activities to extract key metrics and groupings
 * @param activities List of wallet activities
 * @returns Object containing analyzed data
 */
function analyzeActivities(activities: WalletActivity[]) {
  const activityTypes: Record<string, WalletActivity[]> = {};
  const programInteractions: Record<string, number> = {};
  let totalVolume = 0;
  let oldestTimestamp = Infinity;
  let newestTimestamp = 0;

  // Single pass through activities to collect all data
  for (const activity of activities) {
    // Group by activity type
    if (!activityTypes[activity.type]) {
      activityTypes[activity.type] = [];
    }
    activityTypes[activity.type].push(activity);

    // Track program interactions
    const protocol = identifyProtocol(activity.programId);
    programInteractions[protocol] = (programInteractions[protocol] || 0) + 1;

    // Calculate total volume
    totalVolume += activity.value || 0;

    // Track oldest and newest timestamps
    if (activity.timestamp < oldestTimestamp)
      oldestTimestamp = activity.timestamp;
    if (activity.timestamp > newestTimestamp)
      newestTimestamp = activity.timestamp;
  }

  return {
    activityTypes,
    totalVolume,
    oldestTimestamp,
    newestTimestamp,
    programInteractions,
  };
}

/**
 * Builds the formatted markdown report from analyzed data
 * @param params Object containing all report parameters
 * @returns Formatted markdown string
 */
function buildMarkdownReport(params: {
  walletAddress: string;
  oldestDate: Date;
  newestDate: Date;
  activities: WalletActivity[];
  activityTypes: Record<string, WalletActivity[]>;
  totalVolume: number;
  mostCommonActivity: string;
  avgTransactionValue: number;
  transactionsPerDay: string;
  programInteractions: Record<string, number>;
}): string {
  const {
    walletAddress,
    oldestDate,
    newestDate,
    activities,
    activityTypes,
    totalVolume,
    mostCommonActivity,
    avgTransactionValue,
    transactionsPerDay,
    programInteractions,
  } = params;

  // Format date strings for better readability
  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Format SOL values with proper decimal places
  const formatSOL = (value: number) =>
    value.toFixed(value < 0.01 ? 6 : 4) + " SOL";

  // Helper for getting emoji
  const getEmoji = (type: string) =>
    TYPE_EMOJI[type as keyof typeof TYPE_EMOJI] || "•";

  // Build header section
  const header = `# Wallet Activity Report

**Wallet Address:** \`${walletAddress}\`
**Time Period:** ${formatDate(oldestDate)} to ${formatDate(newestDate)}
**Total Transactions:** ${activities.length}
**Total Volume:** ${formatSOL(totalVolume)}`;

  // Build activity summary section
  const activitySummary = `## Activity Summary
${Object.entries(activityTypes)
  .map(
    ([type, acts]) => `- ${getEmoji(type)} ${type}: ${acts.length} transactions`
  )
  .join("\n")}`;

  // Build transaction history section (most recent first)
  const transactionHistory = `## Detailed Transaction History
${activities
  .slice()
  .sort((a, b) => b.timestamp - a.timestamp) // Sort by most recent first
  .slice(0, 10) // Limit to 10 most recent transactions to avoid overly long reports
  .map(
    (activity) => `
### ${getEmoji(activity.type)} Transaction at ${formatDate(
      new Date(activity.timestamp)
    )}
- **Type:** ${activity.type}
- **Value:** ${activity.value ? formatSOL(activity.value) : "N/A"}
- **Program:** ${identifyProtocol(activity.programId)}
- **Status:** ${activity.success ? "✅ Success" : "❌ Failed"}
- **Signature:** \`${activity.signature}\`
${activity.description ? `- **Description:** ${activity.description}` : ""}`
  )
  .join("\n")}`;

  // Build transaction patterns section
  const transactionPatterns = `## Transaction Patterns
- **Most Common Activity:** ${getEmoji(
    mostCommonActivity
  )} ${mostCommonActivity}
- **Average Transaction Value:** ${formatSOL(avgTransactionValue)}
- **Activity Frequency:** ${transactionsPerDay} transactions per day`;

  // Build program interaction summary
  const programSummary = `## Program Interaction Summary
${Object.entries(programInteractions)
  .sort((a, b) => b[1] - a[1])
  .map(([program, count]) => `- ${program}: ${count} interactions`)
  .join("\n")}

*This activity report ${
    activities.length > 10
      ? "shows the 10 most recent of " + activities.length + " transactions"
      : "includes all " + activities.length + " transactions"
  }. For a full analysis, use the analyzeWallet tool.*`;

  // Combine all sections
  return [
    header,
    activitySummary,
    transactionHistory,
    transactionPatterns,
    programSummary,
  ].join("\n\n");
}
