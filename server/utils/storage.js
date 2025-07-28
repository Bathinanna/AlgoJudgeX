class MemStorage {
    constructor() {
      this.users = new Map();
      this.currentUserId = 1;
    }
  
    async getUser(id) {
      return this.users.get(id);
    }
  
    async getUserByUsername(username) {
      return Array.from(this.users.values()).find(
        (user) => user.username === username
      );
    }
  
    async createUser(insertUser) {
      const id = this.currentUserId++;
      const user = { ...insertUser, id };
      this.users.set(id, user);
      return user;
    }
  }
  
  const storage = new MemStorage();
  module.exports = { storage };
  