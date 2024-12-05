const express = require("express");
const marsTime = require("./moodulid/marsTime.js");
const fs = require("fs");
const dbInfo = require("../../vp2024config");
const mysql = require("mysql2");
//päringu lahtiharutamiseks POST päringute puhul
const bodyparser = require("body-parser");
//failide üleslaadimiseks
const multer = require("multer");
//sessioonihaldur
const session = require("express-session");

const sharp = require("sharp");

const bcrypt = require("bcrypt");

const async = require("async");


//                                          ^ IMPORTS ^
////////////////////////////////////////////// BREAK //////////////////////////////////////////////


const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
//päringu url parsimine, false, kui ainult tekst / true, kuimidagi muud.
app.use(bodyparser.urlencoded({extended: true}));
//seadistame vahevara multer fotode laadimiseks kindlasse kataloogi.
const upload = multer({dest: "./public/gallery/orig/"});
//pildi manipulatsiooniks


app.use(session({secret: "MinuSuperSaladusOn_IAmAFurryUwUDealWithIt_F0x02A5C330_:)", saveUninitialized: true, resave: true}));

//funktsioon logini chekkimiseks
const checkLogin = function(req, res, next){
	if(req.session != null){
		if(req.session.userID){
			console.log("Login, sees kasutaja: " + req.session.userID);
			next();
		}
		else{
			console.log("Login ei toiminud");
			res.redirect("/signin");
		}
	}
	else{
		res.redirect("/signin");
		console.log("Sessiooni kui poleks üldse?");
	}
}

//loon andmebaasiühendus
const conn = mysql.createConnection({
	host:dbInfo.configData.host,
	user:dbInfo.configData.user,
	password:dbInfo.configData.passWord,
	database:dbInfo.configData.dataBase
});

//                                           ^ SETUP ^
////////////////////////////////////////////// BREAK //////////////////////////////////////////////


app.get("/EKSAMID", (req, res)=>{
	const deathTimer = marsTime.deltaTime("2024-09-02", new Date());
	res.render("EKSAMITE_AVALEHT.ejs");
});


//VILJAVEDU ÜLESANNE

	//VILJAVEDU SISESTUS JA VORM
app.get("/EKSAMID/viljaveduinput", (req, res)=>{
	let notice = "";
	let carNumHolder = "";
	let carWeightInitHolder = "";
	let carWeightFinalHolder = "";
	res.render("Eviljaveduinput", {msg:notice, registration:carNumHolder, initmass:carWeightInitHolder, finalmass:carWeightFinalHolder});
});

app.post("/EKSAMID/viljaveduinput", (req, res)=>{
	let notice = "";
	let carNumHolder = "";
	let carWeightInitHolder = "";
	let carWeightFinalHolder = "";
	if(!req.body.carSerial || !req.body.carWeightInit || !req.body.carWeightFinal){
		carNumHolder = req.body.carSerial;
		carWeightInitHolder = req.body.carWeightInit;
		carWeightFinalHolder = req.body.carWeightFinal;
		notice = "Osa andmeid sisestamata UwU";
		res.render("Eviljaveduinput", {msg:notice, registration:carNumHolder, initmass:carWeightInitHolder, finalmass:carWeightFinalHolder});
	}
	else{
		let sqlReqViljad = "INSERT INTO eksamproov_viljavedu (carnum, weightin, weightout) VALUES(?,?,?)";
		conn.query(sqlReqViljad, [req.body.carSerial, req.body.carWeightInit, req.body.carWeightFinal], (err, sqlres)=>{
			if(err){
				throw err;
			}
			else{
				notice = "Andmed sisestatud! OwO";
				res.render("Eviljaveduinput", {msg:notice, registration:carNumHolder, initmass:carWeightInitHolder, finalmass:carWeightFinalHolder});
			}
		});
	}
});

	//VILJAVEDU INFO VÄLJASTUS
	
	
app.get("/EKSAMID/viljaveduoutput", (req, res)=>{
	let sql = "SELECT carnum, weightin, weightout FROM eksamproov_viljavedu";
	let totalCounter = 0;
	conn.execute(sql, [new Date()], (err, result)=>{
		if(err) {
			//throw err;
			const carList = [{id: 0, news_title: "Informatsiooni pole!"}];
			notice = 'Info lugemine ebaõnnestus! ' + err;
			res.render("Eviljaveduoutput", {carList: result, totalCounter:totalCounter});
		} 
		else {
			notice = 'Info edukalt loetud!';
			result.forEach(function(car){
				totalCounter = totalCounter + (car.weightin - car.weightout);
			});
			res.render("Eviljaveduoutput", {carList: result, totalCounter:totalCounter});
		}
	});
});

