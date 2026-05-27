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
import {OperatorDto} from '@sovity.de/authority-portal-client';

export interface PolicyOperatorConfig {
  id: OperatorDto;
  title: string;
  descriptionKey: string;
  titleKey?: string;
}

export const SUPPORTED_POLICY_OPERATORS: PolicyOperatorConfig[] = [
  {
    id: 'EQ',
    title: '=',
    descriptionKey: 'POLICY.OPERATOR.EQ_DESC',
  },
  {
    id: 'NEQ',
    title: '≠',
    descriptionKey: 'POLICY.OPERATOR.NEQ_DESC',
  },
  {
    id: 'GEQ',
    title: '≥',
    descriptionKey: 'POLICY.OPERATOR.GEQ_DESC',
  },
  {
    id: 'GT',
    title: '>',
    descriptionKey: 'POLICY.OPERATOR.GT_DESC',
  },
  {
    id: 'LEQ',
    title: '≤',
    descriptionKey: 'POLICY.OPERATOR.LEQ_DESC',
  },
  {
    id: 'LT',
    title: '<',
    descriptionKey: 'POLICY.OPERATOR.LT_DESC',
  },
  {
    id: 'IN',
    title: 'IN',
    titleKey: 'POLICY.OPERATOR.IN',
    descriptionKey: 'POLICY.OPERATOR.IN_DESC',
  },
  {
    id: 'HAS_PART',
    title: 'HAS PART',
    titleKey: 'POLICY.OPERATOR.HAS_PART',
    descriptionKey: 'POLICY.OPERATOR.HAS_PART_DESC',
  },
  {
    id: 'IS_A',
    title: 'IS A',
    titleKey: 'POLICY.OPERATOR.IS_A',
    descriptionKey: 'POLICY.OPERATOR.IS_A_DESC',
  },
  {
    id: 'IS_NONE_OF',
    title: 'IS NONE OF',
    titleKey: 'POLICY.OPERATOR.IS_NONE_OF',
    descriptionKey: 'POLICY.OPERATOR.IS_NONE_OF_DESC',
  },
  {
    id: 'IS_ANY_OF',
    title: 'IS ANY OF',
    titleKey: 'POLICY.OPERATOR.IS_ANY_OF',
    descriptionKey: 'POLICY.OPERATOR.IS_ANY_OF_DESC',
  },
  {
    id: 'IS_ALL_OF',
    title: 'IS ALL OF',
    titleKey: 'POLICY.OPERATOR.IS_ALL_OF',
    descriptionKey: 'POLICY.OPERATOR.IS_ALL_OF_DESC',
  },
];
export const defaultPolicyOperatorConfig = (
  operator: OperatorDto,
): PolicyOperatorConfig => ({
  id: operator,
  title: operator,
  descriptionKey: '',
});
