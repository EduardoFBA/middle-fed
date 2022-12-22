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
exports.actorFedRouter = void 0;
const express_1 = require("express");
const utils_1 = require("./utils");
const utils_json_1 = require("./utils-json");
exports.actorFedRouter = (0, express_1.Router)();
exports.actorFedRouter.get("/authorize_interaction", (req, res) => {
    console.log("authorize interaction", req.body);
    res.send((0, utils_json_1.createAcceptActivity)(`${req.params.username}@${req.app.get("localDomain")}`, req.body.target, "Follow"));
});
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
    console.log("request body", req.body);
    if (req.body) {
        yield (0, utils_1.save)("inbox", req.body);
        res.send((0, utils_json_1.createAcceptActivity)(`${req.params.username}@${req.app.get("localDomain")}`, req.body.target, "Follow"));
    }
    else {
        //error
        res.send("ERROR");
    }
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