import { Component, ViewChild } from '@angular/core';
import { fromEvent, of, Subject } from 'rxjs';
import {
  mergeMap,
  delay,
  map,
  concatMap,
  switchMap,
  tap,
} from 'rxjs/operators';
import { resettableObservable } from './utilities/helper-functions';

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

  delayedQueue = {
    mergeMap: [],
    concatMap: [],
    switchMap: [],
  };

  resetObservable(operator: string) {
    this[operator + 'Input'].nativeElement.value = '';
    this.delayedQueue[operator].length = 0;
    this.results[operator].length = 0;
    this.resets[operator].next(null);
  }

  ngAfterViewInit() {
    const isEven = (i) => (i + 1) % 2 === 0;
    const eventToValue = (ev) => (<any>ev).currentTarget.value;

    const operatorsMapping = {
      mergeMap: this.mergeMapInput,
      concatMap: this.concatMapInput,
      switchMap: this.switchMapInput,
    };

    (<any>Object).entries(operatorsMapping).forEach(([operator, input]) => {
      const operatorFn =
        operator === 'mergeMap'
          ? mergeMap
          : operator === 'concatMap'
          ? concatMap
          : switchMap;

      const removeFromDelayedQueue = (addNew: boolean = true) => {
        return () => {
          const arr = this.delayedQueue[operator];
          let index = arr.findIndex((el) => el === 0);

          if (operator === 'switchMap' && index > -1 && !addNew) {
            arr.splice(index, 1);
          } else {
            arr.splice(index, 1, 1);
          }
        };
      };

      const subscribeToInput = (v: EMITED_VAL_TYPE) =>
        this.results[operator].push(v);
      const emissionDisplay = (v, i) => {
        isEven(i)
          ? this.delayedQueue[operator].push(EMITED_VAL_TYPE.delayed)
          : this.delayedQueue[operator].unshift(EMITED_VAL_TYPE.instant);

        if (!isEven(i) && operator === 'switchMap')
          removeFromDelayedQueue(false)();

        return isEven(i)
          ? of(EMITED_VAL_TYPE.delayed).pipe(
              delay(1000),
              tap(removeFromDelayedQueue(true))
            )
          : of(EMITED_VAL_TYPE.instant);
      };

      const inputObservable = fromEvent(input.nativeElement, 'input').pipe(
        map(eventToValue),
        operatorFn(emissionDisplay)
      );
      resettableObservable(
        inputObservable,
        this.resets[operator],
        subscribeToInput
      ).subscribe(subscribeToInput);
    });
  }
}
