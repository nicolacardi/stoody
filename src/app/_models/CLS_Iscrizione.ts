import { ALU_Alunno }                           from "./ALU_Alunno";
import { CLS_ClasseSezioneAnno }                from "./CLS_ClasseSezioneAnno";
import { CLS_IscrizioneStato }                  from "./CLS_IscrizioneStato";
import { DOC_CertCompetenze } from "./DOC_CertCompetenze";
import { DOC_ConsOrientativo } from "./DOC_ConsOrientativo";
import { DOC_Pagella }                          from "./DOC_Pagella";
import { PAG_Retta } from "./PAG_Retta";

export interface CLS_Iscrizione {
        id:                                     number;
        classeSezioneAnnoID:                    number;
        alunnoID:                               number;

        statoID:                                number;
        dtIni:                                  string;
        dtEnd:                                  string;

        note?:                                   string;
        dtIns?:                                  string;
        dtUpd?:                                  string;
        userIns?:                                number;
        userUpd?:                                number;
        
        stato:                                  CLS_IscrizioneStato;               
        alunno:                                 ALU_Alunno;
        classeSezioneAnno:                      CLS_ClasseSezioneAnno;

        
        pagella1:                               DOC_Pagella;
        pagella2:                               DOC_Pagella;
        certCompetenze:                         DOC_CertCompetenze;
        consOrientativo:                        DOC_ConsOrientativo;
        retta?:                                 PAG_Retta;
}