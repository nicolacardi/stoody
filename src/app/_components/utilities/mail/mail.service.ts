import { HttpClient }                           from '@angular/common/http';
import { Injectable }                           from '@angular/core';
import { Observable }                           from 'rxjs';
import { environment }                          from 'src/environments/environment';

//mdoels
import { _UT_MailMessage }                      from 'src/app/_models/_UT_MailMessage';

@Injectable({
  providedIn: 'root'
})
export class MailService {

  constructor(private http: HttpClient) { }

  
  public inviaMail (mail: _UT_MailMessage): Observable <any>  {

    return this.http.post(environment.apiBaseUrl+'mail/sendEmail', mail);
    //http://213.215.231.4/swappX/api/mail/sendEmail/nicola.cardi@gmail.com
  }

}
