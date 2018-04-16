FROM node:6
MAINTAINER Maru Berezin

# jspm registry config github TOKEN_FROM_GITHUB
# jspm registry export github => JSPM_GITHUB_AUTH_TOKEN
ENV JSPM_GITHUB_AUTH_TOKEN $JSPM_GITHUB_AUTH_TOKEN

RUN npm install -g jspm && \
  jspm config registries.github.remote https://github.jspm.io && \
  jspm config registries.github.auth $JSPM_GITHUB_AUTH_TOKEN && \
  jspm config registries.github.maxRepoSize 0 && \
  jspm config registries.github.handler jspm-github

COPY ./package.json .

RUN npm install

COPY . .

RUN jspm install

EXPOSE 8080

CMD [ "npm", "run", "serve"]
