import { Client } from "pg";

async function query(queryObject) {
  const client = new Client({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT,
    ssl: process.env.NODE_ENV === "development" ? false : true,
  });

  console.log("Credenciais do PostgreSQL", {
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT,
  });

  try {
    await client.connect();
    const result = await client.query(queryObject);
    return result;
  } catch (err) {
    console.error("Error connecting to the database:", err.stack);
    throw error;
  } finally {
    await client.end();
  }
}

export default {
  query: query,
};
