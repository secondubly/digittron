import fastify from "fastify";
export const init = (port) => {
    console.log(`Iniitializing api on port ${port}`);
    const server = fastify({ logger: true });
    server.get('/ping', async (_request, _reply) => {
        return 'pong\n';
    });
    return server.listen({ port }, (err, address) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log(`API server listening at ${address}`);
    });
};
if (import.meta.main) {
    const port = process.env.API_PORT ?? '4001';
    init(parseInt(port));
}
//# sourceMappingURL=index.js.map