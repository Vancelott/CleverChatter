import { ChatData } from "../../src/app/types";
import { useSession } from "next-auth/react";

const mockRepoList: ChatData[] = [
  {
    id: "test-id1",
    slug: "test-slug1",
    createdAt: new Date("2023-11-17T03:24:00"),
    updatedAt: new Date("2023-12-16T17:24:00"),
    published: false,
    title: "testTitle1",
    repository: "test-repo1",
    userId: "1234",
  },
  {
    id: "test-id2",
    slug: "test-slug2",
    createdAt: new Date("2023-10-15T03:24:00"),
    updatedAt: new Date("2023-11-14T13:24:00"),
    published: false,
    title: "testTitle2",
    repository: "test-repo2",
    userId: "12345",
  },
];

// describe("Login", (): void => {
//   it("Login with Github", () => {
//     cy.githubLogin();

//     // const sessionObj = {
//     //   update: "Session",
//     //   data: "Session",
//     //   status: "authenticated",
//     // };

//     // cy.setCookie("session", `${sessionObj}`);

//     // cy.stub();

//     // cy.visit("http://localhost:3000/chat");

//     // cy.get("[data-testid=start-button]").click();
//   });
// });

// describe("Get AI Message", () => {
//   it("typing a message and clicking submit fetches the Ai response", () => {
//     cy.visit("http://localhost:3000");

//     cy.cookieLogin();

//     // cy.get("[data-testid=navBar]")
//     //   .get("[data-testid=profile-menu-button]")
//     //   .click();

//     // cy.get("[data-testid=test-login-button]").click();

//     // cy.getCookie("session").should("exist");

//     cy.get("[data-testid=start-button]").click();

//     cy.url().should("include", "/chat");

//     cy.get("[data-testid=chatnav]")
//       .should("include", "[data-testid=chats-7days]")
//       .click();

//     cy.url().should("include", `/${mockRepoList[0].slug}`);

//     cy.get("input-slug")
//       .should("be.empty")
//       .type("Please write 3 random words.");
//   });
// });

// describe("Login sequence", () => {
//   before(() => {
//     cy.visit("http://localhost:3000");
//   });
//   it("Login with Github", () => {
//     const username = Cypress.env("GOOGLE_USER");
//     const password = Cypress.env("GOOGLE_PW");
//     const loginUrl = Cypress.env("SITE_NAME");
//     const cookieName = Cypress.env("COOKIE_NAME");
//     // const socialLoginOptions = {
//     //   username,
//     //   password,
//     //   loginUrl,
//     //   headless: true,
//     //   logs: false,
//     //   isPopup: true,
//     //   loginSelector: `a[href="${Cypress.env(
//     //     "SITE_NAME"
//     //   )}/api/auth/signin/github"]`,
//     //   postLoginSelector: ".unread-count",
//     // }
//     const sentArgs = { username, password };
//     cy.origin(
//       `http://localhost:3000/api/auth/signin/github`,
//       // Send the args here...
//       { args: sentArgs },
//       // ...and receive them at the other end here!
//       ({ username, password }) => {
//         cy.visit("/login");
//         cy.get("input#username").type(username);
//         cy.get("input#password").type(password);
//         cy.contains("button", "Login").click();
//       }
//     );
//   });
// });

describe("Login page", () => {
  before(() => {
    cy.visit("http://localhost:3000");
  });
  it("Login with GITHUB", () => {
    const username = Cypress.env("GITHUB_USER");
    const password = Cypress.env("GITHUB_PW");
    const loginUrl = Cypress.env("SITE_NAME");
    const cookieName = Cypress.env("COOKIE_NAME");
    const socialLoginOptions = {
      username,
      password,
      loginUrl,
      headless: true,
      logs: false,
      isPopup: true,
      loginSelector: `a[href="${Cypress.env(
        "SITE_NAME"
      )}/api/auth/signin/github"]`,
      postLoginSelector: ".unread-count",
    };

    cy.task("GithubSocialLogin", socialLoginOptions).then(() => {
      cy.clearCookies();

      const cookie: any = cy
        .getAllCookies()
        .filter((cookie: any) => cookie.name === cookieName)
        .clearCookie(cookieName);

      if (cookie) {
        cy.setCookie(cookie.name, cookie.value, {
          domain: cookie.domain,
          expiry: cookie.expires,
          httpOnly: cookie.httpOnly,
          path: cookie.path,
          secure: cookie.secure,
        });

        // Cypress.Cookies.defaults({
        //   preserve: cookieName,
        // });

        //  cy.session('unique_identifier', cy.githubLogin, {
        //       validate () {
        //         cy.getCookies().should('have.length', 2)
        //        },
        //        cacheAcrossSpecs: true
        //     })
      }
    });
  });
});
