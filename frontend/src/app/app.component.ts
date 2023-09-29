import { Component } from '@angular/core';
import { HeartbeatService } from './heartbeat/heartbeat.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{
  constructor(private heartbeat: HeartbeatService) {}

  ngOnInit(){

  }
}
