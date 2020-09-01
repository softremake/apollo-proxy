/**
 * apollo graphql server to test apollo-proxy
 */

const http = require('http')

const express = require('express')

const { gql, ApolloServer } = require('apollo-server-express')

// see .env in root
const backendPort = process.env.APOLLO_PORT
const apiPath = process.env.APOLLO_PATH

const app = express()

// simple query, we return the value of param
const typeDefs = gql`
          type Query {
            test(
              param: String
            ): String!
          }
        `
const resolvers = {
    test: async (_, { param }) => {
        return param
    },
}

const server = new ApolloServer({ typeDefs, resolvers: { Query: resolvers }, playground: true })
server.applyMiddleware({ app, path: apiPath })

app.use('/', async (request, response, next) => {
    if (request.url === '/') {
        response.writeHead(200) // for start-server-and-test to work properly
        response.end()
    } else {
        next()
    }
})

const httpSrv = http.createServer(app)

httpSrv.listen(backendPort)
