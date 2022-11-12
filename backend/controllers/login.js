const {
  badRequest,
  notFound,
  unauthorized,
  serverError,
  ok,
} = require('../helpers/httpResponses')
const User = require('../models/User')
const bcrypt = require('bcrypt')
const TokenGeneratorService = require('../service/TokenGeneratorService')

const controller = {} //objeto vazio

controller.login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email) {
      return badRequest(res, 'E-mail não informado')
    }

    if (!password) {
      return badRequest(res, 'Senha não informada')
    }

    const user = await User.findOne({ email }).select('+password_hash')
    if (!user) {
      return notFound(res, `Usuário com e-mail ${email} não encontrado`)
    }
    const passwordIsValid = bcrypt.compareSync(password, user.password_hash)
    if (!passwordIsValid) {
      return unauthorized(res, 'Senha ou email inválida')
    }

    const tokenGenerator = new TokenGeneratorService()
    const accessToken = tokenGenerator.generateToken({
      id: user._id,
      is_admin: user.is_admin,
    })
    return ok(res, { accessToken })
  } catch (error) {
    return serverError(res, error)
  }
}

module.exports = controller
