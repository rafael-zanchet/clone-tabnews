import orchestrator from "tests/orchestrator";
import user from "models/user";
import webserver from "infra/webserver";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/field", () => {
  describe.skip("Default user", () => {
    test("With INVALID session", async () => {
      let createdUser = await orchestrator.createUser({});
      await orchestrator.activateUser(createdUser);
      orchestrator.createSession(createdUser.id);
      createdUser = await user.findOneById(createdUser.id);
      await orchestrator.createfield({
        user_id: createdUser.id,
      });

      const response = await fetch(`${webserver.origin}/api/v1/field`, {
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

    test("With valid session but no field", async () => {
      let createdUser = await orchestrator.createUser({});
      await orchestrator.activateUser(createdUser);
      const userSessionObj = await orchestrator.createSession(createdUser.id);
      createdUser = await user.findOneById(createdUser.id);

      const response = await fetch(`${webserver.origin}/api/v1/field`, {
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
        message: "field not found",
        action: "Check the user_id and try again",
        status_code: 404,
      });
    });

    test("With valid session and 3 field", async () => {
      let createdUser = await orchestrator.createUser({});
      await orchestrator.activateUser(createdUser);
      const userSessionObj = await orchestrator.createSession(createdUser.id);
      createdUser = await user.findOneById(createdUser.id);
      const field1 = await orchestrator.createfield({
        user_id: createdUser.id,
      });
      const field2 = await orchestrator.createfield({
        user_id: createdUser.id,
      });
      const field3 = await orchestrator.createfield({
        user_id: createdUser.id,
      });

      const response = await fetch(`${webserver.origin}/api/v1/field`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${userSessionObj.token}`,
        },
      });

      expect(response.status).toBe(200);
      const fieldsResponse = await fetch(`${webserver.origin}/api/v1/field`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${userSessionObj.token}`,
        },
      });

      const fieldsResponseBody = await fieldsResponse.json();

      expect(fieldsResponseBody.length).toBe(3);
      expect(fieldsResponseBody).toEqual([
        {
          id: field1.id,
          field_name: field1.field_name,
          user_id: createdUser.id,
          created_at: field1.created_at.toISOString(),
          updated_at: field1.updated_at.toISOString(),
        },
        {
          id: field2.id,
          field_name: field2.field_name,
          user_id: createdUser.id,
          created_at: field2.created_at.toISOString(),
          updated_at: field2.updated_at.toISOString(),
        },
        {
          id: field3.id,
          field_name: field3.field_name,
          user_id: createdUser.id,
          created_at: field3.created_at.toISOString(),
          updated_at: field3.updated_at.toISOString(),
        },
      ]);
    });
  });
});
