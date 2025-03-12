import { NextFunction, Request, Response } from "express";

// Wrapper to catch async errors
function asyncWrap(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((err: any) => next(err));
  };
}

export default asyncWrap;
