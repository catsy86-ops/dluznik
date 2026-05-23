import { ApiResponse } from '../../../src/utils/apiResponse';

describe('ApiResponse', () => {
  describe('success', () => {
    it('should create a successful response with default values', () => {
      const response = ApiResponse.success();

      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.message).toBe('Success');
      expect(response.data).toBeUndefined();
      expect(response.timestamp).toBeDefined();
    });

    it('should create a successful response with custom values', () => {
      const data = { id: 1, name: 'Test' };
      const response = ApiResponse.success(200, 'Custom message', data, '/api/test');

      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.message).toBe('Custom message');
      expect(response.data).toEqual(data);
      expect(response.path).toBe('/api/test');
    });

    it('should include timestamp in ISO format', () => {
      const response = ApiResponse.success();
      const timestamp = new Date(response.timestamp);

      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('created', () => {
    it('should create a 201 response', () => {
      const data = { id: 1, name: 'New Item' };
      const response = ApiResponse.created(data);

      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(201);
      expect(response.message).toBe('Resource created successfully');
      expect(response.data).toEqual(data);
    });

    it('should allow custom message', () => {
      const data = { id: 1 };
      const response = ApiResponse.created(data, 'Custom created message');

      expect(response.statusCode).toBe(201);
      expect(response.message).toBe('Custom created message');
    });
  });

  describe('successPaginated', () => {
    it('should create a paginated response with correct pagination metadata', () => {
      const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const response = ApiResponse.successPaginated(items, 1, 10, 25);

      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.data?.items).toEqual(items);
      expect(response.data?.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: false,
      });
    });

    it('should calculate pagination correctly for last page', () => {
      const items = [{ id: 21 }, { id: 22 }, { id: 23 }, { id: 24 }, { id: 25 }];
      const response = ApiResponse.successPaginated(items, 3, 10, 25);

      expect(response.data?.pagination).toEqual({
        page: 3,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNextPage: false,
        hasPreviousPage: true,
      });
    });

    it('should calculate pagination correctly for single page', () => {
      const items = [{ id: 1 }, { id: 2 }];
      const response = ApiResponse.successPaginated(items, 1, 10, 2);

      expect(response.data?.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });
  });

  describe('error', () => {
    it('should create an error response', () => {
      const response = ApiResponse.error(400, 'BAD_REQUEST', 'Invalid input');

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(400);
      expect(response.message).toBe('Invalid input');
      expect(response.error?.code).toBe('BAD_REQUEST');
      expect(response.data).toBeUndefined();
    });

    it('should include error details when provided', () => {
      const details = { field: 'email', reason: 'Invalid format' };
      const response = ApiResponse.error(400, 'VALIDATION_ERROR', 'Validation failed', details);

      expect(response.error?.details).toEqual(details);
    });

    it('should include path when provided', () => {
      const response = ApiResponse.error(404, 'NOT_FOUND', 'Resource not found', undefined, '/api/users/1');

      expect(response.path).toBe('/api/users/1');
    });
  });

  describe('validationError', () => {
    it('should create a validation error response', () => {
      const errors = { email: 'Invalid email', password: 'Too short' };
      const response = ApiResponse.validationError(errors);

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(400);
      expect(response.error?.code).toBe('VALIDATION_ERROR');
      expect(response.error?.details).toEqual(errors);
    });

    it('should allow custom message', () => {
      const errors = { field: 'error' };
      const response = ApiResponse.validationError(errors, 'Custom validation message');

      expect(response.message).toBe('Custom validation message');
    });
  });

  describe('notFound', () => {
    it('should create a 404 not found response', () => {
      const response = ApiResponse.notFound('User');

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(404);
      expect(response.error?.code).toBe('NOT_FOUND');
      expect(response.message).toBe('User not found');
    });

    it('should use default resource name', () => {
      const response = ApiResponse.notFound();

      expect(response.message).toBe('Resource not found');
    });
  });

  describe('unauthorized', () => {
    it('should create a 401 unauthorized response', () => {
      const response = ApiResponse.unauthorized();

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(401);
      expect(response.error?.code).toBe('UNAUTHORIZED');
      expect(response.message).toBe('Unauthorized');
    });

    it('should allow custom message', () => {
      const response = ApiResponse.unauthorized('Invalid token');

      expect(response.message).toBe('Invalid token');
    });
  });

  describe('forbidden', () => {
    it('should create a 403 forbidden response', () => {
      const response = ApiResponse.forbidden();

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(403);
      expect(response.error?.code).toBe('FORBIDDEN');
      expect(response.message).toBe('Forbidden');
    });
  });

  describe('conflict', () => {
    it('should create a 409 conflict response', () => {
      const response = ApiResponse.conflict('Email already exists');

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(409);
      expect(response.error?.code).toBe('CONFLICT');
      expect(response.message).toBe('Email already exists');
    });

    it('should include details', () => {
      const details = { field: 'email' };
      const response = ApiResponse.conflict('Duplicate', details);

      expect(response.error?.details).toEqual(details);
    });
  });

  describe('internalServerError', () => {
    it('should create a 500 internal server error response', () => {
      const response = ApiResponse.internalServerError();

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(500);
      expect(response.error?.code).toBe('INTERNAL_SERVER_ERROR');
      expect(response.message).toBe('Internal server error');
    });

    it('should allow custom message', () => {
      const response = ApiResponse.internalServerError('Database connection failed');

      expect(response.message).toBe('Database connection failed');
    });
  });
});