//"SELECT carnum, weightin, weightout FROM eksamproov_viljavedu WHERE expirety_date > ? ORDER BY id DESC";


//                                          ^ EKSAMID ^
////////////////////////////////////////////// BREAK //////////////////////////////////////////////


app.get("/", (req, res)=>{
	const deathTimer = marsTime.deltaTime("2024-09-02", new Date());
	res.render("index.ejs", {deathTimer: deathTimer});
});

app.get("/signin", (req, res)=>{
	notice = "";
	res.render("signin.ejs", {notice: notice});
});


//                                          KONTOSSE SISSEPÄÄS, SIGN IN
app.post("/signin", (req, res)=>{
	if(!req.body.emailInput || !req.body.passwordInput){
		console.log("Andmeid puudu")
		notice = "Sisselogimise andmeid on puudu"
		res.render("signin.ejs", {notice:notice});
	}
	else{
		let sqlRec = "SELECT id, password FROM vp1users WHERE email = ?";
		conn.execute(sqlRec, [req.body.emailInput],(err, result)=>{
			if(err){
				console.log("Viga andmebaasist lugemisel" + err);
				notice = "Tehniline viga, sisselogimine ebaõnnestus uwu"
				res.render("signin.ejs", {notice:notice});
			}
			else{
				if(result[0] != null){
					//kasutaja ON olemas, kontrollime parooli
					bcrypt.compare(req.body.passwordInput, result[0].password, (err, compareresult)=>{
						if(err){
							console.log("parooli compariga" + err);
							notice = "Tehniline viga, sisselogimine ebaõnnestus uwu"
							res.render("signin.ejs", {notice:notice});
						}
						else{
							//kas õige või vale parool OwO
							if(compareresult){
								//notice = "Oled sisse loginud, kuidagi, läbi selle spaghetti prograami..."
								//res.render("signin.ejs", {notice:notice});
								req.session.userID = result[0].id;
								res.redirect("/home");
							}
							else{
								notice = "Kasutajatunnus ja/või parool on vale"
								console.log("meid vist bruteforce'ivad >w>");
								res.render("signin.ejs", {notice:notice});
							}
						}
					});
				}
				else{
					notice = "Kasutajatunnus ja/või parool on vale"
					console.log("meid vist bruteforce'ivad >w>");
					res.render("signin.ejs", {notice:notice});
				}
			}
		});//conn execute lõppeb ära
	}
	//res.render("index.ejs", {deathTimer: deathTimer});
});


//                                          KONTO TEKITAMINE, SIGN UP
app.get("/signup", (req, res)=>{
	res.render("signup.ejs");
});

app.post("/signup", (req, res)=>{
	let notice = "Ootan andmeid";
	console.log(req.body);
	if(!req.body.firstNameInput || !req.body.lastNameInput || !req.body.birthDateInput || !req.body.genderInput || !req.body.emailInput || req.body.passwordInput.length < 8 || req.body.passwordInput !== req.body.confirmPasswordInput){
		console.log("Andmeid on puudu või paroolid ei kattu!");
		notice = "Andmeid on puudu, parool liiga lühike või parool ei kattu! :("
		res.render("signup.ejs", {notice: notice});
	}//kui andmetes viga
	else{
		notice = "Andmed sisestatud!";
		//loome parooli räsi jaoks soola
		bcrypt.genSalt(10, (err, salt)=> {
			if(err){
				notice = "Tehniline šokolaad parooli krüpteerimisel, konto ei ole loodud";
				res.render("signup.ejs", {notice: notice});
			}
			else{
				//krüpteerimine
				bcrypt.hash(req.body.passwordInput, salt, (err, pwdHash)=>{
					if(err){
						notice = "Tehniline šokolaad krüpteerimisel";
						res.render("signup.ejs", {notice: notice});
					}
					else{
						let sqlRec = "INSERT INTO vp1users (first_name, last_name, birth_date, gender, email, password) VALUES(?,?,?,?,?,?)"
						conn.execute(sqlRec, [req.body.firstNameInput, req.body.lastNameInput, req.body.birthDateInput, req.body.genderInput, req.body.emailInput, pwdHash], (err, result)=>{
							if(err){
								notice = "Tehniline viga andmebaasi kirjutmisel, kasutaja pole loodud, kurb aga nii on"
								res.render("signup.ejs", {notice: notice});
							}
							else{
								notice = "kasutaja " + req.body.emailInput + " edukalt loodud OwO";
								res.render("signup.ejs", {notice: notice});
							}
						});//conn execute lõpp
					}
				});//hash lõppeb
			}
		});//genSalt lõppes soolamist :3
	}//kui andmed korras
	//res.render("signup.ejs");
});


