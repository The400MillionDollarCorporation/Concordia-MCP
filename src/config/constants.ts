import { clusterApiUrl } from "@solana/web3.js";
import "dotenv/config";

/**
 * RPC URL for Solana network connection,
 * prioritizes custom URL from environment variables
 */
export const RPC_URL =
  process.env.SOLANA_RPC_URL || clusterApiUrl("mainnet-beta");

/**
 * Known Solana program IDs with their respective names
 * Using const assertion to ensure type safety and readonly properties
 */
export const KNOWN_PROGRAMS = {
  // DEXs and Swap Programs
  RAYDIUM_SWAP: "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8",
  ORCA_SWAP: "9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP",
  JUPITER_AGGREGATOR: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
  SERUM_DEX_V3: "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
  FLUXBEAM: "FLUXubRmkEi2q6K3Y9kBPg9248ggaZVsoSFhtJHSrm1X",

  // Staking and Lending
  MARINADE_STAKING: "MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD",
  SOLEND: "So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo",
  MANGO_MARKETS: "mv3ekLzLbnVPNxjSKvqBpU3ZeZXPQdEC3bp5MDEBG68",

  // Core Solana Programs
  TOKEN_PROGRAM: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  ASSOCIATED_TOKEN_PROGRAM: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
  METAPLEX: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
} as const;

/**
 * Standard emoji mappings for transaction types
 * Using semantically meaningful and widely supported emojis
 */
export const TYPE_EMOJI = {
  Transfer: "↗️", // Upward-right arrow indicating outgoing transfer
  Swap: "🔄", // Clockwise vertical arrows for swap/exchange
  Mint: "✨", // Sparkles for creation
  Staking: "📌", // Pushpin for locking tokens in staking
  Trading: "📈", // Chart with upward trend for trading activity
  Lending: "🏦", // Bank for lending operations
  Liquidity: "💧", // Water droplet for liquidity provision
  Other: "🔹", // Small blue diamond for other activities
} as const;

/**
 * Risk level indicators with color-coded emojis
 * Following accessibility standards with meaningful symbols
 */
export const RISK_EMOJI = {
  conservative: "🟢", // Green circle for low risk
  moderate: "🟠", // Orange circle for medium risk
  aggressive: "🔴", // Red circle for high risk
} as const;

/**
 * Protocol brand emojis for visual identification
 * Maps protocol identifiers to representative emojis
 */
export const PROTOCOL_EMOJI = {
  RAYDIUM_SWAP: "☀️", // Sun for Raydium
  ORCA_SWAP: "🐋", // Whale for Orca
  JUPITER_AGGREGATOR: "🪐", // Planet for Jupiter
  MARINADE_STAKING: "🧪", // Test tube for Marinade
  SOLEND: "💵", // Dollar bill for Solend
  MANGO_MARKETS: "🥭", // Mango for Mango Markets
  FLUXBEAM: "⚡", // Lightning for FluxBeam
  Aggregate: "📊", // Bar chart for aggregate stats
} as const;

/**
 * Time period constants in milliseconds for efficient date calculations
 */
export const TIME_PERIODS = {
  ONE_MINUTE: 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
  ONE_MONTH: 30 * 24 * 60 * 60 * 1000,
} as const;
