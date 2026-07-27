const express = require("express");
const locationController = require("../controllers/locationController");

const router = express.Router();

router.get("/countries", locationController.getCountries);
router.get("/countries/:id/states", locationController.getStatesByCountry);
router.get("/states/:id/cities", locationController.getCitiesByState);
router.get("/cities", locationController.searchCities);

module.exports = router;
