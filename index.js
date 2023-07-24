const { Octokit } = require("octokit");
const express = require('express')
const app = express()
const cors = require('cors');
const fileUpload = require('express-fileupload')
const jwt = require('jsonwebtoken');

let shaData = null;
let usersData = [];
let fetchedData = false;
const secretKey = 'KYYKYKKY-ykkykyyk-578875';

app.use(fileUpload());


app.use(cors({
  origin: ['https://seller-id.tiktok.com', 'https://seller.shopee.co.id', 'https://sellercenter.lazada.co.id']
}));
// Octokit.js
// https://github.com/octokit/core.js#readme
const octokit = new Octokit({
  auth: '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'
})

async function fetchContentFile() {
  const fetchingData = await octokit.request('GET /repos/Dickri-prog/jsonData/contents/authentification-modifypdf/usersData.json', {
  owner: 'Dickri-prog',
  repo: 'jsonData',
  path: 'authentification-modifypdf/usersData.json',
  headers: {
    'X-GitHub-Api-Version': '2022-11-28'
  }
}).then((result) => {
  shaData = result['data']['sha']
  const base64Data = result['data']['content']
  const buffer = Buffer.from(base64Data, 'base64');
  const originalString = buffer.toString();
  //
  usersData = JSON.parse(originalString)
  console.log("fetched")
  return true
}).catch(error => {
  console.error(error.message)
  return false
})

return fetchingData
}

function checkingData(req, res, next) {

  if (fetchedData === false) {
    fetchedData = fetchContentFile().then(result => {
      if (result) {
        next()
      }else {
        return res.json({
            isLoggedin: false,
            message: "Something Wrong, contact us"
        })
      }
    })
  }else {
    next()
  }
}

// Octokit.js
// https://github.com/octokit/core.js#readme
async function updateFile() {


    const updatedContent = Buffer.from(JSON.stringify(usersData, null, 2)).toString('base64');

    const updatedData = await octokit.request('PUT /repos/Dickri-prog/jsonData/contents/authentification-modifypdf/usersData.json', {
      owner: 'Dickri-prog',
      repo: 'jsonData',
      sha: shaData,
      path: 'authentification-modifypdf/usersData.json',
      message: 'update usersData.json',
      content: updatedContent,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
      .then(result => {
        shaData = result['data']['content']['sha']
        return true
      })
      .catch(error => {
        console.error(error.message);
        return false
      })

      return updatedData
}

app.post('/login', checkingData, async (req, res) => {
  try {
      const email = req.body.email
      const password = req.body.password
      const findUserIndex = usersData.findIndex((item) => item.email == email)
      const verifyPassword = usersData.findIndex((item) => item.email == email && item.password == password)

      if (findUserIndex != -1) {
        const userResult = usersData[findUserIndex]

        if (verifyPassword != -1) {
          const email = userResult.email
          const id = userResult.id
          const token = jwt.sign({ id, email }, secretKey);
          res.json({
            isLoggedin: true,
            id: userResult.id,
            email: email,
            token: token
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

app.post('/register', checkingData, async (req, res) => {
  try {

      const email = req.body.email
      const password = req.body.password
      const findUserIndex = usersData.findIndex((item) => item.email == email)

      if (findUserIndex != -1) {
        throw new Error("User already exists!!!")
      }else {
        let idObject;

        if (usersData.length > 0) {
          idObject = usersData.reduce((prev, current) => {
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

        usersData.push(userObj)

        const updatedContent = await updateFile()

        if (updatedContent) {
          const token = jwt.sign({ id: idObject, email }, secretKey);
          res.json({
            isLoggedin: true,
            id: idObject,
            email: email,
            message: "Register successfully",
            token: token
          })
        }else {
          res.json({
            isLoggedin: false,
            message: "Register failed"
          })
        }
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



const port = 3001
app.listen(port, () => console.log(`Running on port ${port}`))
