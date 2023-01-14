
import joi from 'joi'

  const participantsSchema = joi.object({
    name: joi.string().required()
})

const messagesSchema = joi.object({
    to: joi.string().required(),
    text: joi.string().required(),
    type: joi.string().valid('message','private_message').required()
})

export {participantsSchema,messagesSchema}

