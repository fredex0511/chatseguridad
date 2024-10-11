import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { IAccessToken } from '../interfaces/auth.interface';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  API_URL = environment.apiURL;

  constructor(
    private http: HttpClient,
  ) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}login`, {
        email,
        password
    });
  }

  logout(): Observable<any> {
    return this.http.post<any>(`${this.API_URL}logout`, {});
  }

  profile(): Observable<any>{
    return this.http.get<any>(`${this.API_URL}profile`);
  }
}
