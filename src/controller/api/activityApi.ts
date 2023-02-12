import { AP } from "activitypub-core-types";
import { Request, Response, Router } from "express";
import {
  extractHandles,
  getActorInfo,
  save,
  sendSignedRequest,
} from "../../utils";
import {
  createDislikeActivity,
  createFollowActivity,
  createLikeActivity,
} from "../../utils-json";

export const activityApiRouter = Router();
const router = Router();
activityApiRouter.use("/activity", router);

/**
 * Creates, saves and sends a follow activity
 *
 * @param account - username and domain of the user
 * @param
 */
router.post("/:account/follow", async (req: Request, res: Response) => {
  const [username, domain] = extractHandles(req.params.account);

  const targetId = req.body.targetId;
  const targetInfo = await getActorInfo(targetId);

  const follow = await createFollowActivity(
    username,
    domain,
    new URL(targetId)
  );

  const response = await sendSignedRequest(
    <URL>targetInfo.inbox,
    "POST",
    follow,
    domain,
    username
  );

  if (response.ok) {
    save(AP.ActivityTypes.FOLLOW, JSON.parse(JSON.stringify(follow)));
    res.sendStatus(200);
  } else {
    console.log(response);
    res.sendStatus(500);
  }
});

/**
 * Likes an activity
 *
 * @param account - username and domain of the target user to follow (@username@domain)
 */
router.post("/:account/like", async (req: Request, res: Response) => {
  const [username, domain] = extractHandles(req.params.account);
  const activity = <AP.Activity>req.body.activity;
  const object = (activity as any).object;
  const like = await createLikeActivity(username, domain, object);

  if (
    object.attributedTo.includes("/u/") &&
    object.attributedTo.split("/u/")[0].includes(domain)
  ) {
    save(AP.ActivityTypes.LIKE, JSON.parse(JSON.stringify(like)))
      .then(() => res.sendStatus(200))
      .catch((e) => {
        console.log(e);
        res.sendStatus(500);
      });

    return;
  }

  const inbox = (activity.actor as AP.Person).inbox.toString();

  const response = await sendSignedRequest(
    new URL(inbox),
    "POST",
    like,
    domain,
    username
  );

  if (response.ok)
    save(AP.ActivityTypes.LIKE, JSON.parse(JSON.stringify(like)))
      .then(() => res.sendStatus(200))
      .catch((e) => {
        console.log(e);
        res.sendStatus(500);
      });
  else res.sendStatus(response.status);
});

/**
 * Dislikes an activity
 *
 * @param account - username and domain of the target user to follow (@username@domain)
 */
router.post("/:account/dislike", async (req: Request, res: Response) => {
  const [username, domain] = extractHandles(req.params.account);
  const activity = <AP.Activity>req.body.activity;

  const dislike = await createDislikeActivity(
    username,
    domain,
    (activity as any).object
  );
  console.log(activity.actor);
  const inbox = (activity.actor as AP.Person).inbox.toString();

  const response = await sendSignedRequest(
    new URL(inbox),
    "POST",
    dislike,
    domain,
    username
  );

  res.sendStatus(response.status);
});
