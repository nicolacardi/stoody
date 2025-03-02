import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { ASC_AnnoScolastico } from '../../_models/ASC_AnnoScolastico';

@Injectable({
  providedIn: 'root'
})

export class AnniScolasticiService {

  constructor(private http: HttpClient) { }

  
  list(): Observable<ASC_AnnoScolastico[]>{
    return this.http.get<ASC_AnnoScolastico[]>(environment.apiBaseUrl+'ASC_Anni');
    //http://213.215.231.4/swappX/api/ASC_Anni
  }

  get(annoID: any): Observable<ASC_AnnoScolastico>{
    return this.http.get<ASC_AnnoScolastico>(environment.apiBaseUrl+'ASC_Anni/'+annoID);
    //http://213.215.231.4/swappX/api/ASC_Anni/2
  }
  
  getAnnoSucc(annoID: any): Observable<ASC_AnnoScolastico>{
    return this.http.get<ASC_AnnoScolastico>(environment.apiBaseUrl+'ASC_Anni/GetAnnoSucc/'+annoID);
    //http://213.215.231.4/swappX/api/ASC_Anni/GetAnnoSucc/2
  }

  filterAnniScolastici(searchstring: string): Observable<ASC_AnnoScolastico[]>{
    if (searchstring != null && (typeof searchstring === 'string')) {
      return this.http.get<ASC_AnnoScolastico[]>(environment.apiBaseUrl+'ASC_Anni')
            .pipe (
            map(val=>val.filter(val=>(val.annoscolastico.toLowerCase()).includes(searchstring.toLowerCase()))),
      );
        } else {
      return of()
      }
  }

  findAnnoID(searchstring: string) : Observable<any>{
    return this.http.get<ASC_AnnoScolastico[]>(environment.apiBaseUrl+'ASC_Anni')
      .pipe(
        map(val => val.find(val => (val.annoscolastico.toLowerCase())== searchstring.toLowerCase())),
      )
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'ASC_Anni/' + formData.id , formData);    
  }

  setAnnoCorrente(annoID: any): Observable <any>{
    let formData: any;
    return this.http.put( environment.apiBaseUrl  + 'ASC_Anni/setAnnoCorrente/' + annoID, formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'ASC_Anni' , formData);  
  }


}
