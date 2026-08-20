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
import {Component, HostBinding, Input, OnDestroy, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {Fetched} from 'src/app/core/utils/fetched';
import {DonutChartData} from '../donut-chart/donut-chart-data';

export interface ConnectorData {
  numOnline: number;
  numDisturbed: number;
  numOffline: number;
}

export interface ConnectorKpi {
  label: string;
  classLed: string;
  classLedShadow: string;
  chartColor: string;
  kpi: (dto: ConnectorData) => number;
}

@Component({
    selector: 'app-dashboard-connector-card',
    templateUrl: './dashboard-connector-card.component.html',
    standalone: false
})
export class DashboardConnectorCardComponent implements OnInit, OnDestroy {
  @HostBinding('class.flex')
  @HostBinding('class.flex-col')
  @HostBinding('class.items-stretch')
  @HostBinding('class.h-[20rem]')
  @HostBinding('class.border')
  @HostBinding('class.border-gray-100')
  @HostBinding('class.shadow')
  @HostBinding('class.rounded-xl')
  @HostBinding('class.p-6')
  @HostBinding('class.overflow-hidden')
  @HostBinding('class.bg-white')
  @HostBinding()
  cls = true;

  allKpis: ConnectorKpi[] = [];
  visibleKpis: ConnectorKpi[] = [];
  chartData: DonutChartData | null = null;

  private _data!: Fetched<ConnectorData>;
  private readonly ngOnDestroy$ = new Subject<void>();

  constructor(private translate: TranslateService) {}

  @Input() set data(value: Fetched<ConnectorData>) {
    this._data = value;
    this.applyData();
  }

  get data(): Fetched<ConnectorData> {
    return this._data;
  }

  ngOnInit(): void {
    this.buildKpis();
    this.translate.onLangChange
      .pipe(takeUntil(this.ngOnDestroy$))
      .subscribe(() => {
        this.buildKpis();
        if (this._data) {
          this.applyData();
        }
      });
  }

  ngOnDestroy(): void {
    this.ngOnDestroy$.next();
    this.ngOnDestroy$.complete();
  }

  private buildKpis(): void {
    this.allKpis = [
      {
        label: this.translate.instant('PAGES.DASHBOARD.STATUS_ONLINE'),
        classLed: 'bg-emerald-500',
        classLedShadow: 'bg-emerald-500/20',
        chartColor: '#10B981',
        kpi: (dto) => dto.numOnline,
      },
      {
        label: this.translate.instant('PAGES.DASHBOARD.STATUS_DISTURBED'),
        classLed: 'bg-amber-500',
        classLedShadow: 'bg-amber-500/20',
        chartColor: '#F59E0B',
        kpi: (dto) => dto.numDisturbed,
      },
      {
        label: this.translate.instant('PAGES.DASHBOARD.STATUS_OFFLINE'),
        classLed: 'bg-red-500',
        classLedShadow: 'bg-red-500/20',
        chartColor: '#EF4444',
        kpi: (dto) => dto.numOffline,
      },
    ];
  }

  private applyData(): void {
    this.visibleKpis = this._data
      .map((it) => this.allKpis.filter((kp) => kp.kpi(it) > 0))
      .orElse([]);
    this.chartData = this._data
      .map((it) => this.buildDonutChartData(it, this.visibleKpis))
      .orElse(null);
  }

  buildDonutChartData(
    dto: ConnectorData,
    kpis: ConnectorKpi[],
  ): DonutChartData | null {
    if (!kpis?.length) {
      return null;
    }

    const connectorsLabel = this.translate.instant(
      'PAGES.DASHBOARD.REPORT_CONNECTORS',
    );

    return {
      labels: kpis.map((it) => it.label),
      datasets: [
        {
          data: kpis.map((it) => it.kpi(dto)),
          backgroundColor: kpis.map((it) => it.chartColor),
        },
      ],
      options: {
        plugins: {
          tooltip: {
            callbacks: {
              label: (item) => ` ${item.formattedValue} ${connectorsLabel}`,
            },
          },
        },
      },
    };
  }
}
