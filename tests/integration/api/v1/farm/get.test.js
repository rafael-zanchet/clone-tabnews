import orchestrator from "tests/orchestrator";
import user from "models/user";
import webserver from "infra/webserver";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/farm", () => {
  describe("Default user", () => {
    test("With INVALID session", async () => {
      let createdUser = await orchestrator.createUser({});
      await orchestrator.activateUser(createdUser);
      await orchestrator.createSession(createdUser.id);
      createdUser = await user.findOneById(createdUser.id);
      await orchestrator.createFarm({ user_id: createdUser.id });

      const response = await fetch(`${webserver.origin}/api/v1/farm`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=c41ae5ec-738f-472e-ada8-ba677a0e5668`,
        },
      });

      expect(response.status).toBe(401);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Session not found",
        action: "Check the id and try again",
        status_code: 401,
      });

      //console.log("responseBody", responseBody);
    });

    test("With valid session but no farm", async () => {
      let createdUser = await orchestrator.createUser({});
      await orchestrator.activateUser(createdUser);
      const userSessionObj = await orchestrator.createSession(createdUser.id);
      createdUser = await user.findOneById(createdUser.id);

      const response = await fetch(`${webserver.origin}/api/v1/farm`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${userSessionObj.token}`,
        },
      });
      expect(response.status).toBe(404);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "Farm not found",
        action: "Check the user_id and try again",
        status_code: 404,
      });
    });

    test("With valid session and 3 farm", async () => {
      let createdUser = await orchestrator.createUser({});
      await orchestrator.activateUser(createdUser);
      const userSessionObj = await orchestrator.createSession(createdUser.id);
      createdUser = await user.findOneById(createdUser.id);
      const farm1 = await orchestrator.createFarm({ user_id: createdUser.id });
      const farm2 = await orchestrator.createFarm({ user_id: createdUser.id });
      const farm3 = await orchestrator.createFarm({ user_id: createdUser.id });

      const response = await fetch(`${webserver.origin}/api/v1/farm`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${userSessionObj.token}`,
        },
      });

      expect(response.status).toBe(200);
      const farmsResponse = await fetch(`${webserver.origin}/api/v1/farm`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${userSessionObj.token}`,
        },
      });

      const farmsResponseBody = await farmsResponse.json();

      expect(farmsResponseBody.length).toBe(3);
      expect(farmsResponseBody).toEqual([
        {
          id: farm1.id,
          farm_name: farm1.farm_name,
          user_id: createdUser.id,
          created_at: farm1.created_at.toISOString(),
          updated_at: farm1.updated_at.toISOString(),
        },
        {
          id: farm2.id,
          farm_name: farm2.farm_name,
          user_id: createdUser.id,
          created_at: farm2.created_at.toISOString(),
          updated_at: farm2.updated_at.toISOString(),
        },
        {
          id: farm3.id,
          farm_name: farm3.farm_name,
          user_id: createdUser.id,
          created_at: farm3.created_at.toISOString(),
          updated_at: farm3.updated_at.toISOString(),
        },
      ]);
    });
  });
});
