import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WebSocketService } from './websocket/websocket.service';
import { User } from '../chat/interfaces/message';
import { catchError } from 'rxjs/operators';
import { throwError, of } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit{
  constructor(private router: Router, private websocketService: WebSocketService, private http: HttpClient) {}

  async ngOnInit(): Promise<void> {
    this.setStatusOnline();
  }

  async loading(modus: string){
  const user = this.http.get<{user: User}>(`http://localhost:3001/api/chat/get-user-data`, { withCredentials: true })
  .pipe(
    catchError((error: any) => {
      // console.log(error);
      return of(null);
    }))
    .subscribe(data => {
      if (data) {
        this.router.navigate(['/loading', modus, data.user.name, data.user.id_42]);
      }})
   }

    async setStatusOnline(): Promise<any>{
    return new Promise<any>((resolve, reject) => {
      this.http.post(`http://localhost:3001/api/status/online`, undefined, { withCredentials: true })
        .subscribe(
          (response: any) => {
            resolve(response); // Resolve the Promise with the response data
          },
          (error: HttpErrorResponse) => {
            if (error.status === 400) {
              console.log('Cant Set Online');
            }
            reject(error); // Reject the Promise with the error
          }
        );
  });
  }
}
