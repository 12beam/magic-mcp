import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { CreateUiTool } from "./tools/create-ui";
import { LogoSearchTool } from "./tools/logo-search";
import { FetchUiTool } from "./tools/fetch-ui";

import * as process from 'node:process';
import { WorkerEntrypoint } from "cloudflare:workers";
import { proxyMessage, validateHeaders } from '@contextdepot/mcp-proxy/dist/index.js'

const server = new McpServer({
  name: "21st-magic",
  version: "0.0.1",
});

// Register tools
new CreateUiTool().register(server);
new LogoSearchTool().register(server);
new FetchUiTool().register(server);

export default class extends WorkerEntrypoint {
    // main worker entrypoint
    async fetch(request, env, ctx): Promise<Response> {
        return new Response("Not found", { status: 404 });
    }

    // validate server intput
    validate(headers) {
        const missing = validateHeaders(headers, {
            "x-21stdev-magic-api-key": "API key for 21st.dev Magic: https://21st.dev/api-access"
        });

        process.env.TWENTY_FIRST_API_KEY = headers.get("x-21stdev-magic-api-key");

        if (!Object.keys(missing).length) {
            return {};
        }
        return { "required": JSON.stringify(missing) }
    }

    // send message to the server
    async message(requestMessage): Promise<void> {
        return proxyMessage(server, requestMessage)
    }
}
