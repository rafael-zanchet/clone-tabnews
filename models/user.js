import database from "infra/database.js";
import { ValidationError, NotFoundError } from "infra/errors.js";

async function findOneByUsername(username) {
  const userFoud = await runSelectQuery(username);

  async function runSelectQuery(username) {
    const results = await database.query({
      text: `
        SELECT 
          *
        FROM 
          users 
        WHERE 
          LOWER(username) = LOWER($1)
        LIMIT 
          1;`,
      values: [username],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "User not found",
        action: "Check the username and try again",
      });
    }

    return results.rows[0];
  }
  return userFoud;
}
async function create(userInputValues) {
  await validateEmptyUsername(userInputValues.username);
  await validateEmptyEmail(userInputValues.email);
  await validateUniqueEmail(userInputValues.email);
  await validateuniqueUsername(userInputValues.username);
  const newUser = await runInsertValues(userInputValues);
  return newUser;

  async function validateEmptyUsername(username) {
    if (!username) {
      throw new ValidationError({
        message: "Username cannot be empty",
        action: "Use a different username",
      });
    }
  }

  async function validateEmptyEmail(email) {
    if (!email) {
      throw new ValidationError({
        message: "Email cannot be empty",
        action: "Use a different email",
      });
    }
  }

  async function validateUniqueEmail(email) {
    const results = await database.query({
      text: `
        SELECT 
          email 
        FROM 
          users 
        WHERE 
          LOWER(email) = LOWER($1);`,
      values: [email],
    });

    if (results.rowCount > 0) {
      throw new ValidationError({
        message: "Email already exists",
        action: "Use a different email",
      });
    }
  }

  async function validateuniqueUsername(username) {
    const results = await database.query({
      text: `
        SELECT 
          username 
        FROM 
          users 
        WHERE 
          LOWER(username) = LOWER($1);`,
      values: [username],
    });

    if (results.rowCount > 0) {
      throw new ValidationError({
        message: "User already exists",
        action: "Use a different user",
      });
    }
  }

  async function runInsertValues(userInputValues) {
    const results = await database.query({
      text: `
      INSERT INTO users 
        (username, email, password) 
      VALUES 
        ($1, $2, $3) 
      RETURNING
        *;`,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });

    return results.rows[0];
  }
}

const user = {
  create,
  findOneByUsername,
};

export default user;
