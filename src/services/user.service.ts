import { RegisterType } from "~/type/auth.type";

export class UserService {
  static async getAllUsers() {
    return [{ id: 1, name: 'John Doe' }]
  }
}
