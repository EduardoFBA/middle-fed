"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authApiRouter = void 0;
const express_1 = require("express");
exports.authApiRouter = (0, express_1.Router)();
const router = (0, express_1.Router)();
exports.authApiRouter.use("/auth", router);
//TODO: create authentication for users and replace endpoints with :username params to get said username from bearer token
//# sourceMappingURL=authApi.js.map