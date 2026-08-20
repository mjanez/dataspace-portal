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

export interface LocaleConfig {
  code: string;
  bcp47Prefixes: string[];
}

const LOCALE_REGISTRY: readonly LocaleConfig[] = [
  {code: 'en', bcp47Prefixes: ['en']},
  {code: 'es', bcp47Prefixes: ['es']},
];

const STORAGE_KEY = 'portal-locale';
export const SUPPORTED_LOCALES = LOCALE_REGISTRY.map(l => l.code);
export const DEFAULT_LOCALE = SUPPORTED_LOCALES[0];

export type PortalLocale = (typeof SUPPORTED_LOCALES)[number];

@Injectable({
  providedIn: 'root',
})
export class LocaleService {
  constructor(private translate: TranslateService) {
    this.translate.addLangs([...SUPPORTED_LOCALES]);
    this.translate.setFallbackLang(DEFAULT_LOCALE);
  }

  init(): void {
    const locale =
      this.readSavedLocale() ??
      this.detectBrowserLocale() ??
      DEFAULT_LOCALE;
    this.setLocale(locale);
  }

  setLocale(locale: PortalLocale): void {
    if (!this.isSupportedLocale(locale)) {
      return;
    }
    this.translate.use(locale);
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }

  get currentLocale(): PortalLocale {
    return this.isSupportedLocale(this.translate.currentLang)
      ? this.translate.currentLang
      : DEFAULT_LOCALE;
  }

  get supportedLocales(): readonly string[] {
    return SUPPORTED_LOCALES;
  }

  private isSupportedLocale(value: unknown): value is PortalLocale {
    return typeof value === 'string' && SUPPORTED_LOCALES.includes(value);
  }

  private readSavedLocale(): PortalLocale | null {
    const saved = localStorage.getItem(STORAGE_KEY);
    return this.isSupportedLocale(saved) ? saved : null;
  }

  private detectBrowserLocale(): PortalLocale | null {
    const browserLangs =
      typeof navigator !== 'undefined'
        ? navigator.languages ?? [navigator.language]
        : [];

    for (const lang of browserLangs) {
      const tag = lang.toLowerCase();
      const match = LOCALE_REGISTRY.find(entry =>
        entry.bcp47Prefixes.some(prefix => tag === prefix || tag.startsWith(`${prefix}-`)),
      );
      if (match) {
        return match.code;
      }
    }
    return null;
  }
}
