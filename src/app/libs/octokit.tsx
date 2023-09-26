const { Octokit } = require("@octokit/rest");
const { createAppAuth } = require("@octokit/auth-app");

const octokit = new Octokit({
    auth: process.env.NEXT_OCTOKIT_SECRET_KEY,
    userAgent: 'Vancelott',
    previews: ['jean-grey', 'symmetra'],
    // timeZone: 'Europe/Sofia',
    // "Access-Control-Allow-Credentials": true,
    baseUrl: 'https://api.github.com',
    // "Access-Control-Allow-Origin": "http://example.com",
    log: {
        debug: () => {},
        info: () => {},
        warn: console.warn,
        error: console.error
      },
      request: {
        agent: undefined,
        fetch: undefined,
        timeout: 0
      }
})

export default octokit