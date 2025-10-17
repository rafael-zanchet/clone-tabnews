import email from "infra/email.js";
import password from "models/password";
import orchestrator from "tests/orchestrator";
import activation from "models/activation";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe("Use case: Registration Flow (all success)", () => {
  let createUserResponseBody;

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

    createUserResponseBody = await createUserResponse.json();

    expect(createUserResponseBody).toEqual({
      id: expect.any(String),
      username: "RegistrationFlow",
      email: "registration.flow@clonetabnews.com",
      password: createUserResponseBody.password,
      created_at: createUserResponseBody.created_at,
      updated_at: createUserResponseBody.updated_at,
      features: ["read:activation_token"],
    });
  });

  test("Check email sent", async () => {
    const lastEmail = await orchestrator.getLastEmail();

    const activationToken = await activation.findOneByUserId(
      createUserResponseBody.id,
    );

    expect(lastEmail.sender).toBe("<contato@clonetabnews.com>");
    expect(lastEmail.recipients[0]).toBe(
      "<registration.flow@clonetabnews.com>",
    );
    expect(lastEmail.subject).toBe("Ative sua conta no Clone TabNews");

    expect(lastEmail.text).toContain("RegistrationFlow");
    expect(lastEmail.text).toContain(activationToken.id);
  });

  test("Activate user account", async () => {});

  test("Login with activated account", async () => {});

  test("Fetch user profile", async () => {});
});
