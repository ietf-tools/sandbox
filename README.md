# Sandbox Status

Status Landing Page for Sandbox Environments

https://dev.ietf.org

## Project Definitions

The list of projects to display is defined in `server/data.json`.

## Deployment

On the server, create a new container with image `ghcr.io/ietf-tools/sandbox-status:latest`\
and bind `/var/run/docker.sock` from the host to the same path inside the container.

The app listens on port `3000` by default.

## Development

### Server

Run in dev mode:

```bash
cd server
yarn
yarn dev
```

Run in production mode:

```
node index.js
```

### Client

Run in dev mode:

```bash
cd client
yarn
yarn dev
```

Build for production:

```
yarn build
```
