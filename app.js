const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()
app.use(express.json())
const dbpath = path.join(__dirname, 'moviesData.db')
let db = null

//intialization:
const intializeDBAndStartServe = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Starts @3000 Port')
    })
  } catch (ex) {
    console.log(ex.message)
    process.exit(1)
  }
}
intializeDBAndStartServe()

//API_1 (GET_all):
const convertToPascalCase = result => {
  return {
    movieName: result.movie_name,
  }
}

app.get('/movies/', async (request, response) => {
  const allQuery = `SELECT * FROM movie`
  const AllResult = await db.all(allQuery)
  //console.log(AllResult)
  response.send(AllResult.map(each => convertToPascalCase(each)))
})

//API-2 (POST:
app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const insertQuery = `INSERT INTO movie (director_id,movie_name,lead_actor)
  VALUES
  ("${directorId}","${movieName}","${leadActor}")`
  const insertResult = await db.run(insertQuery)
  //console.log(insertResult)
  response.send('Movie Successfully Added')
})

//API-3 (GET_specific):
const convertIntoData = row => {
  return {
    movieId: row.movie_id,
    directorId: row.director_id,
    movieName: row.movie_name,
    leadActor: row.lead_actor,
    // data: row,
  }
}

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getSingleQuery = `SELECT * FROM movie 
  where movie_id= ${movieId}`
  const singleRow = await db.get(getSingleQuery)
  // console.log(singleRow)
  console.log(movieId)
  // console.log(getSingleQuery)
  response.send(convertIntoData(singleRow))
})

//API-4 (PUT):
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const putQuery = `UPDATE movie SET
  director_id=${directorId},
  movie_name='${movieName}',
  lead_actor='${leadActor}'
  where movie_id='${movieId}'`
  const updateResult = await db.run(putQuery)
  // console.log(movieId)
  // console.log(directorId)
  // console.log(movieName)
  // console.log(leadActor)
  response.send('Movie Details Updated')
})

//API-5 (DELETE)
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteQuery = `DELETE from movie where
  movie_id ='${movieId}'`
  const deletedRow = await db.run(deleteQuery)
  console.log(movieId)
  response.send('Movie Removed')
})

//API-6 (GET)//Directors
const directorDetails = each => {
  return {
    directorId: each.director_id,
    directorName: each.director_name,
  }
}
app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `SELECT * FROM director`
  const getDirectorResult = await db.all(getDirectorsQuery)
  response.send(getDirectorResult.map(each => directorDetails(each)))
})

//API-7 (GET)
const specifyDirectors = each => {
  return {
    movieName: each.movie_name,
  }
}

app.get('directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const directorsQuery = `SELECT * FROM 
  director INNER JOIN movie 
  on director.director_id=movie.director_id
  where
  director.director_id=${directorId}`
  console.log(directorId)
  //response.send(directorId)
  console.log(directorsQuery)
  // const directorResult = await db.all(directorsQuery)
  // response.send(directorResult.map(each => specifyDirectors(each)))
})

module.exports = app
