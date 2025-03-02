import { CLS_Iscrizione }                       from "./CLS_Iscrizione";
import { MAT_LivelloObiettivo }                         from "./MAT_LivelloObiettivo";
import { MAT_Materia }                  from "./MAT_Materia";

export interface DOC_PagellaVoto {
        id?:                                    number;

        pagellaID?:                             number;                         //verificare nullable ????
        materiaID:                              number;

        ckFrequenza:                            boolean;
        ckAmmesso:                              boolean;
        voto?:                                  number;
        dtVoto:                                 string;
        tipoGiudizioID?:                        number;
        n_assenze:                              number;

        note?:                                  string;
        dtIns?:                                 string;
        dtUpd?:                                 string;
        userIns?:                               number;
        userUpd?:                               number;

        tipoVotoID?:                            number;

        materia?:                               MAT_Materia;
        iscrizione?:                            CLS_Iscrizione
        tipoGiudizio?:                          DOC_TipoGiudizio;

        //classeAnnoMateria?:      CLS_ClasseAnnoMateria;
        countVotiObiettivi?:                    number;
        countTotObiettivi?:                     number;
        _ObiettiviCompleti?:                    DOC_ObiettivoCompleto[];

        periodo?:                               number;
}

export interface DOC_TipoGiudizio {
        id:                                     number;

        descrizione:                            number;
        descrizione2:                           number;
}

export interface DOC_ObiettivoCompleto {
        id:                                     number;

        annoID:                                 number;
        classeID:                               number;
        descrizione:                            string;
        livelloObiettivoID:                     number;
        materiaID:                              number;
        obiettivoID:                            number;
        pagellaVotoID:                          number;
        votoObiettivoID:                        number;
        livelloObiettivo?:                      MAT_LivelloObiettivo;
}



