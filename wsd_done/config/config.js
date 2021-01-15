import { config } from "../deps.js";

let conf = {};
let env = config();

console.log(Deno.env.get('TEST_ENVIRONMENT'));
if (Deno.env.get('TEST_ENVIRONMENT')) {
  console.log("USING TEST DATABASE");
  conf.database = {
    

    //testi database (tyhjennetään joka testikerran lopuksi)
    hostname: "hattie.db.elephantsql.com",
    database: "ueqvpfgb",
    user: "ueqvpfgb",
    password: "z729hFcWTUY-gwWtNx6crkQsB3VkIdwT",
    port: 5432
  };
} else {

  console.log("NOT USING TEST DATABASE");
  conf.database = {
  
    hostname: env.HOST,
    database: env.USER,
    user: env.USER,
    password: env.PASSWORD,
    port: 5432
  };
}

export { conf }; 