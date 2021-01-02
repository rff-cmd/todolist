const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

// Connect Database
mongoose.connect(
  "mongodb+srv://raflymg_22:oii321654@cluster0.dcd6x.mongodb.net/todolistDB?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// const MongoClient = require("mongodb").MongoClient;
// const uri =
//   "mongodb+srv://raflymg_22:oii321654>@cluster0.dcd6x.mongodb.net/todolistDB>?retryWrites=true&w=majority";
// const client = new MongoClient(uri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
// client.connect((err) => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });

mongoose.set("useFindAndModify", false);

// Schema Database
const itemsSchema = {
  name: String,
};

const listsSchema = {
  name: String,
  items: [itemsSchema],
};

// Model Database
const Item = mongoose.model("Item", itemsSchema);

const List = mongoose.model("List", listsSchema);

// Document Database
const itemOne = new Item({
  name: "Wellcome :)",
});

const itemTwo = new Item({
  name: "Click + to ADD",
});

const itemThree = new Item({
  name: "<= Click Checkbox to DELETE",
});

const defaultItem = [itemOne, itemTwo, itemThree];

app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// Get Method
app.get("/", function (req, res) {
  Item.find(function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItem, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Success");
        }
      });
      res.redirect("/");
    } else {
      res.render("lists", {
        listTitle: "Today",
        newItem: foundItems,
      });
    }
  });
});

// Post Method
app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const itemBaru = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    itemBaru.save();
    res.redirect("/");
  } else {
    List.findOne(
      {
        name: listName,
      },
      function (err, foundLists) {
        foundLists.items.push(itemBaru);
        foundLists.save();
        res.redirect("/" + listName);
      }
    );
  }
});

app.post("/delete", function (req, res) {
  const checkboxId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkboxId, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Deleted");
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkboxId } } },
      function (err, foundLists) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.get("/:listItemParam", function (req, res) {
  const listItemParam = _.capitalize(req.params.listItemParam);

  List.findOne(
    {
      name: listItemParam,
    },
    function (err, foundLists) {
      if (!err) {
        if (!foundLists) {
          const listsItems = new List({
            name: listItemParam,
            items: defaultItem,
          });
          listsItems.save();
          res.redirect("/" + listItemParam);
        } else {
          res.render("lists", {
            listTitle: foundLists.name,
            newItem: foundLists.items,
          });
        }
      }
    }
  );
});

app.listen(process.env.PORT || 3000, function () {
  console.log(
    "Express server listening on port %d in %s mode",
    this.address().port,
    app.settings.env
  );
});

// app.listen(5000, function () {
//   console.log("server is running on port 5000.");
// });
// var currentDay = today.getDay();
// var weekday = new Array(5);

// weekday[1] = "Monday";
// weekday[2] = "Tuesday";
// weekday[3] = "Wednesday";
// weekday[4] = "Thursday";
// weekday[5] = "Friday";

// var weekend = new Array(2);
// weekend[6] = "Saturday";
// weekend[0] = "Sunday";

//     var day = "";

//     switch (currentDay) {
//         case 0:
//             day = "Minggu";
//             break;
//         case 1:
//             day = "Senin";
//             break;
//         case 2:
//             day = "Selasa";
//             break;
//         case 3:
//             day = "Rabu";
//             break;
//         case 4:
//             day = "Kamis";
//             break;
//         case 5:
//             day = "Jum'at";
//             break;
//         case 6:
//             day = "Sabtu";
//         default:
//             break;
//     }
//     // if (currentDay === 6 || currentDay === 0) {
//     //     day = weekend[currentDay];

//     // } else {
//     //     day = weekday[currentDay];
//     // }
//     res.render('lists', {
//         kindOfDay: day
//     });
// });
