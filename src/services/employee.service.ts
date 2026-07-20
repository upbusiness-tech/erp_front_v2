import { BaseService } from "./common/base.service";

/**
 * Serviço de Employee.
 *
 * Herda do BaseService os métodos genéricos:
 *   getAll, getById, create, update, delete
 *
 * O construtor chama super("employee") que monta BASE_PATH = "/employee".
 *
 * Uso:
 *   const employeeService = new EmployeeService();
 *   const employees = await employeeService.getAll({ filter: { field: "name", operator: "contains", value: "sofia" } });
 */
export class EmployeeService extends BaseService {
  public BASE_PATH: string = "employee";
}
