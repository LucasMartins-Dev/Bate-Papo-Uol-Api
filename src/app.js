import  express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { MongoClient } from 'mongodb'
import dayjs from 'dayjs'
import joi from 'joi'



const messagesSchema = joi.object({
    to: joi.string().required(),
    text: joi.string().required(),
    type: joi.string().valid('message','private_message').required()
})



dotenv.config()
const app= express()
app.use(cors())
const PORT = 5000
const mongoClient = new MongoClient(process.env.DATABASE_URL)
let db

await mongoClient.connect()

db = mongoClient.db()


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
            const inforeq = req.body
            const participantsSchema = joi.object({
                name: joi.string().required()
            })
            const nomeparticipante = await participantsSchema.validate(inforeq,{abortEarly: false})
            if(nomeparticipante) return res.status(422).send('name not found')
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