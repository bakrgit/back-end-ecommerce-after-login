class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  filter() {
    const queryStringObj = { ...this.queryString };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((field) => delete queryStringObj[field]);

    let queryStr = JSON.stringify(queryStringObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt|in)\b/g,
      (match) => `$${match}`
    );

    console.log(queryStr);
    console.log(JSON.parse(queryStr));

    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select('-__v');
    }
    return this;
  }

  search(modelName) {
    if (this.queryString.keyword) {
      let query = {};
      if (modelName === 'Products') {
        query.$or = [
          { title: { $regex: this.queryString.keyword, $options: 'i' } },
          { description: { $regex: this.queryString.keyword, $options: 'i' } },
        ];
      } else {
        query = { name: { $regex: this.queryString.keyword, $options: 'i' } };
      }

      this.mongooseQuery = this.mongooseQuery.find(query);
    }
    return this;
  }

  paginate(countDocuments) {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 50;
    const skip = (page - 1) * limit;
    const endIndex = page * limit;

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);

    // Pagination Result
    const pagination = {};
    pagination.currentPage = page;
    pagination.numberOfPages = Math.ceil(countDocuments / limit); // 90 / 20 = 4.3  => 5
    pagination.limit = limit;

    if (endIndex < countDocuments) {
      pagination.nextPage = page + 1;
      // pagination.next = {
      //   page: page + 1,
      //   limit: limit,
      // };
    }
    if (skip > 0) {
      pagination.prevPage = page - 1;
      // pagination.prev = {
      //   page: page - 1,
      //   limit: limit,
      // };
    }

    this.paginationResult = pagination;
    return this;
  }
}

module.exports = ApiFeatures;
