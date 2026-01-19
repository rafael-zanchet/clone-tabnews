import database from "infra/database.js";
import password from "models/password.js";
import { ValidationError, NotFoundError } from "infra/errors.js";

async function findOneByUsername(username) {
  const userFoud = await runSelectQuery(username);

  return userFoud;

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
}
async function create(userInputValues) {
  await validateEmptyUsername(userInputValues.username);
  await validateEmptyEmail(userInputValues.email);

  await validateuniqueUsername(userInputValues.username);
  await validateUniqueEmail(userInputValues.email);

  await hashPasswordInObject(userInputValues);
  injectDefaultFeaturesInObject(userInputValues);

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

  async function runInsertValues(userInputValues) {
    const results = await database.query({
      text: `
      INSERT INTO users 
        (username, email, password, features) 
      VALUES 
        ($1, $2, $3, $4) 
      RETURNING
        *;`,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
        userInputValues.features,
      ],
    });

    return results.rows[0];
  }
  function injectDefaultFeaturesInObject(userInputValues) {
    userInputValues.features = ["read:activation_token"];
  }
}

async function hashPasswordInObject(userInputValues) {
  const hashedPassword = await password.hash(userInputValues.password);
  userInputValues.password = hashedPassword;
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

async function update(username, userInputValues) {
  const currentUser = await findOneByUsername(username);

  if ("username" in userInputValues) {
    await validateuniqueUsername(userInputValues.username);
  }
  if ("email" in userInputValues) {
    await validateUniqueEmail(userInputValues.email);
  }

  if ("password" in userInputValues) {
    await hashPasswordInObject(userInputValues);
  }

  const userWithNewValues = {
    ...currentUser,
    ...userInputValues,
  };

  const updatedUser = await runUpdateQuery(userWithNewValues);
  return updatedUser;

  async function runUpdateQuery(userWithNewValues) {
    const results = await database.query({
      text: `
      UPDATE 
        users 
      SET 
        username = $1, 
        email = $2, 
        password = $3,
        updated_at = timezone('utc', now())
      WHERE 
        id = $4 
      RETURNING 
        *;`,
      values: [
        userWithNewValues.username,
        userWithNewValues.email,
        userWithNewValues.password,
        userWithNewValues.id,
      ],
    });

    return results.rows[0];
  }
}

async function findOneByEmail(email) {
  const userFound = await runSelectQuery(email);

  return userFound;

  async function runSelectQuery(email) {
    const results = await database.query({
      text: `
        SELECT 
          *
        FROM 
          users 
        WHERE 
          LOWER(email) = LOWER($1)
        LIMIT 
          1;`,
      values: [email],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "Email not found",
        action: "Check the email and try again",
      });
    }
    return results.rows[0];
  }
}

async function findOneById(userId) {
  const userFoud = await runSelectQuery(userId);

  return userFoud;

  async function runSelectQuery(userId) {
    const results = await database.query({
      text: `
        SELECT 
          *
        FROM 
          users 
        WHERE 
          id = $1
        LIMIT 
          1;`,
      values: [userId],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "Id not found",
        action: "Check the id and try again",
      });
    }
    return results.rows[0];
  }
}

async function setFeatures(userId, features) {
  const updatedUser = await runUpdateQuery(userId, features);
  return updatedUser;

  async function runUpdateQuery(userId, features) {
    const results = await database.query({
      text: `
      UPDATE 
        users 
      SET 
        features = $2,
        updated_at = timezone('utc', now())
      WHERE 
        id = $1 
      RETURNING 
        *;`,
      values: [userId, features],
    });

    return results.rows[0];
  }
}

async function addFeatures(userId, features) {
  const updatedUser = await runUpdateQuery(userId, features);
  return updatedUser;

  async function runUpdateQuery(userId, features) {
    const results = await database.query({
      text: `
      UPDATE 
        users 
      SET 
        features = array_cat(features, $2),
        updated_at = timezone('utc', now())
      WHERE 
        id = $1 
      RETURNING 
        *;`,
      values: [userId, features],
    });

    return results.rows[0];
  }
}

const user = {
  create,
  findOneByEmail,
  findOneById,
  findOneByUsername,
  update,
  setFeatures,
  addFeatures,
};

export default user;
