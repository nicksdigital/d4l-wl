"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authRoutes;
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const auth_1 = require("../utils/auth");
async function authRoutes(fastify, options) {
    // Admin login route
    fastify.post('/admin/login', {
        schema: {
            body: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                    username: { type: 'string' },
                    password: { type: 'string' }
                }
            }
        },
        handler: auth_controller_1.default.adminLogin
    });
    // Public routes
    fastify.post('/register', {
        schema: {
            body: {
                type: 'object',
                required: ['username', 'email', 'deadline', 'signature'],
                properties: {
                    username: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    deadline: { type: 'number' },
                    signature: { type: 'string' }
                }
            }
        },
        handler: auth_controller_1.default.register
    });
    fastify.post('/login', {
        schema: {
            body: {
                type: 'object',
                required: ['deadline', 'signature'],
                properties: {
                    deadline: { type: 'number' },
                    signature: { type: 'string' }
                }
            }
        },
        handler: auth_controller_1.default.login
    });
    fastify.get('/signing-info', {
        handler: auth_controller_1.default.getSigningInfo
    });
    fastify.get('/username-available/:username', {
        schema: {
            params: {
                type: 'object',
                required: ['username'],
                properties: {
                    username: { type: 'string' }
                }
            }
        },
        handler: auth_controller_1.default.isUsernameAvailable
    });
    fastify.get('/email-available/:email', {
        schema: {
            params: {
                type: 'object',
                required: ['email'],
                properties: {
                    email: { type: 'string', format: 'email' }
                }
            }
        },
        handler: auth_controller_1.default.isEmailAvailable
    });
    // Protected routes (require JWT)
    fastify.register(async (fastify) => {
        // Apply JWT verification to all routes in this context
        fastify.addHook('preHandler', auth_1.verifyJWT);
        fastify.post('/logout', {
            schema: {
                body: {
                    type: 'object',
                    required: ['sessionId'],
                    properties: {
                        sessionId: { type: 'string' }
                    }
                }
            },
            handler: auth_controller_1.default.logout
        });
        fastify.post('/validate-session', {
            schema: {
                body: {
                    type: 'object',
                    required: ['wallet', 'sessionId'],
                    properties: {
                        wallet: { type: 'string' },
                        sessionId: { type: 'string' }
                    }
                }
            },
            handler: auth_controller_1.default.validateSession
        });
        fastify.get('/user/:wallet', {
            schema: {
                params: {
                    type: 'object',
                    required: ['wallet'],
                    properties: {
                        wallet: { type: 'string' }
                    }
                }
            },
            handler: auth_controller_1.default.getUser
        });
        fastify.get('/session/:sessionId', {
            schema: {
                params: {
                    type: 'object',
                    required: ['sessionId'],
                    properties: {
                        sessionId: { type: 'string' }
                    }
                }
            },
            handler: auth_controller_1.default.getSession
        });
        fastify.get('/wallet-by-username/:username', {
            schema: {
                params: {
                    type: 'object',
                    required: ['username'],
                    properties: {
                        username: { type: 'string' }
                    }
                }
            },
            handler: auth_controller_1.default.getWalletByUsername
        });
        fastify.get('/wallet-by-email/:email', {
            schema: {
                params: {
                    type: 'object',
                    required: ['email'],
                    properties: {
                        email: { type: 'string', format: 'email' }
                    }
                }
            },
            handler: auth_controller_1.default.getWalletByEmail
        });
        fastify.get('/active-sessions/:wallet', {
            schema: {
                params: {
                    type: 'object',
                    required: ['wallet'],
                    properties: {
                        wallet: { type: 'string' }
                    }
                }
            },
            handler: auth_controller_1.default.getActiveSessions
        });
    });
    // Admin routes (require JWT and admin role)
    fastify.register(async (fastify) => {
        // Apply JWT verification and admin check to all routes in this context
        fastify.addHook('preHandler', auth_1.verifyJWT);
        fastify.addHook('preHandler', async (request, reply) => {
            // Check if user has admin role
            if (!request.user.isAdmin) {
                return reply.code(403).send({
                    success: false,
                    error: 'Forbidden: Admin access required'
                });
            }
        });
        fastify.post('/deactivate-user/:wallet', {
            schema: {
                params: {
                    type: 'object',
                    required: ['wallet'],
                    properties: {
                        wallet: { type: 'string' }
                    }
                }
            },
            handler: auth_controller_1.default.deactivateUser
        });
        fastify.post('/reactivate-user/:wallet', {
            schema: {
                params: {
                    type: 'object',
                    required: ['wallet'],
                    properties: {
                        wallet: { type: 'string' }
                    }
                }
            },
            handler: auth_controller_1.default.reactivateUser
        });
    });
}
//# sourceMappingURL=auth.routes.js.map