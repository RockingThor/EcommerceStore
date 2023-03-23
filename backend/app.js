const express= require('express');
const app = express();

require('dotenv/config');

const api= process.env.API_URL;

//app.use(express.json); 
const morgan= require('morgan');
app.use(morgan('tiny'));

app.get(`${api}/products`,(req, res)=>{
    const product={
        id: 1,
        name: "Laptop",
        image: "/"
    }
    res.send(product);
})

app.listen(3000, ()=>{
    console.log("The surver is running now on http://localhost:3000");
})