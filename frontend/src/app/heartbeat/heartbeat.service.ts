import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class HeartbeatService {
  private heartbeatInterval: Subscription = new Subscription();

  constructor(private http: HttpClient) { }

  startHeartbeat(){
    const heartbeatIntervalMs = 3 * 1000; // every 3 seconds

    // Create an observable that emits values at the specified interval
    const intervalObservable = interval(heartbeatIntervalMs);

    // Use switchMap to make the API call when the interval emits a value
    console.log("test")
    this.heartbeatInterval = intervalObservable.pipe(
      switchMap(() =>
        this.http.post('http://localhost:3001/api/status/heartbeat', undefined, {
          withCredentials: true,
        })
      )
    ).subscribe(
      (response: any) => {
        console.log('Heartbeat sent successfully');
        // Handle the response data if needed
      },
      (error) => {
        console.error('Error sending heartbeat:', error);
        // Handle the error if needed
      }
    );
  }
}
