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
exports.actorFedRouter = (0, express_1.Router)();
exports.actorFedRouter.get("/u/:username/actor.json", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const domain = req.app.get("domain");
    res.send(yield (0, utils_1.search)("actor", "id", `https://${domain}/u/${req.params.username}`));
}));
exports.actorFedRouter.get("/u/:username/outbox", (req, res) => {
    res.send({ dvklsn: req.params.username });
});
//# sourceMappingURL=actorFed.js.map