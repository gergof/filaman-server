import { FastifyRequest, FastifyReply } from 'fastify';

const forbiddenHelper = (req: FastifyRequest, resp: FastifyReply): void => {
	resp.status(403);
	resp.send({ status: 403, error: 'Forbidden' });
};

export default forbiddenHelper;
