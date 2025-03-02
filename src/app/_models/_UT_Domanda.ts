import { CLS_IscrizioneRisposta }               from "./CLS_IscrizioneRisposta";
import { _UT_Risorsa }                          from "./_UT_Risorsa";

export interface _UT_Domanda {
    id:                                         number;
    contesto:                                   string; //"Consensi"/"DatiEconomici"/"CertificazioneCompetenze"/"ConsiglioOrientativo"
    tipo:                                       string; //"Scelta Singola"/"Scelta Multipla"/"Risposta Libera"
    titolo:                                     string;
    domanda:                                    string;
    numOpzioni:                                 number;
    testo1:                                     string;
    testo2:                                     string;
    testo3:                                     string;
    testo4:                                     string;
    testo5:                                     string;
    testo6:                                     string;
    testo7:                                     string;
    testo8:                                     string;
    testo9:                                     string;
    risorsaID:                                  number;
    risorsa?:                                   _UT_Risorsa;
    seq:                                        number;

    risposta?:                                  CLS_IscrizioneRisposta;
  }

 