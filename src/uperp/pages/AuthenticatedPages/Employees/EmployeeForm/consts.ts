export enum PermissionModules {
  COMPANY = "Company",
  SALE = "Sale",
  PRODUCT = "Product",
  EMPLOYEE = "Employee",
  CASH_FLOW = "CashFlow",
  INTERN_CUSTOMER = "InternCustomer",
  REPORT = "Report",
  SIDEBAR = "SideBar",
}

export const mapModuleName = (moduleName: PermissionModules) => {
  switch (moduleName) {
    case PermissionModules.COMPANY:
      return "Empresa";
    case PermissionModules.SALE:
      return "Vendas";
    case PermissionModules.PRODUCT:
      return "Produtos";
    case PermissionModules.CASH_FLOW:
      return "Fluxos de caixa";
    case PermissionModules.INTERN_CUSTOMER:
      return "Clientes internos";
    case PermissionModules.REPORT:
      return "Relatórios";
    case PermissionModules.EMPLOYEE:
      return "Funcionários";
    case PermissionModules.SIDEBAR:
      return "Menu lateral";
    default:
      return "Permissões";
  }
};
