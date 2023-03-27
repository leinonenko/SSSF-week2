// TODO: create following functions:

import {Request, Response, NextFunction} from 'express';
import {validationResult} from 'express-validator';
import {Point} from 'geojson';
import CustomError from '../../classes/CustomError';
import {Cat} from '../../interfaces/Cat';
import DBMessageResponse from '../../interfaces/DBMessageResponse';
import {User} from '../../interfaces/User';
import catModel from '../models/catModel';

// - catGetByUser - get all cats by current user id
const catGetByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      throw new CustomError(messages, 400);
    }
    const cats = await catModel
      .find({owner: (req.user as User)._id})
      .populate('owner', 'user_name email');
    if (!cats) {
      next(new CustomError('No cats found', 404));
      return;
    }
    res.json(cats);
  } catch (err) {
    next(new CustomError((err as Error).message, 500));
  }
};
// - catGetByBoundingBox - get all cats by bounding box coordinates (getJSON)
// - catPutAdmin - only admin can change cat owner
// - catDeleteAdmin - only admin can delete cat

// - catDelete - only owner can delete cat
const catDelete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      throw new CustomError(messages, 400);
    }
    const cat = await catModel
      .findByIdAndDelete(
        {_id: req.params.id, owner: (req.user as User)._id},
        req.body
      )
      .select('-__v');
    if (!cat) {
      next(new CustomError('No cat found', 404));
      return;
    }
    if ((cat as Cat).owner.toString() !== (req.user as User)._id.toString()) {
      next(new CustomError('Not authorized', 401));
      return;
    }
    const output: DBMessageResponse = {
      message: 'Cat deleted',
      data: cat,
    };
    res.json(output);
  } catch (err) {
    next(new CustomError((err as Error).message, 500));
  }
};

// - catPut - only owner can update cat
const catPut = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      throw new CustomError(messages, 400);
    }
    const cat = await catModel
      .findOneAndUpdate(
        {_id: req.params.id, owner: (req.user as User)._id},
        req.body,
        {
          new: true,
        }
      )
      .select('-__v');
    if (!cat) {
      next(new CustomError('No cat found', 404));
      return;
    }
    if ((cat as Cat).owner.toString() !== (req.user as User)._id.toString()) {
      next(new CustomError('Not authorized', 401));
      return;
    }
    const output: DBMessageResponse = {
      message: 'Cat updated',
      data: cat,
    };
    res.json(output);
  } catch (err) {
    next(new CustomError((err as Error).message, 500));
  }
};
// - catGet - get cat by id
const catGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      throw new CustomError(messages, 400);
    }

    const cat = await catModel
      .findById(req.params.id)
      .populate('owner', 'user_name email');
    if (!cat) {
      next(new CustomError('No animal found', 404));
      return;
    }
    res.json(cat);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};
// - catListGet - get all cats
const catListGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cats = await catModel.find().populate('owner');
    if (!cats) {
      next(new CustomError('No animals found', 404));
      return;
    }
    res.json(cats);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};
// - catPost - create new cat
const catPost = async (
  req: Request<{}, {}, Cat>,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    console.log(req.body);

    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      throw new CustomError(messages, 400);
    }

    req.body.filename = <string>req.file?.filename;
    req.body.location = res.locals.coords;
    req.body.owner = (req.user as User)._id;
    const cat = await catModel.create(req.body);
    console.log(cat);
    const output: DBMessageResponse = {
      message: 'Cat created',
      data: cat,
    };
    res.json(output);
  } catch (err) {
    next(new CustomError((err as Error).message, 500));
  }
};

export {catGet, catListGet, catGetByUser, catPost, catPut, catDelete};
