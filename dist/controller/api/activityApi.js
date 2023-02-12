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
const express_1 = require("express");
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
        const content = req.body.content;
        const name = req.body.name;
        const bto = req.body.bto ? req.body.bto : [];
        const to = req.body.to
            ? req.body.to
            : ["https://www.w3.org/ns/activitystreams#Public"];
        const [username, domain] = (0, utils_1.extractHandles)(req.params.account);
        const note = (0, utils_json_1.createNoteObject)(name, content, username, domain, bto, to);
        const create = yield (0, utils_json_1.wrapObjectInActivity)(activitypub_core_types_1.AP.ActivityTypes.CREATE, note, username, domain);
        for (let inbox of to.concat(bto)) {
            (0, utils_1.sendSignedRequest)(new URL(inbox), "POST", create, domain, req.params.username);
        }
        (0, utils_1.save)(activitypub_core_types_1.AP.ActivityTypes.CREATE, JSON.parse(JSON.stringify(create)))
            .then((create) => res.status(200).send(create))
            .catch((e) => {
            console.log(e);
            res.sendStatus(500);
        });
    }
    catch (e) {
        console.log(e);
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
    const targetInfo = yield (0, utils_1.getActorInfo)(targetId);
    const follow = yield (0, utils_json_1.createFollowActivity)(username, domain, new URL(targetId));
    const response = yield (0, utils_1.sendSignedRequest)(targetInfo.inbox, "POST", follow, domain, username);
    if (response.ok) {
        (0, utils_1.save)(activitypub_core_types_1.AP.ActivityTypes.FOLLOW, JSON.parse(JSON.stringify(follow)));
        res.sendStatus(200);
    }
    else {
        console.log(response);
        res.sendStatus(500);
    }
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
    if (actor.id.toString().includes("/u/") &&
        actor.id.toString().split("/u/")[0].includes(domain)) {
        (0, utils_1.save)(activitypub_core_types_1.AP.ActivityTypes.LIKE, JSON.parse(JSON.stringify(like)))
            .then(() => res.sendStatus(200))
            .catch((e) => {
            console.log(e);
            res.sendStatus(500);
        });
        return;
    }
    const inbox = activity.actor.inbox.toString();
    const response = yield (0, utils_1.sendSignedRequest)(new URL(inbox), "POST", like, domain, username);
    if (response.ok)
        (0, utils_1.save)(activitypub_core_types_1.AP.ActivityTypes.LIKE, JSON.parse(JSON.stringify(like)))
            .then(() => res.sendStatus(200))
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
    const dislike = yield (0, utils_json_1.createDislikeActivity)(username, domain, activity.object);
    console.log(activity.actor);
    const inbox = activity.actor.inbox.toString();
    const response = yield (0, utils_1.sendSignedRequest)(new URL(inbox), "POST", dislike, domain, username);
    res.sendStatus(response.status);
}));
//# sourceMappingURL=activityApi.js.map