//                                          LOGOUT
app.get("/logout", (req, res)=>{
	req.session.destroy();
	console.log("Välja logiti");
	res.redirect("/");
});

app.get("/home", checkLogin, (req, res)=>{
	console.log("Sees on kasutaja: " + req.session.userID);
	let userName = "";
	let sqlReqUser = "SELECT first_name FROM vp1users WHERE id = " + req.session.userID;
	console.log("request is" + sqlReqUser);
	conn.query(sqlReqUser, (err, sqlRes)=>{
		if(err){
			throw err;
		}
		else{
			console.log("kasutaja: " + sqlRes);
			userName = sqlRes;
			console.log(userName);
			res.render("home.ejs", {userName: userName});
		}
	});
});


//                                       ^ ACCOUNT VIEWS ^
////////////////////////////////////////////// BREAK //////////////////////////////////////////////
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


//                                          KÜLASTUSE REGISTER !!VANA VT. ALLA!!

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


//                                          KÜLASTUSEREGISTER
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


//                                          KÜLALISTE LOGI
app.get("/abkulalised", (req, res)=>{
	let sqlReqPerson = "SELECT first_name, last_name, visit_time FROM visitlogdb";
	let visitors = [];
	conn.query(sqlReqPerson, (err, sqlres)=>{
		if(err){
			throw err;
		}
		else{
			console.log(sqlres);
			visitors = sqlres;
			res.render("abkulalised.ejs", {visitors: visitors});
		}
	});
});


//                                          EESTI FILMIDE ANDMED

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
			//persons = sqlres;
			for(let i = 0; i < sqlres.length; i++) {
				persons.push({first_name: sqlres[i].first_name, last_name: sqlres[i].last_name, birth_date: marsTime.givenDateFormatted(sqlres[i].birth_date)});
			}
			res.render("tegelased.ejs", {persons: persons});
		}
	});
});

//filmiandmete sisestus
app.get("/eestifilm/kolmvormi", (req, res)=>{
	let notice = "";
	let firstName = "";
	let lastName = "";
	res.render("kolmvormi.ejs", {notice:notice, firstName:firstName, lastName:lastName});
});

app.post("/eestifilm/kolmvormi", (req, res)=>{
	let notice = "";
	let firstName = "";
	let lastName = "";
	if(!req.body.firstNameInput || !req.body.lastNameInput){
		firstName = req.body.firstNameInput;
		lastName = req.body.lastNameInput;
		notice = "Osa andmeid sisestamata UwU";
		res.render("eestifilm/kolmvormi", {notice:notice, firstName:firstName, lastName:lastName});
	}
	else{
	let sqlReqPerson = "INSERT INTO visitlogdb (first_name, last_name) VALUES(?,?)";
	conn.query(sqlReqPerson, [req.body.firstNameInput, req.body.lastNameInput], (err, sqlres)=>{
		if(err){
			throw err;
		}
		else{
			notice = "Andmed sisestatud! OwO";
			res.render("eestifilm/kolmvormi", {notice:notice, firstName:firstName, lastName:lastName});
		}
	});
	}
});


app.get("/eestifilm/lisaseos", (req, res)=>{
	//võtan kasutusele async mooduli
	const filmQueries = [
		function(callback) {
			let sqlReq1 = "SELECT id first_name, last_name, birth_date FROM person";
			conn.execute(sqlReq1, (err, result)=>{
				if(err){
					return callback(err);
				}
				else{
					return callback(null, result);
				}
			});
		},
		function(callback) {
			let sqlReq2 = "SELECT id title, production_year FROM movie";
			conn.execute(sqlReq2, (err, result)=>{
				if(err){
					return callback(err);
				}
				else{
					return callback(null, result);
				}
			});
		},
		function(callback) {
			let sqlReq3 = "SELECT id position_name FROM position";
			conn.execute(sqlReq3, (err, result)=>{
				if(err){
					return callback(err);
				}
				else{
					return callback(null, result);
				}
			});
		}
	];
	//paneme päringud paralleelselt käima, saame lõpuks kolme päringu koondi
	async.parallel(filmQueries, (err, results)=>{
		if(err){
			throw err;
		}
		else{
			console.log(results);
			res.render("addrelations.ejs", {personList: results[0], movieList: results[1], positionList: results[2]});
		}
	});
});



