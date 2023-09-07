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

  async ngOnInit(): Promise<void> {
    const modus = this.param.snapshot.paramMap.get('modus');
    const name = this.param.snapshot.paramMap.get('name');
    const id = this.param.snapshot.paramMap.get('id');
    this.websocketService.requestLobby(modus, name, id);
  }
}
