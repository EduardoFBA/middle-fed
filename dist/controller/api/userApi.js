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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userApiRouter = void 0;
const crypto = __importStar(require("crypto"));
const express_1 = require("express");
const user_service_1 = require("../../service/user.service");
const utils_1 = require("../../utils");
const utils_json_1 = require("../../utils-json");
exports.userApiRouter = (0, express_1.Router)();
const router = (0, express_1.Router)();
exports.userApiRouter.use("/u", router);
/**
 * Gets list of user's followers
 * @param account - account to filter (@username@domain)
 */
router.get("/followers/:account", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [username, _] = (0, utils_1.extractHandles)(req.params.account);
    res.send(yield (0, user_service_1.getFollowers)(username));
}));
/**
 * Creates a new actor for user
 */
router.post("/", (req, res) => {
    const account = req.body.account;
    if (account === undefined) {
        return res
            .status(400)
            .send('Bad request. Please make sure "account" is a property in the POST body.');
    }
    // create keypair
    crypto.generateKeyPair("rsa", {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: "spki",
            format: "pem",
        },
        privateKeyEncoding: {
            type: "pkcs8",
            format: "pem",
        },
    }, (err, publicKey, privateKey) => {
        const domain = req.app.get("localDomain");
        const userRecord = (0, utils_json_1.createUser)(account, domain, publicKey, privateKey);
        const webfingerRecord = (0, utils_json_1.createWebfinger)(account, domain);
        const apikey = crypto.randomBytes(16).toString("hex");
        (0, utils_1.save)("user", userRecord);
        (0, utils_1.save)("webfinger", webfingerRecord);
        res.status(200).json({ msg: "ok", apikey });
    });
});
//# sourceMappingURL=userApi.js.map