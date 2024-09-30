const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const fs = require('fs');       
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

app.use(express.json())
app.use(express.text())

app.use(express.cookieParser())

app.options('*', cors()) 


//app.use(morgan());

/** CORS setting with OPTIONS pre-flight handling */
app.use(function(req, res, next){
    /*res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, accept, access-control-allow-origin');*/
    if ('OPTIONS' == req.method) res.send(200);
    else next();
});


app.post('/',  async (req, res) => {
    const targetUrl = req.query.url;

    
    delete req.headers['accept-encoding'];
    delete req.headers['accept-language']; 
    
    //delete req.headers['origin']; 
    delete req.headers['referer']; 
    delete req.headers['connection']; 
    //delete req.headers['content-length']; 
    //delete req.headers['user-agent']; 
    
   /* if(targetUrl.indexOf('graph')!=-1)
    {
        delete req.headers['sec-ch-ua'];
        delete req.headers['sec-ch-ua-mobile'];
        delete req.headers['sec-ch-ua-platform'];
        delete req.headers['sec-fetch-dest'];
        delete req.headers['sec-fetch-mode'];
        delete req.headers['sec-fetch-site'];
        delete req.headers['sec-fetch-site'];

    }*/


    const {method, headers, body, query, cookies} = req;

    if (!targetUrl) {
        return res.status(400).send('Missing URL parameter');
    }        
    try {
        /*const instanceAxios = axios.create({
            httpsAgent: new https.Agent({  
              rejectUnauthorized: false
            })
          });       */

        headers['host'] = '';
        headers['origin'] = 'http://localhost:3000';


        let transformedHeaders = Object.entries(headers).reduce((acc, [key, value]) => {
            const newKey = key
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join('-');
            acc[newKey] = value; // Assign the value to the new key
            return acc; // Return the accumulator
        }, {});
  

        if(targetUrl.indexOf('graph')!=-1)
            {
                transformedHeaders = {
                    'Host': '',
                    'User-agent': 'node-fetch',
                    'Origin': 'http://localhost:3000',
                    'Connection': 'keep-alive',
                    'Content-Type': 'application/json'
                    }              
            }

            

        responseFetch = await fetch(targetUrl, {
            method: 'POST',
            body: typeof body != 'string' ? JSON.stringify(body) : body,            
            headers: transformedHeaders
                /*{
                'Host': '',
                'User-agent': 'node-fetch',
                'Origin': 'http://localhost:3000',
                'Connection': 'keep-alive',
                'Content-Type': 'application/json'
                }            */
            },
            cookies:cookies
        );
        
        
        const data = await responseFetch.text();

        console.log(data);       
                    
        //headers['Access-Control-Allow-Origin'] = '*'
       
        //headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        //headers['content-Type'] = 'application/json; charset=UTF-8';
        
       
        //const response = await instanceAxios({method:method, url:targetUrl, headers:headers, data:JSON.stringify(body)});  
        
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        /*responseFetch.headers.forEach(function(val,name)
        {
            res.setHeader(name,val)
        });*/
        if(responseFetch.status!=200)
        {
            const logMessage = `${targetUrl} - -Body:${typeof body != 'string' ? JSON.stringify(body) : body} Status: ${responseFetch.status}-|-Headers:${ JSON.stringify(transformedHeaders)}\n `;            
            fs.appendFileSync('proxy-log.log', logMessage); // Log error to file        
        }    
        res.status(responseFetch.status)
        res.send(data); // Send the response data
    } catch (error) {                  
        const logMessage = `${new Date().toISOString()} - Error: ${error.message}\n`;
        fs.appendFileSync('proxy-log.log', logMessage); // Log error to file        
        res.status(error.response.status || 500).send(error.message);
    }
});

app.listen(PORT, () => {
    console.info(`CORS proxy server is running on port ${PORT}`);
});

