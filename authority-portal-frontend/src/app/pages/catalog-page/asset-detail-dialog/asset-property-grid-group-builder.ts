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
import {
  DataOfferDetailContractOffer,
  DataOfferDetailPageResult,
  DataSourceAvailability,
  UiAsset,
} from '@sovity.de/authority-portal-client';
import {AdditionalAssetProperty} from 'src/app/core/api/additional-asset-property';
import {LanguageService} from 'src/app/core/services/languages/language.service';
import {formatDateAgo} from '../../../shared/pipes-and-directives/ago.pipe';
import {JsonDialogService} from '../json-dialog/json-dialog.service';
import {PolicyMapper} from '../policy-editor/model/policy-mapper';
import {PropertyGridGroup} from '../property-grid-group/property-grid-group';
import {PropertyGridField} from '../property-grid/property-grid-field';
import {PropertyGridFieldService} from '../property-grid/property-grid-field.service';
import {UrlListDialogService} from '../url-list-dialog/url-list-dialog.service';

@Injectable()
export class AssetPropertyGridGroupBuilder {
  private readonly assetKey = 'PAGES.CATALOG.ASSET';

  constructor(
    private propertyGridFieldService: PropertyGridFieldService,
    private jsonDialogService: JsonDialogService,
    private urlListDialogService: UrlListDialogService,
    private languageService: LanguageService,
    private policyMapper: PolicyMapper,
    private translate: TranslateService,
  ) {}

  buildDataOfferGroup(dataOffer: DataOfferDetailPageResult): PropertyGridGroup {
    const lastUpdate = formatDateAgo(
      dataOffer.connectorOfflineSinceOrLastUpdatedAt,
    );
    return {
      groupLabel: this.t(`${this.assetKey}.DATA_OFFER`),
      properties: [
        {
          icon: 'dataset',
          label: this.t(`${this.assetKey}.OFFER_TYPE`),
          ...this.propertyGridFieldService.guessValue(
            this.getPrettyDataOfferType(dataOffer.asset.dataSourceAvailability),
          ),
        },
        {
          icon: 'category',
          label: this.t(`${this.assetKey}.CONNECTOR_ID`),
          ...this.propertyGridFieldService.guessValue(dataOffer.connectorId),
        },
        {
          ...{
            icon: 'link',
            label: this.t(`${this.assetKey}.CONNECTOR_ENDPOINT`),
            ...this.propertyGridFieldService.guessValue(
              dataOffer.connectorEndpoint,
            ),
          },
          copyButton: true,
        },
        {
          icon: 'cloud',
          label: this.t(`${this.assetKey}.STATUS`),
          labelTitle: this.t(`${this.assetKey}.LAST_UPDATED`, {date: lastUpdate}),
          text:
            dataOffer.connectorOnlineStatus == 'ONLINE'
              ? this.t(`${this.assetKey}.STATUS_ONLINE`)
              : this.t(`${this.assetKey}.STATUS_OFFLINE_SINCE`, {
                  date: lastUpdate,
                }),
        },
        {
          icon: 'account_circle',
          label: this.t(`${this.assetKey}.ORGANIZATION_ID`),
          ...this.propertyGridFieldService.guessValue(dataOffer.organizationId),
        },
        {
          icon: 'account_circle',
          label: this.t(`${this.assetKey}.ORGANIZATION_NAME`),
          ...this.propertyGridFieldService.guessValue(
            dataOffer.organizationName,
          ),
        },
        {
          icon: 'today',
          label: this.t(`${this.assetKey}.UPDATED_AT`),
          ...this.propertyGridFieldService.guessValue(
            this.propertyGridFieldService.formatDate(dataOffer.updatedAt),
          ),
        },
      ],
    };
  }

