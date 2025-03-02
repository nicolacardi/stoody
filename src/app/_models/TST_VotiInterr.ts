import { CAL_Lezione } from "./CAL_Lezione";

export interface TST_VotoInterr {
  id?:                                           number;
  
  lezioneID:                                    number;
  alunnoID:                                     number;
  materiaID:                                    number;
  voto:                                         number;
  giudizio:                                     string;
  argomento:                                    string;
  note?:                                        string;
  dtIns?:                                       string;
  dtUpd?:                                       string;
  userIns?:                                     number;
  userUpd?:                                     number;

  lezione?:                                      CAL_Lezione;
}