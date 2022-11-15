import { Request, Response, Router } from "express";

export const noteApiRouter = Router();

noteApiRouter.get("/note/send", (req: Request, res: Response) => {
  const note: string = req.body.note;
  const url: string = req.body.url;

  const not = {
    "@context": "https://www.w3.org/ns/activitystreams",
    type: "Create",
    id: "https://chatty.example/ben/p/51086",
    to: ["https://social.example/alyssa/"],
    actor: "https://chatty.example/ben/",
    object: {
      type: "Note",
      id: "https://chatty.example/ben/p/51085",
      attributedTo: "https://chatty.example/ben/",
      to: ["https://social.example/alyssa/"],
      inReplyTo:
        "https://social.example/alyssa/posts/49e2d03d-b53a-4c4c-a95c-94a6abf45a19",
      content:
        "<p>Argh, yeah, sorry, I'll get it back to you tomorrow.</p><p>I was reviewing the section on register machines, since it's been a while since I wrote one.</p>",
    },
  };
});
