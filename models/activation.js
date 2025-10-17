import email from "infra/email.js";
import database from "infra/database";
import webserver from "infra/webserver.js";

const EXPIRATION_IN_MILLISECONDS = 60 * 15 * 1000; // 15 MIN

async function findOneByUserId(userId) {
  const newToken = await runInsertQuery(userId);
  return newToken;

  async function runInsertQuery(userId, expiresAt) {
    const result = await database.query({
      text: `
        SELECT *
        FROM user_activation_tokens 
        WHERE user_id = $1
        LIMIT 1
      ;`,
      values: [userId],
    });
    return result.rows[0];
  }
}

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const newToken = await runInsertQuery(userId, expiresAt);
  return newToken;

  async function runInsertQuery(userId, expiresAt) {
    const result = await database.query({
      text: `
        INSERT INTO 
          user_activation_tokens (user_id, expires_at)
        VALUES 
          ($1, $2)
        RETURNING *
      ;`,
      values: [userId, expiresAt],
    });
    return result.rows[0];
  }
}

async function sendEmailToUser(user, activationToken) {
  await email.sendEmail({
    from: "FinTab <contato@clonetabnews.com>",
    to: user.email,
    subject: "Ative sua conta no Clone TabNews",
    text: `${user.username}, Ative sua conta clicando no link abaixo:

${webserver.origin}/cadastro/activate/${activationToken.id} 

Atenciosamente,
Equipe Clone TabNews
`,
  });
}

const activation = {
  findOneByUserId,
  create,
  sendEmailToUser,
};

export default activation;
