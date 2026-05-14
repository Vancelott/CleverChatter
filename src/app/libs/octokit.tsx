import { Octokit } from "@octokit/rest";
// import { createAppAuth } from "@octokit/auth-app";
// import { Octokit } from "@octokit/core";
import { retry } from "@octokit/plugin-retry";
import { throttling, ThrottlingOptions } from "@octokit/plugin-throttling";
import type { EndpointDefaults } from "@octokit/types";
import type { Octokit as OctokitType } from "@octokit/rest";

const MyOctokit = (Octokit as any).plugin(retry, throttling);
type MyOctokitInstance = InstanceType<typeof MyOctokit>;

const octokit: MyOctokitInstance = new MyOctokit({
  // TODO add token infront?
  auth: process.env.NEXT_OCTOKIT_SECRET_KEY,
  userAgent: "Vancelott",
  baseUrl: "https://api.github.com",
  throttle: {
    onRateLimit: (retryAfter: number, options: EndpointDefaults) => {
      octokit.log.warn(
        `Request quota exhausted for request ${options.method} ${options.url}`,
      );

      if (options?.request?.retryCount === 0) {
        // only retries once
        octokit.log.info(`Retrying after ${retryAfter} seconds!`);
        return true;
      }
    },
    onSecondaryRateLimit: (
      retryAfter: number,
      options: EndpointDefaults,
      octokit: OctokitType,
    ) => {
      // does not retry, only logs a warning
      octokit.log.warn(
        `Secondary quota detected for request ${options.method} ${options.url}`,
      );
      return false;
    },
  },
  log: {
    debug: () => {},
    info: () => {},
    warn: console.warn,
    error: console.error,
  },
  request: {
    agent: undefined,
    fetch: undefined,
    timeout: 0,
  },
});

export default octokit;
