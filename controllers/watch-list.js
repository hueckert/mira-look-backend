
const express = require('express');
const verifyToken = require('../middleware/verify-token.js');
const router = express.Router();
const WatchList = require('../models/watch-list.js');


router.use(verifyToken);





router.get('/', async (req, res) => {
    try {
      const watchList = await WatchList.find({})
        .sort({ createdAt: 'desc' });
      res.status(200).json(watchList);
    } catch (error) {
      res.status(500).json(error);
    }
});


router.post("/", async(req,res) => {
   try {

        req.body.author = req.user._id
        const createdMovie = await WatchList.create(req.body);
        res.status(201).json(createdMovie); 
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
})



router.get("/:movieId", async (req, res) => {
    try {
        const foundMovie = await WatchList.findById(req.params.movieId);
        if (!foundMovie) {
          res.status(404);
          throw new Error('Movie not found.');
        }
        res.status(200).json(foundMovie);
    } catch (error) {
        if (res.statusCode === 404) {
          res.json({ error: error.message });
        } else {
          res.status(500).json({ error: error.message });
        }
    }
  });
router.put("/:movieId", async (req, res) => {
    try {
        const foundMovie = await WatchList.findById(req.params.movieId);
  
        if (!foundMovie.author.equals(req.user._id)) {
            return res.status(403).send("You're not allowed to do that!");
        }
        const updatedMovie = await WatchList.findByIdAndUpdate(
            req.params.movieId,
            req.body,
            { new: true }
        );
    
   
        updatedMovie._doc.author = req.user;

        res.status(200).json(updatedMovie);
    } catch (error) {
        res.status(500).json(error);
        }
});


router.delete("/:movieId", async (req, res) => {
    try {
        const foundMovie = await WatchList.findById(req.params.movieId);
     
        if (!foundMovie.author.equals(req.user._id)) {
            return res.status(403).send("You're not allowed to do that!");
        }
        const deletedMovie = await WatchList.findByIdAndDelete(req.params.movieId);
        res.status(200).json(deletedMovie);
    } catch (error) {
        res.status(500).json(error);
        }
});



router.post('/:movieId/comments', async (req, res) => {
    try {
    
        req.body.author = req.user._id;

        const foundMovie = await WatchList.findById(req.params.movieId);
        foundMovie.Comments.push(req.body);

    
        await foundMovie.save();
    
     
        const newComment = foundMovie.Comments[foundMovie.Comments.length - 1];

        newComment._doc.author = req.user;
      
        newComment._doc.review = foundMovie._id;
 
        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json(error);
    }
  });


module.exports = router;