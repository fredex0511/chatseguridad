import { HttpClient,  HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { IGlobal } from '../interfaces/global.interface';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  API_URL = environment.apiURL;

  constructor(
    private http: HttpClient,
  ) { }

    getConversations(user_id: string): Observable<IGlobal> {
      return this.http.get<IGlobal>(`${this.API_URL}chats`, { });
  }

    getMessages(conversation_id: string, user_id: string): Observable<IGlobal> {
      return this.http.get<IGlobal>(`${this.API_URL}messages/${conversation_id}`, { });
  }

    readMessages(conversation_id: string, user_id: string): Observable<IGlobal> {
      return this.http.get<IGlobal>(`${this.API_URL}messages?_id=${conversation_id}&userID=${user_id}`, { });
  }

    sendMessage(message: string, chat: string, UserId: string) {
      return this.http.post(`${this.API_URL}messages`, { message, chat });
  }

    getPendingMessages(user_id: number): Observable<IGlobal> {
      return this.http.get<IGlobal>(`${this.API_URL}noReadMenssages?id=${user_id}`, { });
  }

    getLastestMessages(conversacion_id: string, user_id: string): Observable<IGlobal> {
      return this.http.get<IGlobal>(`${this.API_URL}lastMenssages?_id=${conversacion_id}&userID=${user_id}`, { });
  }

  login(): Observable<IGlobal> {
    return this.http.get<IGlobal>(`${this.API_URL}Auth`);
  }

  private newMessageSubject = new Subject<any>();
  newMessage$ = this.newMessageSubject.asObservable();

  notifyNewMessage(message: any) {
      this.newMessageSubject.next(message);
  }

  private newChatSubject = new Subject<any>();
  newChat$ = this.newChatSubject.asObservable();

  notifyNewChat(chat: any) {
    this.newChatSubject.next(chat);
  }
}