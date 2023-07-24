const express = require('express')
const app = express()
const cors = require('cors');
const fileUpload = require('express-fileupload')

let userDatas = [];

app.use(fileUpload());


app.use(cors({
  origin: 'https://seller-id.tiktok.com'
}));

app.post('/login', async (req, res) => {
  try {
    const email = req.body.email
    const password = req.body.password
    const findUserIndex = userDatas.findIndex((item) => item.email == email)
    const verifyPassword = userDatas.findIndex((item) => item.email == email && item.password == password)

    if (findUserIndex != -1) {
      const userResult = userDatas[findUserIndex]

      if (verifyPassword != -1) {
        res.json({
          isLoggedin: true,
          id: userResult.id,
          email: userResult.email
        })
      }else {
        throw new Error("Password was wrong!!!")
      }
    }else {
      throw new Error("User not found!!!")

    }

  } catch (e) {
    if (e.name == 'Error') {
      return res.json({
          isLoggedin: false,
          message: e.message
      })
    }

    return res.json({
        isLoggedin: false,
        message: "Something Wrong, contact us"
    })
  }

})

app.post('/register', async (req, res) => {
  try {
    const email = req.body.email
    const password = req.body.password
    const findUserIndex = userDatas.findIndex((item) => item.email == email)

    if (findUserIndex != -1) {
      throw new Error("User already exists!!!")
    }else {
      let idObject;

      if (userDatas.length > 0) {
        idObject = userDatas.reduce((prev, current) => {
          return Math.max(prev, current.id);
        }, -Infinity);

        idObject++
      }else {
        idObject = 1
      }
      const userObj = {
        id: idObject,
        email: email,
        password: password
      }

      userDatas.push(userObj)

      res.json({
        isLoggedin: true,
        id: idObject,
        email: email,
        message: "Register successfully"
      })
    }

  } catch (e) {
    if (e.name == 'Error') {
      return res.json({
          isLoggedin: false,
          message: e.message
      })
    }


    return res.json({
        isLoggedin: false,
        message: "Something Wrong, contact us"
    })
  }

})


const port = 3000
app.listen(port, () => console.log(`Running on port ${port}`))
