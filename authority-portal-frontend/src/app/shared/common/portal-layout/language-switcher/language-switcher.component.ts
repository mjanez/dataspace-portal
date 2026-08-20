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
import {Component} from '@angular/core';
import {
  LocaleService,
  PortalLocale,
} from 'src/app/core/services/locale.service';

@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.component.html',
  standalone: false,
})
export class LanguageSwitcherComponent {
  readonly locales: PortalLocale[] = [...this.localeService.supportedLocales];

  constructor(public localeService: LocaleService) {}

  selectLocale(locale: PortalLocale): void {
    this.localeService.setLocale(locale);
  }

  isSelected(locale: PortalLocale): boolean {
    return this.localeService.currentLocale === locale;
  }
}
