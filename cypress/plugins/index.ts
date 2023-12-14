const { GithubSocialLogin } = require("cypress-social-logins").plugins;

module.exports = (
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions
) => {
  on("task", {
    GithubSocialLogin: GithubSocialLogin,
  });
};
