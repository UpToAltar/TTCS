export class UserService {
  static async getAllUsers() {
    return [{ id: 1, name: 'John Doe' }]
  }
}