  buildAssetPropertiesGroup(
    dataOffer: DataOfferDetailPageResult,
    groupLabel: string | null,
  ): PropertyGridGroup {
    const asset = dataOffer.asset;
    const fields: PropertyGridField[] = [
      {
        icon: 'category',
        label: this.t(`${this.assetKey}.ID`),
        ...this.propertyGridFieldService.guessValue(asset.assetId),
      },
      {
        icon: 'file_copy',
        label: this.t(`${this.assetKey}.VERSION`),
        ...this.propertyGridFieldService.guessValue(asset.version),
      },
      {
        icon: 'language',
        label: this.t(`${this.assetKey}.LANGUAGE`),
        ...this.propertyGridFieldService.guessValue(this.getLanguage(asset)),
      },
      {
        icon: 'apartment',
        label: this.t(`${this.assetKey}.PUBLISHER`),
        ...this.propertyGridFieldService.guessValue(asset.publisherHomepage),
      },
      {
        icon: 'bookmarks',
        label: this.t(`${this.assetKey}.ENDPOINT_DOCUMENTATION`),
        ...this.propertyGridFieldService.guessValue(asset.landingPageUrl),
      },
      {
        icon: 'gavel',
        label: this.t(`${this.assetKey}.STANDARD_LICENSE`),
        ...this.propertyGridFieldService.guessValue(asset.licenseUrl),
      },
      ...this.buildHttpDatasourceFields(dataOffer),
    ];

    if (asset.dataModel) {
      fields.push({
        icon: 'category',
        label: this.t(`${this.assetKey}.DATA_MODEL`),
        ...this.propertyGridFieldService.guessValue(asset.dataModel),
      });
    }
    if (asset.sovereignLegalName) {
      fields.push({
        icon: 'account_balance',
        label: this.t(`${this.assetKey}.SOVEREIGN`),
        ...this.propertyGridFieldService.guessValue(asset.sovereignLegalName),
      });
    }
    if (asset.dataSampleUrls?.length) {
      fields.push(
        this.buildDataSampleUrlsField(asset.dataSampleUrls, asset.title),
      );
    }
    if (asset.referenceFileUrls?.length) {
      fields.push(
        this.buildReferenceFileUrlsField(
          asset.referenceFileUrls,
          asset.referenceFilesDescription,
          asset.title,
        ),
      );
    }
    if (asset.conditionsForUse) {
      fields.push({
        icon: 'description',
        label: this.t(`${this.assetKey}.CONDITIONS_FOR_USE`),
        ...this.propertyGridFieldService.guessValue(asset.conditionsForUse),
      });
    }
    if (asset.dataUpdateFrequency) {
      fields.push({
        icon: 'timelapse',
        label: this.t(`${this.assetKey}.DATA_UPDATE_FREQUENCY`),
        ...this.propertyGridFieldService.guessValue(asset.dataUpdateFrequency),
      });
    }
    if (asset.temporalCoverageFrom || asset.temporalCoverageToInclusive) {
      fields.push({
        icon: 'today',
        label: this.t(`${this.assetKey}.TEMPORAL_COVERAGE`),
        ...this.propertyGridFieldService.guessValue(
          this.buildTemporalCoverageString(
            asset.temporalCoverageFrom,
            asset.temporalCoverageToInclusive,
          ),
        ),
      });
    }

    return {
      groupLabel,
      properties: fields,
    };
  }

