# ====================
# --- Build Assets ---
# ====================
FROM node:18-alpine AS assets

RUN apk add yarn g++ make cmake python3 --no-cache

WORKDIR /workspace/client

COPY ./client /workspace/client

RUN yarn cache clean
RUN yarn --frozen-lockfile --non-interactive
RUN yarn build

# ===============
# --- Release ---
# ===============
FROM node:18-alpine

RUN apk add bash --no-cache && \
    mkdir -p /workspace

WORKDIR /workspace/server

COPY --from=assets /workspace/dist /workspace/dist
COPY ./server /workspace/server
COPY ./LICENSE /workspace/LICENSE

RUN yarn --production --frozen-lockfile --non-interactive

EXPOSE 3000

CMD ["node", "index.js"]
