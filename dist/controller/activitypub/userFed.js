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
exports.userFedRouter = void 0;
const activitypub_core_types_1 = require("activitypub-core-types");
const express_1 = require("express");
const user_service_1 = require("../../service/user.service");
const utils_1 = require("../../utils");
exports.userFedRouter = (0, express_1.Router)();
const router = (0, express_1.Router)();
exports.userFedRouter.use("/u", router);
/**
 * Gets user's page or info as JSON
 * @param username
 */
router.get("/:username", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const isJson = ((_a = req.headers.accept) === null || _a === void 0 ? void 0 : _a.includes("application/activity+json")) ||
        ((_b = req.headers.accept) === null || _b === void 0 ? void 0 : _b.includes("application/ld+json")) ||
        ((_c = req.headers["content-type"]) === null || _c === void 0 ? void 0 : _c.includes("application/activity+json")) ||
        ((_d = req.headers["content-type"]) === null || _d === void 0 ? void 0 : _d.includes("application/ld+json"));
    const result = yield (0, utils_1.searchByField)(activitypub_core_types_1.AP.ActorTypes.PERSON, "account", `${req.params.username}@${req.app.get("localDomain")}`);
    if (!result.length)
        res.send({ error: "no account found" });
    else {
        if (isJson) {
            res.send(result[0]);
        }
        else {
            // TODO should be user's redirect uri
            // res.redirect(result[0].url);
            res.sendStatus(404);
        }
    }
}));
/**
 * Gets user's followers list
 * @param username
 */
router.get("/:username/followers", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const follows = yield (0, user_service_1.getFollowers)(req.params.username);
    const dat = {
        "@context": "https://www.w3.org/ns/activitystreams",
        id: `https://middle-fed.onrender.com/${req.params.username}/followers`,
        type: "OrderedCollection",
        totalItems: follows.length,
        items: follows,
    };
    res.send(dat);
}));
/**
 * Gets user's following list
 * @param username
 */
router.get("/:username/following", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const follows = yield (0, user_service_1.getFollowings)(req.params.username);
    const dat = {
        "@context": "https://www.w3.org/ns/activitystreams",
        id: `https://middle-fed.onrender.com/${req.params.username}/following`,
        type: "OrderedCollection",
        totalItems: follows.length,
        items: follows,
    };
    res.send(dat);
}));
/**
 * Posts on the user's inbox
 * @param username
 * @requires activity - body should have an activity to be posted
 */
router.post("/:username/inbox", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.params.username, "inbox");
    (0, user_service_1.inbox)(req, res);
}));
/**
 * Gets the user's outbox
 * @param username
 * @requires activity - body should have an activity to be posted
 */
router.post("/:username/outbox", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.params.username, "outbox");
    (0, user_service_1.outbox)(req, res);
}));
//# sourceMappingURL=userFed.js.map