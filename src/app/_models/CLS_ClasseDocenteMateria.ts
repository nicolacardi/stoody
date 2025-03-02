import { CLS_ClasseSezioneAnno }                from "./CLS_ClasseSezioneAnno";
import { MAT_Materia }                          from "./MAT_Materia";
import { PER_Docente }                          from "./PER_Docente";

export interface CLS_ClasseDocenteMateria {
        id?:                                     number;

        classeSezioneAnnoID:                    number;
        docenteID:                              number;
        materiaID:                              number;

        ckOrario:                               boolean;
        ckPagella:                              boolean;

        note?:                                   string;
        dtIns?:                                  string;
        dtUpd?:                                  string;
        userIns?:                                number;
        userUpd?:                                number;

        docente?:                                PER_Docente;
        materia?:                                MAT_Materia;
        classeSezioneAnno?:                      CLS_ClasseSezioneAnno;
}

