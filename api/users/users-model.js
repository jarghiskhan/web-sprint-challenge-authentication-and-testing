const db = require("../../data/dbConfig");

function findBy(filter) {
     return db("users as u")
      .where(filter)
  }
function findById(id) {
  return db("users as u").select("*").where({ id }).first();
}

async function add({ username, password}) {
  let created_user_id;
  await db.transaction(async (trx) => {
    const [user_id] = await trx("users").insert({
      username,
      password,
    });
    created_user_id = user_id;
  });
  return findById(created_user_id);
}

module.exports = {
    findBy,
  findById,
  add
};
