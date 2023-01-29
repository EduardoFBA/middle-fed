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
    var _a, _b;
    const isJson = ((_a = req.headers.accept) === null || _a === void 0 ? void 0 : _a.includes("application/ld+json")) ||
        ((_b = req.headers["content-type"]) === null || _b === void 0 ? void 0 : _b.includes("application/ld+json"));
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
        }
    }
}));
/**
 * Gets user's followers list
 * @param username
 */
router.get("/:username/followers", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(yield (0, utils_1.searchByField)(activitypub_core_types_1.AP.ActivityTypes.FOLLOW, "object", `https://middle-fed.onrender.com/u/${req.params.username}`));
}));
/**
 * Gets user's following list
 * @param username
 */
router.get("/:username/following", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(yield (0, user_service_1.getFollowersActivity)(req.params.username));
}));
/**
 * Posts on the user's inbox
 * @param username
 * @requires activity - body should have an activity to be posted
 */
router.post("/:username/inbox", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("inbox");
    (0, user_service_1.inbox)(req, res);
}));
//# sourceMappingURL=userFed.js.map