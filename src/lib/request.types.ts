import { CreateQueryParams } from "@dataui/crud-request";
import { AxiosRequestConfig } from "axios";

export interface GetWithFilterProps {
  path: string;
  queryParams?: CreateQueryParams;
}

export interface GetOneWithFilterProps extends GetWithFilterProps {
  id?: number | string;
  queryConfig?: AxiosRequestConfig;
}
