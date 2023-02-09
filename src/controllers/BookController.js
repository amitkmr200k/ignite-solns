const async = require("async");

const {
  getBooks,
  getTotalBooksCount,
  getAuthors,
  getShelfs,
  getSubjects,
  getLanguages,
  getLinks,
} = require("../services/BookService");
const { paginationResponseData, strToArr } = require("../services/HelperService");

const getAllBooks = async (req, res) => {
  try {
    const { pagination, filters } = getPaginationAndFilters(req.query);

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

      delete book.book_id;
    });

    res.status(200).json({
      message: "Books list fecthed successfully.",
      totalCount,
      dataCount: data.length,
      data,
      pagination: paginationResponseData(totalCount, pagination),
    });
  } catch (error) {
    console.log("🚀 ~ file: BookController.js:87 ~ getAllBooks ~ error", error);

    res.status(500).json({
      message: `Internal Sever Error: ${error.message}`,
    });
  }
};

const getPaginationAndFilters = (query) => {
  let { page } = query;
  page = page || 1;

  const limit = 25;

  return {
    pagination: {
      page,
      limit,
      offset: limit * (page - 1),
    },
    filters: {
      bookId: strToArr(query.book_id),
      language: strToArr(query.language),
      mimeType: strToArr(query.mimeType),
      topic: strToArr(query.topic),
      author: strToArr(query.author),
      title: strToArr(query.title),
    },
  };
};

module.exports = { getAllBooks };
