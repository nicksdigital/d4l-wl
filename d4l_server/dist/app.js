"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const swagger_1 = __importDefault(require("@fastify/swagger"));
const swagger_ui_1 = __importDefault(require("@fastify/swagger-ui"));
const static_1 = __importDefault(require("./plugins/static"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const analytics_1 = require("./analytics");
const config_1 = __importDefault(require("./config"));
// Create Fastify instance
const server = (0, fastify_1.default)({
    logger: true
});
// Register plugins
async function registerPlugins() {
    // CORS
    await server.register(cors_1.default, {
        origin: true,
        credentials: true
    });
    // JWT
    await server.register(jwt_1.default, {
        secret: config_1.default.jwt.secret
    });
    // Static files for admin frontend
    await server.register(static_1.default);
    // Swagger
    await server.register(swagger_1.default, {
        swagger: {
            info: {
                title: 'D4L API',
                description: 'API for D4L SoulStream Protocol',
                version: '1.0.0'
            },
            host: `${config_1.default.server.host}:${config_1.default.server.port}`,
            schemes: ['http', 'https'],
            consumes: ['application/json'],
            produces: ['application/json'],
            securityDefinitions: {
                bearerAuth: {
                    type: 'apiKey',
                    name: 'Authorization',
                    in: 'header'
                }
            }
        }
    });
    await server.register(swagger_ui_1.default, {
        routePrefix: '/documentation',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: false
        }
    });
}
// Register routes
async function registerRoutes() {
    // Health check
    server.get('/health', async () => {
        return { status: 'ok' };
    });
    // Auth routes
    server.register(auth_routes_1.default, { prefix: '/api/auth' });
    // Admin API routes
    server.register(admin_routes_1.default, { prefix: '/api/admin' });
}
// Start server
async function start() {
    try {
        await registerPlugins();
        await registerRoutes();
        // Initialize analytics module
        await (0, analytics_1.initializeAnalytics)(server);
        await server.listen({
            port: config_1.default.server.port,
            host: config_1.default.server.host
        });
        console.log(`Server listening on ${config_1.default.server.host}:${config_1.default.server.port}`);
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
}
// Start the server if this file is run directly
if (require.main === module) {
    start();
}
exports.default = server;
//# sourceMappingURL=app.js.map