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
exports.createWebfinger = exports.createUser = exports.wrapObjectInActivity = exports.createNoteObject = exports.createUndoActivity = exports.createLikeActivity = exports.createFollowActivity = exports.createDislikeActivity = exports.createCreateActivity = exports.createAcceptActivity = void 0;
const activitypub_core_types_1 = require("activitypub-core-types");
const crypto_1 = require("crypto");
const utils_1 = require("./utils");
function createActivity(username, domain, activityType) {
    return __awaiter(this, void 0, void 0, function* () {
        const activity = {};
        activity["@context"] = "https://www.w3.org/ns/activitystreams";
        activity.id = new URL(`https://${domain}/activity/${activityType}/${(0, crypto_1.randomUUID)()}`);
        activity.actor = yield (0, utils_1.getActorInfo)(`https://${domain}/u/${username}`);
        activity.published = new Date();
        return activity;
    });
}
function createAcceptActivity(username, domain, activity) {
    return __awaiter(this, void 0, void 0, function* () {
        const accept = (yield createActivity(username, domain, activitypub_core_types_1.AP.ActivityTypes.ACCEPT));
        accept.type = activitypub_core_types_1.AP.ActivityTypes.ACCEPT;
        accept.object = activity;
        return accept;
    });
}
exports.createAcceptActivity = createAcceptActivity;
function createCreateActivity(username, domain, object) {
    return __awaiter(this, void 0, void 0, function* () {
        const create = (yield createActivity(username, domain, activitypub_core_types_1.AP.ActivityTypes.CREATE));
        create.type = activitypub_core_types_1.AP.ActivityTypes.CREATE;
        create.object = object;
        return create;
    });
}
exports.createCreateActivity = createCreateActivity;
function createDislikeActivity(username, domain, activity) {
    return __awaiter(this, void 0, void 0, function* () {
        const dislike = (yield createActivity(username, domain, activitypub_core_types_1.AP.ActivityTypes.DISLIKE));
        dislike.type = activitypub_core_types_1.AP.ActivityTypes.DISLIKE;
        dislike.object = activity;
        return dislike;
    });
}
exports.createDislikeActivity = createDislikeActivity;
function createFollowActivity(username, domain, targetId) {
    return __awaiter(this, void 0, void 0, function* () {
        const follow = (yield createActivity(username, domain, activitypub_core_types_1.AP.ActivityTypes.FOLLOW));
        follow.type = activitypub_core_types_1.AP.ActivityTypes.FOLLOW;
        follow.object = targetId;
        return follow;
    });
}
exports.createFollowActivity = createFollowActivity;
function createLikeActivity(username, domain, activity) {
    return __awaiter(this, void 0, void 0, function* () {
        const like = (yield createActivity(username, domain, activitypub_core_types_1.AP.ActivityTypes.LIKE));
        like.type = activitypub_core_types_1.AP.ActivityTypes.LIKE;
        like.object = activity;
        return like;
    });
}
exports.createLikeActivity = createLikeActivity;
function createUndoActivity(username, domain, activity) {
    return __awaiter(this, void 0, void 0, function* () {
        const undo = (yield createActivity(username, domain, activitypub_core_types_1.AP.ActivityTypes.UNDO));
        undo.type = activitypub_core_types_1.AP.ActivityTypes.UNDO;
        undo.object = activity;
        return undo;
    });
}
exports.createUndoActivity = createUndoActivity;
function createObject(name, username, domain, objectType) {
    const object = {};
    object["@context"] = "https://www.w3.org/ns/activitystreams";
    object.id = new URL(`https://${domain}/u/${username}/${objectType}/${(0, crypto_1.randomUUID)()}`);
    object.name = name;
    object.likes = [];
    return object;
}
function createNoteObject(name = "Note", content, username, domain, bto = [], to = ["https://www.w3.org/ns/activitystreams#Public"]) {
    const note = (createObject(name, username, domain, activitypub_core_types_1.AP.CoreObjectTypes.NOTE));
    note.type = activitypub_core_types_1.AP.CoreObjectTypes.NOTE;
    note.content = content;
    note.bto = bto.map((x) => new URL(x));
    note.to = to.map((x) => new URL(x));
    return note;
}
exports.createNoteObject = createNoteObject;
function wrapObjectInActivity(activityType, object, username, domain) {
    switch (activityType) {
        case activitypub_core_types_1.AP.ActivityTypes.CREATE:
            return createCreateActivity(username, domain, object);
    }
}
exports.wrapObjectInActivity = wrapObjectInActivity;
function createUser(name, domain, pubkey, prikey) {
    return {
        "@context": [
            "https://www.w3.org/ns/activitystreams",
            "https://w3id.org/security/v1",
        ],
        id: `https://${domain}/u/${name}`,
        type: "Person",
        account: `${name}@${domain}`,
        preferredUsername: `${name}`,
        followers: `https://${domain}/u/${name}/followers`,
        following: `https://${domain}/u/${name}/following`,
        inbox: `https://${domain}/u/${name}/inbox`,
        outbox: `https://${domain}/u/${name}/outbox`,
        endpoints: { sharedInbox: `https://${domain}/public/inbox` },
        summary: `${name}'s actor`,
        icon: {
            type: "Image",
            mediaType: "image/jpg",
            url: "https://firebasestorage.googleapis.com/v0/b/middle-fed.appspot.com/o/icon%2Fplaceholder.jpg?alt=media&token=db101005-b1ff-422c-8424-042d8129a8ed",
        },
        publicKey: {
            id: `https://${domain}/u/${name}#main-key`,
            owner: `https://${domain}/u/${name}`,
            publicKeyPem: pubkey,
        },
        privateKey: prikey, //HACK: this privatekey should obviously be private
    };
}
exports.createUser = createUser;
function createWebfinger(name, domain) {
    return {
        subject: `acct:${name}@${domain}`,
        links: [
            {
                rel: "self",
                type: "application/activity+json",
                href: `https://${domain}/u/${name}`,
            },
        ],
    };
}
exports.createWebfinger = createWebfinger;
//# sourceMappingURL=utils-json.js.map