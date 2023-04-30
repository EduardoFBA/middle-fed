import { AP } from "activitypub-core-types";
import { Request, Response } from "express";
import {
  acceptedActivityTypes,
  activityAlreadyExists,
  buffer,
  getActorInfo,
  Query,
  remove,
  removeActivity,
  save,
  search,
  searchByField,
  sendSignedRequestByAccount,
  sendSignedRequestById,
  update,
} from "../utils";
import { createAcceptActivity, truncateForeignActor } from "../utils-json";
import { sendToAll } from "./activity.service";

export async function updateActor(actor: AP.Person): Promise<void> {
  await update(AP.ActorTypes.PERSON, actor, actor.id.toString());
  return;
}

export async function getFollowings(
  username: string
): Promise<(AP.Person | AP.Follow)[]> {
  const actors: (AP.Person | AP.Follow)[] = [];
  const follows = await getFollowingsActivity(username);

  for (const follow of follows) {
    try {
      const actorInfo = await getActorInfo(
        (follow.object as any).id.toString()
      );
      actors.push(actorInfo as AP.Person);
    } catch (e) {
      console.log(e);
    }
  }

  return actors;
}

export async function getFollowers(
  username: string
): Promise<(AP.Person | AP.Follow)[]> {
  const actors: (AP.Person | AP.Follow)[] = [];
  const follows = await getFollowersActivity(username);

  for (const follow of follows) {
    try {
      const actorInfo = await getActorInfo((follow.actor as any).id.toString());
      actors.push(actorInfo as AP.Person);
    } catch (e) {
      console.log(e);
    }
  }

  return actors;
}

export async function getFollowingsActivity(
  username: string
): Promise<AP.Follow[]> {
  const publishedQuery = new Query("");
  publishedQuery.fieldPath = "published";
  publishedQuery.opStr = "!=";

  const actorQuery = new Query(`https://middle-fed.onrender.com/u/${username}`);
  actorQuery.fieldPath = "actor.id";

  return await search(AP.ActivityTypes.FOLLOW, publishedQuery, actorQuery);
}

export async function getFollowersActivity(
  username: string
): Promise<AP.Follow[]> {
  const publishedQuery = new Query("");
  publishedQuery.fieldPath = "published";
  publishedQuery.opStr = "!=";

  const objQuery = new Query(`https://middle-fed.onrender.com/u/${username}`);
  objQuery.fieldPath = "object.id";

  return await search(AP.ActivityTypes.FOLLOW, publishedQuery, objQuery);
}

export async function inbox(req: Request, res: Response) {
  const buf = await buffer(req);
  const rawBody = buf.toString("utf8");
  const activity: AP.Activity = <AP.Activity>JSON.parse(rawBody);

  if (activity == null || activity.id == null) {
    res.sendStatus(400);
    return;
  }

  if ((activity.actor as any).id == null) {
    const actor = await getActorInfo(activity.actor.toString());
    activity.actor = truncateForeignActor(actor);
  }

  searchByField(AP.ActorTypes.PERSON, "id", (activity.actor as any).id)
    .then((act) => {
      if (act.length === 0)
        save(AP.ActorTypes.PERSON, activity.actor).catch((e) => console.log(e));
    })
    .catch((e) => console.log(e));

  console.log(activity.type, activity);
  switch (activity.type) {
    case AP.ActivityTypes.ACCEPT:
      const accept = <AP.Accept>activity;
      const acceptObject = <AP.Follow>accept.object;
      const acceptQuery = new Query(acceptObject.id);

      const followToAccept: AP.Follow = (
        await search(AP.ActivityTypes.FOLLOW, acceptQuery)
      )[0];
      followToAccept.published = new Date();

      save(followToAccept.type as string, followToAccept);

      res.sendStatus(204);
      return;

    case AP.ActivityTypes.DELETE:
      const del = <AP.Delete>activity;

      if (del.object) {
        if (del.actor === del.object) {
          remove(AP.ActorTypes.PERSON, new Query(del.actor.toString()));
        } else if ((del.object as any).id != null) {
          const query = new Query((del.object as any).id.toString());
          query.fieldPath = "object.id";
          remove(AP.ActivityTypes.CREATE, query);
        }
      }

      res.sendStatus(204);
      return;
    case AP.ActivityTypes.FOLLOW:
      const follow = <AP.Follow>activity;

      if ((follow.object as any).id == null) {
        follow.object = await getActorInfo(follow.object as URL);
      }

      if (await activityAlreadyExists(activity)) {
        res.status(409).send("Activity already exists");
        return;
      }

      follow.published = new Date();

      const localDomain = req.app.get("localDomain");
      const username = req.params.username;
      const acceptFollow = await createAcceptActivity(
        username,
        localDomain,
        follow
      );

      sendSignedRequestByAccount(
        <URL>(follow.actor as any).inbox,
        "POST",
        acceptFollow,
        localDomain,
        username
      ).then(() => save(follow.type as string, follow));
      return;

    case AP.ActivityTypes.DISLIKE:
    case AP.ActivityTypes.LIKE:
      const like = <AP.Like | AP.Dislike>activity;
      const wrapped = like.object as any;
      if (!like.object || !wrapped.id) {
        res.sendStatus(500);
        return;
      }

      const object =
        wrapped.type in AP.ActivityTypes && wrapped.object
          ? wrapped.object
          : wrapped;

      object.likes.push(like);

      return;

    case AP.ActivityTypes.UNDO:
      const undoActivity: AP.Undo = <AP.Undo>activity;
      if (undoActivity.actor == null || undoActivity.object == null) {
        res.status(400).send("Activity missing required fields");
        return;
      }

      removeActivity(undoActivity.object as AP.Activity).then(() =>
        res.sendStatus(204)
      );
      return;

    case AP.ActivityTypes.REJECT:
      const reject = <AP.Reject>activity;
      const rejectObject = <AP.Follow>reject.object;
      const rejectQuery = new Query(rejectObject.id);

      remove(AP.ActivityTypes.FOLLOW, rejectQuery);
      res.sendStatus(204);
      return;

    default:
      if (await activityAlreadyExists(activity)) {
        res.status(409).send("Activity already exists");
        return;
      }

      save(activity.type.toString(), activity)
        .then(() => res.sendStatus(204))
        .catch((e) => {
          res.status(500).send(e);
        });

      return;
  }
}

export async function outbox(req: Request, res: Response) {
  const buf = await buffer(req);
  const rawBody = buf.toString("utf8");
  const activity: AP.Activity = <AP.Activity>JSON.parse(rawBody);

  if (
    !activity.id ||
    (!activity.actor && !(activity.actor as any).id) ||
    !activity.type ||
    !acceptedActivityTypes.includes(activity.type as string)
  ) {
    res.status(500).send("Invalid activity");
    return;
  }
  const actor = <any>activity.actor;
  const actorId = actor?.id || actor;
  const publicPost: boolean = req.body.to == null || req.body.to.length === 0;
  const bto: string[] = req.body.bto ? req.body.bto : [];
  const to: string[] = !publicPost
    ? req.body.to
    : ["https://www.w3.org/ns/activitystreams#Public"];

  save(activity.type as string, activity);

  if (publicPost) {
    sendToAll(actorId, activity);
  } else {
    for (let inbox of to.concat(bto)) {
      sendSignedRequestById(new URL(inbox), "POST", activity, actorId);
    }
  }
}
