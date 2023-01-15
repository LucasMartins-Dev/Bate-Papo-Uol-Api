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
        
            
        }catch(error){
            console.log(erro)
            res.status(500).send('Algo deu errado')
        }
    }) 
  
app.post('/participants', async (req,res)=>{
        const nome = req.body
        
        try{
            console.log(nome)
            console.log(nome.name)
            const validation = await userschema.validate(nome) 
            
            if (validation.error) {
                const errors = validation.error.details.map((detail) => detail.message);
                return res.status(422).send(errors);
              }
            const namexiste = await db.collection('participants').findOne({nome})
            if(namexiste) return res.status(409).send("Usuario já cadastrado")
            await db.collection('participants').insertOne({ ...nome,lastStatus: Date.now()})
            await db.collection("messages").insertOne({
                from: nome.name,
                to: 'Todos',
                text: 'entra na sala...',
                type: 'status',
                time: dayjs(Date.now()).format('HH:mm:ss')})
            res.status(201).send('OK')

        }catch(erro){
            console.log(erro)
            if (validation.error) {
                const errors = validation.error.details.map((detail) => detail.message);
                return res.status(422).send(errors);
              }
              if(namexiste) return res.status(409).send("Usuario já cadastrado")
            res.status(500).send('Deu erro !!')
        }
       
        
    })
app.get('/messages', async (req,res)=>{
    try {
        const { querystring } = req
        const { user } = req.headers
        
        const fullmessages = await db.collection("messages").find({ $or: [{ from: user }, { to: user }, { to: "Todos" }] }).toArray()
        
        if (querystring.limit) {
            const messagesonscreen = Number(querystring.limit)

            if (messagesonscreen < 1 || isNaN(messagesonscreen)) return res.sendStatus(422)
            
            return res.send([...fullmessages].slice(-messagesonscreen).reverse())
        }        

        return res.send([...fullmessages].reverse())

    } catch (err) {
        console.log(err)

        return res.sendStatus(500)
    }
    
    })
app.post('/messages', async (req,res)=>{
    const message = req.body
   
    try{
        const {user} = req.headers
        const validation = await messageschema.validate(message)
        const namexiste = await db.collection("participants").findOne({ name: user })
        if (!namexiste) return res.sendStatus(422)
        const messageposted = await db.collection("messages").insertOne({
            from: user,
            ...validation,
            time: dayjs(Date.now()).format('HH:mm:ss')
        })

        if (messageposted) return res.sendStatus(201)
    }catch(erro){
        console.log(erro)
        if (err.isJoi) return res.sendStatus(422)
        return res.status(500).send(erro)
    } 
    })
    
app.post('/status', async (req,res)=>{
        
    })
    

app.listen(PORT,()=> console.log('Server ON'))