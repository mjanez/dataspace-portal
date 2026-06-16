FROM quay.io/keycloak/keycloak:26.4.7

USER root
COPY authority-portal-keycloak/portal-theme /opt/keycloak/themes/portal-theme
COPY authority-portal-backend/authority-portal-quarkus/src/main/resources/realm.dev.json \
  /opt/keycloak/data/import/authority-portal.json
USER 1000
