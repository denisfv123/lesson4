const UserService = require('./service');
const UserValidation = require('./validation');
const ValidationError = require('../../error/ValidationError');

/**
 * @function
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {Promise < void >}
 */
async function findAll(req, res, next) {
    try {
        const users = await UserService.findAll();

        res.status(200).render('index.ejs', {
            data: users,
            csrfToken: req.csrfToken(),
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            details: null,
        });

        next(error);
    }
}

/**
 * @function
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {Promise < void >}
 */
async function findById(req, res, next) {
    try {
        const { error } = UserValidation.findById(req.params);

        if (error) {
            throw new ValidationError(error.details);
        }

        const user = await UserService.findById(req.params.id);

        return res.status(200).json({
            data: user,
            csrfToken: req.csrfToken(),
        });
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(422).json({
                error: error.name,
                details: error.message,
            });
        }

        res.status(500).json({
            message: error.name,
            details: error.message,
        });

        return next(error);
    }
}

/**
 * @function
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {Promise < void >}
 */
async function create(req, res, next) {
    try {
        const { error } = UserValidation.create(req.body);

        if (error) {
            throw new ValidationError(error.details);
        }

        const user = await UserService.create(req.body);

        res.redirect('/v1/users/');
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(422).render('error.ejs', {
                message: error.name,
                details: error.message,
            });
        }

        res.status(500).render('error.ejs', {
            message: error.name,
            details: error.message,
        });

        return next(error);
    }
}

/**
 * @function
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {Promise<void>}
 */
async function updateById(req, res, next) {
    try {
        const { error } = UserValidation.updateById(req.body);

        if (error) {
            throw new ValidationError(error.details);
        }

        const updatedUser = await UserService.updateById(req.body.id, req.body);

        res.redirect('/v1/users/');
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(422).render('error.ejs', {
                message: error.name,
                details: error.message,
            });
        }

        res.status(500).render('error.ejs', {
            message: error.name,
            details: error.message,
        });

        return next(error);
    }
}

/**
 * @function
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {Promise<void>}
 */
async function deleteById(req, res, next) {
    try {
        const { error } = UserValidation.deleteById(req.body);

        if (error) {
            throw new ValidationError(error.details);
        }

        const deletedUser = await UserService.deleteById(req.body.id);

        res.redirect('/v1/users/');
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(422).render('error.ejs', {
                message: error.name,
                details: error.message,
            });
        }

        res.status(500).render('error.ejs', {
            message: error.name,
            details: error.message,
        });

        return next(error);
    }
}

function formUpdate(req, res, next) {
    const { id } = req.params;

    res.status(200).render('update.ejs', {
        _id: id,
        csrfToken: req.csrfToken(),
    });
}

function formCreate(req, res, next) {
    const { id } = req.params;

    res.status(200).render('create.ejs', {
        _id: id,
        csrfToken: req.csrfToken(),
    });
}

module.exports = {
    findAll,
    findById,
    create,
    updateById,
    deleteById,
    formUpdate,
    formCreate,
};
