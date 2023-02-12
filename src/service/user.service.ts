import { AP } from "activitypub-core-types";
import { Request, Response } from "express";
import {
  activityAlreadyExists,
  buffer,
  extractHandles,
  getActorInfo,
  Query,
  remove,
  removeActivity,
  save,
  searchByField,
  sendSignedRequest,
  update,
} from "../utils";
import { createAcceptActivity } from "../utils-json";
import { getNotes } from "./timeline.service";

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
      const actorInfo = await getActorInfo(follow.object.toString());
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
      const actorInfo = await getActorInfo(follow.actor.toString());
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
  return await searchByField(
    AP.ActivityTypes.FOLLOW,
    "actor.id",
    `https://middle-fed.onrender.com/u/${username}`
  );
}

export async function getFollowersActivity(
  username: string
): Promise<AP.Follow[]> {
  return await searchByField(
    AP.ActivityTypes.FOLLOW,
    "object",
    `https://middle-fed.onrender.com/u/${username}`
  );
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
    activity.actor = await getActorInfo(activity.actor.toString());
  }

  switch (activity.type) {
    case AP.ActivityTypes.ACCEPT:
      console.log("accept", activity);
      res.sendStatus(200);
      return;

    case AP.ActivityTypes.DELETE:
      const del = <AP.Delete>activity;
      console.log(del);

      if (del.object) {
        if (del.actor === del.object) {
          remove(AP.ActorTypes.PERSON, new Query(del.actor.toString()));
        } else if ((del.object as any).id != null) {
          const query = new Query((del.object as any).id.toString());
          query.fieldPath = "object.id";
          remove(AP.ActivityTypes.CREATE, query);
        }
      }

      res.sendStatus(200);
      return;
    case AP.ActivityTypes.FOLLOW:
      if (await activityAlreadyExists(activity)) {
        res.status(409).send("Activity already exists");
        return;
      }

      activity.published = new Date();

      const localDomain = req.app.get("localDomain");
      const username = req.params.username;
      const accept = await createAcceptActivity(
        username,
        localDomain,
        activity
      );

      const userInfo = await getActorInfo((<URL>activity.actor).toString());

      sendSignedRequest(
        <URL>userInfo.inbox,
        "POST",
        accept,
        localDomain,
        username
      )
        .then(() => {
          save(AP.ActivityTypes.FOLLOW, activity);
          res.sendStatus(200);
        })
        .catch((e) => {
          remove(AP.ActivityTypes.FOLLOW, new Query(activity.id));
          res.status(500).send(e);
        });
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

      removeActivity(undoActivity).then(() => res.sendStatus(200));

      return;

    default:
      if (await activityAlreadyExists(activity)) {
        res.status(409).send("Activity already exists");
        return;
      }

      console.log(activity.type, activity);
      save(activity.type.toString(), activity).then(() => res.sendStatus(200));

      return;
  }
}

export async function outbox(req: Request, res: Response) {
  const [username, domain] = extractHandles(req.params.account);
  const userQuery = new Query(`https://${domain}/u/${username}`);
  userQuery.fieldPath = "actor";

  res.send(await getNotes(AP.ActivityTypes.CREATE, userQuery));
}
