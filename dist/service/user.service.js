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
exports.inbox = exports.getFollowersActivity = exports.getFollowers = exports.updateActor = void 0;
const activitypub_core_types_1 = require("activitypub-core-types");
const utils_1 = require("../utils");
const utils_json_1 = require("../utils-json");
function updateActor(actor) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, utils_1.update)(activitypub_core_types_1.AP.ActorTypes.PERSON, actor, actor.id.toString());
        return;
    });
}
exports.updateActor = updateActor;
function getFollowers(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const actors = [];
        const follows = yield getFollowersActivity(username);
        for (const follow of follows) {
            try {
                const actorInfo = yield (0, utils_1.getActorInfo)(follow.object.toString());
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
function getFollowersActivity(username) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (0, utils_1.searchByField)(activitypub_core_types_1.AP.ActivityTypes.FOLLOW, activitypub_core_types_1.AP.ActorTypes.PERSON, `https://middle-fed.onrender.com/u/${username}`);
    });
}
exports.getFollowersActivity = getFollowersActivity;
function inbox(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const buf = yield (0, utils_1.buffer)(req);
        const rawBody = buf.toString("utf8");
        // const activity: AP.Activity = <AP.Activity>JSON.parse(rawBody);
        const activity = req.body;
        if (activity == null || activity.id == null) {
            res.sendStatus(400);
            return;
        }
        switch (activity.type) {
            case activitypub_core_types_1.AP.ActivityTypes.DELETE:
                const del = activity;
                if (del.object) {
                    if (del.actor === del.object) {
                        (0, utils_1.remove)(activitypub_core_types_1.AP.ActorTypes.PERSON, new utils_1.Query(del.actor.toString()));
                    }
                    else if (del.object.id != null) {
                        (0, utils_1.remove)(activitypub_core_types_1.AP.ActivityTypes.CREATE, new utils_1.Query(del.object.id.toString()));
                    }
                }
                res.sendStatus(200);
                break;
            case activitypub_core_types_1.AP.ActivityTypes.FOLLOW:
                if (yield (0, utils_1.activityAlreadyExists)(activity)) {
                    res.status(409).send("Activity already exists");
                    return;
                }
                yield (0, utils_1.save)(activity.type.toString(), activity);
                const localDomain = req.app.get("localDomain");
                const username = req.params.username;
                const accept = (0, utils_json_1.createAcceptActivity)(username, localDomain, activity);
                const userInfo = yield (0, utils_1.getActorInfo)(activity.actor.toString());
                (0, utils_1.sendSignedRequest)(userInfo.inbox, "POST", accept, localDomain, username)
                    .then((response) => {
                    console.log(response);
                    res.sendStatus(200);
                })
                    .catch((e) => {
                    console.log(e);
                    (0, utils_1.remove)(activitypub_core_types_1.AP.ActivityTypes.FOLLOW, new utils_1.Query(activity.id));
                    res.status(500).send(e);
                });
                break;
            case activitypub_core_types_1.AP.ActivityTypes.UNDO:
                const undoActivity = activity;
                if (undoActivity.actor == null || undoActivity.object == null) {
                    res.status(400).send("Activity missing required fields");
                    return;
                }
                (0, utils_1.removeActivity)(undoActivity).then(() => res.sendStatus(200));
                break;
            default:
                if (yield (0, utils_1.activityAlreadyExists)(activity)) {
                    res.status(409).send("Activity already exists");
                    return;
                }
                (0, utils_1.save)(activity.type.toString(), activity).then(() => res.sendStatus(200));
                break;
        }
    });
}
exports.inbox = inbox;
//# sourceMappingURL=user.service.js.map