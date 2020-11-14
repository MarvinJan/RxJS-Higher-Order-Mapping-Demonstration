import { Component, ViewChild } from '@angular/core';
import { fromEvent, of } from 'rxjs';
import { mergeMap, delay, map, concatMap, switchMap } from 'rxjs/operators';

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

    (<any>Object).entries(operatorsMapping).forEach(([key, value]) => {
      const operatorFn =
        key === 'mergeMap'
          ? mergeMap
          : key === 'concatMap'
          ? concatMap
          : switchMap;

      fromEvent(value.nativeElement, 'input')
        .pipe(map(mapFn), operatorFn(higherMapFn))
        .subscribe((v) => this.results[key].push(v));
    });
  }
}
