import { CAL_TipoScadenza } from "./CAL_TipoScadenza";
import { PER_Persona } from "./PER_Persone";

export interface CAL_Scadenza {
  id:                                           number;

  dtCalendario:                                 string;
  ckPromemoria:                                 boolean;
  ckRisposta:                                   boolean;
  PersonaID:                                    number;
  NotaID?:                                       number;
  TipoScadenzaID:                               number;
  //campi di FullCalendar

  start:                                        string;     //YYYY-MM-DDTHH:MM:SS
  end:                                          string;     //YYYY-MM-DDTHH:MM:SS

  h_Ini:                                        string;
  h_End:                                        string;
  
  title:                                        string;
  link:                                         string;
  color:                                        string;


//   note:                 string;
//   dtIns:                string;
//   dtUpd:                string;
//   userIns:              number;
//   userUpd:              number;

  _ScadenzaPersone?:                            CAL_ScadenzaPersone[];

  tipoScadenza?:                                CAL_TipoScadenza;



}

export interface CAL_ScadenzaPersone {
  id?:                                          number;
  
  personaID:                                    number;
  scadenzaID:                                   number;
  ckLetto:                                      boolean;
  ckAccettato:                                  boolean;
  ckRespinto:                                   boolean;

  link?:                                         string;

  scadenza?:                                    CAL_Scadenza;   
  persona?:                                     PER_Persona;
}