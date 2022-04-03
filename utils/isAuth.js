import jwt from "jsonwebtoken";
export const isAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json("Forbidden access");
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json("No token");
  }
};
