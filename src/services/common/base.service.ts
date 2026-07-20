import { api } from "@/config/axios.config";
import { buildNestCrudQuery } from "@/lib/nestcrud-query";
import type { GetAllOptions } from "@/types/crud.types";

/**
 * Classe base para todos os serviços da aplicação.
 *
 * Fornece:
 * - BASE_PATH construído automaticamente a partir do subpath
 * - Métodos CRUD genéricos (getAll, getById, create, update, delete)
 *   que usam a instância do axios configurada (api)
 * - Integração com o hook useGetAllWithParams via getAll()
 *
 * Uso:
 *   class EmployeeService extends BaseService {
 *     constructor() { super("employee"); }
 *   }
 */
export class BaseService {
  public BASE_PATH: string = "";

  constructor(subpath?: string) {
    if (subpath) this.BASE_PATH = `${this.BASE_PATH}/${subpath}`;
  }

  /**
   * Listagem com filtros NestCRUD e paginação.
   * Ex: GET /employee?filter[0]=name||contains||sofia&sort[0]=name,ASC&page=1&limit=20
   *
   * Retorna PaginatedResponse<T> que inclui:
   *   data       → itens da página atual
   *   count      → quantos itens vieram nesta página
   *   total      → total de itens no servidor
   *   page       → página atual
   *   pageCount  → total de páginas
   */
  getAll<TData>(options: GetAllOptions = {}): Promise<TData> {
    return api
      .get<TData>(`${this.BASE_PATH}${buildNestCrudQuery(options)}`)
      .then((response) => response.data);
  }

  /** Busca por ID. Ex: GET /employee/abc-123 */
  getById<TData>(id: string | number): Promise<TData> {
    return api.get<TData>(`${this.BASE_PATH}/${id}`).then((response) => response.data);
  }

  /** Cria um novo registro. Ex: POST /employee */
  create<TData>(data: unknown): Promise<TData> {
    return api.post<TData>(this.BASE_PATH, data).then((response) => response.data);
  }

  /** Atualiza parcialmente. Ex: PATCH /employee/abc-123 */
  update<TData>(id: string | number, data: unknown): Promise<TData> {
    return api.patch<TData>(`${this.BASE_PATH}/${id}`, data).then((response) => response.data);
  }

  /** Remove um registro. Ex: DELETE /employee/abc-123 */
  delete(id: string | number): Promise<void> {
    return api.delete(`${this.BASE_PATH}/${id}`);
  }
}
