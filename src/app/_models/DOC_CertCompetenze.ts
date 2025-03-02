import { CLS_Iscrizione } from "./CLS_Iscrizione";

export interface DOC_CertCompetenze {
        id?:                                    number;
        iscrizioneID:                           number;
        statoID?:                               number;
        dtDocumento?:                           string;
        note?:                                  string;
        dtIns?:                                 string;
        dtUpd?:                                 string;
        userIns?:                               number;
        userUpd?:                               number;

        iscrizione?:                            CLS_Iscrizione;
}




