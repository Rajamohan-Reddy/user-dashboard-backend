const express = require("express");
const path = require("path");
const cors = require("cors");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
app.use(cors());

const dbPath = path.join(__dirname, "user.db");

let db = null;

//Initializing server and connecting with database
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//Getting all users list API
app.get("/users", async (request, response) => {
  const getUsersQuery = `
      SELECT
        *
      FROM
        user
      ORDER BY
        id;`;
  const usersArray = await db.all(getUsersQuery);
  response.send(usersArray);
});

//Getting single user based on id API
app.get("/users/:id/", async (request, response) => {
  const { id } = request.params;
  const getUserQuery = `
      SELECT
        *
      FROM
        user
      WHERE id = ${id};`;
  const user = await db.get(getUserQuery);
  response.send(user);
});

//Adding new user API
app.post("/users", async (request, response) => {
  const userDetails = request.body;
  const { id, firstname, lastname, email, department } = userDetails;
  const addUserQuery = `
  INSERT INTO
    user
  VALUES
  (
    ${id},'${firstname}','${lastname}','${email}','${department}'
  )
  `;
  const dbResponse = await db.run(addUserQuery);
  response.send({ lastId: dbResponse.lastID });
});

//Updating user details API
app.put("/users/:id/", async (request, response) => {
  const { id } = request.params;
  const userDetails = request.body;
  const { firstname, lastname, email, department } = userDetails;
  const updateUserQuery = `
      UPDATE
        user
      SET
        firstname = '${firstname}',
        lastname = '${lastname}',
        email = '${email}',
        department = '${department}'
      WHERE 
      id = ${id};`;
  await db.run(updateUserQuery);
  response.json({
    message: "User Updated Successfully",
  });
});

//Delete user from user table API
app.delete("/users/:id/", async (request, response) => {
  const { id } = request.params;
  const deleteUserQuery = `
      DELETE FROM
        user
      WHERE
        id = ${id};`;
  await db.run(deleteUserQuery);
  response.send("User Deleted Successfully");
});
