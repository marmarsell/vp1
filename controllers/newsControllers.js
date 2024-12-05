const mysql = require("mysql2");

const dbInfo = require("../../../vp2024config.js");

//loon andmebaasiühendus
const conn = mysql.createConnection({
	host:dbInfo.configData.host,
	user:dbInfo.configData.user,
	password:dbInfo.configData.passWord,
	database:dbInfo.configData.dataBase
});

//@desc home page for news section
//@route GET /news
//@access private

const newsHome = (req, res)=>{
	console.log("Töötab uudiste router koos kontrolleriga! AWA");
	res.render("news.ejs");
};


//@desc page for adding news
//@route GET /news/addnews
//@access private

const addNews = (req, res)=>{
	let notice = "Sisesta andmeid";
	let newsTitle = "";
	let newsExpDate = "";
	let newsContent = "";
	res.render("addnews.ejs", {notice:notice, newsTitle:newsTitle, newsExpDate:newsExpDate, newsContent:newsContent});
};


//@desc adding news
//@route POST /news/addnews
//@access private

const addingNews = (req, res)=>{
	let notice = "";
	console.log(req.body);
	if(!req.body.TitleInput || !req.body.expireInput || !req.body.newsInput){
		notice = "Osa andmeid sisestamata UwU";
		res.render("addnews.ejs", {notice:notice});
	}
	else{
		let sqlReqNews = "INSERT INTO news (user_id, news_title, news_text, expirety_date) VALUES(?,?,?,?)";
		const user_id = 1;
		conn.query(sqlReqNews, [user_id, req.body.TitleInput, req.body.newsInput, req.body.expireInput], (err, sqlres)=>{
			if(err){
				throw err;
			}
			else{
			notice = "Andmed sisestatud! OwO";
			res.render("addnews.ejs", {notice:notice});
			}
		});
	}
};


//@desc news reading
//@route GET /news/readnews
//@@access private

const newsRead = (req, res)=>{
	let sql = "SELECT id, news_title, news_text FROM news WHERE expirety_date > ? ORDER BY id DESC";
		//let userid = 1;
		//andmebaasi osa
		conn.execute(sql, [new Date()], (err, result)=>{
			if(err) {
				//throw err;
				const news = [{id: 0, news_title: "Uudiseid pole!"}];
				notice = 'Uudiste lugemine ebaõnnestus!' + err;
				res.render('readnews', {news: news});
			} else {
				notice = 'Uudised edukalt loetud!';
				res.render('readnews', {news: result});
			}
		});
	//res.render("readnews");
};

module.exports = {
	newsHome,
	addNews,
	addingNews,
	newsRead
};