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
exports.activityFedRouter = void 0;
const activitypub_core_types_1 = require("activitypub-core-types");
const express_1 = require("express");
const utils_1 = require("../../utils");
const utils_json_1 = require("../../utils-json");
exports.activityFedRouter = (0, express_1.Router)();
const router = (0, express_1.Router)();
exports.activityFedRouter.use("/activity", router);
/**
 * Deletes an activity
 * @param activityId - id of the activity to delete
 */
router.delete("/delete/:activityId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, utils_1.search)("", "id", req.params.activityId);
    const localDomain = req.app.get("localDomain");
    const webfingerTarget = yield (0, utils_1.getWebfinger)(req.params.target);
    const selfTarget = webfingerTarget.links.filter((link) => {
        return link.rel == "self";
    });
    const targetId = selfTarget[0].href;
    const targetInfo = yield (0, utils_1.getActorInfo)(targetId + ".json");
    const username = req.params.username;
    const actorInfo = yield (0, utils_1.getActorInfo)(`https://${localDomain}/u/${username}.json`);
    const follow = (0, utils_json_1.createFollowActivity)(username, localDomain, new URL(targetId));
    const response = yield (0, utils_1.sendSignedRequest)(targetInfo.inbox, "POST", follow, actorInfo.publicKey.id, actorInfo.privateKey);
    if (response.ok) {
        (0, utils_1.save)("following", JSON.parse(JSON.stringify(follow)));
        res.sendStatus(200);
    }
    else
        res.send({ error: "error" });
}));
/**
 * Gets an activity
 * @param {AP.ActivityType} activityType - type of activity
 * @param activityId - id of the activity to get
 */
router.get("/:activityType/:activityId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let activity;
    switch (req.params.activityType) {
        case activitypub_core_types_1.AP.ActivityTypes.FOLLOW:
            activity = (yield (0, utils_1.search)("following", "id", req.params.activityId));
    }
    if (activity.length)
        res.send(activity[0]);
    else
        res.send("activity not found");
}));
/**
 * Creates, saves and sends a follow activity
 * @param username - name of current user
 * @param target - username and domain of the target user to follow (@username@domain)
 */
router.post("/:username/follow/:target", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const localDomain = req.app.get("localDomain");
    const webfingerTarget = yield (0, utils_1.getWebfinger)(req.params.target);
    const selfTarget = webfingerTarget.links.filter((link) => {
        return link.rel == "self";
    });
    const targetId = selfTarget[0].href;
    const targetInfo = yield (0, utils_1.getActorInfo)(targetId + ".json");
    const username = req.params.username;
    const actorInfo = yield (0, utils_1.getActorInfo)(`https://${localDomain}/u/${username}.json`);
    const follow = (0, utils_json_1.createFollowActivity)(username, localDomain, new URL(targetId));
    console.log("follow", follow);
    const response = yield (0, utils_1.sendSignedRequest)(targetInfo.inbox, "POST", follow, actorInfo.publicKey.id, actorInfo.privateKey);
    if (response.ok) {
        (0, utils_1.save)("following", JSON.parse(JSON.stringify(follow)));
        res.sendStatus(200);
    }
    else
        res.send({ error: "error" });
}));
//# sourceMappingURL=activityFed.js.map