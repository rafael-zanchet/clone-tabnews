import database from "infra/database.js";
import { ValidationError, NotFoundError } from "infra/errors.js";

async function findAllByUserId(userId) {
  const farmsFoud = await runSelectQuery(userId);

  return farmsFoud;

  async function runSelectQuery(userId) {
    const results = await database.query({
      text: `
        SELECT 
          *
        FROM 
          farms 
        WHERE 
          user_id = $1
        ORDER BY created_at;`,
      values: [userId],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "Farm not found",
        action: "Check the user_id and try again",
        status_code: 404,
      });
    }
    return results.rows;
  }
}
async function create(userInputValues) {
  await validateEmptyFarmName(userInputValues.farm_name);
  await validateEmptyUserId(userInputValues.user_id);

  const newFarm = await runInsertValues(userInputValues);
  return newFarm;

  async function validateEmptyFarmName(farmName) {
    if (!farmName) {
      throw new ValidationError({
        message: "Farm name cannot be empty",
        action: "Use a different farm name",
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
      INSERT INTO farms 
        (farm_name, user_id) 
      VALUES 
        ($1, $2) 
      RETURNING
        *;`,
      values: [userInputValues.farm_name, userInputValues.user_id],
    });

    return results.rows[0];
  }
}

async function update(farmId, userInputValues) {
  const currentFarm = await findOneById(farmId);

  const farmWithNewValues = {
    ...currentFarm,
    ...userInputValues,
  };

  const updatedFarm = await runUpdateQuery(farmWithNewValues);
  return updatedFarm;

  async function runUpdateQuery(farmWithNewValues) {
    const results = await database.query({
      text: `
      UPDATE 
        farms 
      SET 
        farm_name = $1,
        updated_at = timezone('utc', now())
      WHERE 
        id = $2 
      RETURNING 
        *;`,
      values: [farmWithNewValues.farm_name, farmWithNewValues.id],
    });

    return results.rows[0];
  }
}

async function findOneById(farmId) {
  const farmFound = await runSelectQuery(farmId);

  return farmFound;

  async function runSelectQuery(farmId) {
    const results = await database.query({
      text: `
        SELECT 
          *
        FROM 
          farms
        WHERE 
          id = $1
        LIMIT 
          1;`,
      values: [farmId],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "Farm Id not found",
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

async function deleteFarm(farmId) {
  const deletedFarm = await runDeleteQuery(farmId);
  return deletedFarm;

  async function runDeleteQuery(farmId) {
    const results = await database.query({
      text: `
      DELETE FROM 
        farms 
      WHERE 
        id = $1 
      RETURNING 
        *;`,
      values: [farmId],
    });

    return results.rows[0];
  }
}

const farm = {
  findAllByUserId,
  create,
  findOneById,
  update,
  setFeatures,
  deleteFarm,
};

export default farm;
