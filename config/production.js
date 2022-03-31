module.exports = {
  mongoURI: `mongodb+srv://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@bt.qcwta.mongodb.net/${process.env.DATABASE_NAME}?retryWrites=true&w=majority`,
};
