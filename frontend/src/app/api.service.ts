import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class AuthService {
  private apiUrl = 'http://localhost:3001/api/'; // Replace with your backend URL

  constructor(private http: HttpClient) {}

  loginWith42(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json', // Add other headers if needed
    });

    return this.http.get(`${this.apiUrl}auth/42/login`, {headers});
  }
}