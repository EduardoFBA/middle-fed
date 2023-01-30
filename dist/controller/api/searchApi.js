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
exports.searchApiRouter = void 0;
const express_1 = require("express");
const utils_1 = require("../../utils");
exports.searchApiRouter = (0, express_1.Router)();
const router = (0, express_1.Router)();
exports.searchApiRouter.use("/search", router);
/**
 * Searches user
 */
router.get("/user/:account", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let [username, domain] = (0, utils_1.extractHandles)(req.params.account);
        if (domain == null)
            domain = req.app.get("localDomain");
        const webfingerTarget = yield (0, utils_1.getWebfinger)(`acct:${username}@${domain}`);
        const selfTarget = webfingerTarget.links.filter((link) => {
            return link.rel == "self";
        });
        const targetId = selfTarget[0].href;
        res.status(200).send(yield (0, utils_1.getActorInfo)(targetId));
    }
    catch (_a) {
        res.sendStatus(404);
    }
}));
//# sourceMappingURL=searchApi.js.map