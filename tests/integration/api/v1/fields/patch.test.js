import orchestrator from "tests/orchestrator";
import user from "models/user";
import farm from "models/farm";
import webserver from "infra/webserver";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/farm", () => {
  describe("Default user", () => {
    test("With INVALID session and farm data", async () => {
      let createdUser = await orchestrator.createUser({});
      await orchestrator.activateUser(createdUser);
      createdUser = await user.findOneById(createdUser.id);
      const newFarm = await orchestrator.createFarm({
        user_id: createdUser.id,
      });
      const foundFarm = await farm.findOneById(newFarm.id);
      const response = await fetch(`${webserver.origin}/api/v1/farm`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=213456789-invalid-session-id`,
        },
        body: JSON.stringify({
          id: foundFarm.id,
          farm_name: "Updated Farm",
        }),
      });
      expect(response.status).toBe(401);
    });

    test("With valid session and farm data", async () => {
      let createdUser = await orchestrator.createUser({});
      await orchestrator.activateUser(createdUser);
      const userSessionObj = await orchestrator.createSession(createdUser.id);
      createdUser = await user.findOneById(createdUser.id);
      const newFarm = await orchestrator.createFarm({
        user_id: createdUser.id,
      });
      const foundFarm = await farm.findOneById(newFarm.id);

      const response = await fetch(`${webserver.origin}/api/v1/farm`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${userSessionObj.token}`,
        },
        body: JSON.stringify({
          id: foundFarm.id,
          farm_name: "Updated Farm Name",
        }),
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        farm_name: "Updated Farm Name",
        user_id: createdUser.id,
        created_at: foundFarm.created_at.toISOString(),
        updated_at: responseBody.updated_at,
      });
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });
  });
});
