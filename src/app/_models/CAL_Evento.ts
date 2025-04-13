import { CAL_TipoEvento } from "./CAL_TipoEvento";
import { PER_Persona } from "./PER_Persone";

export interface CAL_Evento {
  id:                                           number;

  dtCalendario:                                 string;
  ckPromemoria:                                 boolean;
  ckRisposta:                                   boolean;
  PersonaID:                                    number;
  NotaID?:                                       number;
  TipoEventoID:                               number;
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

  _EventoPersone?:                            CAL_EventoPersone[];

  tipoEvento?:                                CAL_TipoEvento;



}

export interface CAL_EventoPersone {
  id?:                                          number;
  
  personaID:                                    number;
  eventoID:                                   number;
  ckLetto:                                      boolean;
  ckAccettato:                                  boolean;
  ckRespinto:                                   boolean;

  link?:                                         string;

  evento?:                                    CAL_Evento;   
  persona?:                                     PER_Persona;
}