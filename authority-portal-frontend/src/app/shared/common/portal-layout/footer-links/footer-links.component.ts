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
import {Component, HostBinding, Inject, OnDestroy, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Subject, takeUntil} from 'rxjs';
import {APP_CONFIG, AppConfig} from 'src/app/core/services/config/app-config';
import {FooterLink} from './footer-link.model';

@Component({
  selector: 'app-footer-links',
  templateUrl: './footer-links.component.html',
  standalone: false,
})
export class FooterLinksComponent implements OnInit, OnDestroy {
  @HostBinding('class.flex')
  @HostBinding('class.justify-center')
  @HostBinding('class.gap-1.5')
  @HostBinding('class.whitespace-normal')
  cls = true;

  footerLinks: FooterLink[] = [];
  private ngOnDestroy$ = new Subject<void>();

  constructor(
    @Inject(APP_CONFIG) public appConfig: AppConfig,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.setFooterLinks();
    this.translate.onLangChange
      .pipe(takeUntil(this.ngOnDestroy$))
      .subscribe(() => this.setFooterLinks());
  }

  ngOnDestroy(): void {
    this.ngOnDestroy$.next();
    this.ngOnDestroy$.complete();
  }

  blurFocus(event: MouseEvent) {
    (event.target as HTMLElement).blur();
  }

  private setFooterLinks(): void {
    this.footerLinks = [
      {
        name: this.translate.instant('FOOTER.PRIVACY_POLICY'),
        href: this.appConfig.privacyPolicyUrl,
      },
      {
        name: this.translate.instant('FOOTER.LEGAL_NOTICE'),
        href: this.appConfig.legalNoticeUrl,
      },
    ];
  }
}
