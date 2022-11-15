"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.noteApiRouter = void 0;
const express_1 = require("express");
exports.noteApiRouter = (0, express_1.Router)();
exports.noteApiRouter.get("/note/send", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const note = req.body.note;
    const url = req.body.url;
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
}));
//# sourceMappingURL=noteApi.js.map