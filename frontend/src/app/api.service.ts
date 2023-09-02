import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, firstValueFrom, map, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})

export class ApiService {
  private apiUrl = 'http://localhost:3001/api/'; // Replace with your backend URL

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  loginWith42(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json', // Add other headers if needed
    });

    return this.http.get(`${this.apiUrl}auth/42/login`, {headers});
  }

  async getProfileInfo(id: string) : Promise<any>{
    return new Promise<any>((resolve, reject) => {
      this.http.get(`${this.apiUrl}user/${id}`, { withCredentials: true })
        .subscribe(
          (response: any) => {
            console.log(response);
            resolve(response); // Resolve the Promise with the response data
          },
          (error: HttpErrorResponse) => {
            if (error.status === 400) {
              console.log('Verification failed: Wrong code');
            } else {
              console.log('An error occurred during verification');
            }
            reject(error); // Reject the Promise with the error
          }
        );
  });
  }

  async postEditUsername(UsernameId: any, id: string): Promise<Observable<any>>{

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.apiUrl}edit`, UsernameId, { withCredentials: true }).pipe(
      map((response: any) => {
        if(response.success == true)
          return response;
        else
          throw new Error('Useranme Exists');
        
      }),
      catchError((error) => {
        return throwError(() => new Error('Useranme Exists'));
      })
    );
  }

  async postDisableTFA(userId : string): Promise<any>{

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    this.http.post(`${this.apiUrl}auth/42/disable`, undefined , { withCredentials: true }).subscribe(
      (response: any) => {
        if(response.message == 'Success!')
        this.router.navigate([`/profile/${userId}`])
      },
      (error) => {
        console.error('Error making POST request', error);
      }
    );
  }

  async postUploadFile(file : any, userId : string): Promise<any>{

    const formData = new FormData();
    formData.append('avatar', file);
    console.log(file, userId);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    this.http.post(`${this.apiUrl}upload/avatar`, formData , { withCredentials: true }).subscribe(
      (response: any) => {
        if(response.success == true)
        this.router.navigate([`/profile/${userId}`])
      },
      (error) => {
        console.error('Error making POST request', error);
      }
    );
  }

  async isUser(id: string): Promise<boolean> {
    const response = await firstValueFrom<any>(
      this.http.get(`${this.apiUrl}user/is-user/${id}`, { withCredentials: true })
    );

    console.log(response);
    return response.message === 'true';
  }

  async setFirstLoginFalse() : Promise<any>{
    console.log('called');
    this.http.get(`${this.apiUrl}user/first-login-false`, { withCredentials: true }).subscribe();
  }
}
