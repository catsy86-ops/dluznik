/**
 * Standard API Response Format
 * Provides consistent response structure for all API endpoints
 */

/**
 * Generic API Response interface
 */
export interface IApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: Record<string, any>;
  };
  timestamp: string;
  path?: string;
}

/**
 * Pagination metadata interface
 */
export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginated response interface
 */
export interface IPaginatedResponse<T = any> {
  items: T[];
  pagination: IPaginationMeta;
}

/**
 * ApiResponse utility class
 * Provides static methods for creating standardized API responses
 */
export class ApiResponse {
  /**
   * Create a successful response
   * 
   * @param statusCode - HTTP status code (default: 200)
   * @param message - Response message
   * @param data - Response data
   * @param path - Request path (optional)
   * @returns Formatted API response
   */
  static success<T = any>(
    statusCode: number = 200,
    message: string = 'Success',
    data?: T,
    path?: string
  ): IApiResponse<T> {
    return {
      success: true,
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString(),
      path,
    };
  }

  /**
   * Create a successful response with pagination
   * 
   * @param items - Array of items
   * @param page - Current page number
   * @param limit - Items per page
   * @param total - Total number of items
   * @param message - Response message
   * @param path - Request path (optional)
   * @returns Formatted paginated API response
   */
  static successPaginated<T = any>(
    items: T[],
    page: number,
    limit: number,
    total: number,
    message: string = 'Success',
    path?: string
  ): IApiResponse<IPaginatedResponse<T>> {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      success: true,
      statusCode: 200,
      message,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage,
          hasPreviousPage,
        },
      },
      timestamp: new Date().toISOString(),
      path,
    };
  }

  /**
   * Create a successful response with created resource (201)
   * 
   * @param data - Created resource data
   * @param message - Response message
   * @param path - Request path (optional)
   * @returns Formatted API response with 201 status
   */
  static created<T = any>(
    data: T,
    message: string = 'Resource created successfully',
    path?: string
  ): IApiResponse<T> {
    return this.success(201, message, data, path);
  }

  /**
   * Create an error response
   * 
   * @param statusCode - HTTP status code
   * @param errorCode - Error code identifier
   * @param message - Error message
   * @param details - Additional error details
   * @param path - Request path (optional)
   * @returns Formatted error API response
   */
  static error(
    statusCode: number,
    errorCode: string,
    message: string,
    details?: Record<string, any>,
    path?: string
  ): IApiResponse {
    return {
      success: false,
      statusCode,
      message,
      error: {
        code: errorCode,
        details,
      },
      timestamp: new Date().toISOString(),
      path,
    };
  }

  /**
   * Create a validation error response
   * 
   * @param validationErrors - Object with field names as keys and error messages as values
   * @param message - Error message
   * @param path - Request path (optional)
   * @returns Formatted validation error API response
   */
  static validationError(
    validationErrors: Record<string, string | string[]>,
    message: string = 'Validation failed',
    path?: string
  ): IApiResponse {
    return {
      success: false,
      statusCode: 400,
      message,
      error: {
        code: 'VALIDATION_ERROR',
        details: validationErrors,
      },
      timestamp: new Date().toISOString(),
      path,
    };
  }

  /**
   * Create a not found error response
   * 
   * @param resource - Resource name that was not found
   * @param path - Request path (optional)
   * @returns Formatted not found error response
   */
  static notFound(
    resource: string = 'Resource',
    path?: string
  ): IApiResponse {
    return this.error(
      404,
      'NOT_FOUND',
      `${resource} not found`,
      undefined,
      path
    );
  }

  /**
   * Create an unauthorized error response
   * 
   * @param message - Error message
   * @param path - Request path (optional)
   * @returns Formatted unauthorized error response
   */
  static unauthorized(
    message: string = 'Unauthorized',
    path?: string
  ): IApiResponse {
    return this.error(
      401,
      'UNAUTHORIZED',
      message,
      undefined,
      path
    );
  }

  /**
   * Create a forbidden error response
   * 
   * @param message - Error message
   * @param path - Request path (optional)
   * @returns Formatted forbidden error response
   */
  static forbidden(
    message: string = 'Forbidden',
    path?: string
  ): IApiResponse {
    return this.error(
      403,
      'FORBIDDEN',
      message,
      undefined,
      path
    );
  }

  /**
   * Create a conflict error response
   * 
   * @param message - Error message
   * @param details - Additional error details
   * @param path - Request path (optional)
   * @returns Formatted conflict error response
   */
  static conflict(
    message: string = 'Conflict',
    details?: Record<string, any>,
    path?: string
  ): IApiResponse {
    return this.error(
      409,
      'CONFLICT',
      message,
      details,
      path
    );
  }

  /**
   * Create an internal server error response
   * 
   * @param message - Error message
   * @param path - Request path (optional)
   * @returns Formatted internal server error response
   */
  static internalServerError(
    message: string = 'Internal server error',
    path?: string
  ): IApiResponse {
    return this.error(
      500,
      'INTERNAL_SERVER_ERROR',
      message,
      undefined,
      path
    );
  }
}
