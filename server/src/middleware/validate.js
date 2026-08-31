import { ApiError } from '../utils/ApiError.js';

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => {
        const field = e.path.slice(1).join('.') || e.path.join('.');
        return `${field}: ${e.message}`;
      });
      throw new ApiError(400, 'Validation Error', errors);
    }

    if (parsed.data.body) req.body = parsed.data.body;
    if (parsed.data.query) req.query = parsed.data.query;
    if (parsed.data.params) req.params = parsed.data.params;

    next();
  } catch (error) {
    next(error);
  }
};
