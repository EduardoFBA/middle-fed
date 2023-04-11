import { AP } from "activitypub-core-types";
import { randomUUID } from "crypto";
import { getActorInfo } from "./utils";

async function createActivity(
  username: string,
  domain: string,
  activityType: string
) {
  const activity = <AP.Activity>{};
  activity["@context"] = "https://www.w3.org/ns/activitystreams";
  activity.id = new URL(
    `https://${domain}/activity/${activityType}/${randomUUID()}`
  );
  activity.actor = await getActorInfo(`https://${domain}/u/${username}`);
  activity.published = new Date();

  return activity;
}

export async function createAcceptActivity(
  username: string,
  domain: string,
  activity: any
) {
  const accept = <AP.Accept>(
    await createActivity(username, domain, AP.ActivityTypes.ACCEPT)
  );
  accept.type = AP.ActivityTypes.ACCEPT;
  accept.object = activity;

  return accept;
}

export async function createCreateActivity(
  username: string,
  domain: string,
  object: AP.CoreObject
) {
  const create = <AP.Create>(
    await createActivity(username, domain, AP.ActivityTypes.CREATE)
  );
  create.type = AP.ActivityTypes.CREATE;
  create.object = object;

  return create;
}

export async function createDislikeActivity(
  username: string,
  domain: string,
  activity: any
) {
  const dislike = <AP.Dislike>(
    await createActivity(username, domain, AP.ActivityTypes.DISLIKE)
  );
  dislike.type = AP.ActivityTypes.DISLIKE;
  dislike.object = activity;

  return dislike;
}

export async function createFollowActivity(
  username: string,
  domain: string,
  targetId: string
) {
  const follow = <AP.Follow>(
    await createActivity(username, domain, AP.ActivityTypes.FOLLOW)
  );
  follow.type = AP.ActivityTypes.FOLLOW;
  follow.object = await getActorInfo(targetId);

  return follow;
}

export async function createLikeActivity(
  username: string,
  domain: string,
  activity: any
) {
  const like = <AP.Like>(
    await createActivity(username, domain, AP.ActivityTypes.LIKE)
  );
  like.type = AP.ActivityTypes.LIKE;
  like.object = activity;

  return like;
}

export async function createUndoActivity(
  username: string,
  domain: string,
  activity: AP.Activity
) {
  const undo = <AP.Undo>(
    await createActivity(username, domain, AP.ActivityTypes.UNDO)
  );
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
  object.likes = <any>[];

  return object;
}

export function createNoteObject(
  name: string = "Note",
  content: string,
  username: string,
  domain: string,
  bto: string[] = [],
  to: string[] = ["https://www.w3.org/ns/activitystreams#Public"]
) {
  const note = <AP.Note>(
    createObject(name, username, domain, AP.CoreObjectTypes.NOTE)
  );
  note.type = AP.CoreObjectTypes.NOTE;
  note.content = content;
  note.bto = bto.map((x) => new URL(x));
  note.to = to.map((x) => new URL(x));

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

export function truncateForeignActor(actor: AP.Actor): AP.Actor {
  return {
    id: actor.id,
    type: actor.type,
    preferredUsername: actor.preferredUsername,
    followers: actor.followers,
    following: actor.following,
    inbox: actor.inbox,
    outbox: actor.outbox,
    endpoints: actor.endpoints,
    summary: actor.summary,
    icon: actor.icon,
    publicKey: actor.publicKey,
  } as AP.Person;
}
