// Require the framework and instantiate it
// const fastify = require("fastify")({ logger: true });
import fastify, { FastifyInstance } from "fastify";
import fastifyCors, { OriginFunction } from "@fastify/cors";

// Salesforce
import squery from "./helpers/salesforce";

// Firebase
import * as fs from "firebase-admin";

import SecureSessionPlugin from "@fastify/secure-session";
import dotenv from "dotenv";

// ----END IMPORTS----

dotenv.config();

const server = fastify();

fs.initializeApp({
  credential: fs.credential.cert(JSON.parse(process.env.FIREBASE!)),
  databaseURL: "https://oblio-bos.firebaseio.com",
});

const db = fs.firestore();

// type callback = (error?: Error, value?: boolean) => void;

let getData = async () => {
  const snapshot = await db.collection("contacts").get();
  let data = snapshot.docs.map((doc) => doc.data());
  return data;
};

const router = (f: FastifyInstance, opts: any, next: () => void) => {
  // f.register(fastifyCors, {
  //   // put your options here
  //   origin: ((origin: string, cb: callback) => {
  //     console.log(origin);
  //     const hostname = new URL(origin).hostname;
  //     console.log(hostname);
  //     if (hostname === "localhost") {
  //       //  Request from localhost will pass
  //       cb(undefined, true);
  //     }
  //     // Generate an error on other origins, disabling access
  //     cb(new Error("Not allowed"), false);
  //   }) as OriginFunction,
  // });

  f.register(fastifyCors, (instance) => async (req: any, callback: any) => {
    //console.log(req.headers.host);
    let corsOptions = {
      credentials: true,
      allowedHeaders: [
        "Origin, X-Requested-With, Content-Type, Accept",
        "Authorization",
      ],
      origin: false,
    };
    // do not include CORS headers for requests from localhost
    let originHostname = req.headers.origin || req.ip || req.headers.host;

    console.log(originHostname);

    if (
      /(localhost:3040|127.0.0.1|localhost:39543|http:\/\/localhost:34851)|oblio-bos--.+\.web\.app/g.test(
        originHostname
      ) ||
      process.env.NODE_ENV == "dev"
    ) {
      console.log("passed!");
      corsOptions.origin = true;
    } else {
      console.log("failed!");
      corsOptions.origin = false;
      callback(new Error("Not allowed"), corsOptions);
    }
    callback(null, corsOptions); // callback expects two parameters: error and options
  });

  f.register(SecureSessionPlugin, {
    key: Buffer.from(process.env.SECRET!),
    cookie: {
      path: "/",
    },
  });

  f.addHook("preHandler", async (req, reply) => {
    try {
      // Skip authentication if running the backend locally
      if (process.env.NODE_ENV == "dev") return;

      // Example route without auth
      // if (req.url && req.url.startsWith("/api/doc")) return;

      const m = /^Bearer (.+)$/.exec(req.headers.authorization || "");

      if (!m) {
        console.log("Unauthorised!");
        reply
          .status(401)
          .send(
            "Please authenticate with Oblio token! For more information, visit....."
          );
        return;
      }

      const ticket = await fs.auth().verifyIdToken(m[1], true);
      req.session.set("user", ticket);
    } catch (e: any) {
      return e;
    }
  });

  next();
};

router(server, {}, () => {
  // Declare a route
  server.get("/", async (request, reply) => {
    return true;
  });

  server.get("/firebase", async (request, reply) => {
    let finalData = await getData();
    return finalData;
  });

  server.post("/salesforce", async (request, reply) => {
    squery();
    return true;
  });

  // Declare a route
  server.post<{
    Querystring: ObjectQuery;
  }>("/upload", async (request, reply) => {
    //console.log(JSON.parse(request.body as string));
    console.log(request.query.object);

    if (request.query.object == undefined)
      return Error("You must parse an Oblio object as a querystring!");

    const batch = db.batch();

    // let ref = db.doc(db, collection("contacts"));
    // console.log(ref);

    // Body must be an array!
    const list: Array<object> = JSON.parse(request.body as string);

    if (list[0] == undefined) return Error("Body must be a JSON list!");

    //!! THE FOLLOWING IS KEY!
    for (let x in list) {
      const nycRef = db.collection(request.query.object).doc();
      batch.set(nycRef, list[x]);
    }

    await batch.commit();
    return "Successfully uploaded.";
  });
});

// Run the server!
const start = async () => {
  try {
    await server.listen(3040, "0.0.0.0", function (err, address) {
      console.log(`Running server at: ${address}:3040`);
    });
  } catch (err) {
    console.log(err);
    server.log.error(err);
    process.exit(1);
  }
};
start();

//@@obli#209120u4