//                                          UUDISED


//UUDISTE OSA ERALDI MARSRUUTIDE FAILIGA
const newsRouter = require("./routes/newsRoutes.js");
app.use("/news", newsRouter);

//                                          FOTOD

/* const galleryRouter = require("./routes/galleryRoutes.js");
app.use("/photos", galleryRouter); */

app.get("/photos", (req, res)=>{
	res.render("photos.ejs");
});

app.get("/photos/photoupload", (req, res)=>{
	
	res.render("photoupload.ejs");
});

app.post("/photos/photoupload", upload.single("photoInput"), (req, res)=>{
	console.log(req.body);
	console.log(req.file);
	//genereerime faile nime
	const fileName = "vp_" + Date.now() + ".png";
	//nimetame üleslaetud faili ümber
	fs.rename(req.file.path, req.file.destination + fileName, (err)=>{
		console.log(err);
	});
	sharp(req.file.destination + fileName).resize(800,600).jpeg({quality: 90}).toFile("./public/gallery/normal/" + fileName);
	sharp(req.file.destination + fileName).resize(100,100).jpeg({quality: 20}).toFile("./public/gallery/smol/" + fileName);
	//salvesta andmebaasi
	let sqlRec = "INSERT INTO vp1photos (file_name, orig_name, alt_text, privacy, user_id) VALUES(?,?,?,?,?)";
	const userId = 1;
	conn.query(sqlRec, [fileName, req.file. originalname, req.body.altInput, req.body.privacyInput, userId], (err, result)=>{
		if(err){
			throw err;
		}
		else{
			res.render("photoupload");
		}
	});
});

app.get("/photos/gallery", (req, res)=>{
	res.redirect("/photos/gallery/1");
});

app.get("/photos/gallery/:page", (req, res)=>{
	let galleryLinks = "";
	let page = parseInt(req.params.page);
	const privacy = 3;
	const photoLimit = 5;
	
	
	
	
	if(page < 1){
		page = 1
	};
	
	//teeme päringuid mis peab üksteise järel teha
	const galleryPageTasks = [
		function(callback) {
			conn.execute("SELECT COUNT(id) as photos from vp1photos WHERE privacy = ? AND deleted IS NULL", [privacy], (err, result)=>{
				if(err){
					return callback(err);
				}
				else{
					return callback(null, result)
				}
			});
		},
		function(photoCount, callback) {
			console.log("Fotosid on: " + photoCount[0].photos);
			if((page - 1) * photoLimit >= photoCount[0].photos) {
				page = Math.ceil(photoCount[0].photos / photoLimit);
			}
			console.log("Lehekülg on: " + page);
			
			//lingid oleksid
			if(page == 1) {
				galleryLinks = "eelmine leht &nbsp; | &nbsp;&nbsp;&nbsp;";
			}
			else{
				galleryLinks = '<a href="/photos/gallery/' + (page - 1) + '"> eelmine leht</a> &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;';
			}
			if(page * photoLimit > photoCount[0].photos){
				galleryLinks += "järgmine leht";
			}
			else{
				galleryLinks += '<a href="/photos/gallery/' + (page + 1) + '"> järgmine leht</a>';
			}		
			return callback(null, page);
		}
	];
	
	async.waterfall(galleryPageTasks, (err, results)=>{
		if(err){
			throw err;
		}
		else{
			console.log(results);
		}
	});
	
	let skip = (page - 1) * photoLimit;
	
	let sqlReq = "SELECT file_name, alt_text FROM vp1photos WHERE privacy = ? AND deleted IS NULL ORDER BY id DESC LIMIT ?,?";
	
	let photoList = [];
	conn.query(sqlReq, [privacy, skip, photoLimit], (err, result)=>{
		if(err){
			throw err;
		}
		else {
			console.log(result);
			for(let i = 0; i < result.length; i ++) {
				photoList.push({href: "/gallery/smol/" + result[i].file_name, alt: result[i].alt_text, fileName: result[i].file_name});
			}
			res.render("gallery", {listData: photoList, links:galleryLinks});
		}
	});
});


//                                           ^ VIEWS ^
////////////////////////////////////////////// BREAK //////////////////////////////////////////////

	//See on vale failisüsteemi jaoks, ERROR 404
app.get("*", (req, res)=>{
	res.render("notFound.ejs");
});

//ava porti 5126
app.listen(5126);