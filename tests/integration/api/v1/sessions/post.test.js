import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";
import setCookieParser from "set-cookie-parser";
import session from "models/session";
import webserver from "infra/webserver";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/sessions", () => {
  describe("Anonymous user", () => {
    test("With incorrect email but correct password", async () => {
      await orchestrator.createUser({
        password: "correct_password",
      });

      const response = await fetch(`${webserver.origin}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "incorrect.email@gmail.com",
          password: "correct_password",
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Athentication failed",
        action: "Check data and try again",
        status_code: 401,
      });
    });

    test("With correct email but incorrect password", async () => {
      await orchestrator.createUser({
        email: "email.correct@gmail.com",
      });

      const response = await fetch(`${webserver.origin}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email.correct@gmail.com",
          password: "incorrect_password",
        }),
      });

      expect(response.status).toBe(401);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Athentication failed",
        action: "Check data and try again",
        status_code: 401,
      });
    });

    test("With incorrect email but incorrect password", async () => {
      await orchestrator.createUser({});

      const response = await fetch(`${webserver.origin}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email.incorrect@gmail.com",
          password: "incorrect_password",
        }),
      });

      expect(response.status).toBe(401);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Athentication failed",
        action: "Check data and try again",
        status_code: 401,
      });
    });

    test("With correct email and correct password", async () => {
      const createdUser = await orchestrator.createUser({
        email: "correct.email@gmail.com",
        password: "correct_password",
      });

      await orchestrator.activateUser(createdUser);

      const response = await fetch(`${webserver.origin}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "correct.email@gmail.com",
          password: "correct_password",
        }),
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        token: responseBody.token,
        user_id: createdUser.id,
        expires_at: responseBody.expires_at,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const expiresAt = new Date(responseBody.expires_at);
      const created_at = new Date(responseBody.created_at);

      expiresAt.setMilliseconds(0);
      created_at.setMilliseconds(0);

      expect(expiresAt - created_at).toBe(session.EXPIRATION_IN_MILLISECONDS);

      const parsedSetCookieHeader = setCookieParser(response, { map: true });

      expect(parsedSetCookieHeader.session_id).toEqual({
        name: "session_id",
        value: responseBody.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000, // Convert milliseconds to seconds
        path: "/",
        httpOnly: true,
      });
    });
  });
});
