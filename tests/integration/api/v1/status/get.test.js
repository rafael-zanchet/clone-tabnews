import orchestrator from "tests/orchestrator";
import webserver from "infra/webserver";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("GET /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Retrieving current system status", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/status`);
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toEqual(parsedUpdatedAt);

      expect(responseBody.dependencies.database).not.toHaveProperty("version");

      expect(responseBody.dependencies.database.max_connections).toEqual(100);

      expect(
        responseBody.dependencies.database.opened_connections,
      ).toBeGreaterThan(0);
    });
  });


  describe("Privileged user", () => {
    test("With read:status:all", async () => {
      const createdUser = await orchestrator.createUser({});
      const activatedUser = await orchestrator.activateUser(createdUser);
      await orchestrator.addFeaturesToUser(createdUser, ["read:status:all"])
      const sessionObj = await orchestrator.createSession(activatedUser.id);


      const response = await fetch(`${webserver.origin}/api/v1/status`,
        {
          headers: {
            Cookie: `session_id=${sessionObj.token}`,
          },
        },
      );
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toEqual(parsedUpdatedAt);

      expect(responseBody.dependencies.database.version).toEqual("16.0");

      expect(responseBody.dependencies.database.max_connections).toEqual(100);

      expect(
        responseBody.dependencies.database.opened_connections,
      ).toBeGreaterThan(0);
    });
  });
});
