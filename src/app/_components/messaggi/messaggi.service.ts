import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { _UT_Message } from 'src/app/_models/_UT_Message';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MessaggiService {

  constructor(private http: HttpClient) { }

  list(): Observable<_UT_Message[]>{
    return this.http.get<_UT_Message[]>(environment.apiBaseUrl+'_UT_Message');
    //http://213.215.231.4/swappX/api/_UT_Messages
  }

  get(messageID: any): Observable<_UT_Message>{
    return this.http.get<_UT_Message>(environment.apiBaseUrl+'_UT_Messages/'+messageID);
    //http://213.215.231.4/swappX/api/_UT_Messages/5
  }

  listByUserID(userID: string): Observable<_UT_Message[]>{
    return this.http.get<_UT_Message[]>(environment.apiBaseUrl+'_UT_Messages/ListByUserID/' + userID);
    //http://213.215.231.4/swappX/api/_UT_Messages/ListByUserID/75b01815-1282-4459-bbf5-61bc877a9100
  }

  put(formData: any): Observable <any>{
    return this.http.put(environment.apiBaseUrl  + '_UT_Messages/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post(environment.apiBaseUrl  + '_UT_Messages' , formData);  
  }

  delete(messageID: number): Observable <any>{
    return this.http.delete(environment.apiBaseUrl  + '_UT_Messages/' + messageID);    
  }
}
