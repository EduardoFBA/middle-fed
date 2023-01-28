import { AP } from "activitypub-core-types";
import { Request, Response, Router } from "express";
import { getFollowersActivity, inbox } from "../../service/user.service";
import { searchByField } from "../../utils";

export const userFedRouter = Router();
const router = Router();
userFedRouter.use("/u", router);

/**
 * Gets user's page or info as JSON
 * @param username
 */
router.get("/:username", async (req: Request, res: Response) => {
  //HACK: should be using Accept header instead of url ending in '.json'
  const isJson =
    req.headers.accept ==
    "application/ld+json; profile='https://www.w3.org/ns/activitystreams'";
  const username = isJson
    ? req.params.username.slice(0, -5)
    : req.params.username;

  const result = await searchByField(
    AP.ActorTypes.PERSON,
    "preferredUsername",
    username
  );
  if (!result.length) res.send({ error: "no account found" });
  else {
    if (isJson) {
      res.send(result[0]);
    } else {
      res.sendFile("user.html", { root: "src/view" }, (err) => {
        if (err) res.send(err);
      });
    }
  }
});

/**
 * Gets user's followers list
 * @param username
 */
router.get("/:username/followers", async (req: Request, res: Response) => {
  res.send(
    await searchByField(
      AP.ActivityTypes.FOLLOW,
      "object",
      `https://middle-fed.onrender.com/u/${req.params.username}`
    )
  );
});

/**
 * Gets user's following list
 * @param username
 */
router.get("/:username/following", async (req: Request, res: Response) => {
  res.send(await getFollowersActivity(req.params.username));
});

/**
 * Posts on the user's inbox
 * @param username
 * @requires activity - body should have an activity to be posted
 */
router.post("/:username/inbox", async (req: Request, res: Response) => {
  inbox(req, res);
});
