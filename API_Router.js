const { Router } = require("express");
const router = Router();
const { UserModel } = require("./models");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

router.post(
  "/auth/register",
  [
    check("email", "Некоректный email").isEmail(),
    check("password", "Минимальная длина пароля 6 символов").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          erros: errors.array(),
          message: "Некоректные данные при регистрации",
        });
      }
      const { email, password, username } = req.body;

      if (!username) {
        return res
          .status(400)
          .json({ error: "Некорректные данные при регестрации" });
      }

      const allU = await UserModel.getAllUsers();
      const candidate = allU.users.find((c) => c.email === email);

      if (candidate) {
        return res.status(404).json({ error: "Данный email уже занят!" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      await UserModel.userRegistration(email, hashedPassword, username).then(
        (dataNewUser) => {
          delete dataNewUser.password;
          return res
            .status(201)
            .json({ success: "Пользователь успешно создан!", dataNewUser });
        }
      );
    } catch (e) {
      console.error(e);
    }
  }
);

router.post(
  "/auth/login",
  [
    check("email", "Некоректный email").isEmail(),
    check("password", "Минимальная длина пароля 6 символов").exists().isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          erros: errors.array(),
          message: "Некоректные данные при входе в систему!",
        });
      }

      const { email, password } = req.body;

      const allU = await UserModel.getAllUsers();
      const candidate = allU.users.find((c) => c.email === email);

      if (!candidate) {
        return res.status(404).json({ error: "Неверный логин или пароль" });
      }

      const isMatch = await bcrypt.compare(password, candidate.password);

      if (!isMatch) {
        return res.status(400).json({ error: "Неверный логин или пароль" });
      }

      return res.status(200).json({
        username: candidate.username,
        email: candidate.email,
        id: candidate.id,
      });
    } catch (e) {
      console.error(e);
    }
  }
);

router.get("/todos/:userid", async (req, res) => {
  try {
    const userTodos = await UserModel.getTodosByUserId(req.params.userid);
    return res.status(200).json(userTodos);
  } catch (e) {
    console.error(e);
  }
});

router.post("/todos/:userid", async (req, res) => {
  try {
    const { title, description } = req.body;

    if (title === '' && description === '') {
      return res.status(400).json();
    }
    const todo = await UserModel.createNewTodo(
      { title, description },
      req.params.userid
    );

    return res.status(201).json({ todo });
  } catch (e) {
    console.error(e);
  }
});

router.post("/todos/:userid/:todoid", async (req, res) => {
  try {
    await UserModel.deleteTodo(req.params.todoid, req.params.userid);
    res.status(204).json({ message: "Задача успешно удалена!" });
  } catch (e) {
    console.error(e);
  }
});

router.put("/todos/:userid/:todoid", async (req, res) => {
  try {
    const { todoid, userid } = req.params;
    const { title, description } = req.body;

    if (req.query.done) {
      await UserModel.donnedTodo(todoid, userid);
      return res.status(200);
    } else if (req.query.edit) {
      if (!title && !description) {
        return res
          .status(405)
          .json({ message: "Поля не должны быть пустыми!" });
      }

      await UserModel.editTodo(todoid, userid, {
        title,
        description,
      });

      return res.status(200).json({ message: "Задача успешно измененно!" });
    }

    res.status(404);
  } catch (e) {
    console.error(e);
  }
});

module.exports = router;
