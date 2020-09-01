import { IncomingMessage, RequestOptions, Server, ServerResponse } from 'http'
import * as http from 'http'

/**
 * @param request standard http request
 * @param response standard http response
 * @param options URL structure, method and headers
 * @param data parsed post body
 * @returns optional, we can return true if we don't want a request to be sent further
 */
type OnRequestCallback = (
    request: IncomingMessage,
    response: ServerResponse,
    options: RequestOptions,
    data
) => void | Boolean

/**
 * Apollo GraphQL lightweight proxy, so you can intercept a call and
 * do something: logging, variables changing e.t.c
 *
 * Usage:
 * ```
 * npm i
 * import { apolloProxy } from 'apollo-proxy'
 *
 * await apolloProxy(proxyPort, (req, res, options, data) => {
            // where we redirect graphql requests
            options.protocol = 'http:'
            options.host = 'localhost'
            options.port = backendPort

            // changing graphql variables
            data.variables.param = 'proxyfied'
        })
 *
 * ```
 *
 * see also test/mainTst.ts for an example.
 *
 * @param port port number proxy listens to
 * @param onRequest see [[OnRequestCallback]]
 */
export const apolloProxy = async (port: number, onRequest: OnRequestCallback): Promise<Server> => {
    return (new ApolloProxy(port, onRequest)).start()
}

export class ApolloProxy {
    constructor(
        protected port: number,
        protected onRequest: OnRequestCallback
    ) {
    }

    public start = async (): Promise<Server> => {
        return http.createServer(async (request, response) => {
            const postBody = []

            request.on('data', (data) => {
                postBody.push(data)
            })

            request.on('end', () => {
                if (this.onRequest) {
                    const reqUrl = new URL(this.fullUrl(request))
                    const options: RequestOptions = {
                        protocol: reqUrl.protocol,
                        host: reqUrl.host,
                        hostname: reqUrl.hostname,
                        port: reqUrl.port,
                        path: reqUrl.pathname,
                        headers: request.headers,
                        method: request.method
                    }

                    const data = JSON.parse(postBody.join(''))

                    const stop = this.onRequest(request, response, options, data)

                    if(!stop) {
                        const newBody = JSON.stringify(data)
                        options.headers['content-length'] = newBody.length

                        const connector = http.request(options, (proxyRes) => {
                            proxyRes.pipe(response)
                            response.writeHead(proxyRes.statusCode, proxyRes.headers)
                        })

                        connector.on('error', function(err) {
                            response.writeHead(500)
                            response.end()
                        })

                        connector.write(newBody)
                        connector.end()
                    }
                }
            })
        }).listen(this.port)
    }

    protected fullUrl(request) {
        // updated from https://github.com/michaelrhodes/full-url/blob/master/index.js
        const secure = (request.connection && request.connection.encrypted) || request.headers['x-forwarded-proto'] === 'https'
        return 'http' + (secure ? 's' : '') + '://' +
            request.headers.host +
            request.url
    }
}

