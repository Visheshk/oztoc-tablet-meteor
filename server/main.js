import { Meteor } from 'meteor/meteor';

pingFreq = 4000;
// access_token = "";
offset = pingFreq;
dataQueryCallback = function(data,error){
	console.log(data);
	if(error){
	  // self.playspace_ids.forEach(function(playspace){
	  //   self.tick(playspace -1,{error: true});
	  // });
	  console.log(error);
	}
	else{
		data.forEach(function(event){
		if(event){
			console.log(event);
			// App.logger.append(event.key);
			// self.checkevents(event);
		}
		});
		if(data.length == 0){
			console.log("no events");
			// App.logger.append("No Events");
			// self.playspace_ids.forEach(function(playspace){
				// self.tick(playspace -1,{});
			// });
		}
	}
}


Meteor.startup(() => {
  // code to run on server at startup
  Meteor.methods({

	login: function(){
		authDeet = {
			email: adage_email,
			password: adage_password, 
			client_id: app_token,
			client_secret: app_secret
		};
		HTTP.call("POST", app_url+"/auth/authorize_unity",
			{
				// beforeSend: function (xhr) {
				// 	xhr.setRequestHeader('Authorization', 'bearer '+ self.access_token);
				// },
				npmRequestOptions: {rejectUnauthorized: false}, // TODO remove when deploy
				data: authDeet
			},
			function (error, result) {
				console.log("login res " + result);
				if (!error) {
					// Session.set("twizzled", true);
					cont = JSON.parse(result.content);
					access_token = cont["access_token"];
					// console.log(typeof(cont));
					// console.log(JSON.parse(cont));
					console.log(access_token);
					// Meteor.call("updateData");
				} 
				else {
					
					console.log("login err " + error);
				}
			}
		);
	},
  	
  	dataQuery: function (callback,time,offset) {
		time -= offset;
		requestData = {
			app_token: app_token,
			// auth_token: access_token,
			time_range: Math.floor(time/1000)+"", 
			events_list: ["MakeSpawnFish","MakeCircuitCreated", "MakeAddComponent"], 
			localTick: time,
			limit: 10
		};

		requestHeader = {
			"Authorization": "bearer " + access_token
		};

		this.unblock();
		try {
			var result = HTTP.call("GET", app_url + "/data/get_events.json",{
					// beforeSend: function (xhr) {
					// 	xhr.setRequestHeader('Authorization', 'bearer '+ self.access_token);
					// },
					npmRequestOptions: {rejectUnauthorized: false}, // TODO remove when deploy
					headers: requestHeader,
					params: requestData
	           },
	               function (error, result) {
						console.log("get req res" + result);
						if (error) {
							console.log("get req Error");
							console.log(error + result);
							Meteor.call("login");
						}
						else {
							console.log("req res" + JSON.stringify(result));
						}
	               });
			return true;
		} catch (e) {
		// Got a network error, time-out or HTTP error in the 400 or 500 range.
			return false;
			console.log("errored call");
		}
  	},

  	updateData: function () {
  		console.log("trying update");
  		time = (new Date()).getTime();
  		
      	if (access_token == "") {
      		console.log("logging in");
      		Meteor.call("login");
      	}
      	else {
      		console.log("calling dataquery");
	  		Meteor.call("dataQuery", dataQueryCallback, time, offset)
	  	}
  	}

  });
});


Meteor.setInterval(function () {
	Meteor.call('updateData');
}, pingFreq);
