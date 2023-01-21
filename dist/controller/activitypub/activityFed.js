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
            const undo = (0, utils_json_1.createUndoActivity)(username, localDomain, follow);
            const response = yield (0, utils_1.sendSignedRequest)(targetInfo.inbox, "POST", undo, localDomain, username);
            if (response.ok) {
                (0, utils_1.remove)(activitypub_core_types_1.AP.ActivityTypes.FOLLOW, [new utils_1.Query(follow.id)]);
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
    let activity = (yield (0, utils_1.searchByField)(req.params.activityType, "id", req.params.activityId));
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
    const follow = (0, utils_json_1.createFollowActivity)(username, localDomain, new URL(targetId));
    console.log(activitypub_core_types_1.AP.ActivityTypes.FOLLOW, follow);
    const response = yield (0, utils_1.sendSignedRequest)(targetInfo.inbox, "POST", follow, localDomain, username);
    if (response.ok) {
        (0, utils_1.save)(activitypub_core_types_1.AP.ActivityTypes.FOLLOW, JSON.parse(JSON.stringify(follow)));
        res.sendStatus(200);
    }
    else
        res.send({ error: "error" });
}));
/**
 * Creates, saves and sends a note activity
 * @param username - name of current user
 * @param target - username and domain of the target user to follow (@username@domain)
 */
router.post("/create/note/:username/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const localDomain = req.app.get("localDomain");
    const content = req.body.content;
    const name = req.body.name;
    const addressedTo = req.body.addressedTo;
    const username = req.params.username;
    const note = (0, utils_json_1.createNoteObject)(name, content, username, localDomain);
    const create = (0, utils_json_1.wrapObjectInActivity)(activitypub_core_types_1.AP.ActivityTypes.CREATE, note, username, localDomain);
    for (let inbox of addressedTo) {
        console.log("inbox", inbox);
        const response = yield (0, utils_1.sendSignedRequest)(new URL(inbox), "POST", create, localDomain, req.params.username);
        if (response.ok) {
            console.log("saving create note", create);
            yield (0, utils_1.save)(activitypub_core_types_1.AP.ActivityTypes.CREATE, JSON.parse(JSON.stringify(create)));
        }
        else {
            console.log("error", yield response.text());
        }
    }
    res.sendStatus(200);
}));
/**
 * Likes an activity
 * @param username - name of current user
 * @param target - username and domain of the target user to follow (@username@domain)
 */
router.post("/like/:username/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const localDomain = req.app.get("localDomain");
    const username = req.params.username;
    const activity = req.body.activity;
    const like = (0, utils_json_1.createLikeActivity)(username, localDomain, activity);
    const inbox = activity.actor.inbox.toString();
    const response = yield likeOrDislike(like, localDomain, username, new URL(inbox));
    res.sendStatus(response.status);
}));
/**
 * Dislikes an activity
 * @param username - name of current user
 * @param target - username and domain of the target user to follow (@username@domain)
 */
router.post("/dislike/:username/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const localDomain = req.app.get("localDomain");
    const username = req.params.username;
    const activity = req.body.activity;
    const dislike = (0, utils_json_1.createDislikeActivity)(username, localDomain, activity);
    const inbox = activity.actor.inbox.toString();
    const response = yield likeOrDislike(dislike, localDomain, username, new URL(inbox));
    res.sendStatus(response.status);
}));
function likeOrDislike(likeOrDislike, domain, username, inbox) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield (0, utils_1.sendSignedRequest)(inbox, "POST", likeOrDislike, domain, username);
        if (response.ok) {
            yield (0, utils_1.save)(likeOrDislike.type.toString(), JSON.parse(JSON.stringify(likeOrDislike)));
        }
        else {
            console.log("error", yield response.text());
        }
        return response;
    });
}
//# sourceMappingURL=activityFed.js.map