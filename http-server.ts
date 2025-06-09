import express from 'express';
import cors from 'cors';
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import "dotenv/config";
import { fetchWalletActivityTool } from "./tools/fetchWalletActivity";
import { analyzeWalletTool } from "./tools/analyzeWallet";
import { getTransactionDetailsTool } from "./tools/getTransactionDetails";

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all origins (adjust for production)
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

const server = new McpServer({
  name: "Portfolio Tracker",
  version: "1.0.0",
});

// Register tools
server.tool(
  fetchWalletActivityTool.name,
  fetchWalletActivityTool.description,
  fetchWalletActivityTool.parameters,
  async (args, extra) => {
    const result = await fetchWalletActivityTool.execute(args);
    return {
      ...result,
      content: result.content.map(item => ({
        ...item,
        type: "text" as const
      }))
    };
  }
);

server.tool(
  analyzeWalletTool.name,
  analyzeWalletTool.description,
  analyzeWalletTool.parameters,
  async (args, extra) => {
    const result = await analyzeWalletTool.execute(args);
    return {
      ...result,
      content: result.content.map(item => ({
        ...item,
        type: "text" as const
      }))
    };
  }
);

server.tool(
  getTransactionDetailsTool.name,
  getTransactionDetailsTool.description,
  getTransactionDetailsTool.parameters,
  async (args, extra) => {
    const result = await getTransactionDetailsTool.execute(args);
    return {
      ...result,
      content: result.content.map(item => ({
        ...item,
        type: "text" as const
      }))
    };
  }
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SSE endpoint for MCP
app.get('/sse', async (req, res) => {
  console.log('SSE connection requested');
  const transport = new SSEServerTransport('/sse', res);
  await server.connect(transport);
});

app.listen(PORT, () => {
  console.log(`Concordia MCP Server running on port ${PORT}`);
  console.log(`SSE endpoint: http://localhost:${PORT}/sse`);
});