import Joi from 'joi'

const participantsSchema = Joi.object({
    name: Joi.string().required()
})

const messagesSchema = Joi.object({
    to: Joi.string().required(),
    text: Joi.string().required(),
    type: Joi.string().valid('message','private_message').required()
})

export {participantsSchema, messagesSchema}