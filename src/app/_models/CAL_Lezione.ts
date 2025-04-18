import { CLS_ClasseDocenteMateria }       from "./CLS_ClasseDocenteMateria";

export interface CAL_Lezione {
  id                          : number;
  
  classeDocenteMateriaID      : number;

  //classeSezioneAnnoID:                          number;
  dtCalendario                : string;

  //campi di FullCalendar
  title                       : string;
  start                       : string;     //YYYY-MM-DDTHH:MM:SS
  end                         : string;     //YYYY-MM-DDTHH:MM:SS
  colore                      : string;

  h_Ini                       : string;
  h_End                       : string;
  //docenteID:                                    number;
  //materiaID:                                    number;
  supplenteID                 : number;
  ckEpoca                     : number;
  ckFirma                     : number;
  dtFirma                     : string;
  ckAssente                   : number;
  ckAppello                   : boolean;

  argomento                   : string;
  compiti                     : string;

  ckCompito                   : boolean;
  argomentoCompito            : string;
  classeDocenteMateria        : CLS_ClasseDocenteMateria

  
  // docente                     : PER_Docente;
  // persona                     : PER_Persona;
  // materia                     : MAT_Materia;

    //classeSezioneAnno:                            CLS_ClasseSezioneAnno;

//   note:                 string;
//   dtIns:                string;
//   dtUpd:                string;
//   userIns:              number;
//   userUpd:              number;

}