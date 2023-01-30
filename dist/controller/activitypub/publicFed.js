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
exports.publicFedRouter = void 0;
const activitypub_core_types_1 = require("activitypub-core-types");
const express_1 = require("express");
const user_service_1 = require("../../service/user.service");
const utils_1 = require("../../utils");
exports.publicFedRouter = (0, express_1.Router)();
const router = (0, express_1.Router)();
exports.publicFedRouter.use("/public", router);
router.get("/inbox", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(yield (0, utils_1.list)(activitypub_core_types_1.AP.ActivityTypes.CREATE));
}));
router.post("/inbox", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("sharedInbox");
    (0, user_service_1.inbox)(req, res);
}));
//# sourceMappingURL=publicFed.js.map