import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { merge } from 'lodash-es'
import { readdirSync, readFileSync } from 'node:fs'
import compression from 'compression'
import cors from 'cors'
import Docker from 'dockerode'
import express from 'express'
import favicon from 'serve-favicon'
import http from 'node:http'
import path from 'node:path'
import scalarDate from './graph/scalars/date.js'
import scalarJSON from './graph/scalars/json.js'

const PROJECT_ROOT = path.resolve(process.cwd(), '..')
const SERVER_PORT = 3000

// Load App Data

const APPDATA = JSON.parse(readFileSync(path.join(PROJECT_ROOT, 'server/data.json'), 'utf8'))
global.APPDATA = APPDATA

// Connect to Docker

const DKR = new Docker({ socketPath: '/var/run/docker.sock' })
global.DKR = DKR

// Express App

const app = express()
app.use(compression())

// Apply Security Options

app.use((req, res, next) => {
  req.app.disable('x-powered-by')
  res.set('Referrer-Policy', 'same-origin')
  res.set('X-Content-Type-Options', 'nosniff')
  res.set('X-Frame-Options', 'deny')
  res.set('X-UA-Compatible', 'IE=edge')
  res.set('X-XSS-Protection', '1; mode=block')
  req.url = req.url.replace(/(\/)(?=\/*\1)/g, '')
  next()
})

// Public Assets

app.use(favicon(path.join(PROJECT_ROOT, 'dist', 'favicon.ico')))
app.use(express.static(path.join(PROJECT_ROOT, 'dist'), {
  index: false,
  maxAge: '7d'
}))

// GraphQL Resolvers

console.info(`Loading GraphQL Resolvers...`)
let resolvers = {
  Date: scalarDate,
  JSON: scalarJSON
}
const resolversList = readdirSync(path.join(PROJECT_ROOT, 'server/graph/resolvers'))
for (const r of resolversList) {
  merge(resolvers, (await import(path.join(PROJECT_ROOT, `server/graph/resolvers/${r}`))).default)
}

// GraphQL Server

console.info('Initializing GraphQL Server...')
const gqlServer = new ApolloServer({
  typeDefs: readFileSync(path.join(PROJECT_ROOT, 'server/graph/schema.graphql'), 'utf8'),
  resolvers,
  allowBatchedHttpRequests: true
})
await gqlServer.start()

app.use('/graphql', cors(), express.json(), expressMiddleware(gqlServer))

// Serve HTML Index

app.use((req, res, next) => {
  res.sendFile(path.join(PROJECT_ROOT, 'dist/index.html'))
})

// Error Fallback

app.use((err, req, res, next) => {
  if (req.path === '/graphql') {
    res.status(err.status || 500).json({
      data: {},
      errors: [{
        message: err.message,
        path: []
      }]
    })
  } else {
    console.warn(err)
    res.status(err.status || 500).send(err.message)
  }
})

// Start HTTP Server

console.info(`Starting HTTP Server on port ${SERVER_PORT}...`)
const httpServer = http.createServer(app)

httpServer.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error
  }

  switch (error.code) {
    case 'EACCES':
      console.error('Listening on port ' + SERVER_PORT + ' requires elevated privileges!')
      return process.exit(1)
    case 'EADDRINUSE':
      console.error('Port ' + SERVER_PORT + ' is already in use!')
      return process.exit(1)
    default:
      throw error
  }
})

httpServer.on('listening', () => {
  console.info('HTTP Server: [ RUNNING ]')
})

httpServer.listen(SERVER_PORT, '0.0.0.0')
