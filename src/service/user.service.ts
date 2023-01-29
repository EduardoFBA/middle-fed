import { AP } from "activitypub-core-types";
import { Request, Response } from "express";
import {
  activityAlreadyExists,
  buffer,
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

export async function updateActor(actor: AP.Person): Promise<void> {
  await update(AP.ActorTypes.PERSON, actor, actor.id.toString());
  return;
}

export async function getFollowers(
  username: string
): Promise<(AP.Person | AP.Follow)[]> {
  const actors: (AP.Person | AP.Follow)[] = [];
  const follows = await getFollowersActivity(username);

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

export async function getFollowersActivity(
  username: string
): Promise<AP.Follow[]> {
  return await searchByField(
    AP.ActivityTypes.FOLLOW,
    AP.ActorTypes.PERSON,
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

  switch (activity.type) {
    case AP.ActivityTypes.DELETE:
      const del = <AP.Delete>activity;

      if (del.object) {
        if (del.actor === del.object) {
          remove(AP.ActorTypes.PERSON, new Query(del.actor.toString()));
        } else if ((del.object as any).id != null) {
          remove(
            AP.ActivityTypes.CREATE,
            new Query((del.object as any).id.toString())
          );
        }
      }

      res.sendStatus(200);
      break;
    case AP.ActivityTypes.FOLLOW:
      if (await activityAlreadyExists(activity)) {
        res.status(409).send("Activity already exists");
        return;
      }

      await save(activity.type.toString(), activity);

      const localDomain = req.app.get("localDomain");
      const username = req.params.username;
      const accept = createAcceptActivity(username, localDomain, activity);

      const userInfo = await getActorInfo((<URL>activity.actor).toString());

      sendSignedRequest(
        <URL>userInfo.inbox,
        "POST",
        accept,
        localDomain,
        username
      )
        .then((response) => {
          console.log(response);
          res.sendStatus(200);
        })
        .catch((e) => {
          console.log(e);
          remove(AP.ActivityTypes.FOLLOW, new Query(activity.id));
          res.status(500).send(e);
        });
      break;

    case AP.ActivityTypes.UNDO:
      const undoActivity: AP.Undo = <AP.Undo>activity;
      if (undoActivity.actor == null || undoActivity.object == null) {
        res.status(400).send("Activity missing required fields");
        return;
      }

      removeActivity(undoActivity).then(() => res.sendStatus(200));

      break;

    default:
      if (await activityAlreadyExists(activity)) {
        res.status(409).send("Activity already exists");
        return;
      }

      save(activity.type.toString(), activity).then(() => res.sendStatus(200));

      break;
  }
}
