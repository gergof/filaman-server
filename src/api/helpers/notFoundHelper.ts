import { FastifyRequest, FastifyReply } from 'fastify';

const notFoundHelper = (req: FastifyRequest, resp: FastifyReply): void => {
	resp.status(404);
	resp.send({ status: 404, error: 'Not found' });
};

export default notFoundHelper;
