const express = require("express");
const router = express.Router(); //hard R is important!!!
const general = require("../generalFNS");

//kõikidele marsruutidele vahevara
router.use(general.checkLogin);

//kontrollerid
const{
	newsHome,
	addNews,
	addingNews,
	newsRead
} = require("../controllers/newsControllers");

//iga marsruudile oma osa nagu index failis

//app.get("/news", (req, res)=>{
router.route("/").get(newsHome);

router.route("/addnews").get(addNews);

router.route("/addnews").post(addingNews);

router.route("/readnews").get(newsRead)

module.exports = router;