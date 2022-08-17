require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const axios = require('axios');

const KEY_MICR = process.env.API_KEY_MICR;
const KEY_GOOL = process.env.API_KEY_GOOL;

const BASE_URL_MICR = 'https://microsoft-translator-text.p.rapidapi.com/translate?api-version=3.0!'
const BASE_URL_GOOL = 'https://labs.goo.ne.jp/api/hiragana'

// express middleware to run func upon recieving http request
app.use(express.json());

// whitelist
app.use(cors({
    origin: 'https://image-translator.glitch.me'
}));

// test 
app.get('/', async (req, res) => {
  try {
    res.json({success: "Hello World!"})
  } catch (e) {
    console.log("error: ", e);
    res.status(500).json({ error: e.message });
  }    
});

// microsoft api call
app.post("/micr", async (req, res) => {
  try {  
    const options = {
      method: 'POST',
      timeout: 10000,
      url: BASE_URL_MICR + req.body.endpt,
      params: {'api-version': '3.0', to: req.body.outputLang, textType: 'plain', profanityAction: 'NoAction'},
      headers: {
        'content-type': 'application/json',
        'x-rapidapi-host': 'microsoft-translator-text.p.rapidapi.com',
        'x-rapidapi-key': KEY_MICR
      },
      data: [{Text: req.body.text}]
    };      
    const x = await axios.request(options)
      .then(response => {
        return response})
      .catch(error => {
        return error.message});  
    
    if (x.message !== undefined) {
      res.json({result: x.message, result2: x.message, usage: 0, remaining: 0, limit: 0, reset: 0});
      return
    }
    
    res.json({
      result: x.data[0].translations[0].text, 
      result2: x.data[0].translations.length > 1 ? x.data[0].translations[1].text : 'empty',
      usage: x.headers['x-metered-usage'],
      remaining: x.headers['x-ratelimit-characters-remaining'],
      limit: x.headers['x-ratelimit-characters-limit'],
      reset: x.headers['x-ratelimit-characters-reset']
    });
  } catch (e) {
    console.log("error: ", e);
    res.status(500).json({ error: e.message });
  }
});

// goolab api call
app.post("/gool", async (req, res) => {
  try {
    const options = {
      method: 'POST',
      timeout: 10000,
      url: BASE_URL_GOOL,
      data: {'app_id': KEY_GOOL, 'sentence': req.body.text, 'output_type': req.body.outputLang},
      headers: {
        'content-type': 'application/json',
      },
    };
    const x = await axios.request(options)
      .then(response => {
        return response})
      .catch(error => {
        return error.message});  
    
    if (x.message !== undefined) {
      res.json({result: x.message});
      return
    }
    
    res.json({result: x.data.converted});   
  } catch (e) {
    console.log("error: ", e);
    res.status(500).json({ error: e.message });
  }
});

// listen for requests
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});




// axios instance for microsoft api
// const api_micr = axios.create({
//   method: 'POST',
//   baseURL: BASE_URL_MICR,
//   timeout: 10000,
//   params: {'api-version': '3.0', textType: 'plain', profanityAction: 'NoAction'},
//   headers: {
//     'content-type': 'application/json',
//     'x-rapidapi-host': 'microsoft-translator-text.p.rapidapi.com',
//     'x-rapidapi-key': KEY_MICR
//   }
// });

// axios instance for goolab api
// const api_gool = axios.create({
//   method: 'POST',
//   baseURL: BASE_URL_GOOL,
//   timeout: 10000,
//   //data: {'app_id': KEY_GOOL},
//   headers: {
//     'content-type': 'application/json'
//   }
// });