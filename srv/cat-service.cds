using { ZEX_ORDERS_SRV as external } from './external/ZEX_ORDERS_SRV';

service CatalogService {
  
  entity Orders as projection on external.ZES_lista_ordiniSet;

  entity Articles as projection on external.ZES_articoliSet;
}