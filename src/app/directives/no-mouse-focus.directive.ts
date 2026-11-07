import { Directive } from '@angular/core';

@Directive({
  selector: '[appNoMouseFocus]',
  host: { '(mousedown)': '$event.preventDefault()' },
})
export class NoMouseFocusDirective {}
