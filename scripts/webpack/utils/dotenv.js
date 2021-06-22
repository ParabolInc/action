/*
 * Sets .env in process.env[VARS] as aside-effect.
 */
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')
const path = require('path')
const getProjectRoot = require('./getProjectRoot')

const PROJECT_ROOT = getProjectRoot()
const envPath = path.join(PROJECT_ROOT, '.env')
const myEnv = dotenv.config({path: envPath})
dotenvExpand(myEnv)
