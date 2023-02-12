"use strict";
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
const activitypub_core_types_1 = require("activitypub-core-types");
const crypto_1 = require("crypto");
const express_1 = require("express");
const user_service_1 = require("../../service/user.service");
const utils_1 = require("../../utils");
const utils_json_1 = require("../../utils-json");
exports.userApiRouter = (0, express_1.Router)();
const router = (0, express_1.Router)();
exports.userApiRouter.use("/u", router);
/**
 * Gets user's info
 * @param account - account to filter (@username@domain)
 */
router.get("/:account", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [username, domain] = (0, utils_1.extractHandles)(req.params.account);
    const u = yield (0, utils_1.searchByField)(activitypub_core_types_1.AP.ActorTypes.PERSON, "id", `https://${domain}/u/${username}`);
    res.send(u[0]);
}));
/**
 * Gets list of user's followings
 * @param account - account to filter (@username@domain)
 */
router.get("/followings/:account", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [username, _] = (0, utils_1.extractHandles)(req.params.account);
    res.send(yield (0, user_service_1.getFollowings)(username));
}));
/**
 * Gets list of user's followers
 * @param account - account to filter (@username@domain)
 */
router.get("/followers/:account", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [username, _] = (0, utils_1.extractHandles)(req.params.account);
    res.send(yield (0, user_service_1.getFollowers)(username));
}));
/**
 * Gets user's icon url
 * @param account - account to filter (@username@domain)
 */
router.get("/icon/:account", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filename = "icon/" + req.params.account;
    const readable = yield (0, utils_1.getFromStorage)(filename);
    //HACK:
    readable.on("data", (data) => __awaiter(void 0, void 0, void 0, function* () {
        res
            .status(200)
            .send(`https://firebasestorage.googleapis.com/v0/b/middle-fed.appspot.com/o/${encodeURIComponent(data.metadata.name)}?alt=media&token=${data.metadata.metadata.firebaseStorageDownloadTokens}`);
    }));
}));
/**
 * Sends user's icon
 * @param account - account to filter (@username@domain)
 */
router.post("/icon/:account", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filename = "icon/" + req.params.account;
    const base64 = req.body.file;
    const base64Str = base64.includes(",") ? base64.split(",")[1] : base64;
    const mime = (0, utils_1.getMimeByBase64)(base64Str);
    const url = yield (0, utils_1.uploadToStorage)(base64Str, filename, mime);
    const [username, domain] = (0, utils_1.extractHandles)(req.params.account);
    const user = ((yield (0, utils_1.searchByField)(activitypub_core_types_1.AP.ActorTypes.PERSON, "account", `${username}@${domain}`))[0]);
    const icon = user.icon;
    icon.mediaType = mime.fullType;
    icon.url = url;
    (0, user_service_1.updateActor)(user);
    res.sendStatus(200);
}));
/**
 * updates user
 */
router.post("/update", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, user_service_1.updateActor)(req.body.user)
        .then(() => res.sendStatus(200))
        .catch((e) => res.status(500).send(e));
}));
/**
 * Creates a new actor for user
 */
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //FIXME: this endpoint needs to be improved on. Needs to be a sign in instead of just creating a user actor
    const account = req.body.account;
    if (account === undefined) {
        return res
            .status(400)
            .send('Bad request. Please make sure "account" is a property in the POST body.');
    }
    // create keypair
    (0, crypto_1.generateKeyPair)("rsa", {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: "spki",
            format: "pem",
        },
        privateKeyEncoding: {
            type: "pkcs8",
            format: "pem",
        },
    }, (err, publicKey, privateKey) => __awaiter(void 0, void 0, void 0, function* () {
        const domain = req.app.get("localDomain");
        const userRecord = (0, utils_json_1.createUser)(account, domain, publicKey, privateKey);
        const webfingerRecord = (0, utils_json_1.createWebfinger)(account, domain);
        const apikey = (0, crypto_1.randomBytes)(16).toString("hex");
        yield (0, utils_1.save)(activitypub_core_types_1.AP.ActorTypes.PERSON, userRecord);
        (0, utils_1.save)("webfinger", webfingerRecord);
        res.status(200).json({ msg: "ok", apikey });
    }));
}));
//# sourceMappingURL=userApi.js.map