import { conf } from "../config/config.js";
import { Pool } from "../deps.js";


/*const DATABASE_URL = Deno.env.toObject().DATABASE_URL;
const connectionPool = new Pool(DATABASE_URL, 5);
console.log(DATABASE_URL);*/
const CONCURRENT_CONNECTIONS = 1;
const connectionPool = () => new Pool(
  conf.database
, CONCURRENT_CONNECTIONS);
const pool = connectionPool()
const executeQuery = async(query, ...params) => {
  const client = await pool.connect();
  try {
      return await client.query(query, ...params);
  } catch (e) {
      console.log(e);  
  } finally {
      client.release();
  }
}
export { executeQuery };