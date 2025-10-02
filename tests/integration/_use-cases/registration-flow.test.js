import email from "infra/email.js";
import password from "models/password";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe("Use case: Registration Flow (all success)", () => {
  test("Create user account", async () => {
    const createUserResponse = await fetch(
      "http://localhost:3000/api/v1/users",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "RegistrationFlow",
          email: "registration.flow@clonetabnews.com",
          password: "senha123",
        }),
      },
    );
    expect(createUserResponse.status).toBe(201);

    const createUserResponseBody = await createUserResponse.json();

    expect(createUserResponseBody).toEqual({
      id: expect.any(String),
      username: "RegistrationFlow",
      email: "registration.flow@clonetabnews.com",
      password: createUserResponseBody.password,
      created_at: createUserResponseBody.created_at,
      updated_at: createUserResponseBody.updated_at,
      features: [],
    });
  });

  test("Check email sent", async () => {});

  test("Activate user account", async () => {});

  test("Login with activated account", async () => {});

  test("Fetch user profile", async () => {});
});
