import email from "infra/email.js";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("Email Infra", () => {
  test("sendEmail()", async () => {
    await orchestrator.deleteAllEmails();
    await email.sendEmail({
      from: "Clone TabNews <rafael.zanchet@gmail.com",
      to: "rafael@zanchet.com.br",
      subject: "teste assunto",
      text: "Corpo do email em texto puro",
    });
    await email.sendEmail({
      from: "Clone TabNews <rafael.zanchet@gmail.com",
      to: "rafael@zanchet.com.br",
      subject: "2 teste assunto",
      text: "2 Corpo do email em texto puro",
    });
    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail).toBeDefined();
    expect(lastEmail.sender).toBe("<rafael.zanchet@gmail.com>");
    expect(lastEmail.recipients[0]).toBe("<rafael@zanchet.com.br>");
    expect(lastEmail.subject).toBe("2 teste assunto");
    expect(lastEmail.text).toBe("2 Corpo do email em texto puro\n");
  });
});
