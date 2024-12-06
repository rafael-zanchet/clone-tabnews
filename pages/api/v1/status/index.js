import database from "/infra/database";

async function status(request, response) {
  const updatedAt = new Date().toISOString();

  const databaseVersionResult = await database.query("SHOW server_version;");
  const databaseVersionValue = databaseVersionResult.rows[0].server_version;

  const databaseMaxConnectionResult = await database.query(
    "SHOW max_connections;",
  );

  const databaseMaxConnectionValue = parseInt(
    databaseMaxConnectionResult.rows[0].max_connections,
  );

  const databaseActivityConnectionResult = await database.query(
    "SELECT * FROM pg_stat_activity WHERE datname = 'local_db';",
  );
  console.log(databaseActivityConnectionResult.rows);
  const databaseActivityConnectionCount =
    databaseActivityConnectionResult.rows.length;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: databaseVersionValue,
        max_connections: databaseMaxConnectionValue,
      },
    },
  });
}

export default status;
