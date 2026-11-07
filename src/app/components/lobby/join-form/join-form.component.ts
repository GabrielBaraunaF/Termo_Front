import { Component, computed, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { JoinParams } from '../../../models/game-contract';
import { SessionStatus } from '../../../services/session.store';

const DEFAULT_PORT = 5050;

const BUTTON_LABEL: Partial<Record<SessionStatus, string>> = {
  connecting: 'Conectando…',
  queued: 'Na fila',
};

@Component({
  selector: 'app-join-form',
  imports: [ReactiveFormsModule],
  templateUrl: './join-form.component.html',
  styleUrl: './join-form.component.scss',
  host: { class: 'card' },
})
export class JoinFormComponent {
  readonly status = input.required<SessionStatus>();
  readonly error = input<string | null>(null);
  readonly join = output<JoinParams>();

  protected readonly form = inject(NonNullableFormBuilder).group({
    host: ['', Validators.required],
    port: [DEFAULT_PORT, [Validators.required, Validators.min(1), Validators.max(65535)]],
    nickname: ['', [Validators.required, Validators.maxLength(16)]],
  });

  protected readonly busy = computed(() => this.status() === 'connecting' || this.status() === 'queued');
  protected readonly buttonLabel = computed(() => BUTTON_LABEL[this.status()] ?? 'Entrar na fila');

  constructor() {
    effect(() => {
      if (this.busy()) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { host, port, nickname } = this.form.getRawValue();
    this.join.emit({ host: host.trim(), port: Number(port), nickname: nickname.trim() });
  }
}
