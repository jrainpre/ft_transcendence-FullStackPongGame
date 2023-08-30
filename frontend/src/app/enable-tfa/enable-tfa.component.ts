import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-enable-tfa',
  templateUrl: './enable-tfa.component.html',
  styleUrls: ['./enable-tfa.component.css']
})
export class EnableTFAComponent {

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  qrCodeUrl: string = '';
  userId: string = '';
  inputCode: string = '';
  errorMessage: string = '';

  loadQRCode(): void {
    // Make API call to get QR code image URL
      this.http.get<{ qrCodeDataUri: string }>(`http://localhost:3001/api/auth/42/get-qr-code/${this.userId}`, { withCredentials: true }).subscribe(data => {
        this.qrCodeUrl = data.qrCodeDataUri;
        console.log(this.qrCodeUrl);
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
