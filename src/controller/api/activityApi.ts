import { AP } from "activitypub-core-types";
import { Request, Response, Router } from "express";
import {
  activityAlreadyExists,
  extractHandles,
  getActorInfo,
  save,
  sendSignedRequest,
} from "../../utils";
import {
  createDislikeActivity,
  createFollowActivity,
  createLikeActivity,
  createNoteObject,
  wrapObjectInActivity,
} from "../../utils-json";

export const activityApiRouter = Router();
const router = Router();
activityApiRouter.use("/activity", router);

/**
 * Creates, saves and sends a note activity
 *
 * @requestParam account - username and domain of the user (@username@domain)
 * @requestBody content - content of the note
 * @requestBody name - title/name of the note
 * @requestBody addressedTo - array of inboxes to send. If empty, address to public
 */
router.post("/:account/create/note", async (req: Request, res: Response) => {
  try {
    const content: string = req.body.content;
    const name: string = req.body.name;
    const bto: string[] = req.body.bto ? req.body.bto : [];
    const to: string[] = req.body.to
      ? req.body.to
      : ["https://www.w3.org/ns/activitystreams#Public"];
    const [username, domain] = extractHandles(req.params.account);

    const note = createNoteObject(name, content, username, domain, bto, to);
    const create = await wrapObjectInActivity(
      AP.ActivityTypes.CREATE,
      note,
      username,
      domain
    );

    for (let inbox of to.concat(bto)) {
      sendSignedRequest(
        new URL(inbox),
        "POST",
        create,
        domain,
        req.params.username
      );
    }

    save(AP.ActivityTypes.CREATE, JSON.parse(JSON.stringify(create)))
      .then(() => res.status(200).send(create))
      .catch((e) => res.status(500).send(e));
  } catch (e) {
    res.status(500).send(e);
  }
});

/**
 * Creates, saves and sends a follow activity
 *
 * @requestParam account - username and domain of the user
 * @requestBody targetId - id of the target user to follow
 */
router.post("/:account/follow", async (req: Request, res: Response) => {
  const [username, domain] = extractHandles(req.params.account);
  const targetId = req.body.targetId;

  const follow = await createFollowActivity(username, domain, targetId);

  if (await activityAlreadyExists(follow)) {
    res.status(409).send("Activity already exists");
    return;
  }

  if (
    targetId.toString().includes("/u/") &&
    targetId.toString().split("/u/")[0].includes(domain)
  ) {
    save(AP.ActivityTypes.FOLLOW, JSON.parse(JSON.stringify(follow)))
      .then(() => res.sendStatus(200))
      .catch((e) => {
        console.log(e);
        res.sendStatus(500);
      });

    return;
  }

  const response = await sendSignedRequest(
    <URL>(follow.object as any).inbox,
    "POST",
    follow,
    domain,
    username
  );

  if (response.ok) {
    save(AP.ActivityTypes.FOLLOW, JSON.parse(JSON.stringify(follow)))
      .then(() => res.sendStatus(200))
      .catch((e) => {
        console.log(e);
        res.sendStatus(500);
      });
  }
});

/**
 * Likes an activity
 *
 * @requestParam account - username and domain of the user (@username@domain)
 */
router.post("/:account/like", async (req: Request, res: Response) => {
  const [username, domain] = extractHandles(req.params.account);
  const activity = <AP.Activity>req.body.activity;

  const object = (activity as any).object;
  const actor = activity.actor as AP.Person;
  const like = await createLikeActivity(username, domain, object);

  if (await activityAlreadyExists(like)) {
    res.status(409).send("Activity already exists");
    return;
  }

  if (
    actor.id.toString().includes("/u/") &&
    actor.id.toString().split("/u/")[0].includes(domain)
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
 * @requestParam account - username and domain of the user (@username@domain)
 */
router.post("/:account/dislike", async (req: Request, res: Response) => {
  const [username, domain] = extractHandles(req.params.account);
  const activity = <AP.Activity>req.body.activity;

  if (await activityAlreadyExists(activity)) {
    res.status(409).send("Activity already exists");
    return;
  }

  const object = (activity as any).object;
  const actor = activity.actor as AP.Person;
  const dislike = await createDislikeActivity(username, domain, object);

  if (
    actor.id.toString().includes("/u/") &&
    actor.id.toString().split("/u/")[0].includes(domain)
  ) {
    save(AP.ActivityTypes.DISLIKE, JSON.parse(JSON.stringify(dislike)))
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
    dislike,
    domain,
    username
  );

  if (response.ok)
    save(AP.ActivityTypes.DISLIKE, JSON.parse(JSON.stringify(dislike)))
      .then(() => res.sendStatus(200))
      .catch((e) => {
        console.log(e);
        res.sendStatus(500);
      });
  else res.sendStatus(response.status);
});
