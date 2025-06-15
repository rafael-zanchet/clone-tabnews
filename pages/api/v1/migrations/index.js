import { createRouter } from "next-connect";
import migrationsRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database";
import controller from "infra/controller";

const router = createRouter();
router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

const defaultMigrationsOptions = {
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations",
};

async function getHandler(request, response) {
  const allowedMethods = ["GET", "POST"];

  if (!allowedMethods.includes(request.method)) {
    return response.status(405).json({
      Error: `Method ${request.method} not allowed`,
    });
  }

  let dbClient;
  try {
    dbClient = await database.getNewClient();

    const pendingMigrations = await migrationsRunner({
      ...defaultMigrationsOptions,
      dbClient,
    });
    return response.status(200).json(pendingMigrations);
  } finally {
    await dbClient.end();
  }
}

async function postHandler(request, response) {
  const allowedMethods = ["GET", "POST"];

  if (!allowedMethods.includes(request.method)) {
    return response.status(405).json({
      Error: `Method ${request.method} not allowed`,
    });
  }

  let dbClient;
  try {
    dbClient = await database.getNewClient();

    const migratedMigrations = await migrationsRunner({
      ...defaultMigrationsOptions,
      dbClient,
      dryRun: false, // Set dryRun to false to actually apply migrations
    });

    if (migratedMigrations.length > 0) {
      return response.status(201).json(migratedMigrations);
    }
    return response.status(200).json(migratedMigrations);
  } finally {
    await dbClient.end();
  }
}
