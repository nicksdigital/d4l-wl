"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = adminRoutes;
const auth_1 = require("../utils/auth");
const admin_controller_1 = __importDefault(require("../controllers/admin.controller"));
const admin_controller_2 = __importDefault(require("../analytics/controllers/admin.controller"));
async function adminRoutes(fastify, options) {
    // All admin routes require JWT authentication and admin role
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
        // Dashboard stats
        fastify.get('/dashboard/stats', {
            handler: admin_controller_1.default.getDashboardStats
        });
        // Users management
        fastify.get('/users', {
            handler: admin_controller_1.default.getUsers
        });
        fastify.get('/users/:wallet', {
            schema: {
                params: {
                    type: 'object',
                    required: ['wallet'],
                    properties: {
                        wallet: { type: 'string' }
                    }
                }
            },
            handler: admin_controller_1.default.getUserDetails
        });
        fastify.post('/users/:wallet/deactivate', {
            schema: {
                params: {
                    type: 'object',
                    required: ['wallet'],
                    properties: {
                        wallet: { type: 'string' }
                    }
                }
            },
            handler: admin_controller_1.default.deactivateUser
        });
        fastify.post('/users/:wallet/reactivate', {
            schema: {
                params: {
                    type: 'object',
                    required: ['wallet'],
                    properties: {
                        wallet: { type: 'string' }
                    }
                }
            },
            handler: admin_controller_1.default.reactivateUser
        });
        // Airdrop management
        fastify.get('/airdrop/stats', {
            handler: admin_controller_1.default.getAirdropStats
        });
        fastify.get('/airdrop/claims', {
            handler: admin_controller_1.default.getAirdropClaims
        });
        fastify.post('/airdrop/add', {
            schema: {
                body: {
                    type: 'object',
                    required: ['wallet', 'amount'],
                    properties: {
                        wallet: { type: 'string' },
                        amount: { type: 'number' },
                        reason: { type: 'string' }
                    }
                }
            },
            handler: admin_controller_1.default.addAirdropAllocation
        });
        // Content management
        fastify.get('/content', {
            handler: admin_controller_1.default.getContent
        });
        fastify.get('/content/:id', {
            schema: {
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                        id: { type: 'string' }
                    }
                }
            },
            handler: admin_controller_1.default.getContentById
        });
        fastify.post('/content', {
            schema: {
                body: {
                    type: 'object',
                    required: ['title', 'slug', 'content'],
                    properties: {
                        title: { type: 'string' },
                        slug: { type: 'string' },
                        content: { type: 'string' },
                        status: { type: 'string', enum: ['published', 'draft'] }
                    }
                }
            },
            handler: admin_controller_1.default.createContent
        });
        fastify.put('/content/:id', {
            schema: {
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                        id: { type: 'string' }
                    }
                },
                body: {
                    type: 'object',
                    required: ['title', 'slug', 'content'],
                    properties: {
                        title: { type: 'string' },
                        slug: { type: 'string' },
                        content: { type: 'string' },
                        status: { type: 'string', enum: ['published', 'draft'] }
                    }
                }
            },
            handler: admin_controller_1.default.updateContent
        });
        fastify.delete('/content/:id', {
            schema: {
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                        id: { type: 'string' }
                    }
                }
            },
            handler: admin_controller_1.default.deleteContent
        });
        // Cache management
        fastify.get('/cache/keys', {
            handler: admin_controller_1.default.getCacheKeys
        });
        fastify.delete('/cache/keys/:key', {
            schema: {
                params: {
                    type: 'object',
                    required: ['key'],
                    properties: {
                        key: { type: 'string' }
                    }
                }
            },
            handler: admin_controller_1.default.deleteCacheKey
        });
        fastify.delete('/cache/flush', {
            handler: admin_controller_1.default.flushCache
        });
        // Settings management
        fastify.get('/settings', {
            handler: admin_controller_1.default.getSettings
        });
        fastify.put('/settings', {
            schema: {
                body: {
                    type: 'object',
                    properties: {
                        siteTitle: { type: 'string' },
                        siteDescription: { type: 'string' },
                        airdropEnabled: { type: 'boolean' },
                        maintenanceMode: { type: 'boolean' }
                    }
                }
            },
            handler: admin_controller_1.default.updateSettings
        });
        // Analytics routes
        fastify.get('/analytics/dashboard/stats', {
            schema: {
                querystring: {
                    type: 'object',
                    properties: {
                        period: { type: 'string', enum: ['day', 'week', 'month', 'all'] }
                    }
                }
            },
            handler: admin_controller_2.default.getDashboardStats
        });
        fastify.get('/analytics/snapshots/daily', {
            schema: {
                querystring: {
                    type: 'object',
                    required: ['startDate', 'endDate'],
                    properties: {
                        startDate: { type: 'string' },
                        endDate: { type: 'string' }
                    }
                }
            },
            handler: admin_controller_2.default.getDailySnapshots
        });
        fastify.post('/analytics/snapshots/daily', {
            schema: {
                body: {
                    type: 'object',
                    required: ['date'],
                    properties: {
                        date: { type: 'string' }
                    }
                }
            },
            handler: admin_controller_2.default.createDailySnapshot
        });
        fastify.get('/analytics/contracts/:address', {
            schema: {
                params: {
                    type: 'object',
                    required: ['address'],
                    properties: {
                        address: { type: 'string' }
                    }
                }
            },
            handler: admin_controller_2.default.getContractAnalytics
        });
        fastify.get('/analytics/contracts', {
            handler: admin_controller_2.default.getAllContracts
        });
        fastify.get('/analytics/users/:walletAddress', {
            schema: {
                params: {
                    type: 'object',
                    required: ['walletAddress'],
                    properties: {
                        walletAddress: { type: 'string' }
                    }
                }
            },
            handler: admin_controller_2.default.getUserAnalytics
        });
        fastify.get('/analytics/users', {
            handler: admin_controller_2.default.getAllUsers
        });
    });
}
//# sourceMappingURL=admin.routes.js.map