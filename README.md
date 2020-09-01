Apollo GraphQL lightweight proxy, so you can intercept 
a call and do something useful: logging, variables changing e.t.c.
 
 Usage:
 ```
 npm i git+https://github.com/softremake/apollo-proxy.git
```

```
import { apolloProxy } from 'apollo-proxy'
 
await apolloProxy(proxyPort, (req, res, options, data) => {
            // where we redirect graphql requests
            options.protocol = 'http:'
            options.host = 'localhost'
            options.port = backendPort

            // changing graphql variables
            data.variables.param = 'proxyfied'
        })

```

see also [test/mainTst.ts](https://github.com/softremake/apollo-proxy/blob/master/test/mainTst.ts) for an example.
