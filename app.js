//jshint esversion:6
require('dotenv/config');
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const date = require(__dirname+"/date.js");
const mongoose = require('mongoose');
mongoose.set("strictQuery", false);

const user = process.env.USER_NAME;
const password = process.env.PASSWORD;

mongoose.connect("mongodb+srv://" + user + ":" + password + "@cluster0.wcibe94.mongodb.net/blogDB", { useNewUrlParser: true})


const psotSchema = new mongoose.Schema(
  {
    title: String,
    textArea: String,
    date: String,
    linkPost: String
  }
);

const Post = mongoose.model("Post", psotSchema);

// Load the full build.
const _ = require('lodash');
const { endsWith } = require("lodash");


const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

//let dataPosts = [];

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, res){
  
  Post.find(function(err, dataPosts){
    if(err){
      console.log(err);
    }else{
      res.render("home", {startingContent: homeStartingContent, dataPosts: dataPosts});
    }
  })


})


app.get("/about", function(req,res){
  res.render("about", {textAbout: aboutContent})
})

app.get("/contact", function(req,res){
  res.render("contact", {textContact: contactContent})
})

app.get("/compose", function(req, res){
  res.render("compose");
})

app.post("/compose", function(req, res){

  const titlePost = req.body.titleCompose;
  let linkPost = _.kebabCase(titlePost.toLowerCase());

  /* const valueCompose = {
    title: titlePost,
    textArea: req.body.postCompose,
    date: date.getDate(),
    linkPost: linkPost
  };
  dataPosts.push(valueCompose); */

  const newPost = Post({
    title: titlePost,
    textArea: req.body.postCompose,
    date: date.getDate(),
    linkPost: linkPost
  })

  newPost.save()

  res.redirect("/")
});
app.get("/posts/:postName", function(req, res){

  let reqPost = req.params.postName;
  
  Post.findOne({_id: reqPost}, function(err, post){
    if(err){
      console.log(err);
    }else{
      res.render("post",{dataPost: post})
    }
  })

 /*  dataPosts.forEach(function(post){
    const valuePost = post.title;
    let editValuePost = _.kebabCase(valuePost.toLowerCase())

    console.log(valuePost+" "+editValuePost+" "+reqPost);
    if(editValuePost === reqPost){
      res.render("post",{dataPost: post})
    }else{
      console.log("essa pagina não existe")
    }

  }); */


});

app.post("/editDelete", function(req, res){
  console.log(req.body);
  if(req.body.delete !== ("" || undefined)){
    console.log("Botão delete clicado");
    Post.deleteOne({_id: req.body.delete}, function(err){
      if(err){
        console.log(err);
      }else{
        console.log("O post foi deletado");
        res.redirect("/")
      }
    })
  }else{
    console.log("Botão edit clicado");
    res.redirect("/edit/" + req.body.edit)
  }
})

app.get("/edit/:postName", function(req, res){

  let reqPost = req.params.postName;
  
  Post.findOne({_id: reqPost}, function(err, post){
    if(err){
      console.log(err);
    }else{
      res.render("edit",{dataPost: post})
    }
  })
});

app.post("/edit", function(req, res){
  const titlePost = req.body.titleCompose;
  const idPost = req.body.id;

  let linkPost = _.kebabCase(titlePost.toLowerCase());

  let update = {
    $set: {
    title: titlePost,
    textArea: req.body.postCompose,
    date: date.getDate(),
    linkPost: linkPost
    }
  };

  let options = { multi: true, upsert: true };

  Post.updateOne({_id: idPost}, update, options, function(err){
    if(!err){
      console.log("Update com sucesso");
          res.redirect("/")
    }
  })

  console.log(update);

});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
