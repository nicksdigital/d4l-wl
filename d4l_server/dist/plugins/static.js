"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const static_1 = __importDefault(require("@fastify/static"));
const path_1 = __importDefault(require("path"));
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
exports.default = (0, fastify_plugin_1.default)(async function (fastify, options) {
    // Serve admin frontend static files
    fastify.register(static_1.default, {
        root: path_1.default.join(__dirname, '../../public/admin'),
        prefix: '/admin/',
        decorateReply: false
    });
    // Serve admin frontend index.html for all admin routes
    fastify.get('/admin*', (request, reply) => {
        reply.sendFile('index.html', path_1.default.join(__dirname, '../../public/admin'));
    });
});
//# sourceMappingURL=static.js.map