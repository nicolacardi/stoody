import { PAG_Pagamento } from "./PAG_Pagamento";
import { PAG_Retta } from "./PAG_Retta";

export interface PAG_PagamentoRetta {
        id                 : number;
        rettaID            : number;
        pagamentoID        : Date;

        retta?             : PAG_Retta;
        Pagamento?         : PAG_Pagamento;
}


