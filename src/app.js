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
            const nomeparticipante = participantsSchema.validateAsync(req.body) 
            const namexiste = await db.collection('participants').findOne(nomeparticipante)
            if(namexiste) return res.status(409).send("Usuario já cadastrado")
            await db.collection('participants').insertOne({ ...nomeparticipante,lastStatus: Date.now()})
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
    app.get('/messages',(req,res)=>{

    
    })
    app.post('/messages',(req,res)=>{
        
    })
    
    app.post('/status',(req,res)=>{
        
    })
    

app.listen(PORT,()=> console.log('Server ON'))