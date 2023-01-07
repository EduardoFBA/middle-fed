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
 * Undoes an activity
 * @param username - name of current user
 * @param activityId - id of the activity to undo
 * @param activityType - type of activity
 */
router.delete("/:username/undo/:activityId/:activityType", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const localDomain = req.app.get("localDomain");
    const result = (yield (0, utils_1.searchByField)(activitypub_core_types_1.AP.ActivityTypes.FOLLOW, "id", `https://${localDomain}/activity/Follow/${req.params.activityId}`));
    if (!result.length) {
        res.send("nothin");
        return;
    }
    switch (result[0].type) {
        case activitypub_core_types_1.AP.ActivityTypes.FOLLOW:
            const follow = result[0];
            const objectActor = follow.object;
            const targetInfo = yield (0, utils_1.getActorInfo)(objectActor + ".json");
            const username = req.params.username;
            const actorInfo = yield (0, utils_1.getActorInfo)(`https://${localDomain}/u/${username}.json`);
            const undo = (0, utils_json_1.createUndoActivity)(username, localDomain, follow);
            const response = yield (0, utils_1.sendSignedRequest)(targetInfo.inbox, "POST", undo, actorInfo.publicKey.id, actorInfo.privateKey);
            if (response.ok) {
                const query = new utils_1.Query();
                query.value = follow.id;
                (0, utils_1.remove)(activitypub_core_types_1.AP.ActivityTypes.FOLLOW, [query]);
                res.send("finished");
            }
            break;
        default:
            res.send("default");
            break;
    }
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
            activity = (yield (0, utils_1.searchByField)(activitypub_core_types_1.AP.ActivityTypes.FOLLOW, "id", req.params.activityId));
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
    console.log(activitypub_core_types_1.AP.ActivityTypes.FOLLOW, follow);
    const response = yield (0, utils_1.sendSignedRequest)(targetInfo.inbox, "POST", follow, actorInfo.publicKey.id, actorInfo.privateKey);
    if (response.ok) {
        (0, utils_1.save)(activitypub_core_types_1.AP.ActivityTypes.FOLLOW, JSON.parse(JSON.stringify(follow)));
        res.sendStatus(200);
    }
    else
        res.send({ error: "error" });
}));
//# sourceMappingURL=activityFed.js.map