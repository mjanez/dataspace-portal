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
import {
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {Subject, distinctUntilChanged, merge, takeUntil} from 'rxjs';
import {map} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {GlobalStateUtils} from 'src/app/core/global-state/global-state-utils';
import {APP_CONFIG, AppConfig} from 'src/app/core/services/config/app-config';
import {ActiveFeatureSet} from '../../../../core/services/config/active-feature-set';
import {SidebarSection} from './sidebar.model';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    standalone: false
})
export class SidebarComponent implements OnInit, OnDestroy {
  isExpandedMenu: boolean = true;
  sidebarSections: SidebarSection[] = [];
  private organizationName = '';
  private ngOnDestroy$ = new Subject();

  constructor(
    @Inject(APP_CONFIG) public appConfig: AppConfig,
    private globalStateUtils: GlobalStateUtils,
    private activeFeatureSet: ActiveFeatureSet,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    this.checkWindowWidth();
    this.startListeningToEnvironmentChanges();
    merge(this.translate.onLangChange, this.translate.onTranslationChange)
      .pipe(takeUntil(this.ngOnDestroy$))
      .subscribe(() => {
        this.setSideBarSections(this.organizationName);
      });
  }

  startListeningToEnvironmentChanges(): void {
    this.globalStateUtils.userInfo$
      .pipe(
        map((it) => it.organizationName),
        distinctUntilChanged(),
        takeUntil(this.ngOnDestroy$),
      )
      .subscribe((organizationName) => {
        this.organizationName = organizationName ?? '';
        this.setSideBarSections(this.organizationName);
      });
  }

  // Listen for window resize events
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkWindowWidth();
  }

  // Function to check window width and update isExpandedMenu accordingly
  checkWindowWidth(): void {
    this.isExpandedMenu = window.innerWidth > 768; // Set the breakpoint as per your design
  }

  navigateHome() {
    window.open('catalog', '_self');
  }

  setSideBarSections(organizationName: string): void {
    const t = (key: string) => this.translate.instant(key);
    this.sidebarSections = [
      {
        title: t('NAV.HOME'),
        userRoles: ['USER'],
        menus: [
          {
            title: t('NAV.DATA_CATALOG'),
            icon: 'tag',
            rLink: '/catalog',
          },
          {
            title: t('NAV.DASHBOARD'),
            icon: 'dashboard',
            rLink: '/dashboard',
            isDisabled: !this.activeFeatureSet.isDashboardEnabled(),
          },
        ],
      },
      {
        title: organizationName || t('NAV.MY_ORGANIZATION'),
        userRoles: ['USER'],
        menus: [
          {
            title: t('NAV.MY_ORGANIZATION'),
            icon: 'home',
            rLink: '/control-center/my-organization',
          },
          {
            title: t('NAV.MY_DATA_OFFERS'),
            icon: 'tag',
            rLink: `/my-organization/data-offers`,
          },
          {
            title: t('NAV.MY_CONNECTORS'),
            icon: 'connector',
            rLink: '/my-organization/connectors',
          },
        ],
      },
      {
        title: t('NAV.OPERATOR_SECTION'),
        userRoles: ['OPERATOR_ADMIN'],
        menus: [
          {
            title: t('NAV.ALL_CONNECTORS'),
            icon: 'connector',
            rLink: '/operator/connectors',
          },
          {
            title: t('NAV.CENTRAL_COMPONENTS'),
            icon: 'extension',
            rLink: '/operator/central-components',
          },
        ],
      },
      {
        title: t('NAV.SERVICE_PARTNER_SECTION'),
        userRoles: ['SERVICE_PARTNER_ADMIN'],
        menus: [
          {
            title: t('NAV.PROVIDED_CONNECTORS'),
            icon: 'connector',
            rLink: '/service-partner/provided-connectors',
          },
        ],
      },
      {
        title: t('NAV.AUTHORITY_SECTION'),
        userRoles: ['AUTHORITY_USER'],
        menus: [
          {
            title: t('NAV.ORGANIZATIONS'),
            icon: 'building-office-2',
            rLink: '/authority/organizations',
          },
          {
            title: t('NAV.ALL_CONNECTORS'),
            icon: 'connector',
            rLink: '/authority/connectors',
          },
        ],
      },
      {
        title: t('NAV.SUPPORT'),
        userRoles: ['USER'],
        menus: [
          {
            title: t('NAV.SUPPORT'),
            icon: 'question-mark-circle',
            rLink: this.appConfig.supportUrl,
            isExternalLink: true,
          },
        ],
      },
    ];
  }

  ngOnDestroy(): void {
    this.ngOnDestroy$.next(null);
    this.ngOnDestroy$.complete();
  }
}
