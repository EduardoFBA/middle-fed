import * as admin from "firebase-admin";
const serviceAccount = require("../serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

import express, { Express } from "express";
import { apiRoutes, fedRoutes } from "./routes";
import bodyParser from "body-parser";
import { wellKnownRouter } from "./controller/well-known/webfinger";

const cors = require("cors");

export const app: Express = express();
const PORT = process.env.PORT || 3000;

const db = admin.firestore();

const config = require("../config.json");
const { USER, PASS, DOMAIN } = config;

app.set("db", db);
app.set("localDomain", DOMAIN);
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/", cors(), apiRoutes);
app.use("/", cors(), fedRoutes);
app.use("/.well-known", cors(), wellKnownRouter);
app.listen(PORT, () => {
  return console.log(`Express is listening at http://localhost:${PORT}`);
});
