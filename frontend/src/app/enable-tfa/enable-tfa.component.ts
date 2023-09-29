import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ChatComponent } from '../chat/chat.component';


@Component({
  selector: 'app-enable-tfa',
  templateUrl: './enable-tfa.component.html',
  styleUrls: ['./enable-tfa.component.css']
})
export class EnableTFAComponent {

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router, private readonly chat: ChatComponent) {}

  qrCodeUrl: string = '';
  userId: string = '';
  inputCode: string = '';
  errorMessage: string = '';

  async ngOnInit(): Promise<void> {
    this.chat.loadUserData();
    this.route.params.subscribe(params => {
      this.userId = params['id'];
      console.log(this.userId);
    });
    this.loadQRCode();
  }

  loadQRCode(): void {
    // Make API call to get QR code image URL
    console.log(this.userId);
      this.http.get<{ qrCodeDataUri: string }>(environment.apiUrl + `auth/42/get-qr-code/${this.userId}`, { withCredentials: true }).subscribe(data => {
        this.qrCodeUrl = data.qrCodeDataUri;
        console.log(this.qrCodeUrl);
  });
}

enable2FA(){
  this.http.post(environment.apiUrl + `auth/42/enable-2FA`, { id: this.userId, code: this.inputCode }, { withCredentials: true })
  .subscribe(
    (response: any) => {
      console.log('Response:', response); // Log the response to see its structure
      if (response.message === 'Success!') {
        console.log('Verification successful');
        this.router.navigate([`/profile/${this.userId}`]); // Redirect to the profile
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
