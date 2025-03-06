# use the official Bun image
FROM oven/bun:1 AS base
WORKDIR /usr/src/app


# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY ../package.json ../bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY ../package.json ../bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
COPY prisma ./prisma/


# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app .
COPY --from=prerelease /usr/src/app/package.json .


COPY ./entrypoint.sh .


# Fix permissions 
RUN chmod +x entrypoint.sh && \
    mkdir -p node_modules/.prisma && \
    chmod -R 777 node_modules/.prisma node_modules/@prisma node_modules/prisma


# run the app
USER bun
EXPOSE 3000
ENTRYPOINT [ "./entrypoint.sh" ]