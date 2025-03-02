import { CLS_Iscrizione } from "./CLS_Iscrizione";
import { DOC_PagellaVoto } from "./DOC_PagellaVoto";

export interface DOC_Pagella {
        id?:                                    number;
        iscrizioneID:                           number;
        periodo:                                number;
        statoID?:                               number;  //è il caso di renderlo non ? ma obbligatorio?
        dtDocumento?:                           string;
        giudizioQuad?:                          string;
        note?:                                  string;
        dtIns?:                                 string;
        dtUpd?:                                 string;
        userIns?:                               number;
        userUpd?:                               number;

        iscrizione?:                            CLS_Iscrizione;
        _PagellaVoti?:                          DOC_PagellaVoto[];
}




