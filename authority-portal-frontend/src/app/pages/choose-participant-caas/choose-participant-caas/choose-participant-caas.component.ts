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
import {TranslateService} from '@ngx-translate/core';
import {Observable, Subject, switchMap, takeUntil} from 'rxjs';
import {CaasAvailabilityResponse} from '@sovity.de/authority-portal-client';
import {ApiService} from 'src/app/core/api/api.service';
import {GlobalStateUtils} from 'src/app/core/global-state/global-state-utils';
import {SelectionBoxModel} from 'src/app/shared/common/selection-box/selection-box.model';
import {APP_CONFIG, AppConfig} from '../../../core/services/config/app-config';
import {inferArticle} from '../../../core/utils/string-utils';

@Component({
    selector: 'app-choose-participant-caas',
    templateUrl: './choose-participant-caas.component.html',
    standalone: false
})
export class ChooseParticipantCaasComponent implements OnInit, OnDestroy {
  sponsoredCaasAmount: number = 1;

  selectionBox!: SelectionBoxModel;

  private caasLimits?: {current: number; limit: number};
  private ngOnDestroy$ = new Subject<void>();

  constructor(
    @Inject(APP_CONFIG) public appConfig: AppConfig,
    private apiService: ApiService,
    private globalStateUtils: GlobalStateUtils,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    this.selectionBox = this.buildInitialSelectionBox();
    this.fetchCaasLimits();
    this.translate.onLangChange
      .pipe(takeUntil(this.ngOnDestroy$))
      .subscribe(() => this.refreshSelectionBox());
  }

  ngOnDestroy() {
    this.ngOnDestroy$.next();
    this.ngOnDestroy$.complete();
  }

  fetchCaasLimits() {
    this.globalStateUtils
      .getDeploymentEnvironmentId()
      .pipe(
        switchMap(
          (deploymentEnvironmentId): Observable<CaasAvailabilityResponse> =>
            this.apiService.checkFreeCaasUsage(deploymentEnvironmentId),
        ),
        takeUntil(this.ngOnDestroy$),
      )
      .subscribe((x) => {
        if (x.current === undefined || x.limit === undefined) {
          this.caasLimits = undefined;
          this.selectionBox.action = {
            label: this.translate.instant(
              'PAGES.CONNECTOR_CHOICE.CAAS_LOAD_ERROR',
            ),
            url: 'my-organization/connectors/new/provided',
            isDisabled: true,
          };
          return;
        }

        this.sponsoredCaasAmount = x.limit;
        this.caasLimits = {current: x.current, limit: x.limit};
        this.refreshSelectionBox();
      });
  }

  protected readonly inferArticle = inferArticle;

  private buildInitialSelectionBox(): SelectionBoxModel {
    return {
      title: this.translate.instant(
        'PAGES.CONNECTOR_CHOICE.SPONSORED_CAAS_TITLE',
      ),
      subTitle: this.translate.instant(
        'PAGES.CONNECTOR_CHOICE.SPONSORED_CAAS_SUBTITLE',
      ),
      icon: this.appConfig.caasResellerBrandLogoSrc,
      bulletPoints: this.buildBulletPoints(),
      action: {
        label: this.translate.instant('COMMON.LOADING'),
        url: 'my-organization/connectors/new/provided',
        isLoading: true,
        isDisabled: true,
      },
    };
  }

  private buildBulletPoints(): string[] {
    return [
      this.translate.instant('PAGES.CONNECTOR_CHOICE.SPONSORED_BULLET_1', {
        dataspaceName: this.appConfig.brandDataspaceName,
      }),
      this.translate.instant('PAGES.CONNECTOR_CHOICE.SPONSORED_BULLET_2'),
      this.translate.instant('PAGES.CONNECTOR_CHOICE.SPONSORED_BULLET_3'),
      this.translate.instant('PAGES.CONNECTOR_CHOICE.SPONSORED_BULLET_4'),
      this.translate.instant('PAGES.CONNECTOR_CHOICE.SPONSORED_BULLET_5'),
      this.translate.instant('PAGES.CONNECTOR_CHOICE.SPONSORED_BULLET_6'),
    ];
  }

  private refreshSelectionBox(): void {
    const limits = this.caasLimits;
    const isLimitReached =
      limits != null && limits.current >= limits.limit;
    const isUnconfigured = limits != null && limits.limit === 0;

    this.selectionBox = {
      title: this.translate.instant(
        'PAGES.CONNECTOR_CHOICE.SPONSORED_CAAS_TITLE',
      ),
      subTitle: this.translate.instant(
        'PAGES.CONNECTOR_CHOICE.SPONSORED_CAAS_SUBTITLE',
      ),
      icon: this.appConfig.caasResellerBrandLogoSrc,
      bulletPoints: this.buildBulletPoints(),
      action: {
        label: isUnconfigured
          ? this.translate.instant('COMMON.UNAVAILABLE')
          : limits != null
          ? this.translate.instant('PAGES.CONNECTOR_CHOICE.CAAS_REQUEST', {
              current: limits.current,
              limit: limits.limit,
            })
          : this.translate.instant('COMMON.LOADING'),
        url: 'my-organization/connectors/new/provided',
        isDisabled:
          limits == null || isLimitReached || isUnconfigured,
        isLoading: limits == null,
        hint: isUnconfigured
          ? this.translate.instant(
              'PAGES.CONNECTOR_CHOICE.CAAS_UNCONFIGURED_HINT',
            )
          : isLimitReached
          ? this.translate.instant(
              'PAGES.CONNECTOR_CHOICE.CAAS_LIMIT_REACHED_HINT',
            )
          : '',
      },
    };
  }
}
