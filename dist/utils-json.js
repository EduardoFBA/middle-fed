"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWebfinger = exports.createUser = exports.createFollowActivity = exports.createDeleteActivity = exports.createAcceptActivity = void 0;
const activitypub_core_types_1 = require("activitypub-core-types");
const crypto_1 = require("crypto");
function createActivity(username, domain, activityType) {
    const activity = {};
    activity["@context"] = "https://www.w3.org/ns/activitystreams";
    activity.id = new URL(`https://${domain}/activity/${activityType}/${(0, crypto_1.randomUUID)()}`);
    activity.actor = new URL(`https://${domain}/u/${username}`);
    return activity;
}
function createAcceptActivity(username, domain, activity) {
    const accept = (createActivity(username, domain, activitypub_core_types_1.AP.ActivityTypes.ACCEPT));
    accept.type = activitypub_core_types_1.AP.ActivityTypes.ACCEPT;
    accept.object = activity;
    return accept;
}
exports.createAcceptActivity = createAcceptActivity;
function createDeleteActivity(username, domain, activity) {
    const del = (createActivity(username, domain, activitypub_core_types_1.AP.ActivityTypes.DELETE));
    del.type = activitypub_core_types_1.AP.ActivityTypes.DELETE;
    del.object = activity;
    return del;
}
exports.createDeleteActivity = createDeleteActivity;
function createFollowActivity(username, domain, targetId) {
    const follow = (createActivity(username, domain, activitypub_core_types_1.AP.ActivityTypes.FOLLOW));
    follow.type = activitypub_core_types_1.AP.ActivityTypes.FOLLOW;
    follow.object = targetId;
    return follow;
}
exports.createFollowActivity = createFollowActivity;
function createUser(name, domain, pubkey, prikey) {
    return {
        "@context": [
            "https://www.w3.org/ns/activitystreams",
            "https://w3id.org/security/v1",
        ],
        id: `https://${domain}/u/${name}`,
        type: "Person",
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
        privateKey: prikey,
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