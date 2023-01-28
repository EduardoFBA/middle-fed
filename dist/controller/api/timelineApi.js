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
exports.timelineApiRouter = void 0;
const express_1 = require("express");
const timeline_service_1 = require("../../service/timeline.service");
const user_service_1 = require("../../service/user.service");
const utils_1 = require("../../utils");
exports.timelineApiRouter = (0, express_1.Router)();
const router = (0, express_1.Router)();
exports.timelineApiRouter.use("/timeline", router);
/**
 * Gets user's posts
 * @param account - account to filter (@username@domain)
 */
router.get("/user/:account", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [username, domain] = (0, utils_1.extractHandles)(req.params.account);
    const userQuery = new utils_1.Query(`https://${domain}/u/${username}`);
    userQuery.fieldPath = "actor";
    res.send(yield (0, timeline_service_1.getNotes)(userQuery));
}));
/**
 * Gets user's following's posts
 * @param account - account to filter (@username@domain)
 */
router.get("/following/:account", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [username, _] = (0, utils_1.extractHandles)(req.params.account);
    const followers = yield (0, user_service_1.getFollowers)(username);
    const queries = [];
    for (const follower of followers) {
        const query = new utils_1.Query(follower.id.toString());
        query.fieldPath = "actor";
        queries.push(query);
    }
    res.send(yield (0, timeline_service_1.getNotes)(...queries));
}));
/**
 * Gets public posts
 */
router.get("/public", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = new utils_1.Query(["https://www.w3.org/ns/activitystreams#Public"]);
    query.fieldPath = "to";
    res.send(yield (0, timeline_service_1.getNotes)(query));
}));
//# sourceMappingURL=timelineApi.js.map