// import database from "pg"
// import * as dotenv from "dotenv"

// dotenv.config();

// export const db = new database.Client({
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   user: process.env.DB_USER,
//   password: String(process.env.DB_PASSWORD), // força para string
//   database: process.env.DATABASE,
//   ssl: { rejectUnauthorized: false }
// });
// db.connect(function (err) {
//     if (err) throw err;
//     console.log("Connected!");
// });

import database from "pg";
import * as dotenv from "dotenv";

dotenv.config();

// Usando DATABASE_URL diretamente
export const db = new database.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});
