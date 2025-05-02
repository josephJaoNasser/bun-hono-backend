class Database {
  async connect() {
    try {
      // Your connection logic here
      // you can return an instance of a database connection
      

      // return true if your connection is successful
      // or replace the true with the db connection instance
      return true;
    } catch (e) {
      throw e;
    }
  }
}

export default new Database();
