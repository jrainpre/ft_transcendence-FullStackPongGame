import { AfterContentChecked, AfterViewInit, Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WebSocketService } from '../websocket/websocket.service';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit{
  constructor(
    private router: Router,
    private param: ActivatedRoute,
    private websocketService: WebSocketService) {
      this.websocketService.socket.on('finishedQueue', () => {
        this.router.navigate(['/match']);
      });

      this.websocketService.socket.on('returnToStart', () => {
        this.router.navigate(['/game']);
      });
    }

  ngOnInit(): void {
    console.log(this.param.snapshot.paramMap.get('parameter'));
    this.websocketService.requestLobby(this.param.snapshot.paramMap.get('parameter'));
  }
}
