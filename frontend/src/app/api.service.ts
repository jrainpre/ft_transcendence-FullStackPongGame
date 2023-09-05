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
            resolve(response); // Resolve the Promise with the response data
          },
          (error: HttpErrorResponse) => {
            if (error.status === 401) {
              this.router.navigate(['login']);
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
    return response.message === 'true';
  }

  async setFirstLoginFalse() : Promise<any>{
    console.log('called');
    this.http.get(`${this.apiUrl}user/first-login-false`, { withCredentials: true }).subscribe();
  }

  async getIdByJwt() : Promise<any>{
    return new Promise<any>((resolve, reject) => {
      this.http.get(`${this.apiUrl}user/get-id-by-jwt`, { withCredentials: true })
        .subscribe(
          (response: any) => {
            console.log(response);
            resolve(response.message); // Resolve the Promise with the response data
          },
          (error: HttpErrorResponse) => {
            if (error.status === 401) 
            {
              console.log('rerout')
              this.router.navigate(['login']);
            }
            reject(error); // Reject the Promise with the error
          }
        );
  });
  }

  // get all the players from the database, name and win/loss ratio
  async getPlayers(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.http.get(`${this.apiUrl}user/all-users`, { withCredentials: true })
        .subscribe(
          (response: any) => {
            console.log(response);
            resolve(response); // Resolve the Promise with the response data
          },
          (error: HttpErrorResponse) => {
            if (error.status === 400) {
              console.log('User doesnt exists');
            } else {
              console.log('User doesnt exists');
            }
            reject(error); // Reject the Promise with the error
          }
        );
  });
  }

  async getFriends(id: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.http.get(`${this.apiUrl}friends/${id}`, { withCredentials: true })
        .subscribe(
          (response: any) => {
            console.log(response);
            resolve(response); // Resolve the Promise with the response data
          },
          (error: HttpErrorResponse) => {
            if (error.status === 401) 
              this.router.navigate(['login']);
            reject(error); // Reject the Promise with the error
          }
        );
  });
  }

  async loadAllMatches(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.http.get(`${this.apiUrl}history/all`, { withCredentials: true })
        .subscribe(
          (response: any) => {
            console.log(response);
            resolve(response); // Resolve the Promise with the response data
          },
          (error: HttpErrorResponse) => {
            if (error.status === 400) {
              console.log('cant load matches');
            } else {
              console.log('cant load matches');
            }
            reject(error); // Reject the Promise with the error
          }
        );
  });
  }


  async loadUserMatches(id: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.http.get(`${this.apiUrl}history/user/${id}`, { withCredentials: true })
        .subscribe(
          (response: any) => {
            console.log(response);
            resolve(response); // Resolve the Promise with the response data
          },
          (error: HttpErrorResponse) => {
            if (error.status === 400) {
              console.log('cant load matches');
            } else {
              console.log('cant load matches');
            }
            reject(error); // Reject the Promise with the error
          }
        );
  });
  }

  getUserByName(name: string): Observable<any> {
    // Make an HTTP GET request to get user by name
    return this.http.get(`${this.apiUrl}user/name/${name}`, { withCredentials: true });
  }

  async isFriend(id: string): Promise<any>{
    return new Promise<any>((resolve, reject) => {
      this.http.get(`${this.apiUrl}friends/is-friend/${id}`, { withCredentials: true })
        .subscribe(
          (response: any) => {
            console.log(response);
            resolve(response); // Resolve the Promise with the response data
          },
          (error: HttpErrorResponse) => {
            if (error.status === 400) {
              console.log('User doesnt exists');
            } else {
              console.log('User doesnt exists');
            }
            reject(error); // Reject the Promise with the error
          }
        );
  });
  }

  async addFriend(id: string): Promise<any>{
    return new Promise<any>((resolve, reject) => {
      this.http.post(`${this.apiUrl}friends/add-friend/${id}`, undefined, { withCredentials: true })
        .subscribe(
          (response: any) => {
            resolve(response); // Resolve the Promise with the response data
          },
          (error: HttpErrorResponse) => {
            if (error.status === 400) {
              console.log('Cant add friend');
            }
            reject(error); // Reject the Promise with the error
          }
        );
  });
  }

  async removeFriend(id: string): Promise<any>{
    return new Promise<any>((resolve, reject) => {
      this.http.post(`${this.apiUrl}friends/remove-friend/${id}`, undefined, { withCredentials: true })
        .subscribe(
          (response: any) => {
            resolve(response); // Resolve the Promise with the response data
          },
          (error: HttpErrorResponse) => {
            if (error.status === 400) {
              console.log('Cant add friend');
            }
            reject(error); // Reject the Promise with the error
          }
        );
  });
  }

  async logout(): Promise<any>{
    return new Promise<any>((resolve, reject) => {
      this.http.post(`${this.apiUrl}user/logout`, undefined, { withCredentials: true })
        .subscribe(
          (response: any) => {
            resolve(response); // Resolve the Promise with the response data
          },
          (error: HttpErrorResponse) => {
            if (error.status === 400) {
              console.log('Cant add friend');
            } else {
              console.log('Cant add friend');
            }
            reject(error); // Reject the Promise with the error
          }
        );
  });
  }

  async isBlocked(id: string): Promise<any>{
    return new Promise<any>((resolve, reject) => {
      this.http.get(`${this.apiUrl}user/is-blocked/${id}`, { withCredentials: true })
        .subscribe(
          (response: any) => {
            resolve(response); // Resolve the Promise with the response data
          },
          (error: HttpErrorResponse) => {
            if (error.status === 400) {
              console.log('User doesnt exists');
            } else {
              console.log('User doesnt exists');
            }
            reject(error); // Reject the Promise with the error
          }
        );
  });
  }

  async blockUser(userId : string): Promise<any>{

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    this.http.post(`${this.apiUrl}user/block/${userId}`, undefined , { withCredentials: true }).subscribe(
      () => {
      },
      (error) => {
        console.error('Error making POST request', error);
      }
    );
  }
}