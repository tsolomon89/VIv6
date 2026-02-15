import jsforce from "jsforce";

const squery = () => {
  var conn = new jsforce.Connection({});

  conn.login(
    process.env.SFEMAIL!,
    process.env.SFPASSWORD!,
    function (err, res) {
      if (err) {
        return console.error(err);
      }
      conn
        .query("SELECT Id, Name FROM Account")
        .then((res) => {
          console.log(res.records);
        })
        .catch((err) => {
          return console.error(err);
        });

      // function (err, res) {
      //   if (err) {
      //     return console.error(err);
      //   }
      //   console.log(res.records);

      //   // for(item in res.records) {
      //   //   await addDoc(collection(db, "cities"), {
      //   //     name: "Tokyo",
      //   //     country: "Japan"
      //   //   })
      //   // }
      // });
    }
  );
};

export default squery;
