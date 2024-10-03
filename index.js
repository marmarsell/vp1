const express = require("express");
const marsTime = require("./moodulid/marsTime.js");

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res)=>{
	//res.send("Express läks täiesti tööle");
	res.render("index.ejs");
});

app.get("/timenow",(req, res)=>{
	const weekDayNow = marsTime.weekDayEt();
	const dateNow = marsTime.dateEt();
	res.render("timenow",{nowWD: weekDayNow, nowD: dateNow});
});

app.listen(5126);