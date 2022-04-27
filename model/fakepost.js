const mongoose = require('mongoose');
const express = require('express')
const app = express()
const port = 8080
const posts = require('./post')
mongoose.connect("mongodb+srv://beefysalad:topibakat@cluster0.bgpas.mongodb.net/BlogApp?retryWrites=true&w=majority", {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    
})
const db = mongoose.connection
db.on("error",console.error.bind(console,"connection error"))
db.once("open",()=>{
    console.log('Database connected')
})
const month = ['January','February','March','April','May','June','July','August','September','October','November','December']
const author = ['Daxu','Paden','Topi','Tabs','Eddy']


async function generate(){
    for (let index = 0; index < 10; index++) {
        const random = Math.floor(Math.random() * 5);
        const mon = Math.floor(Math.random() * 13);
        const newPost = new posts({
            bgImg: 'https://res.cloudinary.com/dhqqwdevm/image/upload/v1631383900/DEV/defaultmale_xwnrss.jpg',
            text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto optio rem blanditiis voluptatibus incidunt facere magni voluptas doloribus! Aspernatur molestias cupiditate, eligendi maiores non beatae error dolor accusamus delectus obcaecati. Minus deleniti, deserunt officiis possimus, quisquam maxime sunt, ex magni adipisci quasi beatae quis! Obcaecati, numquam maiores aliquid iusto reprehenderit ipsam veniam quos nam harum maxime tempora. Doloremque, quam excepturi Error, cumque ab aliquam voluptatibus porro illum iure possimus adipisci magnam ut nesciunt expedita corporis, pariatur eum harum dolorum, minima sint delectus voluptatum? Recusandae unde magnam sapiente accusamus beatae dolorum',
            author: author[random],
            date: `${month[mon]} ${random}, 2022}`,
            title:'This is a title'
            
        })
        await newPost.save()
        
    }
}
generate()
