const express = require("express");
const marsTime = require("./moodulid/marsTime.js");
const fs = require("fs");
const dbInfo = require("../../vp2024config");
const mysql = require("mysql2");
//päringu lahtiharutamiseks POST päringute puhul
const bodyparser = require("body-parser");

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
//päringu url parsimine, false, kui ainult tekst / true, kuimidagi muud.
app.use(bodyparser.urlencoded({extended: false}));

//loon andmebaasiühendus
const conn = mysql.createConnection({
	host:dbInfo.configData.host,
	user:dbInfo.configData.user,
	password:dbInfo.configData.passWord,
	database:dbInfo.configData.dataBase
});

app.get("/", (req, res)=>{
	//res.send("Express läks täiesti tööle");
	res.render("index.ejs");
});

	//See on aja näitamise leht
app.get("/timenow",(req, res)=>{
	const weekDayNow = marsTime.weekDayEt();
	const dateNow = marsTime.dateEt();
	res.render("timenow",{nowWD: weekDayNow, nowD: dateNow});
});

	//See on vanasõnade leht
app.get("/vanasonad", (req, res)=>{
	let folkWisdom = [];
	fs.readFile("public/textfiles/Vanas6nad.txt", "utf8", (err, data)=>{
		if(err){
			res.render("justlist", {h2: "vanasõnad", listData: ["Ei leidnud ühtegi vanasõna!"]});
		}
		else{
			folkWisdom = data.split(";");
			res.render("justlist", {h2: "vanasõnad", listData: folkWisdom});
		}
	});
});

	//See on registreerimise leht
app.get("/regvisit", (req, res)=>{
	
	const dateNow = marsTime.dateEt();
	res.render("regvisit.ejs");
});

app.get("/regvisitDB", (req, res)=>{
	let notice = "";
	let firstName = "";
	let lastName = "";
	const dateNow = marsTime.dateEt();
	res.render("regvisitDB.ejs", {notice:notice, firstName:firstName, lastName:lastName});
});

app.post("/regvisit", (req, res)=>{
	const dateNow = marsTime.dateEt();
	console.log(req.body);
	fs.open("public/textfiles/visitlog.txt", "a",(err, file)=>{
		if(err){
			throw err;
		}
		else{
			fs.appendFile("public/textfiles/visitlog.txt", req.body.firstNameInput + " " + req.body.lastNameInput + " " + dateNow + ";", (err)=>{
				if(err){
					throw err;
				}
				else{
					console.log("Faili kirjutati!");
					res.render("regvisit");
				}
			});
			fs.writeFile("public/textfiles/lastvisit.txt", req.body.firstNameInput + " " + req.body.lastNameInput + " " + dateNow + ";", (err)=>{
				if(err){
					throw err;
				}
				else{
					console.log("Viimane inimene kirjutati!");
					res.render("regvisit");
				}
			});
		}
	});
});

app.post("/regvisitDB", (req, res)=>{
	let notice = "";
	let firstName = "";
	let lastName = "";
	if(!req.body.firstNameInput || !req.body.lastNameInput){
		firstName = req.body.firstNameInput;
		lastName = req.body.lastNameInput;
		notice = "Osa andmeid sisestamata UwU";
		res.render("regvisitDB", {notice:notice, firstName:firstName, lastName:lastName});
	}
	else{
	let sqlReqPerson = "INSERT INTO visitlogdb (first_name, last_name) VALUES(?,?)";
	conn.query(sqlReqPerson, [req.body.firstNameInput, req.body.lastNameInput], (err, sqlres)=>{
		if(err){
			throw err;
		}
		else{
			notice = "Andmed sisestatud! OwO";
			res.render("regvisitDB", {notice:notice, firstName:firstName, lastName:lastName});
		}
	});
	}
});

	//See on registreerija register
app.get("/coolpeople", (req, res)=>{
			//see salvestab logi
	let coolList = [];
	fs.readFile("public/textfiles/visitlog.txt", "utf8", (err, data)=>{
		if(err){
			res.render("coolPeople", {visitData: ["Ei leidnud ühtegi inimest!"]});
		}
		else{
			coolList = data.split(";");
			
			//see salvestab viimast inimest
			let lastList = [];
			fs.readFile("public/textfiles/lastvisit.txt", "utf8", (err, data)=>{
			if(err){
				res.render("coolPeople", {visitData: ["Ei leidnud ühtegi inimest!"]});
			}
			else{
				lastList = data.split(";");
				res.render("coolPeople", {lastVisitData: lastList, visitData: coolList});
			}
			});
		}
	});
	
});

app.get("/eestifilm", (req, res)=>{
	res.render("filmiindex.ejs");
});

app.get("/eestifilm/tegelased", (req, res)=>{
	let sqlReqPerson = "SELECT first_name, last_name, birth_date FROM person";
	let persons = [];
	conn.query(sqlReqPerson, (err, sqlres)=>{
		if(err){
			throw err;
		}
		else{
			console.log(sqlres);
			persons = sqlres;
			res.render("tegelased.ejs", {persons: persons});
		}
	});
});

	//See on vale failisüsteemi jaoks
app.get("*", (req, res)=>{
	res.render("notFound.ejs");
});

app.listen(5126);