import { Component, ViewChild } from '@angular/core';
import { fromEvent, interval, of, Subject } from 'rxjs';
import {
  mergeMap,
  delay,
  map,
  concatMap,
  switchMap,
  takeUntil,
  delayWhen,
  finalize,
} from 'rxjs/operators';

enum EMITED_VAL_TYPE {
  delayed,
  instant,
}
type Results = {
  mergeMap: EMITED_VAL_TYPE[];
  concatMap: EMITED_VAL_TYPE[];
  switchMap: EMITED_VAL_TYPE[];
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  @ViewChild('mergeMapInput') mergeMapInput;
  @ViewChild('concatMapInput') concatMapInput;
  @ViewChild('switchMapInput') switchMapInput;

  results: Results = {
    mergeMap: [],
    concatMap: [],
    switchMap: [],
  };

  resets = {
    mergeMap: new Subject(),
    concatMap: new Subject(),
    switchMap: new Subject(),
  };

  resetObservable(operator: string) {
    this[operator + 'Input'].nativeElement.value = '';
    this.results[operator].length = 0;
    this.resets[operator].next(null);
  }

  ngAfterViewInit() {
    const isEven = (i) => (i + 1) % 2 === 0;
    const mapFn = (ev) => (<any>ev).currentTarget.value;
    const higherMapFn = (v, i) =>
      isEven(i)
        ? of(EMITED_VAL_TYPE.delayed).pipe(delay(1000))
        : of(EMITED_VAL_TYPE.instant);

    const operatorsMapping = {
      mergeMap: this.mergeMapInput,
      concatMap: this.concatMapInput,
      switchMap: this.switchMapInput,
    };

    (<any>Object).entries(operatorsMapping).forEach(([operator, value]) => {
      const operatorFn =
        operator === 'mergeMap'
          ? mergeMap
          : operator === 'concatMap'
          ? concatMap
          : switchMap;
      const subscribeFn = (v) => this.results[operator].push(v);

      const resettableObservable = () => {
        const reset = () => resettableObservable().subscribe(subscribeFn);

        return fromEvent(value.nativeElement, 'input').pipe(
          map(mapFn),
          operatorFn(higherMapFn),
          takeUntil(this.resets[operator]),
          finalize(reset)
        );
      };

      resettableObservable().subscribe(subscribeFn);
    });
  }
}
