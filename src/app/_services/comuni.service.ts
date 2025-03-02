import { HttpClient }                           from '@angular/common/http';
import { Injectable }                           from '@angular/core';
import { Observable }                           from 'rxjs';
import { map }                                  from 'rxjs/operators';
import { environment }                          from 'src/environments/environment';

//models
import { _UT_Comuni }                           from '../_models/_UT_Comuni';

@Injectable({
  providedIn: 'root'
})
export class ComuniService {

  constructor(private http: HttpClient) { }

  list(): Observable<_UT_Comuni[]>{
    return this.http.get<_UT_Comuni[]>(environment.apiBaseUrl+'_UT_Comuni');
    //http://213.215.231.4/swappX/api/_UT_Comuni
  }

  filterList(searchstring: string): Observable<_UT_Comuni[]>{
    return this.http.get<_UT_Comuni[]>(environment.apiBaseUrl+'_UT_Comuni')
      .pipe (
        map(val=> val.filter(val=>val.comune.toLowerCase().includes(searchstring))),
      );
  }
}