  buildAdditionalPropertiesGroups(
    dataOffer: DataOfferDetailPageResult,
  ): PropertyGridGroup[] {
    const asset = dataOffer.asset;

    const additionalProperties: PropertyGridField[] = [];
    const customProperties: PropertyGridField[] = [
      asset.customJsonAsString,
      asset.customJsonLdAsString,
    ]
      .map((json) => this.buildAdditionalProperties(json))
      .flat()
      .map((prop) => {
        return {
          icon: 'category ',
          label: prop.key,
          labelTitle: prop.key,
          ...this.propertyGridFieldService.guessValue(prop.value),
        };
      });

    const privateCustomProperties: PropertyGridField[] = [
      asset.privateCustomJsonAsString,
      asset.privateCustomJsonLdAsString,
    ]
      .map((json) => this.buildAdditionalProperties(json))
      .flat()
      .map((prop) => {
        return {
          icon: 'category ',
          label: prop.key,
          labelTitle: prop.key,
          ...this.propertyGridFieldService.guessValue(prop.value),
        };
      });

    return [
      {
        groupLabel: this.t(`${this.assetKey}.ADDITIONAL_PROPERTIES`),
        properties: additionalProperties,
      },
      {
        groupLabel: this.t(`${this.assetKey}.CUSTOM_PROPERTIES`),
        properties: customProperties,
      },
      {
        groupLabel: this.t(`${this.assetKey}.PRIVATE_PROPERTIES`),
        properties: privateCustomProperties,
      },
    ];
  }

  buildContractOfferGroup(
    dataOffer: DataOfferDetailPageResult,
    contractOffer: DataOfferDetailContractOffer,
    i: number,
    total: number,
  ) {
    const policy = contractOffer.contractPolicy;
    const groupLabel = this.t(`${this.assetKey}.CONTRACT_OFFER`, {
      index: total > 1 ? `${i + 1}` : '',
    }).trim();
    const properties: PropertyGridField[] = [
      {
        icon: 'policy',
        label: this.t(`${this.assetKey}.CONTRACT_POLICY`),
        policy: this.policyMapper.buildPolicy(policy.expression!),
        policyErrors: policy.errors || [],
        additionalContainerClasses: 'col-span-2',
      },
      {
        icon: 'policy',
        label: this.t(`${this.assetKey}.CONTRACT_POLICY_JSON_LD`),
        text: this.t(`${this.assetKey}.SHOW_POLICY_DETAILS`),
        onclick: () =>
          this.jsonDialogService.showJsonDetailDialog({
            title: this.t(`${this.assetKey}.CONTRACT_POLICY_TITLE`, {
              groupLabel,
            }),
            subtitle: dataOffer.asset.title,
            icon: 'policy',
            objectForJson: JSON.parse(
              contractOffer.contractPolicy.policyJsonLd,
            ),
          }),
      },
    ];
    return {groupLabel, properties};
  }

  private buildDataSampleUrlsField(
    dataSampleUrls: string[],
    title: string,
  ): PropertyGridField {
    return {
      icon: 'attachment',
      label: this.t(`${this.assetKey}.DATA_SAMPLES`),
      text: this.t(`${this.assetKey}.SHOW_DATA_SAMPLES`),
      onclick: () =>
        this.urlListDialogService.showUrlListDialog({
          title: this.t(`${this.assetKey}.DATA_SAMPLES`),
          subtitle: title,
          icon: 'attachment',
          urls: dataSampleUrls,
        }),
    };
  }

  private buildReferenceFileUrlsField(
    referenceFileUrls: string[],
    description: string | undefined,
    title: string,
  ): PropertyGridField {
    return {
      icon: 'receipt',
      label: this.t(`${this.assetKey}.REFERENCE_FILES`),
      text: this.t(`${this.assetKey}.SHOW_REFERENCE_FILES`),
      onclick: () =>
        this.urlListDialogService.showUrlListDialog({
          title: this.t(`${this.assetKey}.REFERENCE_FILES`),
          subtitle: title,
          icon: 'receipt',
          urls: referenceFileUrls,
          description: description,
        }),
    };
  }

  private buildTemporalCoverageString(
    start: Date | undefined,
    end: Date | undefined,
  ): string {
    if (!end) {
      return this.t(`${this.assetKey}.TEMPORAL_START`, {
        date: start!.toLocaleDateString(),
      });
    }

    if (!start) {
      return this.t(`${this.assetKey}.TEMPORAL_END`, {
        date: end.toLocaleDateString(),
      });
    }

    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  }

  private getLanguage(asset: UiAsset): string {
    if (!asset.language) {
      return '';
    }
    return this.languageService.findLabel(asset.language.toUpperCase());
  }

