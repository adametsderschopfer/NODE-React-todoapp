const fs = require("fs");
const path = require("path");
const uuid = require("uuid");

const DB_PATH = path.join(__dirname, "..", "database", "db.json");

class UserModel {
  static getAllUsers() {
    return new Promise((res, rej) => {
      fs.readFile(DB_PATH, "utf-8", (err, content) => {
        if (err) {
          return rej(err);
        }

        res(JSON.parse(content));
      });
    });
  }

  static UserSchema(email, password, username) {
    return {
      username,
      email,
      password,
      id: uuid.v4(),
      todos: [],
    };
  }

  static async userRegistration(email, password, username) {
    try {
      const all = await UserModel.getAllUsers();
      const newUser = UserModel.UserSchema(email, password, username);

      await all.users.push(newUser);

      return new Promise((res, rej) => {
        UserModel.save(all)
        res(newUser);
      });
    } catch (e) {
      console.log(e);
    }
  }

  static async getTodosByUserId(id) {
    try {
      const allUser = await UserModel.getAllUsers();
      const { todos } = allUser.users.find((u) => u.id === id);

      return new Promise((res, rej) => {
        if (!todos) {
          rej({ err: "TODOS not found" });
        }

        res({ todos });
      });
    } catch (e) {
      console.log(e);
    }
  }

  static save(content) {
    return new Promise((res, rej) => {
      return fs.writeFile(DB_PATH, JSON.stringify(content), (err) => {
        if (err) {
          rej(err);
        }

        res();
      });
    });
  }

  static async createNewTodo(todoObj, userId) {
    try {
      const allUser = await UserModel.getAllUsers();
      const { todos } = allUser.users.find((u) => u.id === userId);

      const newTodo = { ...todoObj, id: uuid.v4(), done: false };

      await todos.push(newTodo);
      await UserModel.save(allUser);
      return new Promise((res, rej) => {
        res(newTodo);
      });
    } catch (e) {
      console.log(e);
    }
  }

  static async deleteTodo(todoid, userid) {
    try {
      const allUser = await UserModel.getAllUsers();
      let { todos } = await allUser.users.find((u) => u.id === userid);

      if (todos !== []) {
        const updTodos = await todos.filter((t) => t.id !== todoid);
        allUser.users.find((u) => u.id === userid).todos = updTodos;
      }

      return new Promise((res, rej) => {
        res(UserModel.save(allUser));
      });
    } catch (e) {
      console.log(e);
    }
  }

  static async donnedTodo(todoid, userid) {
    try {
      const allUser = await UserModel.getAllUsers();
      let { todos } = await allUser.users.find((u) => u.id === userid);
      if (todos !== []) {
        await todos.map((i) => {
          if (i.id === todoid) {
            i.done = !i.done;
          }
        });
        allUser.users.todos = todos;
      }

      return new Promise((res, rej) => {
        res(UserModel.save(allUser));
      });
    } catch (e) {
      console.log(e);
    }
  }

  static async editTodo(todoid, userid, editedDataObj) {
    try {
      const { title, description } = editedDataObj;

      const allUser = await UserModel.getAllUsers();
      let { todos } = await allUser.users.find((u) => u.id === userid);

      if (todos !== []) {
        await todos.map((i) => {
          if (i.id === todoid) {
            i.title = title;
            i.description = description;
          }
        });
        allUser.users.todos = todos;
      }

      return new Promise((res, rej) => {
        res(UserModel.save(allUser));
      });
    } catch (e) {
      console.error(e);
    }
  }
}

module.exports = UserModel;
