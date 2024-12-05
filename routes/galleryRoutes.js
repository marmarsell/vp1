const express = require("express")
const router = express.Router();
const general = require("../generalFNS");

//kõikidele marsruutidele vahevara
router.use(general.checkLogin);

//kontrollerid
const{
	photosHome,
	photoUpload,
	gallery
} = require("../controllers/galleryControllers");

//iga marsruudile oma osa nagu index failis

router.route("/").get(photosHome);

router.route("/photoupload").get(photoUpload);

router.route("/gallery").get(gallery);

module.exports = router;