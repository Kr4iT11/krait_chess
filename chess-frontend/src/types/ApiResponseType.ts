export interface ApiMeta {
  message: string;
  requestId: string;
  status: 'success' | 'error';
  httpStatus: number;
  timestamp: string;
  path: string;
}
export interface ApiError {
  message: string;
  status: number;
  meta: ApiMeta;
  error?: any;
}

export interface ApiResponse<T> {
  meta: ApiMeta;
  data: T;
  error: any;
}