import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
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
      console.log(this.userId);
    });
  }

verify2FA(){
  this.http.post(`http://localhost:3001/api/auth/42/verify-2FA`, { id: this.userId, code: this.inputCode }, { withCredentials: true })
  .subscribe(
    (response: any) => {
      console.log('Response:', response); // Log the response to see its structure
      if (response.message === 'Success!') {
        console.log('Verification successful');
        this.router.navigate(['/game']); // Redirect to the game page
      }
    },
    (error: HttpErrorResponse) => {
      if (error.status === 400) {
        console.log('Verification failed: Wrong code');
        this.errorMessage = 'Wrong code. Please try again.';
      } else {
        console.log('An error occurred during verification');
        this.errorMessage = 'An error occurred during verification. Please try again later.';
      }
    }
  );
}
}