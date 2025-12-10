import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";
import user from "models/user.js";
import password from "models/password.js";
import webserver from "infra/webserver";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With nonexistent username", async () => {
      const response = await fetch(
        `${webserver.origin}/api/v1/users/UsuarioInexistente`,
        {
          method: "PATCH",
        },
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "User not found",
        action: "Check the username and try again",
        status_code: 404,
      });
    });

    test("With duplicated username", async () => {
      const duplicatedUser1 = await orchestrator.createUser({});

      const duplicatedUser2 = await orchestrator.createUser({});

      const response = await fetch(
        `${webserver.origin}/api/v1/users/${duplicatedUser2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: duplicatedUser1.username,
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "User already exists",
        action: "Use a different user",
        status_code: 400,
      });
    });

    test("With duplicated email", async () => {
      const duplicatedEmail1 = await orchestrator.createUser({});

      const duplicatedEmail2 = await orchestrator.createUser({});

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${duplicatedEmail2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: duplicatedEmail1.email,
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Email already exists",
        action: "Use a different email",
        status_code: 400,
      });
    });

    test("With unique username", async () => {
      const uniqueUser = await orchestrator.createUser({});

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${uniqueUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: uniqueUser.username,
        email: responseBody.email,
        password: responseBody.password, // Password should be hashed
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
        features: ["read:activation_token"],
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With unique email", async () => {
      const uniqueEmail = await orchestrator.createUser({});

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${uniqueEmail.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "uniqueEmail2@gmail.com",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: uniqueEmail.username,
        email: "uniqueEmail2@gmail.com",
        password: responseBody.password, // Password should be hashed
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
        features: ["read:activation_token"],
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With new password", async () => {
      const user1Response = await orchestrator.createUser({});

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${user1Response.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "novasenha",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: user1Response.username,
        email: user1Response.email,
        password: responseBody.password, // Password should be hashed
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
        features: ["read:activation_token"],
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername(
        user1Response.username,
      );
      const correctPasswordMatch = await password.compare(
        "novasenha",
        userInDatabase.password,
      );
      expect(correctPasswordMatch).toBe(true);

      const incorrectPasswordMatch = await password.compare(
        "123senha",
        userInDatabase.password,
      );
      expect(incorrectPasswordMatch).toBe(false);
    });
  });
});
