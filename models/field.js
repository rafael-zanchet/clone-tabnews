import database from "infra/database.js";
import { ValidationError, NotFoundError } from "infra/errors.js";

async function findAllByUserId(userId) {
  const fieldsFoud = await runSelectQuery(userId);

  return fieldsFoud;

  async function runSelectQuery(userId) {
    const results = await database.query({
      text: `
        SELECT 
          *
        FROM 
          fields 
        WHERE 
          user_id = $1
        ORDER BY created_at;`,
      values: [userId],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "field not found",
        action: "Check the user_id and try again",
        status_code: 404,
      });
    }
    return results.rows;
  }
}
async function create(userInputValues) {
  await validateEmptyfieldName(userInputValues.field_name);
  await validateEmptyUserId(userInputValues.user_id);

  const newfield = await runInsertValues(userInputValues);
  return newfield;

  async function validateEmptyfieldName(fieldName) {
    if (!fieldName) {
      throw new ValidationError({
        message: "field name cannot be empty",
        action: "Use a different field name",
      });
    }
  }

  async function validateEmptyUserId(userId) {
    if (!userId) {
      throw new ValidationError({
        message: "User ID cannot be empty",
        action: "Use a user ID",
      });
    }
  }

  async function runInsertValues(userInputValues) {
    const results = await database.query({
      text: `
      INSERT INTO fields 
        (field_name, user_id) 
      VALUES 
        ($1, $2) 
      RETURNING
        *;`,
      values: [userInputValues.field_name, userInputValues.user_id],
    });

    return results.rows[0];
  }
}

async function update(fieldId, userInputValues) {
  const currentfield = await findOneById(fieldId);

  const fieldWithNewValues = {
    ...currentfield,
    ...userInputValues,
  };

  const updatedfield = await runUpdateQuery(fieldWithNewValues);
  return updatedfield;

  async function runUpdateQuery(fieldWithNewValues) {
    const results = await database.query({
      text: `
      UPDATE 
        fields 
      SET 
        field_name = $1,
        updated_at = timezone('utc', now())
      WHERE 
        id = $2 
      RETURNING 
        *;`,
      values: [fieldWithNewValues.field_name, fieldWithNewValues.id],
    });

    return results.rows[0];
  }
}

async function findOneById(fieldId) {
  const fieldFound = await runSelectQuery(fieldId);

  return fieldFound;

  async function runSelectQuery(fieldId) {
    const results = await database.query({
      text: `
        SELECT 
          *
        FROM 
          fields
        WHERE 
          id = $1
        LIMIT 
          1;`,
      values: [fieldId],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "field Id not found",
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

async function deletefield(fieldId) {
  const deletedfield = await runDeleteQuery(fieldId);
  return deletedfield;

  async function runDeleteQuery(fieldId) {
    const results = await database.query({
      text: `
      DELETE FROM 
        fields 
      WHERE 
        id = $1 
      RETURNING 
        *;`,
      values: [fieldId],
    });

    return results.rows[0];
  }
}

const field = {
  findAllByUserId,
  create,
  findOneById,
  update,
  setFeatures,
  deletefield,
};

export default field;
