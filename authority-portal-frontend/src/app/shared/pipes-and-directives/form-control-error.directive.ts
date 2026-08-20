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
import {Directive, ElementRef, Input, OnDestroy, OnInit} from '@angular/core';
import {AbstractControl, FormControl} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {Subscription, merge} from 'rxjs';
import {debounceTime, map} from 'rxjs/operators';

@Directive({
    selector: '[appFormControlError]',
    standalone: false
})
export class FormControlErrorDirective implements OnInit, OnDestroy {
  @Input() control!: AbstractControl | null;
  @Input() fieldName!: string;

  public errorMessage$!: Subscription | undefined;

  constructor(
    private el: ElementRef,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    const formControl = this.control as FormControl;
    this.errorMessage$ = merge(
      formControl.statusChanges,
      this.translate.onLangChange,
    )
      .pipe(
        debounceTime(500),
        map(() => {
          const {dirty, invalid, touched} = formControl || {};
          return (dirty || touched) && invalid
            ? this.getErrorMessage(formControl, this.fieldName)
            : '';
        }),
      )
      .subscribe((response) => {
        this.el.nativeElement.textContent = response;
      });
  }

  private getErrorMessage(
    control: FormControl | null,
    fieldName: string,
  ): string {
    if (!control || !control.errors) {
      return '';
    }

    const t = (key: string, params?: Record<string, unknown>) =>
      this.translate.instant(key, {field: fieldName, ...params});

    const errors = control.errors;

    if (errors['required']) {
      return t('VALIDATION.REQUIRED');
    }

    if (errors['email']) {
      return t('VALIDATION.EMAIL');
    }

    if (errors['isNotUnique']) {
      return t('VALIDATION.NOT_UNIQUE');
    }

    if (errors['mismatch']) {
      return t('VALIDATION.MISMATCH');
    }

    if (errors['minlength']) {
      const {requiredLength} = errors['minlength'];
      return requiredLength === 1
        ? t('VALIDATION.MIN_LENGTH', {length: requiredLength})
        : t('VALIDATION.MIN_LENGTH_PLURAL', {length: requiredLength});
    }

    if (errors['invalidUrl']) {
      return t('VALIDATION.INVALID_URL');
    }

    if (errors['invalidSubdomain']) {
      return t('VALIDATION.INVALID_SUBDOMAIN');
    }

    if (errors['errorMessage']) {
      return t('VALIDATION.INVALID_CREDENTIALS');
    }

    if (errors['pattern']) {
      return t('VALIDATION.INVALID_PATTERN');
    }

    if (errors['hasNumber']) {
      return t('VALIDATION.HAS_NUMBER');
    }

    if (errors['hasCapitalCase']) {
      return t('VALIDATION.HAS_UPPERCASE');
    }

    if (errors['hasSmallCase']) {
      return t('VALIDATION.HAS_LOWERCASE');
    }

    if (errors['hasSpecialCharacters']) {
      return t('VALIDATION.HAS_SPECIAL');
    }

    return '';
  }

  ngOnDestroy(): void {
    this.errorMessage$?.unsubscribe();
  }
}
