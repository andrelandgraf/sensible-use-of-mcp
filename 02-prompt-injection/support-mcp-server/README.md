# Support MCP Server

This is an MCP (Model Context Protocol) server that provides tools for managing support cases through API calls to a local support application.

## Prerequisites

1. Make sure your support frontend is running on `localhost:3000`
2. You need a valid admin API key from your support application

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the TypeScript code:
```bash
npm run build
```

## Usage

Run the MCP server with your API key:

```bash
npm start <YOUR_API_KEY>
```

Or for development:
```bash
npm run dev <YOUR_API_KEY>
```

## Available Tools

### get_all_support_cases
Retrieve all support cases from the system.

### get_support_case_messages
Retrieve all messages for a specific support case.
- Parameters: `caseId` (string) - The ID of the support case

### reply_to_support_case
Send a reply message to a support case as an admin.
- Parameters: 
  - `caseId` (string) - The ID of the support case
  - `message` (string) - The message content to send

## API Authentication

The server uses Bearer token authentication with the API key provided as a command line argument. The API key must belong to an admin user in the support system.

Headers sent to the API:
```
Authorization: Bearer <API_KEY>
Content-Type: application/json
```