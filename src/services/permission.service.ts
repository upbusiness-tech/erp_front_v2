import { BaseService } from "./common/base.service";

export class PermissionService extends BaseService {
  constructor(subpath?: string) {
    super(`permissions${subpath ? `/${subpath}` : ""}`);
  }
}
