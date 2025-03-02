import { HttpClient }                           from '@angular/common/http';
import { Injectable }                           from '@angular/core';
import { Observable }                           from 'rxjs';
import { environment }                          from 'src/environments/environment';

import { DOC_TipoDocumento }                    from 'src/app/_models/DOC_TipoDocumento';

@Injectable({
  providedIn: 'root'
})
export class TipiDocumentoService {

  constructor(private http: HttpClient) { }

  list(): Observable<DOC_TipoDocumento[]>{
    return this.http.get<DOC_TipoDocumento[]>(environment.apiBaseUrl+'DOC_TipiDocumento');
    //http://213.215.231.4/swappX/api/DOC_TipiDocumento
  }

  get(verbaleID: any): Observable<DOC_TipoDocumento>{
    return this.http.get<DOC_TipoDocumento>(environment.apiBaseUrl+'DOC_TipiDocumento/'+verbaleID);
    //http://213.215.231.4/swappX/api/DOC_TipiDocumento/1
  }


}
