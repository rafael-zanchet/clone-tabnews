import retry from "async-retry";
import { faker } from "@faker-js/faker";

import database from "infra/database";
import migrator from "models/migrator";
import user from "models/user.js";
import session from "models/session";

const emailHttpUrl = `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

async function waitForAllServices() {
  await waitForWebServer();
  await waitForEmailServer();

  function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");
      //const responseBody = await response.json();
      if (response.status !== 200) {
        console.log(response.status);
        throw Error();
      }
    }
  }

  function waitForEmailServer() {
    return retry(fetchStatusEmail, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusEmail() {
      const response = await fetch(`${emailHttpUrl}`);
      //const responseBody = await response.json();
      if (response.status !== 200) {
        console.log(response.status);
        throw Error();
      }
    }
  }
}

async function clearDatabase() {
  await database.query("drop schema public cascade; create schema public");
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function createUser(userObject) {
  return await user.create({
    username:
      userObject.username || faker.internet.username().replace(/[_.-]/g, ""),
    email: userObject.email || faker.internet.email(),
    password: userObject.password || "123senha",
  });
}

async function createSession(userId) {
  return session.create(userId);
}

async function deleteAllEmails() {
  await fetch(`${emailHttpUrl}/messages`, { method: "DELETE" });
}

async function getLastEmail() {
  const responseEmail = await fetch(`${emailHttpUrl}/messages`);
  const emails = await responseEmail.json();
  const lastEmail = emails.pop();
  const responseLastEmailText = await fetch(
    `${emailHttpUrl}/messages/${lastEmail.id}.plain`,
  );
  const lastEmailText = await responseLastEmailText.text();
  lastEmail.text = lastEmailText;

  return lastEmail;
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
  createSession,
  deleteAllEmails,
  getLastEmail,
};

export default orchestrator;
