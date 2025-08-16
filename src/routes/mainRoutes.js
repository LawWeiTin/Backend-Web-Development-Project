// ##############################################################
// REQUIRE MODULES
// ##############################################################
const express = require('express')

const user = require('./userRoutes')
const challenge = require('./challengeRoutes')
const map = require('./mapRoutes')
const party = require('./partyRoutes')
const trade = require('./tradeRoutes')

// ##############################################################
// CREATE ROUTER
// ##############################################################
const router = express.Router()

// ##############################################################
// DEFINE ROUTES
// ##############################################################
router.use('/users', user)
router.use('/challenges', challenge)
router.use('/map', map)
router.use('/party', party)
router.use('/trades', trade)

// ##############################################################
// EXPORT ROUTER
// ##############################################################
module.exports = router;