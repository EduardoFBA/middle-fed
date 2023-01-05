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
exports.wellKnownRouter = void 0;
const express_1 = require("express");
const utils_1 = require("../../utils");
exports.wellKnownRouter = (0, express_1.Router)();
exports.wellKnownRouter.get("/webfinger", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.query.resource) {
        res.send(yield (0, utils_1.getWebfinger)(req.query.resource));
        return;
    }
    res.send({ error: "No account provided" });
}));
//# sourceMappingURL=webfinger.js.map