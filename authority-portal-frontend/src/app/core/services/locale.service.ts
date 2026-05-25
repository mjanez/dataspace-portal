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
import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

export type PortalLocale = 'en' | 'es';

const STORAGE_KEY = 'portal-locale';
const SUPPORTED_LOCALES: PortalLocale[] = ['en', 'es'];
export const DEFAULT_LOCALE: PortalLocale = 'en';

@Injectable({
  providedIn: 'root',
})
export class LocaleService {
  constructor(private translate: TranslateService) {
    this.translate.addLangs(SUPPORTED_LOCALES);
    this.translate.setFallbackLang(DEFAULT_LOCALE);
  }

  init(): void {
    const saved = localStorage.getItem(STORAGE_KEY) as PortalLocale | null;
    const locale =
      saved && SUPPORTED_LOCALES.includes(saved) ? saved : DEFAULT_LOCALE;
    this.setLocale(locale);
  }

  setLocale(locale: PortalLocale): void {
    if (!SUPPORTED_LOCALES.includes(locale)) {
      return;
    }
    this.translate.use(locale);
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }

  get currentLocale(): PortalLocale {
    return (this.translate.currentLang as PortalLocale) || DEFAULT_LOCALE;
  }

  get supportedLocales(): readonly PortalLocale[] {
    return SUPPORTED_LOCALES;
  }
}
