const paginationResponseData = (totalCount, pagination) => {
  const { limit, page } = pagination;

  const totalPages = Math.ceil(totalCount / limit);
  const currentPage = page;
  const nextPage = currentPage + 1 > totalPages ? null : currentPage + 1;

  return {
    currentPage,
    nextPage: nextPage,
    perPageLimit: limit,
    totalPages,
  };
};

const strToArr = (str, separator = ",") => {
  if (!str) {
    return [];
  }

  return str.split(separator).map((val) => val.trim());
};

module.exports = {
  paginationResponseData,
  strToArr,
};
