"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wellKnownRoutes = exports.fedRoutes = exports.apiRoutes = void 0;
const express_1 = require("express");
const userApi_1 = require("./api/userApi");
const userFed_1 = require("./activitypub/userFed");
const webfinger_1 = require("./well-known/webfinger");
exports.apiRoutes = (0, express_1.Router)();
exports.apiRoutes.use(userApi_1.userApiRouter);
exports.fedRoutes = (0, express_1.Router)();
exports.fedRoutes.use(userFed_1.userFedRouter);
exports.wellKnownRoutes = (0, express_1.Router)();
webfinger_1.wellKnownRouter.use(webfinger_1.wellKnownRouter);
//# sourceMappingURL=routes.js.map