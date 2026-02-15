FROM node:lts-slim as builder

RUN npm install typescript -g

# update packages, to reduce risk of vulnerabilities
RUN apt-get update && apt-get upgrade -y && apt-get autoclean -y && apt-get autoremove -y

# set a non privileged user to use when running this image
RUN groupadd -r nodejs && useradd -g nodejs -s /bin/bash -d /home/nodejs -m nodejs

# set right (secure) folder permissions
RUN mkdir -p /home/nodejs/app/node_modules
WORKDIR /home/nodejs/app

# set default node env
ARG NODE_ENV=prod
# ARG NODE_ENV=production
# to be able to run tests (for example in CI), do not set production as environment
ENV NODE_ENV=${NODE_ENV}

ENV NPM_CONFIG_LOGLEVEL=warn

# copy project definition/dependencies files, for better reuse of layers
COPY package*.json ./

RUN chown -R nodejs:nodejs /home/nodejs/app

USER nodejs

# install dependencies here, for better reuse of layers
RUN npm install

# copy all sources in the container (exclusions in .dockerignore file)
COPY --chown=nodejs:nodejs . .

# build/pack binaries from sources

# This results in a single layer image
# FROM node:lts-alpine AS release
# COPY --from=builder /dist /dist

#ENV PORT 3040
RUN tsc -p tsconfig.json

# exposed port/s
EXPOSE 3040

# ENTRYPOINT [ "node" ]
# CMD [ "npm", "start" ]
CMD [ "npm", "run", "start" ]

# end.