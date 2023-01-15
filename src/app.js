import  express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { MongoClient } from 'mongodb'
import dayjs from 'dayjs'
import Joi from 'joi'


dotenv.config()
const app= express()
app.use(cors())
app.use(express.json());
const PORT = 5000
const mongoClient = new MongoClient(process.env.DATABASE_URL)
let db

await mongoClient.connect()

db = mongoClient.db()

const userschema = Joi.object({
    name: Joi.string().required()
})

const messageschema = Joi.object({
    to: Joi.string().required(),
    text: Joi.string().required(),
    type: Joi.string().valid('message','private_message').required()
})

app.get('/participants',async (req,res)=>{
    try{
        const participants = await db.collection("participants").find().toArray()
            return res.send(participants)
        
            
        }catch(err){
            console.log(err)
            res.status(500).send('Algo deu errado')
        }
    }) 
  
    app.post('/participants', async (req,res)=>{
        console.log(req.body)
        try{
            const validation = await userschema.validate(req.body) 
            
            if (validation.error) {
                const errors = validation.error.details.map((detail) => detail.message);
                return res.status(422).send(errors);
              }
            const namexiste = await db.collection('participants').findOne(validation)
            if(namexiste) return res.status(409).send("Usuario já cadastrado")
            await db.collection('participants').insertOne({ name:validation,lastStatus: Date.now()})
            await db.collection("messages").insertOne({
                from: validation.name,
                to: 'Todos',
                text: 'entra na sala...',
                type: 'status',
                time: dayjs(Date.now()).format('HH:mm:ss')})
            res.status(201).send('OK')

        }catch(err){
            console.log(err)
            if (validation.error) {
                const errors = validation.error.details.map((detail) => detail.message);
                return res.status(422).send(errors);
              }
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