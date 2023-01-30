import { Request, Response, Router } from "express";
import { getFollowers } from "../../service/user.service";
import { extractHandles, getActorInfo, getWebfinger, Query } from "../../utils";

export const searchApiRouter = Router();
const router = Router();
searchApiRouter.use("/search", router);

/**
 * Searches user
 */
router.get("/user/:account", async (req: Request, res: Response) => {
  try {
    const [username, domain] = extractHandles(req.params.account);

    const webfingerTarget = await getWebfinger(`acct:${username}@${domain}`);
    const selfTarget: any[] = webfingerTarget.links.filter((link: any) => {
      return link.rel == "self";
    });

    const targetId = selfTarget[0].href;
    res.status(200).send(await getActorInfo(targetId));
  } catch {
    res.sendStatus(500);
  }
});
