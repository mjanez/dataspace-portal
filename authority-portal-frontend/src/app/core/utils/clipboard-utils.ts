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
import {ToastService} from 'src/app/shared/common/toast-notifications/toast.service';

@Injectable({
  providedIn: 'root',
})
export class ClipboardUtils {
  constructor(
    private toastService: ToastService,
    private translate: TranslateService,
  ) {}

  copyToClipboard(text: string | undefined) {
    if (!text) {
      this.toastService.showDanger(
        this.translate.instant('TOASTS.NOTHING_TO_COPY'),
      );
      return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;

    document.body.appendChild(textarea);
    textarea.select();
    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.toastService.showSuccess(
          this.translate.instant('TOASTS.CLIPBOARD_COPIED'),
        );
      })
      .catch(() => {
        this.toastService.showDanger(
          this.translate.instant('TOASTS.FAILED_COPY_CLIPBOARD'),
        );
      });

    document.body.removeChild(textarea);
  }
}
