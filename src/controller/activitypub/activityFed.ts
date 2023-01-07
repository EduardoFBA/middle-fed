import { AP } from "activitypub-core-types";
import { Request, Response, Router } from "express";
import {
  getActorInfo,
  getWebfinger,
  Query,
  remove,
  save,
  search,
  searchByField,
  sendSignedRequest,
} from "../../utils";
import { createFollowActivity, createUndoActivity } from "../../utils-json";

export const activityFedRouter = Router();
const router = Router();
activityFedRouter.use("/activity", router);

/**
 * Undoes an activity
 * @param username - name of current user
 * @param activityId - id of the activity to undo
 * @param activityType - type of activity
 */
router.delete(
  "/:username/undo/:activityId/:activityType",
  async (req: Request, res: Response) => {
    const localDomain = req.app.get("localDomain");
    const result = <AP.Activity[]>(
      await searchByField(
        "following",
        "id",
        `https://${localDomain}/activity/Follow/${req.params.activityId}`
      )
    );

    if (!result.length) {
      res.send("nothin");
      return;
    }

    switch (result[0].type) {
      case AP.ActivityTypes.FOLLOW:
        const follow = <AP.Follow>result[0];
        const objectActor = <AP.Person>follow.object;
        const targetInfo = await getActorInfo(objectActor + ".json");

        const username = req.params.username;
        const actorInfo = await getActorInfo(
          `https://${localDomain}/u/${username}.json`
        );

        const undo = createUndoActivity(username, localDomain, follow);

        const response = await sendSignedRequest(
          <URL>targetInfo.inbox,
          "POST",
          undo,
          actorInfo.publicKey.id,
          (actorInfo as any).privateKey
        );

        console.log("response", response);

        if (response.ok) {
          const query = new Query();
          query.value = follow.id;
          remove("following", [query]);
          res.send("finished");
        }
        break;
      default:
        res.send("default");
        break;
    }
  }
);

/**
 * Gets an activity
 * @param {AP.ActivityType} activityType - type of activity
 * @param activityId - id of the activity to get
 */
router.get(
  "/:activityType/:activityId",
  async (req: Request, res: Response) => {
    let activity;
    switch (req.params.activityType) {
      case AP.ActivityTypes.FOLLOW:
        activity = <AP.Follow[]>(
          await searchByField("following", "id", req.params.activityId)
        );
    }

    if (activity.length) res.send(activity[0]);
    else res.send("activity not found");
  }
);

/**
 * Creates, saves and sends a follow activity
 * @param username - name of current user
 * @param target - username and domain of the target user to follow (@username@domain)
 */
router.post(
  "/:username/follow/:target",
  async (req: Request, res: Response) => {
    const localDomain = req.app.get("localDomain");

    const webfingerTarget = await getWebfinger(req.params.target);
    const selfTarget: any[] = webfingerTarget.links.filter((link: any) => {
      return link.rel == "self";
    });
    const targetId = selfTarget[0].href;
    const targetInfo = await getActorInfo(targetId + ".json");

    const username = req.params.username;
    const actorInfo = await getActorInfo(
      `https://${localDomain}/u/${username}.json`
    );

    const follow = createFollowActivity(
      username,
      localDomain,
      new URL(targetId)
    );
    console.log("follow", follow);
    const response = await sendSignedRequest(
      <URL>targetInfo.inbox,
      "POST",
      follow,
      actorInfo.publicKey.id,
      (actorInfo as any).privateKey
    );

    if (response.ok) {
      save(AP.ActivityTypes.FOLLOW, JSON.parse(JSON.stringify(follow)));
      res.sendStatus(200);
    } else res.send({ error: "error" });
  }
);
