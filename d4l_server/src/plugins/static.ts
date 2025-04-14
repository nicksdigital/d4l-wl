import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import fp from 'fastify-plugin';

export default fp(async function (fastify: FastifyInstance, options: FastifyPluginOptions) {
  // Serve admin frontend static files
  fastify.register(fastifyStatic, {
    root: path.join(__dirname, '../../public/admin'),
    prefix: '/admin/',
    decorateReply: false
  });

  // Serve admin frontend index.html for all admin routes
  fastify.get('/admin*', (request, reply) => {
    reply.sendFile('index.html', path.join(__dirname, '../../public/admin'));
  });
});
