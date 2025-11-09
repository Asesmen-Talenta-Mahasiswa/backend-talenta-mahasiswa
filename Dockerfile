FROM oven/bun:1.3.1 AS build

WORKDIR /app

RUN pwd

# Cache packages installation
COPY package.json tsconfig.json drizzle.config.ts bunfig.toml bun.lock ./
COPY ./src ./src

RUN bun install

ENV NODE_ENV=production

RUN bun build \
  --compile \
  --minify-whitespace \
  --minify-syntax \
  --outfile server \
  src/index.ts

FROM gcr.io/distroless/base

WORKDIR /app

COPY --from=build /app/server server

ENV NODE_ENV=production

CMD ["./server"]

EXPOSE 3002
