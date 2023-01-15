import  express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { MongoClient } from 'mongodb'
import dayjs from 'dayjs'
import Joi from 'joi'


dotenv.config()
const app= express()
app.use(cors())
const PORT = 5000
const mongoClient = new MongoClient(process.env.DATABASE_URL)
let db

await mongoClient.connect()
db = mongoClient.db()

const uschema = Joi.object({
    name: Joi.string().required()
})
const mschema = Joi.object({
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

        const name  = req.body;
	    
       
        try{
            const Validar = userSchema.validate(name);
        if (Validar.error) {
            return res.sendStatus(422);
        }
            const namexiste = await db.collection('participants').findOne(name.name)
            if(namexiste) return res.status(409).send("Usuario já cadastrado")
            await db.collection('participants').insertOne({ name:name.name, lastStatus: Date.now()})
            await db.collection("messages").insertOne({
                from: name.name,
                to: 'Todos',
                text: 'entra na sala...',
                type: 'status',
                time: dayjs(Date.now()).format('hh:mm:ss')})
            res.status(201).send('OK')

        }catch(err){
            console.log(err)
            
            res.status(500).send('Deu erro !!')
        }
       
        
    })
    app.get('/messages', async (req,res)=>{

    
    })
    app.post('/messages',(req,res)=>{
        
    })
    
    app.post('/status',(req,res)=>{
        
    })
    

app.listen(PORT,()=> console.log('Server ON'))