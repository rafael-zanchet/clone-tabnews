import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";
import user from "models/user.js";
import activation from "models/activation";
import webserver from "infra/webserver";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/activations/[token_id]", () => {
  describe("Anonymous user", () => {
    test("With nonexistent token", async () => {
      const response = await fetch(
        `${webserver.origin}/api/v1/activations/7cac6189-51ec-4761-a4d0-701630d83967`,
        {
          method: "PATCH",
        },
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "Activation token not found or expired",
        action: "Request a new activation token",
        status_code: 404,
      });
    });

    test("With expired token", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - activation.EXPIRATION_IN_MILLISECONDS),
      });

      const createdUser = await orchestrator.createUser({});
      const createdActivationToken = await activation.create(createdUser.id);

      jest.useRealTimers();

      const response = await fetch(
        `${webserver.origin}/api/v1/activations/${createdActivationToken.id}`,
        {
          method: "PATCH",
        },
      );

      expect(response.status).toBe(404);
    });

    test("With already used token", async () => {
      const createdUser = await orchestrator.createUser({});
      const createdActivationToken = await activation.create(createdUser.id);

      const response1 = await fetch(
        `${webserver.origin}/api/v1/activations/${createdActivationToken.id}`,
        {
          method: "PATCH",
        },
      );
      expect(response1.status).toBe(200);

      const response2 = await fetch(
        `${webserver.origin}/api/v1/activations/${createdActivationToken.id}`,
        {
          method: "PATCH",
        },
      );
      expect(response2.status).toBe(404);
    });

    test("With valid token", async () => {
      const createdUser = await orchestrator.createUser({});
      const createdActivationToken = await activation.create(createdUser.id);

      const response = await fetch(
        `${webserver.origin}/api/v1/activations/${createdActivationToken.id}`,
        {
          method: "PATCH",
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: createdActivationToken.id,
        user_id: createdUser.id,
        expires_at: createdActivationToken.expires_at.toISOString(),
        used_at: responseBody.used_at,
        created_at: createdActivationToken.created_at.toISOString(),
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(uuidVersion(responseBody.user_id)).toBe(4);

      expect(Date.parse(responseBody.expires_at)).not.toBeNaN();

      const activatedUser = await user.findOneById(responseBody.user_id);
      expect(activatedUser.features).toEqual([
        "create:session",
        "read:session",
        "read:farm",
        "create:farm",
        "update:farm",
        "delete:farm",
      ]);
    });

    test("With valid token but alredy activated user", async () => {
      const createdUser = await orchestrator.createUser({});
      await orchestrator.activateUser(createdUser);
      const activationToken = await activation.create(createdUser.id);

      const response = await fetch(
        `${webserver.origin}/api/v1/activations/${activationToken.id}`,
        {
          method: "PATCH",
        },
      );

      expect(response.status).toBe(403);
    });
  });

  describe("Default user", () => {
    test("With valid token, but already logged in user", async () => {
      const createdUser1 = await orchestrator.createUser({});
      await orchestrator.activateUser(createdUser1);
      const user1SessionObj = await orchestrator.createSession(createdUser1.id);

      const createdUser2 = await orchestrator.createUser({});
      const user2ActivationToken = await activation.create(createdUser2.id);

      const response = await fetch(
        `${webserver.origin}/api/v1/activations/${user2ActivationToken.id}`,
        {
          method: "PATCH",
          headers: {
            Cookie: `session_id=${user1SessionObj.token}`,
          },
        },
      );
      expect(response.status).toBe(403);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "You do not have permission to perform this action",
        action: "Contact support if you believe this is an error",
        status_code: 403,
      });
    });
  });
});
