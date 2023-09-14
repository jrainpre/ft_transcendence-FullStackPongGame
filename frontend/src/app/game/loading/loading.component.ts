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
    }

  async ngOnInit(): Promise<void> {
    this.param.params.subscribe((params) => {
      if (params['friend_socket_id']) {
        const modus = params['modus'];
        const name = params['name'];
        const id_42 = params['id_42'];
        const friend_socket_id = params['friend_socket_id'];
        const friend_name = params['friend_name'];
        const friend_id_42 = params['friend_id_42'];

        this.websocketService.privateLobby(modus, name, id_42, friend_socket_id, friend_name, friend_id_42);
      } else {
        const modus = params['modus'];
        const name = params['name'];
        const id_42 = params['id_42'];
        
        this.websocketService.requestLobby(modus, name, id_42);
      }
    });
  }

  abort(){
    this.websocketService.sendAbort();
    this.router.navigate(['/game']);
  }
}
