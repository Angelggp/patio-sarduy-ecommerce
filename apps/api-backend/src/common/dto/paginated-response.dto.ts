export interface PaginationMetaDto {
  page: number;
  pageSize: number;
  total: number;
  totalPage: number;
}

export interface PaginatedResponseDto<T> {
  results: T[];
  meta: PaginationMetaDto;
}
