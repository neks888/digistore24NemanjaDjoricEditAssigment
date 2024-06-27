import { Component, Injectable, Input, OnInit } from '@angular/core';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Injectable()
class MessageService {
  messages: Message[] = [];

  async all() {
    const res = await fetch('http://127.0.0.1:4010/messages');
    const data = await res.json();
    this.messages = data.messages.map(
      (message: any) => new Message(message.text, message.status)
    );
  }

  add(message: Message) {
    this.messages.push(message);
  }
}

class Message {
  text: string;
  status: string;

  constructor(text: string, status: string) {
    this.text = text;
    this.status = status;
  }

  empty() {
    return this.text === '';
  }
}

@Component({
  selector: 'app-message',
  standalone: true,
  template: `
    <div style="background-color: #fff;">
      <span class="bg-slate-400 block bg-slate-200 text-slate-500"
        >#{{ no }} - {{ message.status }}</span
      >
      <div
        class="p-2"
        [ngClass]="{ 'text-slate-500': message.status === 'draft' }"
      >
        {{ message.text }}
      </div>
    </div>
  `,
  imports: [NgClass],
})
class MessageComponent {
  @Input({ required: true }) message!: Message;
  @Input() no!: number;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  providers: [MessageService],
  imports: [NgForOf, MessageComponent],
  template: `
    <div>
      <div *ngFor="let message of messages; index as i">
        <app-message [message]="message" [no]="i"></app-message>
      </div>
    </div>
  `,
})
class ChatComponent implements OnInit {
  messages: Message[] = [];

  constructor(private messageService: MessageService) {}

  async ngOnInit() {
    await this.messageService.all();
    this.messages = this.messageService.messages;
  }
}

@Component({
  selector: 'app-create-message',
  standalone: true,
  providers: [MessageService],
  imports: [ReactiveFormsModule, FormsModule, MessageComponent, NgIf, NgClass],
  template: `
    <div *ngIf="!message.empty()">
      <app-message [message]="message" no="preview"></app-message>
    </div>
    <form (ngSubmit)="onSubmit()">
      <label class="mt-4">
        <div>Write Message</div>
        <textarea
          class="block w-full"
          required
          name="text"
          [(ngModel)]="message.text"
        ></textarea>
      </label>
      <button
        type="submit"
        [disabled]="message.status === 'pending'"
        class="pointer bg-blue-400 py-2 px-4 mt-2 w-full"
        [ngClass]="{ 'bg-gray-400': message.status === 'pending' }"
      >
        Send
      </button>
    </form>
  `,
  styles: [],
})
class CreateMessageComponent {
  message: Message = new Message('', 'draft');

  constructor(private messageService: MessageService) {}

  async onSubmit() {
    this.message.status = 'pending';
    const res = await fetch('http://127.0.0.1:4010/messages/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: this.message.text }),
    });
    this.message.status = res.status === 204 ? 'sent' : 'failed';
    this.messageService.add(this.message);
    this.message = new Message('', 'draft');
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChatComponent, CreateMessageComponent],
  template: `
    <div class="max-w-md mx-auto">
      <h1 class="text-2xl my-8">{{ title }}</h1>
      <app-chat></app-chat>
      <app-create-message></app-create-message>
    </div>
  `,
})
export class AppComponent {
  title = 'Chat';
}
