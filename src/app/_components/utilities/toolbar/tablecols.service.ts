import { HttpClient }                           from '@angular/common/http';
import { Injectable }                           from '@angular/core';
import { Observable }                           from 'rxjs';

//components
import { environment }                          from 'src/environments/environment';

//models
import { _UT_TableCol }                         from 'src/app/_models/_UT_TableCol';

@Injectable({
  providedIn: 'root'
})
export class TableColsService {

  constructor(private http: HttpClient) { }


  list(): Observable<_UT_TableCol[]>{
    return this.http.get<_UT_TableCol[]>(environment.apiBaseUrl+'_UT_TablesCols');
    //http://213.215.231.4/swappX/api/_UT_TablesCols
  }

  listByTable(TableName: string): Observable<_UT_TableCol[]>{
    return this.http.get<_UT_TableCol[]>(environment.apiBaseUrl+'_UT_TablesCols/listByTable/'+TableName);
    //http://213.215.231.4/swappX/api/_UT_TablesCols/listByTable/PersoneList
  }

  listTableNames(): Observable<_UT_TableCol[]>{
    return this.http.get<_UT_TableCol[]>(environment.apiBaseUrl+'_UT_TablesCols/ListTableNames');
    //http://213.215.231.4/swappX/api/_UT_TablesCols/ListTableNames
  }


  get(TableColID: any): Observable<_UT_TableCol>{
    return this.http.get<_UT_TableCol>(environment.apiBaseUrl+'_UT_TablesCols/'+TableColID);
    //http://213.215.231.4/swappX/api/_UT_TableCols/25
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + '_UT_TablesCols/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + '_UT_TablesCols' , formData);  
  }

  delete(BloccoID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + '_UT_TablesCols/' + BloccoID);    
  }
}
