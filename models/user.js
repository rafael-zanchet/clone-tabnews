import database from "infra/database.js";
import { ValidationError } from "infra/errors.js";

async function create(userInputValues) {
  await validateUniqueEmail(userInputValues.email);
  await validateuniqueUsername(userInputValues.username);
  const newUser = await runInsertValues(userInputValues);
  return newUser;

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
};

export default user;
