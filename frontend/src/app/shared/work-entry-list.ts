import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KIND_NAMES, entryTitle, longDate } from '../core/work';
import { WorkEntry } from '../core/models';

/** Lista de registros de trabajo (vista previa); cada uno abre su edición. */
@Component({
  selector: 'app-work-entry-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <ul class="results">
      @for (e of entries(); track e.id) {
        <li>
          <a class="result" [routerLink]="['/trabajo/registrar']" [queryParams]="{ id: e.id }">
            <span class="between"><strong>{{ title(e) }}</strong><span class="chip-static">{{ kinds[e.kind] }}</span></span>
            @if (showDate()) { <span class="muted small">{{ date(e.date) }}</span> }
            <span class="muted preview">{{ e.body }}@if (e.truncated) { … }</span>
          </a>
        </li>
      }
    </ul>
  `,
})
export class WorkEntryList {
  readonly entries = input.required<WorkEntry[]>();
  readonly showDate = input(false);
  protected readonly kinds = KIND_NAMES;
  protected title(e: WorkEntry): string { return entryTitle(e); }
  protected date(iso: string): string { return longDate(iso); }
}
