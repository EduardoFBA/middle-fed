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
Object.defineProperty(exports, "__esModule", { value: true });
exports.userFedRouter = void 0;
const activitypub_core_types_1 = require("activitypub-core-types");
const crypto_1 = require("crypto");
const express_1 = require("express");
const utils_1 = require("../../utils");
exports.userFedRouter = (0, express_1.Router)();
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
exports.userFedRouter.get("/u/:username", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const isJson = req.params.username.endsWith(".json");
    const username = isJson
        ? req.params.username.slice(0, -5)
        : req.params.username;
    const result = yield (0, utils_1.search)("actor", "preferredUsername", username);
    if (!result.length)
        res.send({ error: "no account found" });
    else {
        if (isJson) {
            res.send(result[0]);
        }
        else {
            res.sendFile("user.html", { root: "src/view" }, (err) => {
                if (err)
                    res.send(err);
            });
        }
    }
}));
exports.userFedRouter.get("/u/:username.json", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, utils_1.search)("actor", "preferredUsername", req.params.username);
    if (result.length)
        res.send(result[0]);
    else
        res.send({ error: "no account found json" });
}));
exports.userFedRouter.get("/u/:username/followers", (req, res) => {
    res.send({ dvklsn: req.params.username });
});
exports.userFedRouter.get("/u/:username/inbox", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(yield (0, utils_1.list)("inbox"));
}));
exports.userFedRouter.post("/u/:username/inbox", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("post inbox");
    const buf = yield buffer(req);
    const rawBody = buf.toString("utf8");
    const message = JSON.parse(rawBody);
    if (message.type == "Follow") {
        const followMessage = message;
        if (followMessage.id == null)
            return;
        console.log("followMessage", followMessage);
        yield (0, utils_1.save)("followers", followMessage);
        const localDomain = req.app.get("localDomain");
        const accept = {};
        accept["@context"] = "https://www.w3.org/ns/activitystreams";
        accept.type = activitypub_core_types_1.AP.ActivityTypes.ACCEPT;
        accept.id = new URL(`https://${localDomain}/${(0, crypto_1.randomUUID)()}`);
        accept.actor = new URL(`https://${localDomain}/u/${req.params.username}`);
        accept.object = followMessage;
        console.log("accept", accept);
        yield (0, utils_1.save)("accept", JSON.parse(JSON.stringify(accept)));
        const userInfo = yield (0, utils_1.getUserInfo)(followMessage.actor.toString() + ".json");
        console.log("localuserinfo", accept.actor.toString());
        const localUserInfo = yield (0, utils_1.getUserInfo)(accept.actor.toString());
        console.log("send signed request", userInfo);
        const response = yield (0, utils_1.sendSignedRequest)(userInfo.inbox, "POST", accept, localUserInfo.publicKey.id, localUserInfo.privateKey);
        console.log("response", response);
    }
    // if (message.type == "Undo") {
    //   // Undo a follow.
    //   const undoObject: AP.Undo = <AP.Undo>message;
    //   if (undoObject == null || undoObject.id == null) return;
    //   if (undoObject.object == null) return;
    //   if ("user" in undoObject.object == false && (<CoreObject>undoObject.object).type != "Follow") return;
    //   const docId = undoObject.user.toString().replace(/\//g, "_");
    //   const res = await db.collection('followers').doc(docId).delete();
    //   console.log("Deleted", res)
    res.end("inbox finish");
}));
exports.userFedRouter.get("/u/:username/outbox", (req, res) => {
    res.send({ outbox: req.params.username });
});
//# sourceMappingURL=userFed.js.map