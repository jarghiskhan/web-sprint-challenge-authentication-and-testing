// Write your tests here
const request = require("supertest");
const server = require("../api/server");
const db = require("../data/dbConfig");

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});
beforeEach(async () => {
  await db("users").truncate();
});
afterAll(async () => {
  await db.destroy();
});

describe("server tests", () => {
  describe("[POST] /api/auth/register", () => {
    test("[1] registers a new user in the database", async () => {
      await request(server)
        .post("/api/auth/register")
        .send({ username: "kinsley", password: "asdf" });
      let users = await db("users");
      expect(users).toHaveLength(1);
      await request(server)
        .post("/api/auth/register")
        .send({ username: "nuggs", password: "1234" });
      users = await db("users");
      expect(users).toHaveLength(2);
    }, 750);
    test("[2] responds with a 401 if username is missing", async () => {
      let res = await request(server)
        .post("/api/auth/register")
        .send({ password: "asdf" });
      expect(res.status).toBe(401);
    }, 750);
  });
  describe("[POST] /api/auth/login", () => {
    test("[3] responds with a 200 for login", async () => {
      await request(server)
        .post("/api/auth/register")
        .send({ username: "kinsley", password: "asdf" });
      let res = await request(server)
        .post("/api/auth/login")
        .send({ username: "kinsley", password: "asdf" });
      expect(res.status).toBe(200);
    }, 750);
    test("[4] responds with a 401 if username is missing", async () => {
      let res = await request(server)
        .post("/api/auth/login")
        .send({ password: "asdf" });
      expect(res.status).toBe(401);
    }, 750);
  });
  describe("[GET] /api/jokes", () => {
    test("[5] requests with a valid token obtain a list of users", async () => {
      await request(server)
        .post("/api/auth/register")
        .send({ username: "kinsley", password: "asdf" });
      let res = await request(server)
        .post("/api/auth/login")
        .send({ username: "kinsley", password: "asdf" });
      res = res = await request(server)
        .get("/api/jokes")
        .set("Authorization", res.body.token);
      expect(res.body).toMatchObject([
        {
          id: "0189hNRf2g",
          joke: "I'm tired of following my dreams. I'm just going to ask them where they are going and meet up with them later.",
        },
        {
          id: "08EQZ8EQukb",
          joke: "Did you hear about the guy whose whole left side was cut off? He's all right now.",
        },
        {
          id: "08xHQCdx5Ed",
          joke: "Why didn’t the skeleton cross the road? Because he had no guts.",
        },
      ]);
    }, 750);
    test("[6] responds with a 401 if token is missing", async () => {
      let res = await request(server).get("/api/jokes");
      
      expect(res.body).toMatchObject({ message: "token required" });
    }, 750);
  });
});
