const async = require("async");

const { getBooks, getTotalBooksCount, getAuthors,
  getShelfs,
  getSubjects,
  getLanguages,
  getLinks, } = require("../services/BookService");

const getPaginationAndFilters = (query) => {
  let { page } = query;
  page = page || 1;

  const limit = 25;

  return {
    pagination: {
      page,
      limit,
      offset: limit * (page - 1)
    },
    filters: {
      bookId: strToArr(query.bookId),
      language: strToArr(query.language),
      mimeType: strToArr(query.mimeType),
      topic: strToArr(query.topic),
      author: strToArr(query.author),
      title: strToArr(query.title),
    },
  }
}

const paginationResponseData = (totalCount, pagination) => {
  const {limit, page } = pagination;

  const totalPages = Math.ceil(totalCount/limit);
  const currentPage = page;
  const nextPage = (currentPage + 1) > totalPages ? null : (currentPage + 1);

  return {
    currentPage,
    nextPage: nextPage,
    perPageLimit: limit,
    totalPages
  };
} 

const strToArr = (str, separator = ",") => {
  if (!str) {
    return [];
  }

  return str.split(separator).map(val => val.trim());
}

const getAllBooks = async (req, res) => {
  const {pagination, filters} = getPaginationAndFilters(req.query);

  const totalCount = await getTotalBooksCount(filters);

  let data = [];

  if (totalCount) {
    data = await getBooks(pagination, filters);
  }

  await async.forEachOfLimit(data, 2, async (book) => {
    book.authors = await getAuthors(book.book_id, book.authors);
    book.shelfs = await getShelfs(book.book_id, book.shelfs);
    book.subjects = await getSubjects(book.book_id, book.subjects);
    book.languages = await getLanguages(book.book_id, book.languages);
    book.links = await getLinks(book.book_id, book.links);
  });

  res.status(200).json({
    totalCount,
    dataCount: data.length,
    data,
    pagination : paginationResponseData(totalCount, pagination),
    message: "Books list",
  });
}

module.exports = { getAllBooks };
