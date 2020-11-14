import { Observable } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

/**
 * @returns an observable which resets on another observable emission
 * @param observable an observable which will be reset
 * @param resetOn an observable which emission will trigger the reset
 * @param subscribeCallback
 */
export const resettableObservable = (
  observable: Observable<any>,
  resetOn: Observable<any>,
  subscribeCallback
) => {
  const reset = () =>
    resettableObservable(observable, resetOn, subscribeCallback).subscribe(
      subscribeCallback
    );

  return observable.pipe(takeUntil(resetOn), finalize(reset));
};
