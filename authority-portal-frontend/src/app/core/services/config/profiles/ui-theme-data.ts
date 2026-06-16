/*
 * Data Space Portal
 * Copyright (C) 2025 sovity GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import {UiThemeConfig} from './ui-theme-config';

export const DEFAULT_THEME: UiThemeConfig = {
  theme: 'theme-default',
  brandFaviconSrc: 'favicon.ico',
  brandLogo: {src: 'assets/images/logo-placeholder.svg', class: 'scale-[1.1]'},
  brandLogoSmall: {
    src: 'assets/images/logo-placeholder.svg',
    class: 'scale-[0.6]',
  },
  brandLogoUnauthenticatedPage: {
    src: 'assets/images/logo-placeholder.svg',
    class: 'w-[15%] h-[15%]',
  },
  brandLogoOnboardingPage: {
    src: 'assets/images/logo-placeholder.svg',
    class: 'w-[10%] h-[10%]',
  },
  connectorSelfOwnedIconSrc: 'assets/images/self-hosted-connector.svg',
  connectorCaasIconSrc: 'assets/images/request-caas.svg',
  caasResellerBrandLogoSrc: 'assets/images/request-caas.svg',
  copyrightCompanyName: '',
};
