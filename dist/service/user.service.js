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
exports.outbox = exports.inbox = exports.getFollowersActivity = exports.getFollowingsActivity = exports.getFollowers = exports.getFollowings = exports.updateActor = void 0;
const activitypub_core_types_1 = require("activitypub-core-types");
const utils_1 = require("../utils");
const utils_json_1 = require("../utils-json");
const activity_service_1 = require("./activity.service");
function updateActor(actor) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, utils_1.update)(activitypub_core_types_1.AP.ActorTypes.PERSON, actor, actor.id.toString());
        return;
    });
}
exports.updateActor = updateActor;
function getFollowings(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const actors = [];
        const follows = yield getFollowingsActivity(username);
        for (const follow of follows) {
            try {
                const actorInfo = yield (0, utils_1.getActorInfo)(follow.object.id.toString());
                actors.push(actorInfo);
            }
            catch (e) {
                console.log(e);
            }
        }
        return actors;
    });
}
exports.getFollowings = getFollowings;
function getFollowers(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const actors = [];
        const follows = yield getFollowersActivity(username);
        for (const follow of follows) {
            try {
                const actorInfo = yield (0, utils_1.getActorInfo)(follow.actor.id.toString());
                actors.push(actorInfo);
            }
            catch (e) {
                console.log(e);
            }
        }
        return actors;
    });
}
exports.getFollowers = getFollowers;
function getFollowingsActivity(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const publishedQuery = new utils_1.Query("");
        publishedQuery.fieldPath = "published";
        publishedQuery.opStr = "!=";
        const actorQuery = new utils_1.Query(`https://middle-fed.onrender.com/u/${username}`);
        actorQuery.fieldPath = "actor.id";
        return yield (0, utils_1.search)(activitypub_core_types_1.AP.ActivityTypes.FOLLOW, publishedQuery, actorQuery);
    });
}
exports.getFollowingsActivity = getFollowingsActivity;
function getFollowersActivity(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const publishedQuery = new utils_1.Query("");
        publishedQuery.fieldPath = "published";
        publishedQuery.opStr = "!=";
        const objQuery = new utils_1.Query(`https://middle-fed.onrender.com/u/${username}`);
        objQuery.fieldPath = "object.id";
        return yield (0, utils_1.search)(activitypub_core_types_1.AP.ActivityTypes.FOLLOW, publishedQuery, objQuery);
    });
}
exports.getFollowersActivity = getFollowersActivity;
function inbox(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const buf = yield (0, utils_1.buffer)(req);
        const rawBody = buf.toString("utf8");
        const activity = JSON.parse(rawBody);
        if (activity == null || activity.id == null) {
            res.sendStatus(400);
            return;
        }
        if (activity.actor.id == null) {
            const actor = yield (0, utils_1.getActorInfo)(activity.actor.toString());
            activity.actor = (0, utils_json_1.truncateForeignActor)(actor);
        }
        (0, utils_1.searchByField)(activitypub_core_types_1.AP.ActorTypes.PERSON, "id", activity.actor.id)
            .then((act) => {
            if (act.length === 0)
                (0, utils_1.save)(activitypub_core_types_1.AP.ActorTypes.PERSON, activity.actor).catch((e) => console.log(e));
        })
            .catch((e) => console.log(e));
        console.log(activity.type, activity);
        switch (activity.type) {
            case activitypub_core_types_1.AP.ActivityTypes.ACCEPT:
                const accept = activity;
                const acceptObject = accept.object;
                const acceptQuery = new utils_1.Query(acceptObject.id);
                const followToAccept = (yield (0, utils_1.search)(activitypub_core_types_1.AP.ActivityTypes.FOLLOW, acceptQuery))[0];
                followToAccept.published = new Date();
                (0, utils_1.save)(followToAccept.type, followToAccept);
                res.sendStatus(204);
                return;
            case activitypub_core_types_1.AP.ActivityTypes.DELETE:
                const del = activity;
                if (del.object) {
                    if (del.actor === del.object) {
                        (0, utils_1.remove)(activitypub_core_types_1.AP.ActorTypes.PERSON, new utils_1.Query(del.actor.toString()));
                    }
                    else if (del.object.id != null) {
                        const query = new utils_1.Query(del.object.id.toString());
                        query.fieldPath = "object.id";
                        (0, utils_1.remove)(activitypub_core_types_1.AP.ActivityTypes.CREATE, query);
                    }
                }
                res.sendStatus(204);
                return;
            case activitypub_core_types_1.AP.ActivityTypes.FOLLOW:
                const follow = activity;
                if (follow.object.id == null) {
                    follow.object = yield (0, utils_1.getActorInfo)(follow.object);
                }
                if (yield (0, utils_1.activityAlreadyExists)(activity)) {
                    res.status(409).send("Activity already exists");
                    return;
                }
                follow.published = new Date();
                const localDomain = req.app.get("localDomain");
                const username = req.params.username;
                const acceptFollow = yield (0, utils_json_1.createAcceptActivity)(username, localDomain, follow);
                (0, utils_1.sendSignedRequestByAccount)(follow.actor.inbox, "POST", acceptFollow, localDomain, username).then(() => (0, utils_1.save)(follow.type, follow));
                return;
            case activitypub_core_types_1.AP.ActivityTypes.DISLIKE:
            case activitypub_core_types_1.AP.ActivityTypes.LIKE:
                const like = activity;
                const wrapped = like.object;
                if (!like.object || !wrapped.id) {
                    res.sendStatus(500);
                    return;
                }
                const object = wrapped.type in activitypub_core_types_1.AP.ActivityTypes && wrapped.object
                    ? wrapped.object
                    : wrapped;
                object.likes.push(like);
                return;
            case activitypub_core_types_1.AP.ActivityTypes.UNDO:
                const undoActivity = activity;
                if (undoActivity.actor == null || undoActivity.object == null) {
                    res.status(400).send("Activity missing required fields");
                    return;
                }
                (0, utils_1.removeActivity)(undoActivity.object).then(() => res.sendStatus(204));
                return;
            case activitypub_core_types_1.AP.ActivityTypes.REJECT:
                const reject = activity;
                const rejectObject = reject.object;
                const rejectQuery = new utils_1.Query(rejectObject.id);
                (0, utils_1.remove)(activitypub_core_types_1.AP.ActivityTypes.FOLLOW, rejectQuery);
                res.sendStatus(204);
                return;
            default:
                if (yield (0, utils_1.activityAlreadyExists)(activity)) {
                    res.status(409).send("Activity already exists");
                    return;
                }
                (0, utils_1.save)(activity.type.toString(), activity)
                    .then(() => res.sendStatus(204))
                    .catch((e) => {
                    res.status(500).send(e);
                });
                return;
        }
    });
}
exports.inbox = inbox;
function outbox(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const buf = yield (0, utils_1.buffer)(req);
        const rawBody = buf.toString("utf8");
        const activity = JSON.parse(rawBody);
        if (!activity.id ||
            (!activity.actor && !activity.actor.id) ||
            !activity.type ||
            !utils_1.acceptedActivityTypes.includes(activity.type)) {
            res.status(500).send("Invalid activity");
            return;
        }
        const actor = activity.actor;
        const actorId = (actor === null || actor === void 0 ? void 0 : actor.id) || actor;
        const publicPost = req.body.to == null || req.body.to.length === 0;
        const bto = req.body.bto ? req.body.bto : [];
        const to = !publicPost
            ? req.body.to
            : ["https://www.w3.org/ns/activitystreams#Public"];
        (0, utils_1.save)(activity.type, activity);
        if (publicPost) {
            (0, activity_service_1.sendToAll)(actorId, activity);
        }
        else {
            for (let inbox of to.concat(bto)) {
                (0, utils_1.sendSignedRequestById)(new URL(inbox), "POST", activity, actorId);
            }
        }
    });
}
exports.outbox = outbox;
//# sourceMappingURL=user.service.js.map