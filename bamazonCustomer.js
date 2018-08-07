const mysql = require("mysql");
const inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  
  
  user: "root",
  
  
  password: "Harper5113!",
  database: "bamazon_db"
});


connection.connect(function(error) {
  if (error) throw error;
  console.log("connected as id " + connection.threadId + "\n");
  start();
});


function start() {
  
  
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;

    
    inquirer.prompt([
      {
        name: "choice",
        type: "list",
        message: "Which item would you like to purchase?",
        choices: function() {
          let array = [];

          for (let i = 0; i < results.length; i++) {
            let item = results[i].product_name;
            array.push(item);
          }
          return array;
        }
      }
    ]).then(function(answer) {
    
      var item = "";
      
      for (let i = 0; i < results.length; i++) {
        if (results[i].product_name === answer.choice) {
          item = results[i];
        }
      };

    
      inquirer.prompt([
        {
          name: "count",
          type: "input",
          message: "How many would you like to purchase?",
          validate: function(value) {
            if (isNaN(value) === false && value > 0) {
              return true;
            }
            return false;
          }
        }
      ]).then(function(input) {

        // customer's number input
        let count = input.count;
        let totalPrice = item.price * count;
        let cost = totalPrice.toFixed(2);
        console.log("Request received! \n")

        // update stock quantity 
        if (count <= item.stock_quantity && count > 0) {
          let quantity = item.stock_quantity - count;
          connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              {
                stock_quantity: quantity            
              },
              {
                product_name: item.product_name
              }
            ],
            function(err, res) {
              if (err) throw err;
            
              console.log("Department inventory count has been updated!\nTotal Transaction Cost: $" + cost + "\n");
              endApp();
            }
          );

        }
        else {
          console.log("Insufficient Quantity!!!")
          endApp();
        }

      });
    });
  });
};

function readProducts() {
  console.log("\nAll Products:");
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    

    for (let i = 0; i < res.length; i++) {
      console.log(res[i].item_id + ". " + res[i].product_name + " (" + res[i].department_name + "): $" + res[i].price + " & Quantity: " + res[i].stock_quantity);
    }
  });
};

function endApp() {
  inquirer.prompt([
    {
      name: "end",
      type: "list",
      message: "Make another purchase?",
      choices: ["YES", "NO"]
    }
  ]).then(function(lastAnswer) {
    if (lastAnswer.end === "YES") {
      start();
    }
    else {
      console.log('Thank you for shopping at Bamazon');
      connection.end();
    }
  })
};