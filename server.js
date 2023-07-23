require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(`${process.env.MONGO_URI}`);

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item"
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
    Item.find({})
        .then(function(foundItems){
            if (foundItems.length === 0) {
                Item.insertMany(defaultItems)
                .then(function(){
                    console.log("Successfully Inserted!");
                })
                .catch(function(err){
                    console.log(err);
                });
                res.redirect("/");
            } else {
                res.render("list", {listTitle: "Today", newListItems: foundItems});
            }
        })
        .catch(function(err){
            console.log(err);
        });
});

app.get("/:listName", function(req, res) {
    const listName = _.capitalize(req.params.listName);

    List.findOne({name: listName})
        .then(function(foundList){
            if (!foundList) {
                const list = new List({
                    name: listName,
                    items: defaultItems
                });
                list.save();
                res.redirect(`/${listName}`);
            } else {
                res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
            }
        })
        .catch(function(err){
            console.log(err);
        });
});

app.post("/", function(req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    
    const newItem = new Item({
        name: itemName
    });

    if (listName === "Today") {
        newItem.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName})
        .then(function(foundList){
            foundList.items.push(newItem);
            foundList.save();
            res.redirect(`/${listName}`);
        })
        .catch(function(err){
            console.log(err);
        });
    } 
});

app.post("/delete", function(req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId)
        .then(function() {
            res.redirect("/");
        })
        .catch(function(err){
            console.log(err);
        });   
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
            .then(function(){
                res.redirect(`/${listName}`);
            })
            .catch(function(err){
                console.log(err);
            });
    }
});

app.post("/work", function(req, res) {
    let item = req.body.newItem;
    workItems.push(item);

    res.redirect("/work");
});

app.get("/about", function(req, res) {
    res.render("about");
});

app.listen(3000, function() {
    console.log("Server started at port 3000");
})
