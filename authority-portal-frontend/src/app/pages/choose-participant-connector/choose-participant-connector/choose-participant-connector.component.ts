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
import {Subject, takeUntil} from 'rxjs';
import {SelectionBoxModel} from 'src/app/shared/common/selection-box/selection-box.model';
import {APP_CONFIG, AppConfig} from '../../../core/services/config/app-config';

@Component({
    selector: 'app-choose-participant-connector',
    templateUrl: './choose-participant-connector.component.html',
    standalone: false
})
export class ChooseParticipantConnectorComponent implements OnInit, OnDestroy {
  selectionBoxes: SelectionBoxModel[] = [];

  private ngOnDestroy$ = new Subject<void>();

  constructor(
    @Inject(APP_CONFIG) public appConfig: AppConfig,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.buildSelectionBoxes();
    this.translate.onLangChange
      .pipe(takeUntil(this.ngOnDestroy$))
      .subscribe(() => this.buildSelectionBoxes());
  }

  ngOnDestroy(): void {
    this.ngOnDestroy$.next();
    this.ngOnDestroy$.complete();
  }

  private buildSelectionBoxes(): void {
    this.selectionBoxes = [
      {
        title: this.translate.instant(
          'PAGES.CONNECTOR_CHOICE.HAVE_CONNECTOR_TITLE',
        ),
        subTitle: this.translate.instant(
          'PAGES.CONNECTOR_CHOICE.HAVE_CONNECTOR_SUBTITLE',
        ),
        icon: this.appConfig.connectorSelfOwnedIconSrc,
        action: {
          url: '/my-organization/connectors/new/self-hosted',
        },
      },
      {
        title: this.translate.instant(
          'PAGES.CONNECTOR_CHOICE.NEED_CONNECTOR_TITLE',
        ),
        subTitle: this.translate.instant(
          'PAGES.CONNECTOR_CHOICE.NEED_CONNECTOR_SUBTITLE',
        ),
        icon: this.appConfig.connectorCaasIconSrc,
        action: {
          url: '/my-organization/connectors/new/choose-provider',
        },
      },
    ];
  }
}
