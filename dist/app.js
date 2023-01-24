"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const admin = __importStar(require("firebase-admin"));
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
const firebaseApp = admin.initializeApp(Object.assign({ credential: admin.credential.cert(serviceAccount) }, firebaseConfig));
const auth = admin.auth(firebaseApp);
const express_1 = __importDefault(require("express"));
const routes_1 = require("./routes");
const body_parser_1 = __importDefault(require("body-parser"));
const webfinger_1 = require("./controller/well-known/webfinger");
const cors = require("cors");
exports.app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const db = admin.firestore();
const storage = admin.storage();
const config = require("../config.json");
const { USER, PASS, DOMAIN } = config;
exports.app.set("auth", auth);
exports.app.set("db", db);
exports.app.set("storage", storage);
exports.app.set("firebaseApp", firebaseApp);
exports.app.set("localDomain", DOMAIN);
exports.app.use(express_1.default.json({ limit: "50mb" }));
exports.app.use(body_parser_1.default.urlencoded({ extended: true }));
exports.app.use("/api", cors(), routes_1.apiRoutes);
exports.app.use("/", cors(), routes_1.fedRoutes);
exports.app.use("/.well-known", cors(), webfinger_1.wellKnownRouter);
exports.app.listen(PORT, () => {
    return console.log(`Express is listening at http://localhost:${PORT}`);
});
//# sourceMappingURL=app.js.map