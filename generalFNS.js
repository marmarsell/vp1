exports.checkLogin = function(req, res, next){
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
};