  private buildHttpDatasourceFields(
    dataOffer: DataOfferDetailPageResult,
  ): PropertyGridField[] {
    const asset = dataOffer.asset;
    const fields: PropertyGridField[] = [];

    const hints: {labelKey: string; value: boolean | undefined}[] = [
      {
        labelKey: `${this.assetKey}.HTTP_METHOD`,
        value: asset.httpDatasourceHintsProxyMethod,
      },
      {
        labelKey: `${this.assetKey}.HTTP_PATH`,
        value: asset.httpDatasourceHintsProxyPath,
      },
      {
        labelKey: `${this.assetKey}.HTTP_QUERY_PARAMS`,
        value: asset.httpDatasourceHintsProxyQueryParams,
      },
      {
        labelKey: `${this.assetKey}.HTTP_BODY`,
        value: asset.httpDatasourceHintsProxyBody,
      },
    ];
    if (hints.some((hint) => hint.value != null)) {
      const text = hints.some((hint) => hint.value)
        ? hints
            .filter((hint) => hint.value)
            .map((hint) => this.t(hint.labelKey))
            .join(', ')
        : this.t(`${this.assetKey}.HTTP_DISABLED`);

      fields.push({
        icon: 'api',
        label: this.t(`${this.assetKey}.HTTP_PARAMETRIZATION`),
        text,
      });
    }

    if (asset.mediaType) {
      fields.push({
        icon: 'category',
        label: this.t(`${this.assetKey}.CONTENT_TYPE`),
        ...this.propertyGridFieldService.guessValue(asset.mediaType),
      });
    }

    return fields;
  }

  private buildAdditionalProperties(
    json: string | undefined,
  ): AdditionalAssetProperty[] {
    const obj = this.tryParseJsonObj(json || '{}');
    return Object.entries(obj).map(
      ([key, value]): AdditionalAssetProperty => ({
        key: `${key}`,
        value:
          typeof value === 'object'
            ? JSON.stringify(value, null, 2)
            : `${value}`,
      }),
    );
  }

  private tryParseJsonObj(json: string): any {
    const bad = {
      [this.t(`${this.assetKey}.CONVERSION_FAILURE`)]: this.t(
        `${this.assetKey}.BAD_JSON`,
        {json},
      ),
    };

    try {
      const parsed = JSON.parse(json);
      if (parsed == null) {
        return {};
      } else if (typeof parsed === 'object') {
        return parsed;
      }
    } catch (e) {}

    return bad;
  }

  buildOnRequestContactInformation(
    dataOffer: DataOfferDetailPageResult,
  ): PropertyGridGroup[] {
    const asset = dataOffer.asset;
    if (asset.dataSourceAvailability === 'LIVE') {
      return [];
    }
    return [
      {
        groupLabel: this.t(`${this.assetKey}.CONTACT_INFORMATION`),
        properties: [
          {
            icon: 'mail',
            label: this.t(`${this.assetKey}.CONTACT_EMAIL`),
            copyButton: true,
            hideFieldValue: true,
            ...this.propertyGridFieldService.guessValue(
              asset.onRequestContactEmail,
            ),
          },
          {
            icon: 'subject',
            label: this.t(`${this.assetKey}.CONTACT_EMAIL_SUBJECT`),
            copyButton: true,
            ...this.propertyGridFieldService.guessValue(
              asset.onRequestContactEmailSubject,
            ),
          },
        ],
      },
    ];
  }

  private getPrettyDataOfferType(dataOfferType: DataSourceAvailability): string {
    switch (dataOfferType) {
      case 'LIVE':
        return this.t(`${this.assetKey}.OFFER_TYPE_AVAILABLE`);
      case 'ON_REQUEST':
        return this.t(`${this.assetKey}.OFFER_TYPE_ON_REQUEST`);
    }
  }

  private t(key: string, params?: Record<string, unknown>): string {
    return this.translate.instant(key, params);
  }
}
