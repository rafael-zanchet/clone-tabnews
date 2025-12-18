import { NotFoundError, ForbiddenError } from "infra/errors.js";
import email from "infra/email.js";
import database from "infra/database";
import webserver from "infra/webserver.js";
import user from "models/user.js";
import authorization from "./authorization";

const EXPIRATION_IN_MILLISECONDS = 60 * 15 * 1000; // 15 MIN

async function findOneValidById(tokenId) {
  const activationTokenObject = await runSelectQuery(tokenId);
  return activationTokenObject;

  async function runSelectQuery(tokenId) {
    const result = await database.query({
      text: `
        SELECT *
        FROM user_activation_tokens
        WHERE id = $1
          AND used_at IS NULL
          AND expires_at > timezone('UTC', now())
        LIMIT 1
      ;`,
      values: [tokenId],
    });

    if (result.rowCount === 0) {
      throw new NotFoundError({
        name: "NotFoundError",
        message: "Activation token not found or expired",
        action: "Request a new activation token",
        status_code: 404,
      });
    }
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

async function markTokenAsUsed(activationTokenId) {
  const userdActivationToken = await runUpdateQuery(activationTokenId);
  return userdActivationToken;

  async function runUpdateQuery(activationTokenId) {
    const result = await database.query({
      text: `
        UPDATE 
          user_activation_tokens
        SET 
          used_at = timezone('UTC', now()),
            updated_at = timezone('UTC', now())
        WHERE 
          id = $1
        RETURNING *
      ;`,
      values: [activationTokenId],
    });
    return result.rows[0];
  }
}

async function activateUserByUserId(userId) {
  const userToActivate = await user.findOneById(userId);
  if (!authorization.can(userToActivate, "read:activation_token")) {
    throw new ForbiddenError({
      message: "You can not use this token.",
      action: "Contact support.",
      status_code: 403,
    });
  }
  const activatedUser = await user.setFeatures(userId, [
    "create:session",
    "read:session",
    "read:farm",
    "create:farm",
    "update:farm",
    "delete:farm",
  ]);
  return activatedUser;
}

const activation = {
  // findOneByUserId,
  create,
  sendEmailToUser,
  findOneValidById,
  markTokenAsUsed,
  activateUserByUserId,
  EXPIRATION_IN_MILLISECONDS,
};

export default activation;
