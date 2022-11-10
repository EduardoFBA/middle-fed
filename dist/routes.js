"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fedRoutes = exports.apiRoutes = void 0;
const express_1 = require("express");
const actorApi_1 = require("./actorApi");
const actorFed_1 = require("./actorFed");
exports.apiRoutes = (0, express_1.Router)();
exports.apiRoutes.use(actorApi_1.actorApiRouter);
exports.fedRoutes = (0, express_1.Router)();
exports.fedRoutes.use(actorFed_1.actorFedRouter);
//# sourceMappingURL=routes.js.map