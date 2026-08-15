import { Table } from "antd";
import { SizeType } from "antd/es/config-provider/SizeContext";
import type { ColumnsType, TablePaginationConfig, TableProps } from "antd/es/table";
import { TableRowSelection } from "antd/es/table/interface";

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
  onRowClick?: (record: T) => void;
  rowSelection?: TableRowSelection<T> | undefined;
  rowKey?: string;
  locale?: TableProps<T>["locale"];
  size?: SizeType;
  rowClassName?: any | undefined;
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
  onRowClick,
  rowSelection,
  rowKey = "id",
  size = "large",
  locale,
  rowClassName,
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
      size={size}
      rowClassName={rowClassName}
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
      rowSelection={rowSelection}
      rowKey={rowKey}
      locale={locale}
      {...(onRowClick && {
        onRow: (record) => ({
          onClick: () => onRowClick(record),
          style: { cursor: "pointer" },
        }),
      })}
    />
  );
};
