/**
 * Example of apollo-proxy usage:
 */
import { apolloProxy } from '../src'

/**
 *
 * 1. for testing we use .env file and dotenv-cli
 *
 * 2. Apollo server is defined in test/startServer.js, see package.json test
 * script: `dotenv cross-var start-server-and-test start-server http://localhost:%APOLLO_PORT% jest-test`
 *
 * 3. Apollo client is defined below, as well as apolloProxy interceptor
 *
 */
import {gql, HttpLink, InMemoryCache} from 'apollo-boost'
import { ApolloClient } from 'apollo-client'
import fetch from 'isomorphic-unfetch'

// see .env file in the root
const backendPort = process.env.APOLLO_PORT
const proxyPort = parseInt(process.env.PROXY_PORT)
const apiPath = process.env.APOLLO_PATH

describe('Apollo proxy', () => {
    it('can intercept graphql', async () => {
        const checkString = 'proxyfied'

        // define the interceptor
        const proxy = await apolloProxy(proxyPort, (req, res, options, data) => {
            // where we redirect graphql requests
            options.protocol = 'http:'
            options.host = 'localhost'
            options.port = backendPort

            // changing graphql variables
            data.variables.param = checkString
        })

        // testing client
        const client = new ApolloClient({
            cache: new InMemoryCache(),
            link: new HttpLink({ uri: `http://localhost:${proxyPort}${apiPath}`, fetch }),
        })

        // simple query, we return the value of param
        const query = gql`
              query test($param: String!) {
                test(param: $param)
              }
        `
        const variables = {
            param: 'it has to change'
        }
        const opts = {
            query,
            variables
        }

        const r = await client.query(opts)

        // check that the param was changed at proxy
        expect(r && r.data && r.data.test && r.data.test === checkString).toBeTruthy()

        proxy.close()
    })
})
