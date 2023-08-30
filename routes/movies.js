const express = require("express");
const router = express.Router();

const { Movie, schema } = require("../model/movie");
const { Genre } = require("../model/genre");
const auth = require("../middleware/auth");


router.get("/", async (req, res) => {
  try {
    const movie = await Movie.find({});
    res.send(movie);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

router.post("/", auth, async (req, res) => {
  const { value, error } = schema.validate(req.body);
  if (error) return res.status(400).send(error.message);

  console.log("genre", value);

  const genre = await Genre.findById(value.genreId);
  console.log("returned", genre);
  if (!genre) return res.status(400).send("Invalid genre");

  const movie = new Movie({
    title: value.title,
    genre: {
      _id: genre._id,
      name: genre.name,
    },
    numberInStock: value.numberInStock,
    dailyRentalRate: value.dailyRentalRate,
  });

  try {
    await movie.save();
    res.status(201).send(movie);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

router.put("/:id", auth, async (req, res) => {
  const { value, error } = schema.validate(req.body);
  if (error) return res.status(400).send(error.message);

  const _id = req.params.id;

  try {
    const movie = await Movie.findByIdAndUpdate(
      _id,
      { ...value },
      { new: true }
    );
    if (!movie) return res.status(404).send("Movie not found");

    return res.status(200).send(movie);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
});

router.delete("/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const movie = await Movie.findByIdAndRemove(_id);
    if (!movie) return res.status(404).send("Movie not found");

    return res.status(200).send(movie);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
});

router.get("/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const movie = await Movie.findById(_id);
    if (!movie)
      return res.status(404).send("The movie with the given ID was not found.");
    return res.status(200).send(movie);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send("Internal server error");
  }
});

module.exports = router;
