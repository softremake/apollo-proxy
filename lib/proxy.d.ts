/// <reference types="node" />
import { IncomingMessage, RequestOptions, Server, ServerResponse } from 'http';
/**
 * @param request standard http request
 * @param response standard http response
 * @param options URL structure, method and headers
 * @param data parsed post body
 * @returns optional, we can return true if we don't want a request to be sent further
 */
declare type OnRequestCallback = (request: IncomingMessage, response: ServerResponse, options: RequestOptions, data: any) => void | Boolean;
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
export declare const apolloProxy: (port: number, onRequest: OnRequestCallback) => Promise<Server>;
export declare class ApolloProxy {
    protected port: number;
    protected onRequest: OnRequestCallback;
    constructor(port: number, onRequest: OnRequestCallback);
    start: () => Promise<Server>;
    protected fullUrl(request: any): string;
}
export {};
