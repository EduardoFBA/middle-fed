import * as admin from "firebase-admin";
const serviceAccount = require("../serviceAccountKey.json");
const firebaseConfig = {
  apiKey: "AIzaSyCPJaiqrF5XgbhJEUlvy6W5F5YhxkF0Ckc",
  authDomain: "middle-fed.firebaseapp.com",
  projectId: "middle-fed",
  storageBucket: "middle-fed.appspot.com",
  messagingSenderId: "350610937625",
  appId: "1:350610937625:web:cd6854d79401acf087d788",
  measurementId: "G-SZRCHBJC5J",
};

const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  ...firebaseConfig,
});

const auth = admin.auth(firebaseApp);

import express, { Express } from "express";
import { apiRoutes, fedRoutes } from "./routes";
import bodyParser from "body-parser";
import { wellKnownRouter } from "./controller/well-known/webfinger";

const cors = require("cors");

export const app: Express = express();
const PORT = process.env.PORT || 3000;

const db = admin.firestore();
const storage = admin.storage();

const config = require("../config.json");
const { USER, PASS, DOMAIN } = config;

app.set("auth", auth);
app.set("db", db);
app.set("storage", storage);
app.set("firebaseApp", firebaseApp);
app.set("localDomain", DOMAIN);
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api", cors(), apiRoutes);
app.use("/", cors(), fedRoutes);
app.use("/.well-known", cors(), wellKnownRouter);
app.listen(PORT, () => {
  return console.log(`Express is listening at http://localhost:${PORT}`);
});
