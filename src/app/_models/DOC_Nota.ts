import { DOC_NotaIscrizione }                   from "./DOC_NotaIscrizione";
import { PER_Persona }                          from "./PER_Persone";

export interface DOC_Nota {
    id:                                         number;
    
    //iscrizioneID:                               number;
    personaID:                                  number;
    ckInvioMsg:                                 boolean;
    dtNota:                                     string;
    periodo:                                    number;
    ckFirmato?:                                 boolean;
    dtFirma:                                    string;
    nota:                                       string;
    
    note?:                                      string;
    dtIns?:                                     string;
    dtUpd?:                                     string;
    userIns?:                                   number;
    userUpd?:                                   number;

    //iscrizione?:                                CLS_Iscrizione;
    nomiAlunni?:                                string;
    _NotaIscrizioni:                            DOC_NotaIscrizione[];
    persona?:                                   PER_Persona;

    personaAlunno?:                             PER_Persona;
}

 