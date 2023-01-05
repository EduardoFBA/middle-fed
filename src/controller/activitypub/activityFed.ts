import { AP } from "activitypub-core-types";
import { Request, Response, Router } from "express";
import {
  getActorInfo,
  getWebfinger,
  save,
  search,
  sendSignedRequest,
} from "../../utils";
import { createFollowActivity } from "../../utils-json";

export const activityFedRouter = Router();
const router = Router();
activityFedRouter.use("/activity", router);

/**
 * Deletes an activity
 * @param activityId - id of the activity to delete
 */
router.delete("/delete/:activityId", async (req: Request, res: Response) => {
  search("", "id", req.params.activityId);
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

  const follow = createFollowActivity(username, localDomain, new URL(targetId));

  const response = await sendSignedRequest(
    <URL>targetInfo.inbox,
    "POST",
    follow,
    actorInfo.publicKey.id,
    (actorInfo as any).privateKey
  );

  if (response.ok) {
    save("following", JSON.parse(JSON.stringify(follow)));
    res.sendStatus(200);
  } else res.send({ error: "error" });
});

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
          await search("following", "id", req.params.activityId)
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
      save("following", JSON.parse(JSON.stringify(follow)));
      res.sendStatus(200);
    } else res.send({ error: "error" });
  }
);
