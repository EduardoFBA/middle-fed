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
exports.timelineFedRouter = void 0;
const express_1 = require("express");
exports.timelineFedRouter = (0, express_1.Router)();
const router = (0, express_1.Router)();
exports.timelineFedRouter.use("/timeline", router);
/**
 * Gets an activity
 * @param {AP.ActivityType} activityType - type of activity
 * @param activityId - id of the activity to get
 */
router.get("/following/:username", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //   const followers = await getFollowers(req.params.username);
    //   const outboxes:URL[] = followers.map(x=>x.outbox as URL);
    //   for (const outbox of outboxes) {
    //     sendSignedRequest(inbox, "GET")
    //   }
    return [];
}));
//# sourceMappingURL=timelineApi.js.map