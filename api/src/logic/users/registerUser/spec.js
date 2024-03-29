require('dotenv').config()

const { connect, disconnect } = require('mongoose')
const { User } = require('../../../models')
const { DuplicityError, FormatError } = require('errors')
const registerUser = require('.')

const { MONGO_URL_TEST } = process.env

describe('registerUser', () => {
    beforeAll(() => connect(MONGO_URL_TEST))

    beforeEach(() => User.deleteMany())

    test('SUCCEEDS ON NEW USER', async () => {  // happy path
        const name = 'Matias'
        const lastname = 'Manolo'
        const email = 'matias@manolo.com'
        const password = '123123123'
        const birth = '1990/11/04'
        const phonenumber = '34666456985'

        const res = await registerUser(name, lastname, email, password, birth, phonenumber)

        expect(res).toBeUndefined()

        const users = await User.find({ email })

        expect(users).toHaveLength(1)

        const [user] = users

        expect(user.name).toEqual(name)
        expect(user.lastname).toEqual(lastname)
        expect(user.email).toEqual(email)
        expect(user.password).toEqual(password)
        expect(user.birth.toISOString().substring(0, 10)).toEqual('1990-11-03')
        expect(user.phonenumber).toEqual(phonenumber)
    })

    debugger
    test('fails on existing user', async () => {  // unhappy path
        const name = 'Elart'
        const lastname = 'Esanos'
        const email = 'Elart@esanos.com'
        const password = '123123123'
        const birth = '12/09/1990'
        const phonenumber = '3452528080'


        await User.create({ name, lastname, email, password, birth, phonenumber })
        
        // try {
        //     await registerUser(name, email, password)
        // } catch (error) {
        //     expect(error).toBeInstanceOf(DuplicityError)
        //     expect(error.message).toEqual('user already exists')
        // }

        await expect(registerUser(name, email, password)).rejects.toThrowError(DuplicityError, 'user already exists')
    })

    it('fails on non-string name', () => { // unhappy path
        const name = 123
        const email = 'elartes@ano.com'
        const password = '123123123'

        expect(() => registerUser(name, email, password)).toThrowError(TypeError, 'name is not a string')
    })

    it('fails on empty name', () => { // unhappy path
        const name = ''
        const email = 'elartes@ano.com'
        const password = '123123123'

        expect(() => registerUser(name, email, password)).toThrowError(FormatError, 'name is empty or blank')
    })

    it('fails on invalid email', () => { // unhappy path
        const name = 'Elartes Ano'
        const email = 'elartes@ano.com'
        const password = '123123123'

        expect(() => registerUser(name, email, password)).toThrowError(FormatError, 'email is not valid')
    })

    afterAll(() => disconnect())
})