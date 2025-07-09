import express from "express";

const app = express();
const PORT = 3000;

app.use(express.json());

import authRoutes from "./routes/auth.routes.js";
import swaggerDocs from "./config/swagger.js";
app.use("/auth", authRoutes);

swaggerDocs(app); 

app.listen(PORT, () => {
  console.log("Server", PORT, "ishlayapti");
});
