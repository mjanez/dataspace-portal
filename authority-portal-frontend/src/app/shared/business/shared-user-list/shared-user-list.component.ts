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
import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Subject, takeUntil} from 'rxjs';
import {MemberInfo} from '@sovity.de/authority-portal-client';
import {getOrganizationUserRegistrationStatusClasses} from 'src/app/core/utils/ui-utils';
import {
  getHighestApplicationRole,
  getHighestParticipantRole,
  mapRolesToReadableFormat,
} from 'src/app/core/utils/user-role-utils';

export interface Members extends MemberInfo {
  applicationRole: string;
  participantRole: string;
}

@Component({
    selector: 'app-shared-user-list',
    templateUrl: './shared-user-list.component.html',
    standalone: false
})
export class SharedUserListComponent implements OnInit, OnDestroy {
  @Input() organizationId!: string;
  @Input() members!: MemberInfo[];
  @Output() selectUserEvent = new EventEmitter<MemberInfo>();

  modifiedMembers!: Members[];

  getOrganizationUserRegistrationStatusClasses =
    getOrganizationUserRegistrationStatusClasses;
  selectedRole: any;

  private ngOnDestroy$ = new Subject();

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    this.buildModifiedMembers();
    this.translate.onLangChange
      .pipe(takeUntil(this.ngOnDestroy$))
      .subscribe(() => this.buildModifiedMembers());
  }

  ngOnDestroy(): void {
    this.ngOnDestroy$.next(null);
    this.ngOnDestroy$.complete();
  }

  private buildModifiedMembers(): void {
    this.modifiedMembers = this.members.map((member: MemberInfo) => {
      let highestApplicationRole = getHighestApplicationRole(member.roles);
      return {
        ...member,
        applicationRole: highestApplicationRole
          ? mapRolesToReadableFormat(highestApplicationRole, (key) =>
              this.translate.instant(key),
            )
          : '',
        participantRole: mapRolesToReadableFormat(
          getHighestParticipantRole(member.roles),
          (key) => this.translate.instant(key),
        ),
      };
    });
  }

  selectUser(user: MemberInfo) {
    this.selectUserEvent.emit(user);
  }
}
