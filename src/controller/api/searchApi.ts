import { Request, Response, Router } from "express";
import { extractHandles, getActorInfo, getWebfinger } from "../../utils";

export const searchApiRouter = Router();
const router = Router();
searchApiRouter.use("/search", router);

/**
 * Searches user
 */
router.get("/user/:account", async (req: Request, res: Response) => {
  try {
    let [username, domain] = extractHandles(req.params.account);
    if (domain == null) domain = req.app.get("localDomain");

    const webfingerTarget = await getWebfinger(`acct:${username}@${domain}`);
    const selfTarget: any[] = webfingerTarget.links.filter((link: any) => {
      return link.rel == "self";
    });

    const targetId = selfTarget[0].href;
    res.status(200).send(await getActorInfo(targetId));
  } catch {
    res.sendStatus(404);
  }
});
