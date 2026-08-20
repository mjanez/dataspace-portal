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
import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';
import {Subject, takeUntil} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {
  ComponentStatusOverview,
  UptimeStatusDto,
} from '@sovity.de/authority-portal-client';
import {ApiService} from 'src/app/core/api/api.service';
import {GlobalStateUtils} from 'src/app/core/global-state/global-state-utils';
import {APP_CONFIG, AppConfig} from 'src/app/core/services/config/app-config';
import {Fetched} from 'src/app/core/utils/fetched';
import {HeaderBarConfig} from 'src/app/shared/common/header-bar/header-bar.model';
import {ConnectorData} from '../dashboard-connector-card/dashboard-connector-card.component';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard-page.component.html',
    standalone: false
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  headerConfig: HeaderBarConfig = this.buildHeaderConfig();

  dapsData: Fetched<UptimeStatusDto | undefined> = Fetched.empty();
  loggingHouseData: Fetched<UptimeStatusDto | undefined> = Fetched.empty();
  connectorData: Fetched<ConnectorData> = Fetched.empty();
  crawlerData: Fetched<UptimeStatusDto | undefined> = Fetched.empty();

  constructor(
    @Inject(APP_CONFIG) public appConfig: AppConfig,
    private globalStateUtils: GlobalStateUtils,
    private apiService: ApiService,
    private titleService: Title,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.updateTitle();
    this.translate.onLangChange
      .pipe(takeUntil(this.ngOnDestroy$))
      .subscribe(() => {
        this.headerConfig = this.buildHeaderConfig();
        this.updateTitle();
      });
    this.fetchDashboardPageData();
  }

  private buildHeaderConfig(): HeaderBarConfig {
    return {
      title: this.translate.instant('PAGES.DASHBOARD.TITLE'),
      subtitle: this.translate.instant('PAGES.DASHBOARD.SUBTITLE'),
      headerActions: [],
    };
  }

  private updateTitle(): void {
    this.titleService.setTitle(this.translate.instant('PAGES.DASHBOARD.TITLE'));
  }

  fetchDashboardPageData() {
    this.globalStateUtils.deploymentEnvironment$
      .pipe(
        map((it) => it.environmentId),
        switchMap((deploymentEnvironmentId) =>
          this.apiService.getComponentsStatus(deploymentEnvironmentId).pipe(
            Fetched.wrap({
              failureMessage: this.translate.instant('TOASTS.FAILED_DASHBOARD'),
            }),
          ),
        ),
        takeUntil(this.ngOnDestroy$),
      )
      .subscribe(
        (componentStatusOverview: Fetched<ComponentStatusOverview>) => {
          this.dapsData = componentStatusOverview.map((x) => x.dapsStatus);
          this.loggingHouseData = componentStatusOverview.map(
            (x) => x.loggingHouseStatus,
          );
          this.crawlerData = componentStatusOverview.map(
            (x) => x.crawlerStatus,
          );
          this.connectorData = componentStatusOverview.map((x) => ({
            numOnline: x.onlineConnectors,
            numDisturbed: x.disturbedConnectors,
            numOffline: x.offlineConnectors,
          }));
        },
      );
  }

  private ngOnDestroy$ = new Subject();
  ngOnDestroy(): void {
    this.ngOnDestroy$.next(null);
    this.ngOnDestroy$.complete();
  }
}
