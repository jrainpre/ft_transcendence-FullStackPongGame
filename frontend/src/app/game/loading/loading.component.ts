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
    // const modus = this.param.snapshot.paramMap.get('modus');
    // const name = this.param.snapshot.paramMap.get('name');
    // const id_42 = this.param.snapshot.paramMap.get('id_42');

    // if (this.param.snapshot.paramMap.) {
    //   const friend_socket_id = this.param.snapshot.paramMap.get('friend_socket_id');
    //   const friend_name = this.param.snapshot.paramMap.get('friend_name');
    //   const friend_id_42 = this.param.snapshot.paramMap.get('friend_id_42');
    //   this.websocketService.privateLobby(modus, name, id_42, friend_socket_id, friend_name, friend_id_42);
    // }
    // else {
    //   this.websocketService.requestLobby(modus, name, id_42);
    // }

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
}
