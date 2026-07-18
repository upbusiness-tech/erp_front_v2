export class BaseService {
  public BASE_PATH: string = "";

  constructor(basePath: string) {
    this.BASE_PATH = basePath;
  }
}
