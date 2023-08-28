import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NotFoundError, throwError } from 'rxjs';

@Component({
  selector: 'app-two-factor-auth',
  templateUrl: './two-factor-auth.component.html',
  styleUrls: ['./two-factor-auth.component.css']
})
export class TwoFactorAuthComponent implements OnInit {
  userId: string = ''; // Initialize with a default value
  qrCodeUrl: string = '';

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    console.log('hello');
    this.route.queryParams.subscribe(params => {
      this.userId = params['user'];
      console.log(this.userId);
      this.loadQRCode();
    });
  }

  loadQRCode(): void {
    // Make API call to get QR code image URL
      this.http.get<{ qrCodeDataUri: string }>(`http://localhost:3001/api/auth/42/get-qr-code/${this.userId}`).subscribe(data => {
        this.qrCodeUrl = data.qrCodeDataUri;
        console.log(this.qrCodeUrl);
  });
}

}