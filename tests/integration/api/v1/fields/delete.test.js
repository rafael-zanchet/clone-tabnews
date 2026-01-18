import orchestrator from "tests/orchestrator";
import user from "models/user";
import field from "models/field";
import webserver from "infra/webserver";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/field", () => {
  describe("Default user", () => {
    test("With INVALID session and field data", async () => {
      let createdUser = await orchestrator.createUser({});
      await orchestrator.activateUser(createdUser);
      createdUser = await user.findOneById(createdUser.id);
      const newfield = await orchestrator.createfield({
        user_id: createdUser.id,
      });
      const foundfield = await field.findOneById(newfield.id);
      const response = await fetch(`${webserver.origin}/api/v1/field`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=213456789-invalid-session-id`,
        },
        body: JSON.stringify({
          id: foundfield.id,
        }),
      });
      expect(response.status).toBe(401);
    });

    test("With valid session and field data", async () => {
      let createdUser = await orchestrator.createUser({});
      await orchestrator.activateUser(createdUser);
      const userSessionObj = await orchestrator.createSession(createdUser.id);
      createdUser = await user.findOneById(createdUser.id);
      const newfield = await orchestrator.createfield({
        user_id: createdUser.id,
      });
      const foundfield = await field.findOneById(newfield.id);
      const response = await fetch(`${webserver.origin}/api/v1/field`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${userSessionObj.token}`,
        },
        body: JSON.stringify({
          id: foundfield.id,
        }),
      });

      expect(response.status).toBe(200);
    });
  });
});
