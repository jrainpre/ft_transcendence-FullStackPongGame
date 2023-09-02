import { Component } from '@angular/core';
import { delay } from 'rxjs';
import { io } from 'socket.io-client';
import { AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { Message, User, Channel } from './interfaces/message';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  ngAfterViewChecked() {
      this.scrollToBottom();
    }
  
    scrollToBottom(): void {
      if (this.messagesContainer){
          this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    }

  socket: any;
  user: User = {
      id_42: 0,
      name: ''
  };
  newPrvtchat: string = '';
  channel: Channel = {
      id: 0,
      name: '',
      private_channel: false
  }
  message: Message = {
      author: '',
      content: '',
      owner_id: 0,
      channel_id: 0,
      isSystemMessage: false,
      created_at: new Date()
  }
  channelName: string = '';
  channelList: any[] = [];
  messageContent: string = '';
  isRegistered: boolean = false;
  messages: Message[] = [];
  typingDisplay: string = '';
  blockedUsers: User[] = [];
  toBlock: string = '';
  toUnblock: string = '';

  constructor() {
      this.socket = io('http://10.12.1.1:3001');

      this.socket.on('message', (message: Message) => {
          if (!this.blockedUsers.some(user => user.id_42 === message.owner_id) && message.channel_id === this.channel.id) {
              this.messages.push(message);
          }
      });

      this.socket.on('ChannelMessages', (messageArray: Message[]) => {
          const filteredMessages = messageArray.filter(message => !this.blockedUsers.some(user => user.id_42 === message.owner_id)
          );
          this.messages.push(...filteredMessages);
          // console.log(JSON.stringify(this.messages));

      });

      this.socket.on('userChannels', (channels: any[]) => {
          this.channelList = channels;
      });

      // this.socket.on("typing", (data: any) => {
      //     if (data.channelName === this.currentChannel) {
      //         if (!this.blockedUsers.some(user => user.name === data.name)) {
      //         if (data.isTyping) {
      //             this.typingDisplay = `${data.name} is typing...`;
      //         } else {
      //             this.typingDisplay = '';
      //         }
      //     }
      // }
      // })




      this.socket.on('blockedUsers', (users: User[]) => {
          this.blockedUsers = users;
          console.log(JSON.stringify(this.blockedUsers));

      })

      this.socket.on('identifyDone', (user: User) => {

          this.user = user;
          this.isRegistered = true;
          console.log(JSON.stringify(this.user));
      });

      this.socket.on('channelInfo', (channel: Channel) => {
          this.channel = channel;
          console.log(JSON.stringify(this.channel.id));
      });

      
  }

  registerUser() {
      let user: User = {
              id_42: this.user.id_42,
              name: this.user.name,
          }
          this.socket.emit('identifyUser', { user: user });
      }
  

  createChannel() {
      if (this.channelName.trim()){
          let newChannel: Channel = {
              name: this.channelName,
              private_channel: false,
              id: 0
          }
          this.socket.emit('createOrJoinChannel', { channel: newChannel });
          this.channelName = '';
          this.messages = [];
      }
      }

  createPrivateChannel() {
      if (this.newPrvtchat.trim()){
          let user: User = {
              id_42: 0,
              name: this.newPrvtchat
          }
          this.newPrvtchat = '';
          this.socket.emit('createPrivateChannel', { user: user });
      }
  }

  setCurrentChannel(channel: Channel) {
      this.socket.emit('selectChannel', { channel: channel });
      this.messages = [];
  }

  sendMessage() {
      if (this.message.content.trim() && this.channel.id !== 0) {
          this.message.owner_id = this.user.id_42;
          this.message.channel_id = this.channel.id;
          }

          this.socket.emit('createMessage', { message: this.message });
          this.flushMessage();
      }
  

  // emitTyping = () => {
  //     this.socket.emit("typing", { isTyping: true, channelName: this.currentChannel });

  //     setTimeout(() => {
  //         this.socket.emit("typing", { isTyping: false, channelName: this.currentChannel });
  //     }, 2000);
  // };

  leaveChannel() {
      this.socket.emit('leaveChannel', { channel: this.channel});
      this.flushChannel();
  }



  blockUser() {
      let userToBlock: User = {
          id_42: 0,
          name: this.toBlock
      }
      this.socket.emit('blockUser',{ toBlockUser: userToBlock} );
      this.toBlock = '';
  }

  unblockUser() {
      let userToUnblock: User = {
          name: this.toUnblock,
          id_42: 0
      }
      this.socket.emit('unblockUser',{ toUnblockUser: userToUnblock} );
      this.toUnblock = '';
  }





  flushChannel() {
      this.messages = [];
      this.typingDisplay = '';
      this.typingDisplay = '';
      this.channel.id = 0;
      this.channel.name = '';
      this.channel.private_channel = false;
  }

  flushMessage(){
  this.message.author = '';
  this.message.content = '';
  this.message.owner_id = 0;
  this.message.channel_id = 0;
  this.message.isSystemMessage = false;
  this.message.created_at = new Date();
  }
}
