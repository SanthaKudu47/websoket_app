"use strict";
//connection

import mongoose from "mongoose";
const CONNECTION_URL = process.env.LOCAL_MONGO_DB_URL;

global.connection = global.connection || null;

async function initiateConnection(connection_url = CONNECTION_URL) {
  try {
    if (mongoose.connection.listeners("error").length == 0) {
      mongoose.connection.on("error", function (error) {
        console.log("DB connection error:");
        console.log(error);
      });
    }

    mongoose.connection.once("connected", function () {
      console.log("DB connection established");
    });

    mongoose.connection.on("disconnected", () => {
      console.log("DB connection lost");
    });

    const connection = await mongoose.connect(connection_url); //creating initial connection.

    if (!global.connection) global.connection = connection;

    console.log("Initial DB connection ready");
  } catch (error) {
    console.log("Failed to connect database");
    console.log(error);
    global.connection = null;
  }
}

export default async function dbConnect() {
  if (!global.connection) {
    await initiateConnection(CONNECTION_URL);
  }
}
