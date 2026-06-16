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
import {EMPTY, Observable, forkJoin} from 'rxjs';
import {
  filter,
  finalize,
  ignoreElements,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import {Action, Actions, Selector, State, StateContext} from '@ngxs/store';
import {OrganizationDetailsDto} from '@sovity.de/authority-portal-client';
import {ApiService} from 'src/app/core/api/api.service';
import {GlobalStateUtils} from 'src/app/core/global-state/global-state-utils';
import {ErrorService} from 'src/app/core/services/error.service';
import {SlideOverService} from 'src/app/core/services/slide-over.service';
import {Fetched} from 'src/app/core/utils/fetched';
import {ToastService} from 'src/app/shared/common/toast-notifications/toast.service';
import {RefreshOrganizations} from '../../authority-organization-list-page/authority-organization-list-page/state/authority-organization-list-page-actions';
import {AuthorityOrganizationDetailTab} from '../authority-organization-detail-page/authority-organization-detail-page.model';
import {
  ApproveOrganization,
  DeactivateUser,
  ReactivateUser,
  RefreshOrganization,
  RefreshOrganizationUser,
  RejectOrganization,
  SetOrganizationId,
  SetOrganizationUserId,
} from './authority-organization-detail-page-actions';
import {
  AuthorityOrganizationDetailPageState,
  DEFAULT_AUTHORITY_ORGANIZATION_DETAIL_PAGE_STATE,
  DEFAULT_AUTHORITY_ORGANIZATION_DETAIL_STATE,
} from './authority-organization-detail-page-state';

@State<AuthorityOrganizationDetailPageState>({
  name: 'AuthorityOrganizationDetailPageState',
  defaults: DEFAULT_AUTHORITY_ORGANIZATION_DETAIL_PAGE_STATE,
})
@Injectable()
export class AuthorityOrganizationDetailPageStateImpl {
  constructor(
    private apiService: ApiService,
    private actions$: Actions,
    private errorService: ErrorService,
    private toast: ToastService,
    private globalStateUtils: GlobalStateUtils,
    private slideOverService: SlideOverService,
    private translate: TranslateService,
  ) {}

  // Organization  State Implementation

  @Action(SetOrganizationId)
  onSetOrganizationId(
    ctx: StateContext<AuthorityOrganizationDetailPageState>,
    action: SetOrganizationId,
  ): Observable<never> {
    ctx.patchState({
      organizationDetail: {
        ...DEFAULT_AUTHORITY_ORGANIZATION_DETAIL_STATE,
        organizationId: action.organizationId,
      },
    });

    return EMPTY;
  }

  @Action(RefreshOrganization, {cancelUncompleted: true})
  onRefreshOrganization(
    ctx: StateContext<AuthorityOrganizationDetailPageState>,
    action: RefreshOrganization,
  ): Observable<never> {
    return this.globalStateUtils.getDeploymentEnvironmentId().pipe(
      switchMap((deploymentEnvironmentId) =>
        this.apiService.getOrganizationDetailsForAuthority(
          ctx.getState().organizationDetail.organizationId,
          deploymentEnvironmentId,
        ),
      ),
      Fetched.wrap({
        failureMessage: this.translate.instant('TOASTS.FAILED_ORGANIZATIONS'),
      }),
      tap((organization) =>
        this.organizationRefreshed(ctx, organization, action.cb),
      ),
      ignoreElements(),
    );
  }

  private organizationRefreshed(
    ctx: StateContext<AuthorityOrganizationDetailPageState>,
    organization: Fetched<OrganizationDetailsDto>,
    cb?: () => void,
  ) {
    this.globalStateUtils.updateNestedProperty(
      ctx,
      'organizationDetail.organization',
      organization,
    );
    if (cb) {
      cb();
    }
  }

  @Action(ApproveOrganization)
  onApproveOrganization(
    ctx: StateContext<AuthorityOrganizationDetailPageState>,
    action: ApproveOrganization,
  ): Observable<never> {
    if (ctx.getState().organizationDetail.busy) {
      return EMPTY;
    }
    this.globalStateUtils.updateNestedProperty(
      ctx,
      'organizationDetail.busy',
      true,
    );

    return forkJoin([
      this.apiService.approveOrganization(
        ctx.getState().organizationDetail.organizationId,
      ),
      this.globalStateUtils.getDeploymentEnvironmentId(),
    ]).pipe(
      switchMap(([res, deploymentEnvironmentId]) =>
        this.apiService.getOrganizationDetailsForAuthority(
          ctx.getState().organizationDetail.organizationId,
          deploymentEnvironmentId,
        ),
      ),
      takeUntil(
        this.actions$.pipe(
          filter((action) => action instanceof RefreshOrganization),
        ),
      ),
      this.errorService.toastFailureRxjs(
        this.translate.instant('TOASTS.ORGANIZATION_NOT_APPROVED'),
      ),
      tap((data) => {
        this.organizationRefreshed(ctx, Fetched.ready(data));
        ctx.dispatch(new RefreshOrganizations());
        this.toast.showSuccess(
          this.translate.instant('TOASTS.ORGANIZATION_APPROVED', {
            id: ctx.getState().organizationDetail.organizationId,
          }),
        );
      }),
      finalize(() =>
        this.globalStateUtils.updateNestedProperty(
          ctx,
          'organizationDetail.busy',
          false,
        ),
      ),
      ignoreElements(),
    );
  }

  @Action(RejectOrganization)
  onRejectOrganization(
    ctx: StateContext<AuthorityOrganizationDetailPageState>,
    action: RejectOrganization,
  ): Observable<never> {
    if (ctx.getState().organizationDetail.busy) {
      return EMPTY;
    }
    this.globalStateUtils.updateNestedProperty(
      ctx,
      'organizationDetail.busy',
      true,
    );
    return forkJoin([
      this.apiService.rejectOrganization(
        ctx.getState().organizationDetail.organizationId,
      ),
      this.globalStateUtils.getDeploymentEnvironmentId(),
    ]).pipe(
      switchMap(([res, deploymentEnvironmentId]) =>
        this.apiService.getOrganizationDetailsForAuthority(
          ctx.getState().organizationDetail.organizationId,
          deploymentEnvironmentId,
        ),
      ),
      takeUntil(
        this.actions$.pipe(
          filter((action) => action instanceof RefreshOrganization),
        ),
      ),
      this.errorService.toastFailureRxjs(
        this.translate.instant('TOASTS.ORGANIZATION_NOT_REJECTED'),
      ),
      tap((data) => {
        this.toast.showSuccess(
          this.translate.instant('TOASTS.ORGANIZATION_REJECTED', {
            id: ctx.getState().organizationDetail.organizationId,
          }),
        );
        this.organizationRefreshed(ctx, Fetched.ready(data));
        ctx.dispatch(new RefreshOrganizations());
      }),
      finalize(() =>
        this.globalStateUtils.updateNestedProperty(
          ctx,
          'organizationDetail.busy',
          false,
        ),
      ),
      ignoreElements(),
    );
  }

  // Organization Currently Opened User Detail State Implementation

  @Action(SetOrganizationUserId)
  onSetOrganizationUserId(
    ctx: StateContext<AuthorityOrganizationDetailPageState>,
    action: SetOrganizationUserId,
  ): Observable<never> {
    ctx.patchState({
      openedUserDetail: {
        ...DEFAULT_AUTHORITY_ORGANIZATION_DETAIL_PAGE_STATE.openedUserDetail,
        organizationId: action.organizationId,
        userId: action.userId,
      },
    });
    return EMPTY;
  }

  @Action(RefreshOrganizationUser, {cancelUncompleted: true})
  onRefreshOrganizationUser(
    ctx: StateContext<AuthorityOrganizationDetailPageState>,
  ): Observable<never> {
    return this.apiService
      .getOrganizationUser(ctx.getState().openedUserDetail.userId)
      .pipe(
        Fetched.wrap({
          failureMessage: this.translate.instant('TOASTS.FAILED_USER'),
        }),
        tap((user) => this.organizationUserRefreshed(ctx, user)),
        ignoreElements(),
      );
  }

  private organizationUserRefreshed(
    ctx: StateContext<AuthorityOrganizationDetailPageState>,
    user: Fetched<any>,
  ) {
    this.globalStateUtils.updateNestedProperty(
      ctx,
      'openedUserDetail.user',
      user,
    );
  }

  redirectToMembersTab() {
    this.slideOverService.setSlideOverViews(
      {viewName: AuthorityOrganizationDetailTab.MEMBERS},
      {viewName: AuthorityOrganizationDetailTab.DETAIL},
    );
  }

  @Action(DeactivateUser)
  onDeactivateUser(
    ctx: StateContext<AuthorityOrganizationDetailPageState>,
    action: DeactivateUser,
  ) {
    if (ctx.getState().openedUserDetail.busy) {
      return EMPTY;
    }
    this.globalStateUtils.updateNestedProperty(
      ctx,
      'openedUserDetail.busy',
      true,
    );
    return this.apiService.deactivateAnyUser(action.userId).pipe(
      takeUntil(
        this.actions$.pipe(
          filter((action) => action instanceof RefreshOrganizationUser),
        ),
      ),
      this.errorService.toastFailureRxjs(
        this.translate.instant('TOASTS.FAILED_DEACTIVATE_USER'),
      ),
      tap((data) => {
        this.toast.showSuccess(
          this.translate.instant('TOASTS.USER_DEACTIVATED'),
        );
        this.organizationUserRefreshed(ctx, Fetched.ready(data));
      }),
      finalize(() => {
        ctx.dispatch(
          new RefreshOrganization(() => {
            this.redirectToMembersTab();
          }),
        );

        return this.globalStateUtils.updateNestedProperty(
          ctx,
          'openedUserDetail.busy',
          false,
        );
      }),
      ignoreElements(),
    );
  }

  @Action(ReactivateUser)
  onReactivateUser(
    ctx: StateContext<AuthorityOrganizationDetailPageState>,
    action: ReactivateUser,
  ) {
    if (ctx.getState().openedUserDetail.busy) {
      return EMPTY;
    }
    this.globalStateUtils.updateNestedProperty(
      ctx,
      'openedUserDetail.busy',
      false,
    );
    return this.apiService.reactivateAnyUser(action.userId).pipe(
      takeUntil(
        this.actions$.pipe(
          filter((action) => action instanceof RefreshOrganizationUser),
        ),
      ),
      this.errorService.toastFailureRxjs(
        this.translate.instant('TOASTS.FAILED_REACTIVATE_USER'),
      ),
      tap((data) => {
        this.toast.showSuccess(
          this.translate.instant('TOASTS.USER_REACTIVATED'),
        );
        this.organizationUserRefreshed(ctx, Fetched.ready(data));
      }),
      finalize(() => {
        ctx.dispatch(
          new RefreshOrganization(() => {
            this.redirectToMembersTab();
          }),
        );
        return this.globalStateUtils.updateNestedProperty(
          ctx,
          'openedUserDetail.busy',
          false,
        );
      }),
      ignoreElements(),
    );
  }
}
