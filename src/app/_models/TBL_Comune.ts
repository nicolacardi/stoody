export class Comune {
  constructor(public istat: string, public comune: string, public regione: string, public provincia: string ) {}
}

export interface IComuneResponse {
  total:      number;
  results:    TBL_Comune[];
}

export interface TBL_Comune {
  istat:      string;
  comune:     string;
  regione:    string;
  provincia:  string;
}