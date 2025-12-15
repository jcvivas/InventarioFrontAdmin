export type ApiResponse<T> = {
  isSuccess: boolean;
  message: string;
  data: T;
};
