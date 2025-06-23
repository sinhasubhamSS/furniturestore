export class ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;

  constructor(statusCode: number, data: T, message = "Success") {
    this.success = true;
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
  }
}
