import { Request, Response, Router } from "express";

export const noteApiRouter = Router();

noteApiRouter.get("/note/send", async (req: Request, res: Response) => {
  const note: string = req.body.note;
  const url: string = req.body.url;

  const not = {
    "@context": "https://www.w3.org/ns/activitystreams",

    id: "https://duard@middle-fed.onrender.com/first-create",
    type: "Create",
    actor: "https://middle-fed.onrender.com/u/duard",

    object: {
      id: "https://my-example.com/first-object",
      type: "Note",
      published: "2018-06-23T17:17:11Z",
      attributedTo: "https://middle-fed.onrender.com/u/duard",
      inReplyTo: "https://mastodon.social/@Gargron/100254678717223630",
      content: "<p>duard!</p>",
      to: "https://www.w3.org/ns/activitystreams#Public",
    },
  };

  // await fetch(
  //   `https://${domain}/.well-known/webfinger?resource=acct:${username}@${domain}`
  // );
});
