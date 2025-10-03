import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With exect case match", async () => {
      await orchestrator.createUser({
        username: "MesmoCase",
        email: "mesmo.case@gmail.com",
        password: "123senha",
      });

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/MesmoCase",
      );

      expect(response2.status).toBe(200);

      const responseBody2 = await response2.json();
      expect(responseBody2).toEqual({
        id: responseBody2.id,
        username: "MesmoCase",
        email: "mesmo.case@gmail.com",
        password: responseBody2.password,
        created_at: responseBody2.created_at,
        updated_at: responseBody2.updated_at,
        features: ["read:activation_token"],
      });
      expect(uuidVersion(responseBody2.id)).toBe(4);
      expect(Date.parse(responseBody2.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody2.updated_at)).not.toBeNaN();
    });

    test("With exect case mismatch", async () => {
      await orchestrator.createUser({
        username: "CaseDiferente",
        email: "case.diferente@gmail.com",
        password: "123senha",
      });

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/casediferente",
      );

      expect(response2.status).toBe(200);

      const responseBody2 = await response2.json();
      expect(responseBody2).toEqual({
        id: responseBody2.id,
        username: "CaseDiferente",
        email: "case.diferente@gmail.com",
        password: responseBody2.password,
        created_at: responseBody2.created_at,
        updated_at: responseBody2.updated_at,
        features: ["read:activation_token"],
      });
      expect(uuidVersion(responseBody2.id)).toBe(4);
      expect(Date.parse(responseBody2.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody2.updated_at)).not.toBeNaN();
    });

    test("With nonexistent user", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/UsuarioInexistente",
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
  });
});
