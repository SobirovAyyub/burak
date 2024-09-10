import express from "express";
 import path from "path";
 import router from "./router";
 import routerAdmin from "./routerAdmin"
 import morgan from "morgan";
 import { MORGAN_FORMAT } from "./libs/config";


 /** 1 - ENTRENCE **/
 const app = express();
 console.log("__dirname:", __dirname);
 app.use(express.static(path.join(__dirname, "public")));
 app.use(express.urlencoded({ extended: true }));
 app.use(express.json());
 app.use(morgan(MORGAN_FORMAT));

 /** 2 - SESSIONS **/

 /** 3 - VIEWS **/
 app.set("view", path.join(__dirname, "views"));
 app.set("view engine", "ejs");


 /** 4 - ROUTERS **/
 //
 app.use("/admin", routerAdmin); // BSSR: EJS (front end ni backend da qurish uchun)
 app.use("/", router); // SPA: REACT

 export default app; // module.exports