<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->

<a name="readme-top"></a>

<!-- PROJECT SHIELDS -->

[![Static Badge][webpage-shield]][webpage-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<br />

<div align="center">
<a href="https://github.com/sovity/dataspace-portal">
<img src="https://raw.githubusercontent.com/sovity/edc-ui/main/src/assets/images/sovity_logo.svg" alt="Logo" width="300">
</a>

<h3 align="center">Data Space Portal</h3>

  <p align="center">
    Frontend (UI) of Data Space Portal
    <br />
    <a href="https://github.com/sovity/dataspace-portal/issues">Report Bug</a>
    ·
    <a href="https://github.com/sovity/dataspace-portal/issues">Request Feature</a>
    <br />
    <br />
    <a href="https://angular.io"><img src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="angular.io" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="typescriptlang.org"></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/TailwindCSS-00AAEE?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="tailwindcss.com"></a>
    <a href="https://www.ngxs.io/"><img src="https://img.shields.io/badge/NGXS-1d00ff?style=for-the-badge&logo=ngxs&logoColor=white" alt="ngxs.io"></a>
  </p>

</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#compatibility">Compatibility</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#configuration">Configuration</a></li>
    <li><a href="#running-dev-mode">Running dev mode</a></li>
    <li><a href="#build-docker-image">Build docker image</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

## About This Component

Frontend for sovity's Data Space Portal, written in Angular with TypeScript,
NGXS State Management and TailwindCSS Framework.

<p align="right">(<a href="#readme-top">back to top</a>)

## Configuration

Both the docker image and the locally run build can be configured via ENV
Variables:

```yaml
# Required: Backend URL
AUTHORITY_PORTAL_FRONTEND_BACKEND_URL=https://my-portal.sovity.io
```

All available configuration options can be found in
[app-config.ts](src/app/core/services/config/app-config.ts)

> [!TIP]
> For local development, `npm run start` runs [config-generator.js](config-generator.js) before `ng serve`. It writes `src/assets/config/app-configuration.json` from variables prefixed with `AUTHORITY_PORTAL_FRONTEND_`. By default it loads [`.env.local-dev`](.env.local-dev) (unless `ENV` selects another file).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Development

### Local Development

For local development Node16 and NPM are required.

Local Development uses a type-safe
[Fake Backend](src/app/core/api/fake-backend/fake-backend.ts).

This requires the API definitions for new and changed endpoints to be ready, as
the data will be filled in by the UI Fake Backend.

To start the frontend with the fake backend, please either run:

```shell
# Expects the API Client Library to be built
npm run start
```

or

```shell
# Always re-builds the API Client Library
npm run cold-start
```

#### Internationalization (i18n)

The UI uses [ngx-translate](https://github.com/ngx-translate/core) with JSON files in [`src/assets/i18n/`](src/assets/i18n/) (`en.json`, `es.json`).

[`LocaleService`](src/app/core/services/locale.service.ts) manages the active locale (persisted in `localStorage`). Users switch language via [`LanguageSwitcherComponent`](src/app/shared/common/portal-layout/language-switcher/language-switcher.component.ts) in the toolbar and on unauthenticated pages.

**Adding a language:** Copy `en.json`, translate values, add the locale to `SUPPORTED_LOCALES` in `LocaleService`, and expose it in `LanguageSwitcherComponent`.

**Templates:** `{{ 'SOME.KEY' | translate }}` or `{{ 'KEY' | translate: {param: value} }}`. Brand-specific strings often pass `dataspaceName: appConfig.brandDataspaceName` — see [Configuration](#configuration).

**TypeScript:** Inject `TranslateService` and use `translate.instant('KEY')`. Subscribe to `translate.onLangChange` when rebuilding dynamic labels (table headers, tabs, charts).

**Testing locally:** Run `npm run start`, open the unauthenticated landing page, and use the language switcher (top right) to toggle EN/ES. Interpolated strings should show the configured dataspace name (e.g. "sovity Dataspace"), not `{{dataspaceName}}`.

**Keycloak (login & emails):** Theme messages live under `authority-portal-keycloak/sovity-theme/login/messages/` and `.../email/messages/` (`messages_en.properties`, `messages_es.properties`). Configure Keycloak realm internationalization / supported locales for the theme to pick them up.

**Note:** Catalog metadata language (asset `language` field) is separate from UI locale and is handled by `LanguageService` — do not change that for UI translations.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Local E2E Development

Requires Node16 and NPM and a running backend in local development mode (Port
8080).

This can use this to manually test backend implementations in interaction with
the UI.

To run the frontend against a locally running backend, please either run:

```shell
# Expects the API Client Library to be built
npm run start-e2e-dev
```

or

```shell
# Always re-builds the API Client Library
npm run cold-start-e2e-dev
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

See [`LICENSE`](../LICENSE) for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

contact@sovity.de

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->

[webpage-shield]:
  https://img.shields.io/badge/Sovity-black.svg?style=for-the-badge&colorB=09254d
[webpage-url]: https://www.sovity.de
[linkedin-shield]:
  https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=0a66c2
[linkedin-url]: https://www.linkedin.com/company/sovity
