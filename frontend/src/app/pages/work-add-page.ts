import { ChangeDetectionStrategy, Component, OnInit, inject, input, linkedSignal, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Api, errorMessage } from '../core/api';
import { todayIso } from '../core/format';
import { WorkKind } from '../core/models';
import { KIND_NAMES, MAX_BODY } from '../core/work';

/** Registrar (o editar) una nota, un resumen o un texto/prompt pegado. */
@Component({
  selector: 'app-work-add-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section>
      <h1>{{ id() ? 'Editar registro' : 'Registrar' }}</h1>
      @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
      <form (submit)="save($event)">
        <div class="row">
          <label class="field"><span>Fecha</span>
            <input type="date" required aria-label="Fecha" [value]="date()" (input)="date.set($any($event.target).value)" (change)="date.set($any($event.target).value)" /></label>
          <label class="field"><span>Tipo</span>
            <select aria-label="Tipo" [value]="kind()" (change)="kind.set($any($event.target).value)">
              @for (k of kinds; track k[0]) { <option [value]="k[0]" [selected]="k[0] === kind()">{{ k[1] }}</option> }
            </select></label>
        </div>
        <label class="field"><span>Título (opcional)</span>
          <input type="text" maxlength="200" aria-label="Título" [value]="title()" (input)="title.set($any($event.target).value)" /></label>
        <label class="field"><span>Texto</span>
          <textarea rows="12" required maxlength="20000" aria-label="Texto" [value]="body()" (input)="body.set($any($event.target).value)"
            placeholder="Escribe una nota, un resumen o pega aquí un texto o un prompt…"></textarea>
          <small class="muted">{{ body().length }} / {{ max }} caracteres</small></label>
        <div class="actions">
          <button type="submit" class="btn primary big" [disabled]="saving() || !body().trim()">{{ saving() ? 'Guardando…' : 'Guardar' }}</button>
          @if (body().trim()) { <button type="button" class="btn" (click)="copy()">{{ copied() ? 'Copiado ✓' : 'Copiar texto' }}</button> }
          @if (id()) { <button type="button" class="btn danger" (click)="remove()">Borrar</button> }
          <a class="btn" routerLink="/trabajo">Cancelar</a>
        </div>
      </form>
    </section>
  `,
})
export class WorkAddPage implements OnInit {
  readonly id = input<string | undefined>();
  readonly dateParam = input<string | undefined>(undefined, { alias: 'date' });
  private readonly api = inject(Api);
  private readonly router = inject(Router);
  protected readonly kinds = Object.entries(KIND_NAMES);
  protected readonly max = MAX_BODY;
  /** Se deriva del parámetro ?date= (sin pisar lo que la persona teclee después); en ngOnInit el campo ya existe. */
  protected readonly date = linkedSignal(() => { const d = this.dateParam(); return d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : todayIso(); });
  protected readonly kind = signal<WorkKind>('NOTE');
  protected readonly title = signal('');
  protected readonly body = signal('');
  protected readonly error = signal('');
  protected readonly saving = signal(false);
  protected readonly copied = signal(false);

  async ngOnInit(): Promise<void> {
    if (!this.id()) return;
    try {
      const e = await this.api.workEntry(this.id()!);
      this.date.set(e.date); this.kind.set(e.kind); this.title.set(e.title ?? ''); this.body.set(e.body);
    } catch (err) { this.error.set(errorMessage(err)); }
  }

  protected async save(ev: Event): Promise<void> {
    ev.preventDefault();
    this.saving.set(true); this.error.set('');
    const req = { date: this.date(), kind: this.kind(), title: this.title().trim() || null, body: this.body() };
    try {
      if (this.id()) await this.api.updateWorkEntry(this.id()!, req); else await this.api.createWorkEntry(req);
      if (req.date === todayIso()) await this.router.navigate(['/trabajo']);
      else await this.router.navigate(['/trabajo/calendario'], { queryParams: { date: req.date } });
    } catch (e) { this.error.set(errorMessage(e)); } finally { this.saving.set(false); }
  }

  protected async remove(): Promise<void> {
    if (!confirm('¿Borrar este registro? No se puede deshacer.')) return;
    try { await this.api.deleteWorkEntry(this.id()!); await this.router.navigate(['/trabajo']); } catch (e) { this.error.set(errorMessage(e)); }
  }

  protected async copy(): Promise<void> {
    try { await navigator.clipboard.writeText(this.body()); this.copied.set(true); setTimeout(() => this.copied.set(false), 2000); }
    catch { this.error.set('No se pudo copiar: selecciona el texto y cópialo a mano.'); }
  }
}
