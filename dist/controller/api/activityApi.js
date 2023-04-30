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
exports.activityApiRouter = void 0;
const activitypub_core_types_1 = require("activitypub-core-types");
const activitypub_1 = require("activitypub-core-types/lib/activitypub");
const express_1 = require("express");
const activity_service_1 = require("../../service/activity.service");
const utils_1 = require("../../utils");
const utils_json_1 = require("../../utils-json");
exports.activityApiRouter = (0, express_1.Router)();
const router = (0, express_1.Router)();
exports.activityApiRouter.use("/activity", router);
/**
 * Creates, saves and sends a note activity
 *
 * @requestParam account - username and domain of the user (@username@domain)
 * @requestBody content - content of the note
 * @requestBody name - title/name of the note
 * @requestBody addressedTo - array of inboxes to send. If empty, address to public
 */
router.post("/:account/create/note", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [username, domain] = (0, utils_1.extractHandles)(req.params.account);
        const content = req.body.content;
        const name = req.body.name || activitypub_1.CoreObjectTypes.NOTE;
        const bto = req.body.bto ? req.body.bto : [];
        const publicPost = req.body.to == null || req.body.to.length === 0;
        const to = !publicPost
            ? req.body.to
            : ["https://www.w3.org/ns/activitystreams#Public"];
        const note = (0, utils_json_1.createNoteObject)(name, content, username, domain, bto, to);
        const create = yield (0, utils_json_1.wrapObjectInActivity)(activitypub_core_types_1.AP.ActivityTypes.CREATE, note, username, domain);
        if (publicPost) {
            (0, activity_service_1.sendToAll)(`https://${domain}/u/${username}`, create);
        }
        else {
            for (let inbox of to.concat(bto)) {
                (0, utils_1.sendSignedRequestByAccount)(new URL(inbox), "POST", create, domain, req.params.username);
            }
        }
        (0, utils_1.save)(activitypub_core_types_1.AP.ActivityTypes.CREATE, JSON.parse(JSON.stringify(create)))
            .then(() => res.status(200).send(create))
            .catch((e) => res.status(500).send(e));
    }
    catch (e) {
        res.status(500).send(e);
    }
}));
/**
 * Creates, saves and sends a follow activity
 *
 * @requestParam account - username and domain of the user
 * @requestBody targetId - id of the target user to follow
 */
router.post("/:account/follow", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [username, domain] = (0, utils_1.extractHandles)(req.params.account);
    const targetId = req.body.targetId;
    const follow = yield (0, utils_json_1.createFollowActivity)(username, domain, targetId);
    if (yield (0, utils_1.activityAlreadyExists)(follow)) {
        res.status(409).send("Activity already exists");
        return;
    }
    if (targetId.toString().includes("/u/") &&
        targetId.toString().split("/u/")[0].includes(domain)) {
        (0, utils_1.save)(activitypub_core_types_1.AP.ActivityTypes.FOLLOW, JSON.parse(JSON.stringify(follow)))
            .then(() => res.sendStatus(204))
            .catch((e) => {
            console.log(e);
            res.sendStatus(500);
        });
        return;
    }
    delete follow.published;
    const response = yield (0, utils_1.sendSignedRequestByAccount)(follow.object.inbox, "POST", follow, domain, username);
    if (response.ok) {
        follow.id = new URL(`https://${domain}/Follow/pending`);
        (0, utils_1.save)(activitypub_core_types_1.AP.ActivityTypes.FOLLOW, JSON.parse(JSON.stringify(follow)))
            .then(() => res.sendStatus(204))
            .catch((e) => {
            console.log(e);
            res.sendStatus(500);
        });
    }
    else
        res.status(500).send("Internal server error");
}));
/**
 * Likes an activity
 *
 * @requestParam account - username and domain of the user (@username@domain)
 */
router.post("/:account/like", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [username, domain] = (0, utils_1.extractHandles)(req.params.account);
    const activity = req.body.activity;
    const object = activity.object;
    const actor = activity.actor;
    const like = yield (0, utils_json_1.createLikeActivity)(username, domain, object);
    if (yield (0, utils_1.activityAlreadyExists)(like)) {
        res.status(409).send("Activity already exists");
        return;
    }
    const queryActor = new utils_1.Query(like.actor.id);
    queryActor.fieldPath = "actor.id";
    const queryObject = new utils_1.Query(like.object.id);
    queryObject.fieldPath = "object.id";
    const dis = yield (0, utils_1.search)(activitypub_core_types_1.AP.ActivityTypes.DISLIKE, queryActor, queryObject);
    if (dis.length)
        (0, utils_1.removeActivity)(dis[0]);
    if (actor.id.toString().includes("/u/") &&
        actor.id.toString().split("/u/")[0].includes(domain)) {
        (0, utils_1.save)(activitypub_core_types_1.AP.ActivityTypes.LIKE, JSON.parse(JSON.stringify(like)))
            .then(() => res.sendStatus(204))
            .catch((e) => {
            console.log(e);
            res.sendStatus(500);
        });
        return;
    }
    const inbox = activity.actor.inbox.toString();
    const response = yield (0, utils_1.sendSignedRequestByAccount)(new URL(inbox), "POST", like, domain, username);
    if (response.ok)
        (0, utils_1.save)(activitypub_core_types_1.AP.ActivityTypes.LIKE, JSON.parse(JSON.stringify(like)))
            .then(() => res.sendStatus(204))
            .catch((e) => {
            console.log(e);
            res.sendStatus(500);
        });
    else
        res.sendStatus(response.status);
}));
/**
 * Dislikes an activity
 *
 * @requestParam account - username and domain of the user (@username@domain)
 */
router.post("/:account/dislike", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [username, domain] = (0, utils_1.extractHandles)(req.params.account);
    const activity = req.body.activity;
    const object = activity.object;
    const actor = activity.actor;
    const dislike = yield (0, utils_json_1.createDislikeActivity)(username, domain, object);
    if (yield (0, utils_1.activityAlreadyExists)(dislike)) {
        res.status(409).send("Activity already exists");
        return;
    }
    const queryActor = new utils_1.Query(dislike.actor.id);
    queryActor.fieldPath = "actor.id";
    const queryObject = new utils_1.Query(dislike.object.id);
    queryObject.fieldPath = "object.id";
    const like = yield (0, utils_1.search)(activitypub_core_types_1.AP.ActivityTypes.LIKE, queryActor, queryObject);
    if (like.length)
        (0, utils_1.removeActivity)(like[0]);
    if (actor.id.toString().includes("/u/") &&
        actor.id.toString().split("/u/")[0].includes(domain)) {
        (0, utils_1.save)(activitypub_core_types_1.AP.ActivityTypes.DISLIKE, JSON.parse(JSON.stringify(dislike)))
            .then(() => res.sendStatus(204))
            .catch((e) => {
            console.log(e);
            res.sendStatus(500);
        });
        return;
    }
    const inbox = activity.actor.inbox.toString();
    const response = yield (0, utils_1.sendSignedRequestByAccount)(new URL(inbox), "POST", dislike, domain, username);
    if (response.ok)
        (0, utils_1.save)(activitypub_core_types_1.AP.ActivityTypes.DISLIKE, JSON.parse(JSON.stringify(dislike)))
            .then(() => res.sendStatus(204))
            .catch((e) => {
            console.log(e);
            res.sendStatus(500);
        });
    else
        res.sendStatus(response.status);
}));
//# sourceMappingURL=activityApi.js.map