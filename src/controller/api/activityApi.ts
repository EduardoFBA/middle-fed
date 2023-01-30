import { AP } from "activitypub-core-types";
import { Request, Response, Router } from "express";
import {
  extractHandles,
  getActorInfo,
  save,
  sendSignedRequest,
} from "../../utils";
import { createFollowActivity } from "../../utils-json";

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

  const follow = createFollowActivity(username, domain, new URL(targetId));
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
  } else res.sendStatus(500);
});
