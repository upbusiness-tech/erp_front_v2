import { Table } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";

type GenericTableProps<T> = {
  columns: ColumnsType<T>;
  data: T[];
  isLoading: boolean;
  page?: number;
  pageSize?: number;
  total?: number;
  pageSizeOptions?: number[];
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
};

export const GenericTable = <T,>({
  data,
  columns,
  isLoading,
  page = 1,
  pageSize = 8,
  total,
  pageSizeOptions = [8, 12, 16, 20],
  onPageChange,
  onPageSizeChange,
}: GenericTableProps<T>) => {
  const handleTableChange = (pagination: TablePaginationConfig) => {
    if (pagination.current && pagination.current !== page) {
      onPageChange?.(pagination.current);
    }
    if (pagination.pageSize && pagination.pageSize !== pageSize) {
      onPageSizeChange?.(pagination.pageSize);
    }
  };

  return (
    <Table<T>
      dataSource={[...data]}
      pagination={{
        current: page,
        pageSize,
        total,
        showSizeChanger: true,
        pageSizeOptions,
        ...(total !== undefined && {
          showTotal: (totalCount, range) => `${range[0]}-${range[1]} de ${totalCount} registros`,
        }),
      }}
      onChange={handleTableChange}
      scroll={{ x: 760 }}
      columns={columns}
      loading={isLoading}
    />
  );
};
