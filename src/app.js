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

const participantsSchema = Joi.object({
    name: Joi.string().min(1).required()
})

const messagesSchema = Joi.object({
    to: Joi.string().min(1).required(),
    text: Joi.string().min(1).required(),
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
     
        try{
            const nomeparticipante = await participantsSchema.validate(req.body) 
            const namexiste = await db.collection('participants').findOne(nomeparticipante)
            if(namexiste) return res.status(409).send("Usuario já cadastrado")
            await db.collection('participants').insertOne({ name:nomeparticipante,lastStatus: Date.now()})
            await db.collection("messages").insertOne({
                from: nomeparticipante.name,
                to: 'Todos',
                text: 'entra na sala...',
                type: 'status',
                time: dayjs(Date.now()).format('HH:mm:ss')})
            res.status(201).send('OK')

        }catch(err){
            console.log(err)
            if (err.isJoi) return res.sendStatus(422)
            res.status(500).send('Deu erro !!')
        }
       
        
    })
    app.get('/messages', async (req,res)=>{

        try{
            const { limitemessage } = req
            const { user } = req.headers

            const mensagensgeral = await db.collection("messages").find({ $or: [{ from: user }, { to: user }, { to: "Todos" }] }).toArray()
            
            if(limitemessage.limit){

                const mensagenslimitadas = Number(limitemessage.limit)
                if(isNaN(mensagenslimitadas ||mensagenslimitadas<=0)) return res.status(422)

                return res.send([...mensagensgeral].slice(mensagenslimitadas).reverse())
            }

            return res.send([...mensagensgeral].reverse()) 

        }catch(err){

            console.log(err)
            return res.status(500)

        }
    
    })
    app.post('/messages',(req,res)=>{
        
    })
    
    app.post('/status',(req,res)=>{
        
    })
    

app.listen(PORT,()=> console.log('Server ON'))