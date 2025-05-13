import { TransactionDetails } from "../types/interfaces";
import { TYPE_EMOJI } from "../config/constants";

// Known system program IDs
const SYSTEM_PROGRAMS = {
  SYSTEM_PROGRAM: "11111111111111111111111111111111",
  COMPUTE_BUDGET: "ComputeBudget111111111111111111111111111111",
  TOKEN_PROGRAM: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
} as const;

// Time constants
const TIME_UNITS = {
  SECOND: 1,
  MINUTE: 60,
  HOUR: 60 * 60,
  DAY: 24 * 60 * 60,
} as const;

// Transaction complexity thresholds
const COMPLEXITY = {
  SIMPLE: "Simple (Single Program)",
  MODERATE: "Moderate (2-3 Programs)",
  COMPLEX: "Complex (Multiple Programs)",
} as const;

/**
 * Formats transaction details into a readable markdown report
 * @param tx Transaction details to format
 * @returns Formatted markdown string
 */
export function formatTransactionDetails(tx: TransactionDetails): string {
  // Process transaction data
  const {
    formattedBasicInfo,
    formattedProgramInteraction,
    formattedAccountParticipants,
    formattedTransactionAnalysis,
    formattedSecurityConsiderations,
  } = processTransactionDetails(tx);

  // Combine all sections into the final report
  return [
    formattedBasicInfo,
    formattedProgramInteraction,
    formattedAccountParticipants,
    formattedTransactionAnalysis,
    formattedSecurityConsiderations,
  ].join("\n\n");
}

/**
 * Processes transaction details into formatted sections
 */
function processTransactionDetails(tx: TransactionDetails) {
  const statusEmoji = tx.status === "Success" ? "✅" : "❌";
  const typeEmoji = TYPE_EMOJI[tx.type as keyof typeof TYPE_EMOJI] || "📄";

  // Format timestamp and time ago string
  const { formattedDate, timeAgoStr } = formatTimeInfo(tx.blockTime);

  // Analyze account roles
  const accountRoles = determineAccountRoles(tx);

  // Check if this is a token transfer
  const isTokenTransfer =
    tx.type === "Transfer" &&
    tx.programIds.some((p) => p.id === SYSTEM_PROGRAMS.TOKEN_PROGRAM);

  // Determine transaction complexity
  const complexity = determineComplexity(tx.programIds.length);

  // Format each section
  return {
    formattedBasicInfo: formatBasicInfo(
      tx,
      statusEmoji,
      typeEmoji,
      formattedDate,
      timeAgoStr
    ),
    formattedProgramInteraction: formatProgramInteraction(tx),
    formattedAccountParticipants: formatAccountParticipants(tx, accountRoles),
    formattedTransactionAnalysis: formatTransactionAnalysis(
      tx,
      complexity,
      isTokenTransfer
    ),
    formattedSecurityConsiderations: formatSecurityConsiderations(tx),
  };
}

/**
 * Formats the basic information section
 */
function formatBasicInfo(
  tx: TransactionDetails,
  statusEmoji: string,
  typeEmoji: string,
  formattedDate: string,
  timeAgoStr: string
): string {
  return `# Transaction Details ${statusEmoji}

## Basic Information
**Type:** ${typeEmoji} ${tx.type}
**Status:** ${tx.status}
**Signature:** \`${tx.signature}\`
**Timestamp:** ${formattedDate} (${timeAgoStr})
**Transaction Fee:** ${tx.fee} SOL`;
}

/**
 * Formats the program interaction section
 */
function formatProgramInteraction(tx: TransactionDetails): string {
  return `## Program Interaction
${tx.programIds
  .map(
    (program) =>
      `- **${program.name || "Unknown Program"}** (\`${program.id}\`)`
  )
  .join("\n")}`;
}

/**
 * Formats the account participants section
 */
function formatAccountParticipants(
  tx: TransactionDetails,
  accountRoles: string[]
): string {
  return `## Account Participants
${tx.accounts
  .map((account, index) => `- **${accountRoles[index]}**: \`${account}\``)
  .join("\n")}`;
}

/**
 * Formats the transaction analysis section
 */
function formatTransactionAnalysis(
  tx: TransactionDetails,
  complexity: string,
  isTokenTransfer: boolean
): string {
  const transferTypeInfo =
    tx.type === "Transfer"
      ? `- **Transfer Type:** ${
          isTokenTransfer ? "Token Transfer" : "SOL Transfer"
        }\n`
      : "";

  return `## Transaction Analysis
- **Complexity:** ${complexity}
- **Program Type:** ${tx.programIds.map((p) => p.name || "Unknown").join(", ")}
- **Account Count:** ${tx.accounts.length} accounts involved
${transferTypeInfo}`;
}

/**
 * Formats the security considerations section
 */
function formatSecurityConsiderations(tx: TransactionDetails): string {
  const highFeeWarning =
    tx.fee > 0.001 ? "- **Note:** Higher than average transaction fee\n" : "";

  return `## Security Considerations
- Always verify transaction signatures
- Check program IDs match expected addresses
- Confirm account permissions and roles
${highFeeWarning}
*This analysis is based on on-chain data and is provided for informational purposes only.*`;
}

/**
 * Formats time information for a transaction
 */
function formatTimeInfo(timestamp: number): {
  formattedDate: string;
  timeAgoStr: string;
} {
  const txDate = new Date(timestamp);

  // Format date in a more readable format
  const formattedDate = txDate.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Calculate time difference
  const timeAgo = Math.floor((Date.now() - timestamp) / 1000);

  // Generate human-readable time ago string
  let timeAgoStr: string;
  if (timeAgo < TIME_UNITS.MINUTE) {
    timeAgoStr = `${timeAgo} seconds ago`;
  } else if (timeAgo < TIME_UNITS.HOUR) {
    timeAgoStr = `${Math.floor(timeAgo / TIME_UNITS.MINUTE)} minutes ago`;
  } else if (timeAgo < TIME_UNITS.DAY) {
    timeAgoStr = `${Math.floor(timeAgo / TIME_UNITS.HOUR)} hours ago`;
  } else {
    timeAgoStr = `${Math.floor(timeAgo / TIME_UNITS.DAY)} days ago`;
  }

  return { formattedDate, timeAgoStr };
}

/**
 * Determines roles for each account in the transaction
 */
function determineAccountRoles(tx: TransactionDetails): string[] {
  return tx.accounts.map((account) => {
    if (account === SYSTEM_PROGRAMS.SYSTEM_PROGRAM) return "System Program";
    if (account === SYSTEM_PROGRAMS.COMPUTE_BUDGET)
      return "Compute Budget Program";
    if (tx.programIds.some((p) => p.id === account)) return "Program";
    return "User Account";
  });
}

/**
 * Determines transaction complexity based on program count
 */
function determineComplexity(programCount: number): string {
  if (programCount === 1) return COMPLEXITY.SIMPLE;
  if (programCount <= 3) return COMPLEXITY.MODERATE;
  return COMPLEXITY.COMPLEX;
}
