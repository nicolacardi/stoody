import { DOC_NotaIscrizione }                   from "./DOC_NotaIscrizione";
import { DOC_Verbale }                          from "./DOC_Verbale";
import { TST_VotoInterr }                       from "./TST_VotiInterr";

//I dialog Data si usano ogni volta che da un form ad una Dialog non bisogna passare una sola info ma un serie di informazioni
export interface DialogData {
        titolo:                                 string;
        sottoTitolo:                            string;
        annoID:                                 number;
        classeSezioneAnnoID:                    number;
        alunnoID:                               number;
      }
      
export interface DialogDataLezione {
        lezioneID:                              number;
        start:                                  string;
        end:                                    string;
        dtCalendario:                           string;
        h_Ini:                                  string;
        h_End:                                  string;
        classeSezioneAnnoID:                    number;
        dove:                                   string;
        docenteID:                              number;
      }

export interface DialogDataScadenza {
        scadenzaID:                              number;
        start:                                  string;
        end:                                    string;
        dtCalendario:                           string;
        h_Ini:                                  string;
        h_End:                                  string;

      }

export interface DialogDataLezioniUtils {
        start:                                  Date;
        classeSezioneAnnoID:                    number;
      }

export interface DialogDataDownloadRegistroClasse {
      start:                                    Date;
      classeSezioneAnnoID:                      number;
      annoID:                                   number;
      }

export interface DialogDataDownloadRegistroDocente {
      start:                                    Date;
      docenteID:                                number;
      annoID:                                   number;
      }

      


export interface DialogDataVotiObiettivi {
        iscrizioneID:                           number
        pagellaID:                              number;
        pagellaVotoID:                          number;
        periodo:                                number;
        //dtDocumento?:                              string;
        classeSezioneAnnoID:                    number;
        materiaID:                              number;
        chiusa:                                 boolean;
      }

export interface DialogDataColoreMateria {
        ascRGB:                                 string;
      }

export interface DialogDataNota {
        notaID:                                 number;
        iscrizioni:                             DOC_NotaIscrizione[];
        classeSezioneAnnoID:                    number;
        personaID:                              number;
        nome?:                                  string;
        cognome?:                               string;
        dtNota?:                                string;
      }

export interface DialogDataVerbale {
        verbale:                                DOC_Verbale;
        annoID:                                 number;
      }

export interface DialogDataVotoInterr {
        votoInterr:                             TST_VotoInterr;
        classeSezioneAnnoID:                    number;
        docenteID:                              number;
        lezioneID:                              number;  //se undefined serve a capire che ci troviamo in orario-docenti!
      }

export interface DialogDataMateriaEdit {
      materiaID:                                number;
      maxSeq:                                   number;
      }

export interface DialogDataDomandaEdit {
      domandaID:                               number;
      maxSeq:                                   number;
      }

export interface DialogDataFileEdit {
      risorsaID:                              number;
      }

export interface DialogDataParametroEdit {
      parametroID:                              number;
      maxSeq:                                   number;
      }

export interface DialogDataAnnoEdit {
      annoID:                                   number;
      }

export interface DialogDataTipoScadenzaEdit {
      tipoScadenzaID:                           number;
      maxSeq:                                   number;

      }

export interface DialogDataRisorsaClasseEdit {
      risorsaCSAID:                             number;
      classeSezioneAnnoID:                      number;
      }