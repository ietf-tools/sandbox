import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'
import { boot } from "quasar/wrappers"

export default boot(({ app }) => {
  const httpLink = createHttpLink({
    uri: '/graphql',
  })

  const cache = new InMemoryCache()

  const apolloClient = new ApolloClient({
    link: httpLink,
    cache
  })

  window.APOLLO_CLIENT = apolloClient
})
