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

export function createDeleteActivity(
  username: string,
  domain: string,
  activity: any
) {
  const del = <AP.Delete>(
    createActivity(username, domain, AP.ActivityTypes.DELETE)
  );
  del.type = AP.ActivityTypes.DELETE;
  del.object = activity;

  return del;
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
