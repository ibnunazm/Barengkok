const basicAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ message: 'Authorization header missing or invalid' });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  const validUser = "cxianz";
  const validPass = "E7r$wT!zKq@2";

  if (username === validUser && password === validPass) {
    return next(); 
  }

  return res.status(401).json({ message: 'Invalid username or password' });
};

export default basicAuth;
