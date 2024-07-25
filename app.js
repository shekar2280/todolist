//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin:Soma2024@cluster0.aplbnwq.mongodb.net/todolistDB");

const itemsSchema = new mongoose.Schema({
  name: "String",
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!",
});

const item2 = new Item({
  name: "Hit the + button to add a new item",
});
const item3 = new Item({
  name: "<--- Hit this to delete an item.",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  async function find() {
    try {
      const item = await Item.find({});

      if (item.length === 0) {
        Item.insertMany([item1, item2, item3]);
        res.redirect("/"); //if items are entered once then redirecting to app.get again will lead it to else loop
      } else {
        res.render("list", { listTitle: "Today", newListItems: item });
      }
      // console.log(item);
    } catch (err) {
      console.log(err);
    } finally {
      console.log("Search Successfully");
    }
  }
  find();
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  async function findListName() {
    try {
      const listName = await List.findOne({ name: customListName });
      if (!listName) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: listName.name,
          newListItems: listName.items,
        });
      }
    } catch (err) {
      console.log(err);
    }
  }
  findListName();
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  }
  else {
    async function findList() {
      try {
        const foundList = await List.findOne({ name: listName });
        if (foundList) {
          foundList.items.push(item);
          await foundList.save();
          res.redirect("/" + listName);
        }
      } catch (err) {
        console.log(err);
      }
    }
    findList();
  }
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    async function deleteItem() {
      try {
        const item = await Item.findByIdAndDelete(checkedItemId);
        res.redirect("/");
      } catch (err) {
        console.log(err);
      } finally {
        console.log("Successfully deleted Item");
      }
    }
    deleteItem();
  } else {
     async function deleteCustomList() {
      try{
        const item = await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}});
        if(item) {
          res.redirect("/" + listName);
        }
        else {
          console.log("Error");
        }
      }
      catch(err){
        console.log(err);
      }
     }
     deleteCustomList();
  }

  
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
