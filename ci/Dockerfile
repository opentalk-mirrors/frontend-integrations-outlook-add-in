# SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
#
# SPDX-License-Identifier: EUPL-1.2

FROM alpine:latest AS builder

WORKDIR /addin

# @microsoft/teamsapp-cli runs a postinstall hook that has npm hardcoded :(
RUN apk --no-cache add pnpm npm
COPY . /addin

ARG CONFIG_PORT=8000
ENV CONFIG_PORT=${CONFIG_PORT}

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod
# Webpack is required for building
RUN pnpm install -D webpack
RUN pnpm build

FROM nginxinc/nginx-unprivileged:alpine-slim

USER root

COPY --from=builder /addin/dist /usr/share/nginx/html

ENV USERID=1000
ENV GROUPID=1000
ENV PORT=80
ENV OPENTALK_OUTLOOK_OIDC_CLIENT_ID=device
ENV OPENTALK_OUTLOOK_HOST_URL=localhost:8000

COPY ./ci/entrypoint.sh /docker-entrypoint.d/40-configure-app.sh
RUN chmod +x /docker-entrypoint.d/40-configure-app.sh
COPY ./ci/nginx-default.conf.template /etc/nginx/templates/default.conf.template
COPY ./ci/nginx.conf /etc/nginx/

RUN chown -R nobody:nobody /usr/share/nginx/html && \
        chmod -R 777 /usr/share/nginx/html && \
        chown -R nobody:nobody /var/cache/nginx && \
        chown -R nobody:nobody  /var/log/nginx && \
        chown -R nobody:nobody  /etc/nginx && \
        chmod -Rf 777  /etc/nginx

USER $USERID:$GROUPID

CMD ["nginx", "-g", "daemon off;"]
