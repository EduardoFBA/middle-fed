import { AP } from "activitypub-core-types";
import { randomUUID } from "crypto";

function createActivity(
  username: string,
  domain: string,
  activityType: string
) {
  const activity = <AP.Activity>{};
  activity["@context"] = "https://www.w3.org/ns/activitystreams";
  activity.id = new URL(
    `https://${domain}/activity/${activityType}/${randomUUID()}`
  );
  activity.actor = new URL(`https://${domain}/u/${username}`);
  activity.published = new Date();

  return activity;
}

export function createAcceptActivity(
  username: string,
  domain: string,
  activity: any
) {
  const accept = <AP.Accept>(
    createActivity(username, domain, AP.ActivityTypes.ACCEPT)
  );
  accept.type = AP.ActivityTypes.ACCEPT;
  accept.object = activity;

  return accept;
}

export function createCreateActivity(
  username: string,
  domain: string,
  object: AP.CoreObject
) {
  const create = <AP.Create>(
    createActivity(username, domain, AP.ActivityTypes.CREATE)
  );
  create.actor = new URL(`https://${domain}/u/${username}`);
  create.type = AP.ActivityTypes.CREATE;
  create.object = object;

  return create;
}

export function createDislikeActivity(
  username: string,
  domain: string,
  activity: AP.Activity
) {
  const dislike = <AP.Dislike>(
    createActivity(username, domain, AP.ActivityTypes.DISLIKE)
  );
  dislike.type = AP.ActivityTypes.DISLIKE;
  dislike.object = activity;

  return dislike;
}

export function createFollowActivity(
  username: string,
  domain: string,
  targetId: URL
) {
  const follow = <AP.Follow>(
    createActivity(username, domain, AP.ActivityTypes.FOLLOW)
  );
  follow.type = AP.ActivityTypes.FOLLOW;
  follow.object = targetId;

  return follow;
}

export function createLikeActivity(
  username: string,
  domain: string,
  activity: AP.Activity
) {
  const like = <AP.Like>createActivity(username, domain, AP.ActivityTypes.LIKE);
  like.type = AP.ActivityTypes.LIKE;
  like.object = activity;

  return like;
}

export function createUndoActivity(
  username: string,
  domain: string,
  activity: AP.Activity
) {
  const undo = <AP.Undo>createActivity(username, domain, AP.ActivityTypes.UNDO);
  undo.type = AP.ActivityTypes.UNDO;
  undo.object = activity;

  return undo;
}

function createObject(
  name: string,
  username: string,
  domain: string,
  objectType: string
) {
  const object = <AP.CoreObject>{};
  object["@context"] = "https://www.w3.org/ns/activitystreams";
  object.id = new URL(
    `https://${domain}/u/${username}/${objectType}/${randomUUID()}`
  );
  object.name = name;

  return object;
}

export function createNoteObject(
  name: string,
  content: string,
  username: string,
  domain: string
) {
  const note = <AP.Note>(
    createObject(name, username, domain, AP.CoreObjectTypes.NOTE)
  );
  note.type = AP.CoreObjectTypes.NOTE;
  note.content = content;

  return note;
}

export function wrapObjectInActivity(
  activityType: string,
  object: AP.CoreObject,
  username: string,
  domain: string
) {
  switch (activityType) {
    case AP.ActivityTypes.CREATE:
      return createCreateActivity(username, domain, object);
  }
}

export function createUser(
  name: string,
  domain: string,
  pubkey: string,
  prikey: string
) {
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

export function createWebfinger(name: string, domain: string) {
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
