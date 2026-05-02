export type ColumnType = 1 | 2;

export interface HeaderConfig {
    title: string;
    color: string;
    columns: ColumnType;
    fontSize: number; // pt
}