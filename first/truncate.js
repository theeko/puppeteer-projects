const truncate = (str, length) => {
  return str.length < length ? str : str.slice(0, length) + "...";
};

module.exports = truncate;
