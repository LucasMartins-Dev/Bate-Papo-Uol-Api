import  express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { MongoClient } from 'mongodb'
import dayjs from 'dayjs'

dotenv.config()
const app= express()
app.use(cors())
const PORT = 5000
const mongoClient = new MongoClient(process.env.DATABASE_URL)
let db

mongoClient.connect().then(()=>{
   db = mongoClient.db('Bancoteste')
}).catch(()=>{
    console.log('Não foi')
})

app.get('/participants',(req,res)=>{
    try{
        const participants = await db.collection("participants").find().toArray()
            return res.send(participants)
        
            
        }catch(err){
            console.log(err)
            res.status(500).send('Algo deu errado')
        }
    }) 
  
    app.post('/participants', async (req,res)=>{
     
        try{
            const {name} = req.body
            const namexiste = await db.collection('participants').findOne({name})
            if(namexiste) return res.status(409).send("Usuario já cadastrado")
            await db.collection('participants').insertOne({name,lastStatus: Date.now()})
            await db.collection("messages").insertOne({
                from: name,
                to: 'Todos',
                text: 'entra na sala...',
                type: 'status',
                time: dayjs(Date.now()).format('HH:mm:ss')})
            res.send('OK')

        }catch(err){
            console.log(err)
            res.status(500).send('Deu erro !!')
        }
       
        
    })
    app.get('/messages',(req,res)=>{

    
    })
    app.post('/messages',(req,res)=>{
        
    })
    
    app.post('/status',(req,res)=>{
        
    })
    

app.listen(PORT,()=> console.log('Server ON'))