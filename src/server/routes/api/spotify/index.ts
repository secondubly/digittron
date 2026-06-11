// import type { FastifyPluginAsync } from 'fastify'
// import { getToken, handleCallback } from '../../../controllers/spotify.js'
// import {
//     callbackQuerySchema,
//     getTokenParamsSchema,
// } from 'src/server/schemas/spotify.js'

// const plugin: FastifyPluginAsync = async (fastify) => {
//     fastify.get(
//         '/token/:id',
//         {
//             schema: {
//                 params: getTokenParamsSchema,
//                 response: {
//                     200: {
//                         type: 'string',
//                     },
//                 },
//             },
//         },
//         getToken,
//     )

//     fastify.get(
//         '/callback',
//         {
//             schema: {
//                 querystring: callbackQuerySchema,
//             },
//         },
//         handleCallback,
//     )
// }

// export default plugin
