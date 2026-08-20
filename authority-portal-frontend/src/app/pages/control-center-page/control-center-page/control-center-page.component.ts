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
import {Component, OnDestroy, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {toKebabCase} from '../../../core/utils/string-utils';
import {CONTROL_CENTER_ROUTES} from '../control-center-routes';

export interface ControlCenterTab {
  title: string;
  routerLink: string[];
}

@Component({
    selector: 'app-control-center-page',
    templateUrl: './control-center-page.component.html',
    standalone: false
})
export class ControlCenterPageComponent implements OnInit, OnDestroy {
  tabs: ControlCenterTab[] = [];
  private readonly ngOnDestroy$ = new Subject<void>();

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    this.buildTabs();
    this.translate.onLangChange
      .pipe(takeUntil(this.ngOnDestroy$))
      .subscribe(() => this.buildTabs());
  }

  ngOnDestroy(): void {
    this.ngOnDestroy$.next();
    this.ngOnDestroy$.complete();
  }

  private buildTabs(): void {
    const routes = CONTROL_CENTER_ROUTES.filter((it) => !it.data.excludeFromTabs);
    this.tabs = routes.map((it) => ({
      title: this.translate.instant(it.data.titleKey),
      routerLink: ['/control-center', it.path!],
    }));
  }

  protected readonly toKebabCase = toKebabCase;
}
