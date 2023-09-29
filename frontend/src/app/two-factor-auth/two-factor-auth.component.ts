import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-two-factor-auth',
  templateUrl: './two-factor-auth.component.html',
  styleUrls: ['./two-factor-auth.component.css']
})
export class TwoFactorAuthComponent implements OnInit {
  userId: string = ''; // Initialize with a default value
  inputCode: string = '';
  errorMessage: string = '';


  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.userId = params['user'];
    });
  }

verify2FA(){
  this.http.post(environment.apiUrl + `auth/42/verify-2FA`, { id: this.userId, code: this.inputCode }, { withCredentials: true })
  .subscribe(
    (response: any) => {
      if (response.message === 'Success!') {
        this.router.navigate(['/game']); // Redirect to the game page
      }
    },
    (error: HttpErrorResponse) => {
      if (error.status === 400) {
        this.errorMessage = 'Wrong code. Please try again.';
      } else {
        this.errorMessage = 'An error occurred during verification. Please try again later.';
      }
    }
  );
}
}