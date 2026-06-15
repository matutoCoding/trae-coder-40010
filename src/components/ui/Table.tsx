import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface TableColumn<T> {
  key: string;
  title: string;
  width?: number;
  render?: (record: T, index: number) => ReactNode;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: string;
  className?: string;
  onRowClick?: (record: T) => void;
  loading?: boolean;
  emptyText?: string;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  rowKey,
  className,
  onRowClick,
  loading,
  emptyText = '暂无数据',
}: TableProps<T>) {
  return (
    <div className={cn('w-full overflow-auto scrollbar-thin', className)}>
      <table className="w-full border-collapse">
        <thead className="sticky top-0 z-10">
          <tr className="bg-industrial-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'table-header',
                  col.align === 'center' && 'text-center',
                  col.align === 'right' && 'text-right'
                )}
                style={{ width: col.width }}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="table-cell text-center py-8">
                <div className="flex items-center justify-center gap-2 text-industrial-400">
                  <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  加载中...
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table-cell text-center py-12 text-industrial-400">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((record, index) => (
              <tr
                key={record[rowKey] as string}
                className={cn(
                  'transition-colors duration-100',
                  index % 2 === 0 ? 'bg-white' : 'bg-industrial-50/30',
                  onRowClick && 'hover:bg-primary-50 cursor-pointer'
                )}
                onClick={() => onRowClick?.(record)}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'table-cell',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right'
                    )}
                  >
                    {col.render ? col.render(record, index) : record[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
