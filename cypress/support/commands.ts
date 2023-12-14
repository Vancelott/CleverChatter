// // @ts-ignore
// Cypress.Commands.add("cookieLogin", (): void => {
//   cy.intercept("/api/auth/session", { fixture: "auth-session.json" }).as(
//     "session"
//   );

//   cy.setCookie(
//     "next-auth.session-token",
//     "a valid cookie from your browser session"
//   );
//   cy.visit("/");
//   cy.wait("@session");
// });

// Cypress.Commands.add("githubLogin", () => {
//   cy.log("Logging in to Github");
//   return (
//     cy
//       .request({
//         method: "POST",
//         url: "http://localhost:3000/api/auth/signin/github",
//         body: {
//           grant_type: "refresh_token",
//           username: Cypress.env("GITHUB_USER"),
//           password: Cypress.env("GOOGLE_PW"),
//           cookie_name: Cypress.env("COOKIE_NAME"),
//         },
//       })
//       // .its("body.id_token")
//       .then((id_token) => {
//         cy.setCookie("next-auth.session-token", "2131231");
//         cy.preserveCookieOnce("next-auth.session-token");

//         // on visit, the cookie is cleared after the next-auth call
//         // since we already have the cookie set, we can stub out the next-auth call
//         cy.intercept("/api/auth/session", { status: 200 }).as("next-auth-stub");
//         return cy.visit("/");
//       })
//   );
// });
