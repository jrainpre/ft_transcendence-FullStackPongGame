import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subscription, interval, of } from 'rxjs';
import { catchError, mergeMap, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HeartbeatService {
  private heartbeatInterval: Subscription = new Subscription();

  constructor(private http: HttpClient) { }

//   startHeartbeat(){
//     const heartbeatIntervalMs = 3 * 1000; // every 3 seconds

//     // Create an observable that emits values at the specified interval
//     const intervalObservable = interval(heartbeatIntervalMs);

//     // Use switchMap to make the API call when the interval emits a value
//     this.heartbeatInterval = intervalObservable.pipe(
//       mergeMap(() =>
//         this.http.post(environment.apiUrl + 'status/heartbeat', undefined, {
//           withCredentials: true,
//         }).pipe(
//           catchError((error) => {
//             console.error('Error sending heartbeat:', error);
//             // Handle the error if needed
//             return of(null); // Continue the observable stream even after an error
//           })
//         )
//       )
//     ).subscribe(
//       (response: any) => {
//         if (response !== null) {
//           console.log('Heartbeat sent successfully');
//           // Handle the response data if needed
//         }
//       }
//     );
//     // this.heartbeatInterval = intervalObservable.pipe(
//     //   switchMap(() =>
//     //     this.http.post('http://localhost:3001/api/status/heartbeat', undefined, {
//     //       withCredentials: true,
//     //     })
//     //   )
//     // ).subscribe(
//     //   (response: any) => {
//     //     console.log('Heartbeat sent successfully');
//     //     // Handle the response data if needed
//     //   },
//     //   (error) => {
//     //     console.error('Error sending heartbeat:', error);
//     //     // Handle the error if needed
//     //   }
//     // );
//   }
}
