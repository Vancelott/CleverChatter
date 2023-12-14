import { defineConfig } from "cypress";
const { GithubSocialLogin } = require("cypress-social-logins").plugins;

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on("task", {
        GithubSocialLogin: GithubSocialLogin,
      });
    },
    baseUrl: "http://localhost:3000",
  },
});
