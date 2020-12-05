// custom modules
const asyncHandler = require('../middlewares/asyncHandler');
const ErrorResponse = require('./error');

const advancedResults = (model, modelType, populate) => {
    return async (request, response, next) => {
        let reqQuery = { ...request.query };
        let query;
        const paramsToRemove = ['select', 'page', 'limit', 'sort', 'populate'];

        paramsToRemove.forEach((param) => {
            delete reqQuery[param];
        });

        let queryString = JSON.stringify(reqQuery);

        // convert all the lt, gt etc etc to $lt, $gt etc etc
        queryString = queryString.replace(
            /\b(lte|lt|gte|gt|in|eq)\b/g,
            (match) => `$${match}`
        );

        reqQuery = JSON.parse(queryString);

        if (modelType === 'notes') {
            reqQuery.user = request.user.id;
        }

        query = model.find(reqQuery);

        if (
            populate &&
            (request.query.populate === true ||
                request.query.populate === undefined)
        ) {
            query = query.populate(populate);
        }

        if (request.query.select) {
            const selectFields = request.query.select.split(',').join(' ');
            query = query.select(selectFields);
        }
        if (request.query.sort) {
            const sortFields = request.query.sort.split(',').join(' ');
            query = query.sort(sortFields);
        } else {
            query = query.sort('-createdAt');
        }

        const pagination = {
            prev: null,
            next: null,
        };

        const pageNumber = Number(request.query.page) || 1;
        let limit = Number(request.query.limit) || 10;
        const toSkip = (pageNumber - 1) * limit;
        const startIndex = toSkip;
        const endIndex = pageNumber * limit;

        const tempResult = await query;
        console.log(
            `result length before pagination : ${tempResult.length}`.yellow
        );

        if (tempResult.length === 0) {
            return next(
                new ErrorResponse(
                    'No results found for the current filter',
                    404
                )
            );
        }

        console.log(`Limit set : ${request.query.limit}`.yellow.bold);

        if (request.query.limit === 'all') {
            limit = -1;
            query = query.skip(toSkip).limit();
        } else {
            query = query.skip(toSkip).limit(limit);
        }
        console.log(`Calculated limit : ${limit}`.yellow);

        let results = await query;

        const totalNoOfDocs = tempResult.length;
        if (startIndex > 0) {
            pagination.prev = pageNumber - 1;
        }
        if (endIndex < totalNoOfDocs) {
            pagination.next = pageNumber + 1;
        }

        if (!results) {
            return next(err);
        }
        if (results.length === 0) {
            response.advancedResults = {
                success: true,
                count: totalNoOfDocs,
                pagination,
                message: 'No results for current filters',
                error: false,
            };
            return;
        }

        response.advancedResults = {
            success: true,
            count: totalNoOfDocs,
            pagination,
            data: results,
            error: false,
        };

        next();
    };
};

module.exports = advancedResults;
