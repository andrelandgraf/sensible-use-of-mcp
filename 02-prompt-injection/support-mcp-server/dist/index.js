import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
// Get API key from command line arguments
const apiKey = process.argv[2];
if (!apiKey) {
    console.error("Usage: npm run start <API_KEY>");
    process.exit(1);
}
const API_BASE_URL = "http://localhost:3000/api";
// Helper function to make authenticated API requests
async function makeApiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
    };
    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: "Unknown error" }));
            throw new Error(`API Error (${response.status}): ${error.error || response.statusText}`);
        }
        return await response.json();
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to call ${endpoint}: ${message}`);
    }
}
// Create an MCP server
const server = new McpServer({
    name: "support-admin-server",
    version: "1.0.0"
});
// Tool: Get all support cases
server.registerTool("get_all_support_cases", {
    title: "Get All Support Cases",
    description: "Retrieve all support cases from the system",
    inputSchema: z.object({}).shape
}, async () => {
    try {
        const cases = await makeApiRequest("/support-cases");
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify(cases, null, 2)
                }]
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
            content: [{
                    type: "text",
                    text: `Error: ${message}`
                }]
        };
    }
});
// Tool: Get messages for a specific support case
server.registerTool("get_support_case_messages", {
    title: "Get Support Case Messages",
    description: "Retrieve all messages for a specific support case",
    inputSchema: z.object({
        caseId: z.string().describe("The ID of the support case")
    }).shape
}, async ({ caseId }) => {
    try {
        const messages = await makeApiRequest(`/support-cases/${caseId}/messages`);
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify(messages, null, 2)
                }]
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
            content: [{
                    type: "text",
                    text: `Error: ${message}`
                }]
        };
    }
});
// Tool: Reply to a support case as admin
server.registerTool("reply_to_support_case", {
    title: "Reply to Support Case",
    description: "Send a reply message to a support case as an admin",
    inputSchema: z.object({
        caseId: z.string().describe("The ID of the support case"),
        message: z.string().describe("The message content to send")
    }).shape
}, async ({ caseId, message }) => {
    try {
        const response = await makeApiRequest(`/support-cases/${caseId}/messages`, {
            method: "POST",
            body: JSON.stringify({ message })
        });
        return {
            content: [{
                    type: "text",
                    text: `Reply sent successfully: ${JSON.stringify(response, null, 2)}`
                }]
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
            content: [{
                    type: "text",
                    text: `Error: ${message}`
                }]
        };
    }
});
// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
