const { executeQuery } = require("./DBService");

const getTotalBooksCount = async (filters) => {
  const query = getTotalBooksQuery(filters);

  const res = await executeQuery(query);

  return res[0].count || 0;
};

const getBooks = async (pagination, filters) => {
  const query = getBooksQuery(pagination, filters);

  return await executeQuery(query);
};

const getAuthors = async (bookId, data) => {
  if (!data) {
    return [];
  }

  data = data.split(",").join(", ");

  const query = `Select  books_author.id, books_author.birth_year, books_author.death_year, books_author.name
    FROM books_book_authors 
    INNER JOIN books_author ON books_book_authors.author_id = books_author.id
    WHERE book_id = ${bookId} AND books_author.id IN (${data})`;

  return await executeQuery(query);
};

const getShelfs = async (bookId, data) => {
  if (!data) {
    return [];
  }

  data = data.split(",").join(", ");

  const query = `Select books_bookshelf.id, books_bookshelf.name
    FROM books_book_bookshelves
    INNER JOIN books_bookshelf ON books_book_bookshelves.bookshelf_id = books_bookshelf.id
    WHERE book_id = ${bookId} AND books_bookshelf.id IN (${data})`;

  return await executeQuery(query);
};

const getSubjects = async (bookId, data) => {
  if (!data) {
    return [];
  }

  data = data.split(",").join(", ");

  const query = `Select books_subject.id, books_subject.name
    FROM books_book_subjects
    INNER JOIN books_subject ON books_book_subjects.subject_id = books_subject.id
    WHERE book_id = ${bookId} AND books_subject.id IN (${data})`;

  return await executeQuery(query);
};

const getLanguages = async (bookId, data) => {
  if (!data) {
    return [];
  }

  data = data.split(",").join(", ");

  const query = `Select books_language.id, books_language.code
    FROM 
    books_book_languages
    INNER JOIN books_language ON books_book_languages.language_id = books_language.id
    WHERE book_id = ${bookId} AND books_language.id IN (${data})`;

  return await executeQuery(query);
};

const getLinks = async (bookId, data) => {
  if (!data) {
    return [];
  }

  data = data.split(",").join(", ");

  const query = `Select 
      books_format.mime_type,
      books_format.url
   from books_format
    WHERE book_id = ${bookId} AND books_format.id IN (${data})`;

  return await executeQuery(query);
};

const getMutipleOrClause = (data, key, compare = "like") => {
  let res = [];

  if (!data || !data.length) {
    return "1=1";
  }

  for (const value of data) {
    let str = "";
    if (compare === "like") {
      str = `${key} ${compare} "%${value}%"`;
    } else {
      str = `${key} ${compare} ${value}`;
    }
    res.push(str);
  }

  return "(" + res.join(" OR ") + ")";
};

const getWhereClause = (filters) => {
  let res = [];

  const localFilters = {
    bookId: getMutipleOrClause(filters.bookId, "books_book.gutenberg_id", "="),
    language: getMutipleOrClause(filters.language, "books_language.code", "="),
    mimeType: getMutipleOrClause(filters.mimeType, "books_format.mime_type", "="),
    topic:
      "(" +
      getMutipleOrClause(filters.topic, "books_bookshelf.name") +
      " OR " +
      getMutipleOrClause(filters.topic, "books_subject.name") +
      ")",
    author: getMutipleOrClause(filters.author, "books_author.name"),
    title: getMutipleOrClause(filters.title, "books_book.title"),
  };

  for (const key in localFilters) {
    if (localFilters[key] !== "1=1" && localFilters[key] !== "(1=1 OR 1=1)") {
      res.push(localFilters[key]);
    }
  }

  return res.length ? `WHERE ${res.join(" AND ")}` : "";
};

const getBooksQuery = function (pagination, filters) {
  const { limit, offset } = pagination;

  return `
    SELECT
      books_book.id as book_id,
      books_book.title,
      GROUP_CONCAT(DISTINCT books_author.id) as authors,
      GROUP_CONCAT(DISTINCT books_bookshelf.id) as shelfs,
      GROUP_CONCAT(DISTINCT books_subject.id) as subjects,
      GROUP_CONCAT(DISTINCT books_language.id) as languages,
      GROUP_CONCAT(DISTINCT books_format.id) as links
    FROM
      books_book
      LEFT JOIN books_book_authors ON books_book.id = books_book_authors.book_id
      LEFT JOIN books_author ON books_book_authors.author_id = books_author.id
      LEFT JOIN books_book_bookshelves ON books_book.id = books_book_bookshelves.book_id
      LEFT JOIN books_bookshelf ON books_book_bookshelves.bookshelf_id = books_bookshelf.id
      LEFT JOIN books_book_subjects ON books_book.id = books_book_subjects.book_id
      LEFT JOIN books_subject ON books_book_subjects.subject_id = books_subject.id
      LEFT JOIN books_book_languages ON books_book.id = books_book_languages.book_id
      LEFT JOIN books_language ON books_book_languages.language_id = books_language.id
      LEFT JOIN books_format ON books_book.id = books_format.book_id
    ${getWhereClause(filters)}
    GROUP BY
      books_book.id
    ORDER BY
      books_book.download_count DESC
    LIMIT
      ${limit} OFFSET ${offset};
  `;
};

const getTotalBooksQuery = function (filters) {
  return `
    SELECT
      Count(DISTINCT books_book.id) as count
      FROM
      books_book
      LEFT JOIN books_book_authors ON books_book.id = books_book_authors.book_id
      LEFT JOIN books_author ON books_book_authors.author_id = books_author.id
      LEFT JOIN books_book_bookshelves ON books_book.id = books_book_bookshelves.book_id
      LEFT JOIN books_bookshelf ON books_book_bookshelves.bookshelf_id = books_bookshelf.id
      LEFT JOIN books_book_subjects ON books_book.id = books_book_subjects.book_id
      LEFT JOIN books_subject ON books_book_subjects.subject_id = books_subject.id
      LEFT JOIN books_book_languages ON books_book.id = books_book_languages.book_id
      LEFT JOIN books_language ON books_book_languages.language_id = books_language.id
      LEFT JOIN books_format ON books_book.id = books_format.book_id
      ${getWhereClause(filters)};
  `;
};

module.exports = {
  getBooks,
  getTotalBooksCount,
  getAuthors,
  getShelfs,
  getSubjects,
  getLanguages,
  getLinks,
};
