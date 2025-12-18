import orchestrator from "tests/orchestrator";
import user from "models/user";
import webserver from "infra/webserver";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/farm", () => {
  describe("Default user", () => {
    test("With valid session and farm data", async () => {
      let createdUser = await orchestrator.createUser({});
      await orchestrator.activateUser(createdUser);
      const userSessionObj = await orchestrator.createSession(createdUser.id);
      createdUser = await user.findOneById(createdUser.id);

      const response = await fetch(`${webserver.origin}/api/v1/farm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${userSessionObj.token}`,
        },
        body: JSON.stringify({
          farm_name: "My Farm",
          user_id: createdUser.id,
        }),
      });

      expect(response.status).toBe(201);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        farm_name: "My Farm",
        user_id: createdUser.id,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });
  });
});
