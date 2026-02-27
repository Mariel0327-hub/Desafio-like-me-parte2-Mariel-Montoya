const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/posts", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM posts ORDER BY id DESC;");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener posts" });
  }
});

app.post("/posts", async (req, res) => {
  try {
    const { titulo, url, descripcion } = req.body;
    const query =
      "INSERT INTO posts (titulo, img, descripcion, likes) VALUES ($1, $2, $3, $4) RETURNING *;";
    const values = [titulo, url, descripcion, 0];
    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear post" });
  }
});
// PUT: dar like a un post (incrementa likes)
app.put("/posts/like/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const query =
      "UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING *;";
    const values = [id];

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Post no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al dar like" });
  }
});

// DELETE: eliminar un post
app.delete("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const query = "DELETE FROM posts WHERE id = $1 RETURNING *;";
    const values = [id];

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Post no encontrado" });
    }

    res.json({ message: "Post eliminado", post: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar post" });
  }
});
app.listen(3000, () => console.log("Server ON http://localhost:3000"));
