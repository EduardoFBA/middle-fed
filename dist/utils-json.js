"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWebfinger = exports.createUser = exports.wrapObjectInActivity = exports.createNoteObject = exports.createUndoActivity = exports.createLikeActivity = exports.createFollowActivity = exports.createDislikeActivity = exports.createCreateActivity = exports.createAcceptActivity = void 0;
const activitypub_core_types_1 = require("activitypub-core-types");
const crypto_1 = require("crypto");
function createActivity(username, domain, activityType) {
    const activity = {};
    activity["@context"] = "https://www.w3.org/ns/activitystreams";
    activity.id = new URL(`https://${domain}/activity/${activityType}/${(0, crypto_1.randomUUID)()}`);
    activity.actor = new URL(`https://${domain}/u/${username}`);
    activity.published = new Date();
    return activity;
}
function createAcceptActivity(username, domain, activity) {
    const accept = (createActivity(username, domain, activitypub_core_types_1.AP.ActivityTypes.ACCEPT));
    accept.type = activitypub_core_types_1.AP.ActivityTypes.ACCEPT;
    accept.object = activity;
    return accept;
}
exports.createAcceptActivity = createAcceptActivity;
function createCreateActivity(username, domain, object) {
    const create = (createActivity(username, domain, activitypub_core_types_1.AP.ActivityTypes.CREATE));
    create.actor = new URL(`https://${domain}/u/${username}`);
    create.type = activitypub_core_types_1.AP.ActivityTypes.CREATE;
    create.object = object;
    return create;
}
exports.createCreateActivity = createCreateActivity;
function createDislikeActivity(username, domain, activity) {
    const dislike = (createActivity(username, domain, activitypub_core_types_1.AP.ActivityTypes.DISLIKE));
    dislike.type = activitypub_core_types_1.AP.ActivityTypes.DISLIKE;
    dislike.object = activity;
    return dislike;
}
exports.createDislikeActivity = createDislikeActivity;
function createFollowActivity(username, domain, targetId) {
    const follow = (createActivity(username, domain, activitypub_core_types_1.AP.ActivityTypes.FOLLOW));
    follow.type = activitypub_core_types_1.AP.ActivityTypes.FOLLOW;
    follow.object = targetId;
    return follow;
}
exports.createFollowActivity = createFollowActivity;
function createLikeActivity(username, domain, activity) {
    const like = createActivity(username, domain, activitypub_core_types_1.AP.ActivityTypes.LIKE);
    like.type = activitypub_core_types_1.AP.ActivityTypes.LIKE;
    like.object = activity;
    return like;
}
exports.createLikeActivity = createLikeActivity;
function createUndoActivity(username, domain, activity) {
    const undo = createActivity(username, domain, activitypub_core_types_1.AP.ActivityTypes.UNDO);
    undo.type = activitypub_core_types_1.AP.ActivityTypes.UNDO;
    undo.object = activity;
    return undo;
}
exports.createUndoActivity = createUndoActivity;
function createObject(name, username, domain, objectType) {
    const object = {};
    object["@context"] = "https://www.w3.org/ns/activitystreams";
    object.id = new URL(`https://${domain}/u/${username}/${objectType}/${(0, crypto_1.randomUUID)()}`);
    object.name = name;
    return object;
}
function createNoteObject(name, content, username, domain) {
    const note = (createObject(name, username, domain, activitypub_core_types_1.AP.CoreObjectTypes.NOTE));
    note.type = activitypub_core_types_1.AP.CoreObjectTypes.NOTE;
    note.content = content;
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
        publicKey: {
            id: `https://${domain}/u/${name}#main-key`,
            owner: `https://${domain}/u/${name}`,
            publicKeyPem: pubkey,
        },
        privateKey: prikey, //TODO: change private key location to make it actually private
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