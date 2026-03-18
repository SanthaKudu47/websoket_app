//sample game->cricket

sport cricket/football/
id//mongodb id
home_team//string
away_team//
status//toss/start/won/loss/FT/break/halftime/abandon/rainy delayed /Postponed
score_home
score_away
sport
date
meta->//jason stringg
turnement
{'sport':'cricket',venue:'r-premadasa',overs:20,played_overs,left_overs}

//timeline//commentry
id->relation ship one to one ith match

time->hours::minutes
meta:{}

runs
wickets
overs

matchSchema = createSchema({
id//auto
homeTeam: {
type:String;
required
validate:validation for
},
sport:{
type:String,
required
},
date:{
type:Date,
//could be change due to postponed or any other reason //Time To Be Determined
}
homeTeam: {
type:String;
required
validate:validation for
},
status:{
type:String,
required,
validation:validate only for strings and numbers,
},
score_home:{
type:Number
},
score_away:{
type:Number
},
tournament:{
type:String;//the tournament that this match belongs
}

meta:{
type:String//json stringify objects will be stored
}
//{'sport':'cricket',venue:'r-premadasa',overs:20,played_overs,left_overs} additional details on match

});
