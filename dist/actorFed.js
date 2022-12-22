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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.actorFedRouter = void 0;
const crypto_1 = require("crypto");
const express_1 = require("express");
const utils_1 = require("./utils");
const utils_json_1 = require("./utils-json");
const node_fetch_1 = __importDefault(require("node-fetch"));
exports.actorFedRouter = (0, express_1.Router)();
exports.actorFedRouter.get("/authorize_interaction", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const buf = yield buffer(req);
    const rawBody = buf.toString("utf8");
    console.log("authorize interaction", rawBody);
    res.send((0, utils_json_1.createAcceptActivity)(`${req.params.uri}@${req.app.get("localDomain")}`, req.body.target, "Follow"));
}));
function buffer(readable) {
    var readable_1, readable_1_1;
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
        const chunks = [];
        try {
            for (readable_1 = __asyncValues(readable); readable_1_1 = yield readable_1.next(), !readable_1_1.done;) {
                const chunk = readable_1_1.value;
                chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (readable_1_1 && !readable_1_1.done && (_a = readable_1.return)) yield _a.call(readable_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return Buffer.concat(chunks);
    });
}
exports.actorFedRouter.get("/u/:username", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const domain = req.app.get("localDomain");
    const result = yield (0, utils_1.search)("actor", "id", `https://${domain}/u/${req.params.username}`);
    if (result.length) {
        res.send(result[0]);
    }
    else
        throw "No account found";
}));
exports.actorFedRouter.get("/u/:username/followers", (req, res) => {
    res.send({ dvklsn: req.params.username });
});
exports.actorFedRouter.get("/u/:username/inbox", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(yield (0, utils_1.list)("inbox"));
}));
exports.actorFedRouter.post("/u/:username/inbox", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("post inbox");
    const buf = yield buffer(req);
    const rawBody = buf.toString("utf8");
    const message = JSON.parse(rawBody);
    // const message: AP.Activity = <AP.Activity>req.body;
    if (message.type == "Follow") {
        const followMessage = message;
        if (followMessage.id == null)
            return;
        // const collection = db.collection('followers');
        // const actorID = (<URL>followMessage.actor).toString();
        // const followDocRef = collection.doc(actorID.replace(/\//g, "_"));
        // const followDoc = await followDocRef.get();
        // if (followDoc.exists) {
        //   console.log("Already Following")
        //   return res.end('already following');
        // }
        console.log("followMessage", followMessage);
        yield (0, utils_1.save)("followers", followMessage);
        const localDomain = req.app.get("localDomain");
        const acceptRequest = {
            "@context": "https://www.w3.org/ns/activitystreams",
            id: `https://${localDomain}/${(0, crypto_1.randomUUID)()}`,
            type: "Accept",
            actor: `https://${localDomain}/u/${req.params.username}`,
            object: followMessage,
        };
        // const accept = createAcceptActivity(
        //   `${req.params.username}@${req.app.get("localDomain")}`,
        //   req.body.target,
        //   "Follow"
        // );
        console.log("accept", acceptRequest);
        yield (0, utils_1.save)("accept", acceptRequest);
        const actorInfo = yield (0, utils_1.getActorInfo)(followMessage.actor.toString());
        yield (0, node_fetch_1.default)(actorInfo.inbox, {
            method: "POST",
            body: JSON.stringify(acceptRequest),
        });
        res.end();
    }
    // if (message.type == "Undo") {
    //   // Undo a follow.
    //   const undoObject: AP.Undo = <AP.Undo>message;
    //   if (undoObject == null || undoObject.id == null) return;
    //   if (undoObject.object == null) return;
    //   if ("actor" in undoObject.object == false && (<CoreObject>undoObject.object).type != "Follow") return;
    //   const docId = undoObject.actor.toString().replace(/\//g, "_");
    //   const res = await db.collection('followers').doc(docId).delete();
    //   console.log("Deleted", res)
}));
exports.actorFedRouter.get("/u/:username/outbox", (req, res) => {
    res.send({ outbox: req.params.username });
});
exports.actorFedRouter.get("/.well-known/webfinger", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.query.resource) {
        const domain = req.app.get("localDomain");
        res.send(yield (0, utils_1.getWebfinger)(req.query.resource, domain));
        return;
    }
    throw "No account provided";
}));
//# sourceMappingURL=actorFed.js.map