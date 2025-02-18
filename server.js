import express from 'express'; 
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/happyThoughts";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// Defines the port the app will run on. 
//   PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(bodyParser.json());


// Thought model
 const Thought = mongoose.model('Thought', {
   message: { 
     type: String,
     required: true,
     minLength: 5,
     maxLength: 140
   },

   hearts: { 
     type: Number,
     default: 0
   },

   createdAt: { 
     type: Date, 
     default: Date.now
   }
 });

// ROUTES
app.get('/', (req, res) => {
  res.send('Hello and Welcome to the Happy thoughts API, where feeling blue is not allowed! :)');
});

// GET REQUESTS 
app.get('/thoughts', async (req, res) => { 
  const thoughts = await Thought.find().sort({ createdAt: 'desc'}).limit(20).exec();
  res.json(thoughts);
});

// POST REQUESTS

//By doing await new Thought({ message }).save()instead of saving the entire body it's
// only saving the message sent my the client. 
//Any other info sent by the client will not be saved and it's more secure this way.
//Now the number of likes can't be sent in the post request.   

app.post('/thoughts', async (req,res) => { 
  try { 
    const { message } = req.body;
    const newThought = await new Thought({ message }).save();
    res.status(200).json(newThought);
  } catch (error) { 
    console.log(error);
    res.status(400).json({ success:false, error });
  };
});
 
app.post('/thoughts/:thoughtId/like', async (req, res) => { 
  const thoughtId = req.params.thoughtId;

  try { 
    const thoughtLiked = await Thought.updateOne({ _id: thoughtId }, { $inc : { hearts: 1 } });
    res.json(thoughtLiked);
  } catch (err) {
    res.status(400).json({ message: "Thought not found", error: err.errors });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
